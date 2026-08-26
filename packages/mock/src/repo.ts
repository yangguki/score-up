import type { AppData, Competition, Match, Player, SportId, SportRules, Team } from "@score-up/domain";
import {
  BASKETBALL_CLUB_PRESET,
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  isBaseballMatch,
  isBasketballMatch,
  isPitchMatch,
  isPitchSport,
  isRallySetMatch,
  isRallySetSport,
  isVolleyballMatch,
  nextTeamColor,
  type BaseballRules,
  type BasketballRules,
  type PitchRules,
  type TableTennisRules,
  type VolleyballRules,
} from "@score-up/domain";
import {
  applyFoul,
  applyPoint,
  applySub,
  applyTimeout,
  confirmMatchEnd,
  confirmPeriodEnd,
  createBlankMatch,
  endTimeout,
  forfeitMatch,
  pauseMatch,
  resumeMatch,
  startMatch,
  startOvertime,
  tickClock,
  undoLast,
} from "./basketball";
import { createBlankTableTennisMatch } from "./table-tennis";
import { createBlankVolleyballMatch } from "./volleyball";
import { createBlankPitchMatch } from "./pitch";
import { createBlankBaseballMatch } from "./baseball";
import { uid } from "./id";
import { createSeedState } from "./seed";

export function listCompetitions(data: AppData) {
  return data.competitions;
}

export function getCompetition(data: AppData, id: string) {
  return data.competitions.find((c) => c.id === id);
}

export function teamsOf(data: AppData, competitionId: string) {
  return data.teams.filter((t) => t.competitionId === competitionId);
}

export function playersOfTeam(data: AppData, teamId: string) {
  return data.players.filter((p) => p.teamId === teamId);
}

export function matchesOf(data: AppData, competitionId: string) {
  return data.matches.filter((m) => m.competitionId === competitionId);
}

export function liveMatches(data: AppData) {
  return data.matches.filter(
    (m) => m.status === "in_progress" || m.status === "paused" || m.status === "confirm_period_end" || m.status === "confirm_match_end",
  );
}

export function getMatch(data: AppData, id: string) {
  return data.matches.find((m) => m.id === id);
}

export function replaceMatch(data: AppData, match: Match): AppData {
  return {
    ...data,
    matches: data.matches.map((m) => (m.id === match.id ? match : m)),
  };
}

export function advanceBracket(data: AppData, completed: Match): AppData {
  if (!completed.competitionId || !completed.winnerTeamId) return data;
  const slots = data.brackets.filter((b) => b.competitionId === completed.competitionId);
  const current = slots.find((s) => s.matchId === completed.id);
  if (!current) return data;

  if (current.round === "sf") {
    const final = slots.find((s) => s.round === "final");
    if (!final) return data;
    const nextFinal = { ...final };
    if (!nextFinal.homeTeamId) nextFinal.homeTeamId = completed.winnerTeamId;
    else if (!nextFinal.awayTeamId) nextFinal.awayTeamId = completed.winnerTeamId;

    const winnerTeam = data.teams.find((t) => t.id === completed.winnerTeamId);
    const matches = data.matches.map((m) => {
      if (m.id !== final.matchId) return m;
      return {
        ...m,
        homeTeamId: nextFinal.homeTeamId,
        awayTeamId: nextFinal.awayTeamId,
        homeLabel: nextFinal.homeTeamId
          ? data.teams.find((t) => t.id === nextFinal.homeTeamId)?.name ?? m.homeLabel
          : m.homeLabel,
        awayLabel: nextFinal.awayTeamId
          ? data.teams.find((t) => t.id === nextFinal.awayTeamId)?.name ?? m.awayLabel
          : m.awayLabel,
        homeColor: nextFinal.homeTeamId
          ? data.teams.find((t) => t.id === nextFinal.homeTeamId)?.color ?? m.homeColor
          : m.homeColor,
        awayColor: nextFinal.awayTeamId
          ? data.teams.find((t) => t.id === nextFinal.awayTeamId)?.color ?? m.awayColor
          : m.awayColor,
      };
    });
    void winnerTeam;
    return {
      ...data,
      matches,
      brackets: data.brackets.map((b) => (b.id === nextFinal.id ? nextFinal : b)),
    };
  }

  if (current.round === "final") {
    return {
      ...data,
      competitions: data.competitions.map((c) =>
        c.id === completed.competitionId ? { ...c, status: "completed" as const } : c,
      ),
      brackets: data.brackets.map((b) =>
        b.round === "champion" && b.competitionId === completed.competitionId
          ? { ...b, homeTeamId: completed.winnerTeamId }
          : b,
      ),
    };
  }
  return data;
}

export function addTeam(data: AppData, competitionId: string, name: string, color?: string): AppData {
  const used = teamsOf(data, competitionId).map((t) => t.color);
  const team: Team = { id: uid("team"), competitionId, name, color: color ?? nextTeamColor(used) };
  return { ...data, teams: [...data.teams, team] };
}

export function updateTeam(data: AppData, teamId: string, patch: { name?: string; color?: string }): AppData {
  const teams = data.teams.map((t) => (t.id === teamId ? { ...t, ...patch } : t));
  const team = teams.find((t) => t.id === teamId);
  if (!team) return data;
  const matches = data.matches.map((m) => {
    if (m.homeTeamId === teamId) return { ...m, homeLabel: team.name, homeColor: team.color };
    if (m.awayTeamId === teamId) return { ...m, awayLabel: team.name, awayColor: team.color };
    return m;
  });
  return { ...data, teams, matches };
}

export function addPlayer(
  data: AppData,
  teamId: string,
  name: string,
  number: number,
): AppData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const duplicate = data.players.some((p) => p.teamId === teamId && p.number === number);
  if (duplicate) return data;
  const player: Player = { id: uid("p"), teamId, name: trimmed, number };
  return { ...data, players: [...data.players, player] };
}

type BlankMatchInput = {
  sportId: SportId;
  competitionId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel: string;
  awayLabel: string;
  homeColor?: string;
  awayColor?: string;
  roundLabel: string;
  scheduledLabel: string;
  rules: SportRules;
  isFriendly?: boolean;
  status?: Match["status"];
};

function createSportMatch(input: BlankMatchInput): Match {
  if (input.sportId === "volleyball") {
    return createBlankVolleyballMatch({ ...input, rules: input.rules as VolleyballRules });
  }
  if (isRallySetSport(input.sportId)) {
    return createBlankTableTennisMatch({
      ...input,
      sportId: input.sportId,
      rules: input.rules as TableTennisRules,
    });
  }
  if (isPitchSport(input.sportId)) {
    return createBlankPitchMatch({
      ...input,
      sportId: input.sportId,
      rules: input.rules as PitchRules,
    });
  }
  if (input.sportId === "baseball") {
    return createBlankBaseballMatch({ ...input, rules: input.rules as BaseballRules });
  }
  return createBlankMatch({ ...input, rules: input.rules as BasketballRules });
}

function markByeWinner(match: Match, teamId: string, teamName: string) {
  match.winnerTeamId = teamId;
  match.winnerLabel = teamName;
  if (isBasketballMatch(match)) match.snapshot.homeScore = 1;
  if (isVolleyballMatch(match)) {
    match.snapshot.setsWonHome = 1;
    match.snapshot.setHistory = [{ home: 1, away: 0, winner: "home" }];
  }
  if (isRallySetMatch(match)) {
    match.snapshot.setsWonHome = 1;
    match.snapshot.setHistory = [{ home: 1, away: 0, winner: "home" }];
  }
  if (isPitchMatch(match)) match.snapshot.homeScore = 1;
  if (isBaseballMatch(match)) match.snapshot.homeScore = 1;
}

export function createCompetition(
  data: AppData,
  input: {
    name: string;
    dateLabel: string;
    format: Competition["format"];
    sportId?: SportId;
    rules: SportRules;
    officialPreset: boolean;
    teams?: { name: string; color: string }[];
    courtCount?: number;
  },
): { data: AppData; id: string } {
  const id = uid("comp");
  const sportId = input.sportId ?? "basketball";
  const competition: Competition = {
    id,
    name: input.name,
    sportId,
    status: "prep",
    format: input.format,
    dateLabel: input.dateLabel,
    courtCount: input.courtCount,
    rules: input.rules,
    officialPreset: input.officialPreset,
  };
  const teams: Team[] = (input.teams ?? [])
    .filter((t) => t.name.trim())
    .map((t) => ({ id: uid("team"), competitionId: id, name: t.name.trim(), color: t.color }));
  return { data: { ...data, competitions: [...data.competitions, competition], teams: [...data.teams, ...teams] }, id };
}

function generateLeagueSchedule(
  data: AppData,
  competitionId: string,
  competition: Competition,
  teams: Team[],
): AppData {
  const rules = competition.rules;
  const fixtures = roundRobinFixtures(teams);
  const matches = [
    ...data.matches.filter((m) => m.competitionId !== competitionId),
    ...fixtures.map(({ round, home, away }) =>
      createSportMatch({
        sportId: competition.sportId,
        competitionId,
        homeTeamId: home.id,
        awayTeamId: away.id,
        homeLabel: home.name,
        awayLabel: away.name,
        homeColor: home.color,
        awayColor: away.color,
        roundLabel: `${round}라운드`,
        scheduledLabel: `R${round}`,
        rules,
        status: "scheduled",
      }),
    ),
  ];
  return {
    ...data,
    matches,
    brackets: data.brackets.filter((b) => b.competitionId !== competitionId),
    competitions: data.competitions.map((c) =>
      c.id === competitionId ? { ...c, status: "in_progress" } : c,
    ),
  };
}

/** 원형 일정. 홀수 팀이면 BYE 자리로 한 경기 쉬게 한다. */
function roundRobinFixtures(teams: Team[]): { round: number; home: Team; away: Team }[] {
  type Slot = Team | { id: "bye"; name: string; color: string; competitionId?: string };
  const slots: Slot[] = [...teams];
  if (slots.length % 2 === 1) {
    slots.push({ id: "bye", name: "BYE", color: DEFAULT_AWAY_COLOR });
  }
  const n = slots.length;
  const rounds = n - 1;
  const half = n / 2;
  const out: { round: number; home: Team; away: Team }[] = [];
  let arr = [...slots];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home.id === "bye" || away.id === "bye") continue;
      out.push({ round: r + 1, home: home as Team, away: away as Team });
    }
    const fixed = arr[0];
    const rest = arr.slice(1);
    const last = rest.pop();
    if (last) rest.unshift(last);
    arr = [fixed, ...rest];
  }
  return out;
}

export function generateBracket(data: AppData, competitionId: string): AppData {
  const teams = teamsOf(data, competitionId);
  const competition = getCompetition(data, competitionId);
  if (!competition || teams.length < 2) return data;

  if (competition.format === "league") {
    return generateLeagueSchedule(data, competitionId, competition, teams);
  }

  const rules = competition.rules;
  const used = teams.slice(0, teams.length >= 4 ? 4 : teams.length);
  let matches = data.matches.filter((m) => m.competitionId !== competitionId);
  let brackets = data.brackets.filter((b) => b.competitionId !== competitionId);

  if (used.length === 2) {
    const match = createSportMatch({
      sportId: competition.sportId,
      competitionId,
      homeTeamId: used[0].id,
      awayTeamId: used[1].id,
      homeLabel: used[0].name,
      awayLabel: used[1].name,
      homeColor: used[0].color,
      awayColor: used[1].color,
      roundLabel: "결승",
      scheduledLabel: "미정",
      rules,
      status: "scheduled",
    });
    matches = [...matches, match];
    brackets = [
      ...brackets,
      {
        id: uid("br"),
        competitionId,
        round: "final",
        label: "결승",
        homeTeamId: used[0].id,
        awayTeamId: used[1].id,
        matchId: match.id,
      },
      { id: uid("br"), competitionId, round: "champion", label: "우승" },
    ];
  } else {
    const a = used[0];
    const b = used[1];
    const c = used[2];
    const d = used[3] ?? undefined;
    const sf1 = createSportMatch({
      sportId: competition.sportId,
      competitionId,
      homeTeamId: a.id,
      awayTeamId: b.id,
      homeLabel: a.name,
      awayLabel: b.name,
      homeColor: a.color,
      awayColor: b.color,
      roundLabel: "4강",
      scheduledLabel: "미정",
      rules,
    });
    const sf2 = d
      ? createSportMatch({
          sportId: competition.sportId,
          competitionId,
          homeTeamId: c.id,
          awayTeamId: d.id,
          homeLabel: c.name,
          awayLabel: d.name,
          homeColor: c.color,
          awayColor: d.color,
          roundLabel: "4강",
          scheduledLabel: "미정",
          rules,
        })
      : createSportMatch({
          sportId: competition.sportId,
          competitionId,
          homeTeamId: c.id,
          homeLabel: c.name,
          awayLabel: "BYE",
          homeColor: c.color,
          awayColor: DEFAULT_AWAY_COLOR,
          roundLabel: "4강",
          scheduledLabel: "자동승",
          rules,
          status: "completed",
        });
    if (!d) {
      markByeWinner(sf2, c.id, c.name);
    }
    const final = createSportMatch({
      sportId: competition.sportId,
      competitionId,
      homeLabel: "승자",
      awayLabel: "승자",
      roundLabel: "결승",
      scheduledLabel: "미정",
      rules,
    });
    matches = [...matches, sf1, sf2, final];
    brackets = [
      ...brackets,
      {
        id: uid("br"),
        competitionId,
        round: "sf",
        label: "4강",
        homeTeamId: a.id,
        awayTeamId: b.id,
        matchId: sf1.id,
      },
      {
        id: uid("br"),
        competitionId,
        round: "sf",
        label: "4강",
        homeTeamId: c.id,
        awayTeamId: d?.id,
        matchId: sf2.id,
        bye: !d,
      },
      { id: uid("br"), competitionId, round: "final", label: "결승", matchId: final.id },
      { id: uid("br"), competitionId, round: "champion", label: "우승" },
    ];
    if (!d) {
      const finalSlot = brackets.find((x) => x.round === "final" && x.competitionId === competitionId);
      if (finalSlot) finalSlot.awayTeamId = c.id;
      const fm = matches.find((m) => m.id === final.id);
      if (fm) {
        fm.awayTeamId = c.id;
        fm.awayLabel = c.name;
        fm.awayColor = c.color;
      }
    }
  }

  return {
    ...data,
    matches,
    brackets,
    competitions: data.competitions.map((c) =>
      c.id === competitionId ? { ...c, status: "in_progress" } : c,
    ),
  };
}

export function createFriendly(
  data: AppData,
  input: {
    sportId?: SportId;
    homeName: string;
    awayName: string;
    homeColor?: string;
    awayColor?: string;
    rules?: SportRules;
    homePlayers?: { name: string; number: number }[];
    awayPlayers?: { name: string; number: number }[];
  },
): { data: AppData; matchId: string } {
  const homeTeam: Team = {
    id: uid("team"),
    name: input.homeName || "홈",
    color: input.homeColor ?? DEFAULT_HOME_COLOR,
  };
  const awayTeam: Team = {
    id: uid("team"),
    name: input.awayName || "어웨이",
    color: input.awayColor ?? DEFAULT_AWAY_COLOR,
  };
  const toPlayers = (teamId: string, drafts: { name: string; number: number }[] = []): Player[] =>
    drafts
      .filter((p) => p.name.trim())
      .map((p) => ({ id: uid("p"), teamId, name: p.name.trim(), number: p.number || 0 }));
  const players = [...toPlayers(homeTeam.id, input.homePlayers), ...toPlayers(awayTeam.id, input.awayPlayers)];
  const hasPlayers = players.length > 0;
  const sportId = input.sportId ?? "basketball";
  const rules = input.rules ?? BASKETBALL_CLUB_PRESET.rules;
  const skipLineup = sportId !== "basketball" || !hasPlayers;
  const match = createSportMatch({
    sportId,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeLabel: homeTeam.name,
    awayLabel: awayTeam.name,
    homeColor: homeTeam.color,
    awayColor: awayTeam.color,
    roundLabel: "친선",
    scheduledLabel: "지금",
    rules,
    isFriendly: true,
    status: skipLineup ? "in_progress" : "lineup",
  });
  if (skipLineup && isBasketballMatch(match)) {
    match.snapshot.clockRunning = false;
    match.snapshot.started = false;
  }
  return {
    data: {
      ...data,
      teams: [...data.teams, homeTeam, awayTeam],
      players: [...data.players, ...players],
      matches: [...data.matches, match],
    },
    matchId: match.id,
  };
}

export {
  applyFoul,
  applyPoint,
  applySub,
  applyTimeout,
  confirmMatchEnd,
  confirmPeriodEnd,
  createSeedState,
  endTimeout,
  forfeitMatch,
  pauseMatch,
  resumeMatch,
  startMatch,
  startOvertime,
  tickClock,
  undoLast,
  BASKETBALL_CLUB_PRESET,
};
