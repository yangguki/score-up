import {
  BASKETBALL_CLUB_PRESET,
  BADMINTON_CLUB_PRESET,
  BASEBALL_CLUB_PRESET,
  FUTSAL_CLUB_PRESET,
  SOCCER_CLUB_PRESET,
  SQUASH_CLUB_PRESET,
  TABLE_TENNIS_CLUB_PRESET,
  VOLLEYBALL_CLUB_PRESET,
  type AppData,
  type Match,
  type MatchEvent,
  type Player,
} from "@score-up/domain";
import {
  emptyBaseballSnapshot,
  emptyPitchSnapshot,
  emptySnapshot,
  emptyTableTennisSnapshot,
  emptyVolleyballSnapshot,
} from "@score-up/domain";

const RULES = BASKETBALL_CLUB_PRESET.rules;
const VB_RULES = VOLLEYBALL_CLUB_PRESET.rules;
const TT_RULES = TABLE_TENNIS_CLUB_PRESET.rules;
const BD_RULES = BADMINTON_CLUB_PRESET.rules;
const SQ_RULES = SQUASH_CLUB_PRESET.rules;
const SC_RULES = SOCCER_CLUB_PRESET.rules;
const FT_RULES = FUTSAL_CLUB_PRESET.rules;
const BB_RULES = BASEBALL_CLUB_PRESET.rules;

const TIGER = "team-tiger";
const EAGLE = "team-eagle";
const SHARK = "team-shark";
const WOLF = "team-wolf";
const COMP = "comp-weekend";
const OFFICE = "comp-office";
const SF1 = "match-sf1";
const SF2 = "match-sf2";
const FINAL = "match-final";
const VB1 = "match-vb1";
const TT1 = "match-tt1";
const BD1 = "match-bd1";
const SQ1 = "match-sq1";
const SC1 = "match-sc1";
const FT1 = "match-ft1";
const BB1 = "match-bb1";

function p(id: string, teamId: string, number: number, name: string): Player {
  return { id, teamId, number, name };
}

function ev(
  id: string,
  type: MatchEvent["type"],
  quarter: number,
  clockMs: number,
  extra: Partial<MatchEvent> = {},
): MatchEvent {
  return {
    id,
    matchId: SF1,
    type,
    quarter,
    clockMs,
    createdAt: Date.now() - 600_000,
    revoked: false,
    ...extra,
  };
}

function seededSf1(): Match {
  const snapshot = emptySnapshot(RULES, TIGER, EAGLE);
  snapshot.quarter = 2;
  snapshot.clockMs = (5 * 60 + 32) * 1000;
  snapshot.clockRunning = false;
  snapshot.started = true;
  snapshot.homeScore = 24;
  snapshot.awayScore = 18;
  snapshot.homeTeamFoulsInQuarter = 3;
  snapshot.awayTeamFoulsInQuarter = 4;
  snapshot.periodScores = [{ home: 18, away: 16 }];
  snapshot.onCourtHome = ["p-t12", "p-t5", "p-t7", "p-t8", "p-t11"];
  snapshot.onCourtAway = ["p-e4", "p-e9", "p-e15", "p-e2", "p-e6"];
  snapshot.playerFouls = {
    "p-t12": 2,
    "p-t5": 5,
    "p-t7": 1,
    "p-e4": 3,
    "p-e9": 2,
  };
  snapshot.timeoutsLeft = { [TIGER]: 1, [EAGLE]: 2 };

  const events: MatchEvent[] = [
    ev("ev-1", "timeout", 2, (6 * 60 + 10) * 1000, {
      teamId: TIGER,
    }),
    ev("ev-2", "foul", 2, (5 * 60 + 48) * 1000, {
      teamId: EAGLE,
      playerId: "p-e4",
      payload: { personalFouls: 3, teamFouls: 4 },
    }),
    ev("ev-3", "point", 2, (5 * 60 + 32) * 1000, {
      teamId: TIGER,
      playerId: "p-t12",
      payload: { points: 2 },
    }),
  ];

  return {
    id: SF1,
    sportId: "basketball",
    competitionId: COMP,
    homeTeamId: TIGER,
    awayTeamId: EAGLE,
    homeLabel: "호랑이",
    awayLabel: "독수리",
    homeColor: "#B91C1C",
    awayColor: "#1D4ED8",
    roundLabel: "4강",
    scheduledLabel: "오늘 14:00",
    status: "in_progress",
    snapshot,
    events,
    isFriendly: false,
    rules: RULES,
  };
}

export function createSeedState(): AppData {
  return {
    competitions: [
      {
        id: COMP,
        name: "주말 농구 토너먼트",
        sportId: "basketball",
        status: "in_progress",
        format: "tournament",
        dateLabel: "2026-08-22",
        rules: RULES,
        officialPreset: false,
      },
      {
        id: OFFICE,
        name: "사내 농구 대회",
        sportId: "basketball",
        status: "prep",
        format: "league",
        dateLabel: "2026-08-29",
        rules: RULES,
        officialPreset: false,
      },
    ],
    teams: [
      { id: TIGER, competitionId: COMP, name: "호랑이", color: "#B91C1C" },
      { id: EAGLE, competitionId: COMP, name: "독수리", color: "#1D4ED8" },
      { id: SHARK, competitionId: COMP, name: "상어", color: "#0F766E" },
      { id: WOLF, competitionId: COMP, name: "늑대", color: "#111827" },
      { id: "team-office-a", competitionId: OFFICE, name: "기획실", color: "#B45309" },
      { id: "team-office-b", competitionId: OFFICE, name: "개발팀", color: "#1D4ED8" },
      { id: "team-office-c", competitionId: OFFICE, name: "디자인", color: "#0F766E" },
      { id: "team-office-d", competitionId: OFFICE, name: "영업부", color: "#7C3AED" },
      { id: TEAM_CA, name: "A", color: "#B91C1C" },
      { id: TEAM_CB, name: "B", color: "#1D4ED8" },
      { id: TEAM_CA2, name: "A", color: "#B91C1C" },
      { id: TEAM_CB2, name: "B", color: "#1D4ED8" },
      { id: TEAM_CA3, name: "A", color: "#B91C1C" },
      { id: TEAM_CB3, name: "B", color: "#1D4ED8" },
    ],
    players: [
      p("p-t12", TIGER, 12, "김민수"),
      p("p-t5", TIGER, 5, "박지훈"),
      p("p-t7", TIGER, 7, "이서연"),
      p("p-t21", TIGER, 21, "한지호"),
      p("p-t8", TIGER, 8, "정우성"),
      p("p-t11", TIGER, 11, "오세훈"),
      p("p-t3", TIGER, 3, "윤다혜"),
      p("p-e4", EAGLE, 4, "최유진"),
      p("p-e9", EAGLE, 9, "강태민"),
      p("p-e15", EAGLE, 15, "문하늘"),
      p("p-e2", EAGLE, 2, "서지호"),
      p("p-e6", EAGLE, 6, "배도윤"),
      p("p-e22", EAGLE, 22, "임하린"),
      p("p-e10", EAGLE, 10, "조은우"),
      p("p-s1", SHARK, 1, "신재혁"),
      p("p-s8", SHARK, 8, "노지민"),
      p("p-s13", SHARK, 13, "하준서"),
      p("p-s4", SHARK, 4, "권소율"),
      p("p-s11", SHARK, 11, "표시우"),
      p("p-s7", SHARK, 7, "안예준"),
      p("p-w5", WOLF, 5, "유태양"),
      p("p-w9", WOLF, 9, "백서아"),
      p("p-w14", WOLF, 14, "홍지성"),
      p("p-w3", WOLF, 3, "남도하"),
      p("p-w21", WOLF, 21, "채민재"),
      p("p-w8", WOLF, 8, "설아린"),
    ],
    matches: [
      seededSf1(),
      {
        id: SF2,
        sportId: "basketball",
        competitionId: COMP,
        homeTeamId: SHARK,
        awayTeamId: WOLF,
        homeLabel: "상어",
        awayLabel: "늑대",
        homeColor: "#0F766E",
        awayColor: "#111827",
        roundLabel: "4강",
        scheduledLabel: "오늘 15:30",
        status: "scheduled",
        snapshot: emptySnapshot(RULES, SHARK, WOLF),
        events: [],
        isFriendly: false,
        rules: RULES,
      },
      {
        id: FINAL,
        sportId: "basketball",
        competitionId: COMP,
        homeLabel: "승자",
        awayLabel: "승자",
        homeColor: "#1D4ED8",
        awayColor: "#B91C1C",
        roundLabel: "결승",
        scheduledLabel: "오늘 17:00",
        status: "scheduled",
        snapshot: emptySnapshot(RULES),
        events: [],
        isFriendly: false,
        rules: RULES,
      },
      {
        id: VB1,
        sportId: "volleyball",
        homeLabel: "블루",
        awayLabel: "레드",
        homeColor: "#1D4ED8",
        awayColor: "#B91C1C",
        roundLabel: "친선",
        scheduledLabel: "오늘 배구",
        status: "in_progress",
        snapshot: emptyVolleyballSnapshot(VB_RULES),
        events: [],
        isFriendly: true,
        rules: VB_RULES,
      },
      {
        id: TT1,
        sportId: "table-tennis",
        homeLabel: "김민수",
        awayLabel: "박지훈",
        homeColor: "#B91C1C",
        awayColor: "#1D4ED8",
        roundLabel: "친선",
        scheduledLabel: "오늘 탁구",
        status: "in_progress",
        snapshot: emptyTableTennisSnapshot(),
        events: [],
        isFriendly: true,
        rules: TT_RULES,
      },
      {
        id: BD1,
        sportId: "badminton",
        homeLabel: "최은지",
        awayLabel: "한소라",
        homeColor: "#0F766E",
        awayColor: "#B91C1C",
        roundLabel: "친선",
        scheduledLabel: "오늘 배드민턴",
        status: "in_progress",
        snapshot: emptyTableTennisSnapshot(),
        events: [],
        isFriendly: true,
        rules: BD_RULES,
      },
      {
        id: SQ1,
        sportId: "squash",
        homeLabel: "정우성",
        awayLabel: "오세훈",
        homeColor: "#9A3412",
        awayColor: "#1D4ED8",
        roundLabel: "친선",
        scheduledLabel: "오늘 스쿼시",
        status: "in_progress",
        snapshot: emptyTableTennisSnapshot(),
        events: [],
        isFriendly: true,
        rules: SQ_RULES,
      },
      {
        id: SC1,
        sportId: "soccer",
        homeLabel: "그린",
        awayLabel: "네이비",
        homeColor: "#276749",
        awayColor: "#1A365D",
        roundLabel: "친선",
        scheduledLabel: "오늘 축구",
        status: "scheduled",
        snapshot: emptyPitchSnapshot(SC_RULES),
        events: [],
        isFriendly: true,
        rules: SC_RULES,
      },
      {
        id: FT1,
        sportId: "futsal",
        homeLabel: "시티",
        awayLabel: "포트",
        homeColor: "#1D4ED8",
        awayColor: "#B91C1C",
        roundLabel: "친선",
        scheduledLabel: "오늘 풋살",
        status: "scheduled",
        snapshot: emptyPitchSnapshot(FT_RULES),
        events: [],
        isFriendly: true,
        rules: FT_RULES,
      },
      {
        id: BB1,
        sportId: "baseball",
        homeLabel: "타이거즈",
        awayLabel: "이글스",
        homeColor: "#1A365D",
        awayColor: "#C53030",
        roundLabel: "친선",
        scheduledLabel: "오늘 야구",
        status: "scheduled",
        snapshot: emptyBaseballSnapshot(),
        events: [],
        isFriendly: true,
        rules: BB_RULES,
      },
      clubDoneMatch(MATCH_CLUB_1, SES_DONE_1, TEAM_CA, TEAM_CB, "home", "2026-08-08"),
      clubDoneMatch(MATCH_CLUB_2, SES_DONE_2, TEAM_CA2, TEAM_CB2, "away", "2026-08-15"),
      clubDoneMatch(MATCH_CLUB_3, SES_DONE_3, TEAM_CA3, TEAM_CB3, "home", "2026-08-22"),
    ],
    brackets: [
      {
        id: "br-sf1",
        competitionId: COMP,
        round: "sf",
        label: "4강",
        homeTeamId: TIGER,
        awayTeamId: EAGLE,
        matchId: SF1,
      },
      {
        id: "br-sf2",
        competitionId: COMP,
        round: "sf",
        label: "4강",
        homeTeamId: SHARK,
        awayTeamId: WOLF,
        matchId: SF2,
      },
      {
        id: "br-final",
        competitionId: COMP,
        round: "final",
        label: "결승",
        matchId: FINAL,
      },
      { id: "br-champ", competitionId: COMP, round: "champion", label: "우승" },
    ],
    ...seedClubFields(),
  };
}

const CLUB = "club-weekend";
const SES_VOTE = "ses-vote";
const SES_DONE_1 = "ses-done-1";
const SES_DONE_2 = "ses-done-2";
const SES_DONE_3 = "ses-done-3";
const MATCH_CLUB_1 = "match-club-1";
const MATCH_CLUB_2 = "match-club-2";
const MATCH_CLUB_3 = "match-club-3";
const TEAM_CA = "team-club-a";
const TEAM_CB = "team-club-b";
const TEAM_CA2 = "team-club-a2";
const TEAM_CB2 = "team-club-b2";
const TEAM_CA3 = "team-club-a3";
const TEAM_CB3 = "team-club-b3";

const CLUB_PEOPLE = [
  ["acc-minsu", "김민수"],
  ["acc-jihun", "박지훈"],
  ["acc-seoyeon", "이서연"],
  ["acc-jiho", "한지호"],
  ["acc-woosung", "정우성"],
  ["acc-sehun", "오세훈"],
  ["acc-dahye", "윤다혜"],
  ["acc-yujin", "최유진"],
  ["acc-taemin", "강태민"],
  ["acc-haneul", "문하늘"],
  ["acc-seojiho", "서지호"],
  ["acc-doyun", "배도윤"],
  ["acc-minho", "이민호"],
] as const;

function seedClubFields(): Pick<
  AppData,
  | "accountId"
  | "accounts"
  | "clubs"
  | "clubMembers"
  | "sessions"
  | "sessionVotes"
  | "sessionGuests"
  | "sessionAssignments"
> {
  const accounts = CLUB_PEOPLE.map(([id, name]) => ({ id, name }));
  const active = CLUB_PEOPLE.slice(0, 12);
  const going = active.slice(0, 8);
  const maybe = active.slice(8, 10);
  const notGoing = active.slice(10, 11);
  const home1 = active.slice(0, 5);
  const away1 = active.slice(5, 10);
  const home2 = [active[1], active[2], active[3], active[4], active[5]] as const;
  const away2 = [active[0], active[6], active[7], active[8], active[9]] as const;
  const home3 = [active[0], active[2], active[4], active[6], active[8]] as const;
  const away3 = [active[1], active[3], active[5], active[7], active[9]] as const;

  const assignment = (
    sessionId: string,
    people: readonly (readonly [string, string])[],
    side: "home" | "away",
    prefix: string,
  ) =>
    people.map(([accountId], index) => ({
      id: `${prefix}-${index}`,
      sessionId,
      accountId,
      side,
    }));

  return {
    accountId: "acc-minsu",
    accounts,
    clubs: [
      {
        id: CLUB,
        name: "주말 농구 모임",
        sportId: "basketball",
        venue: "시민체육관 3코트",
        inviteToken: "ab12cd",
        ownerAccountId: "acc-minsu",
        seasonLabel: "2026",
        weekday: 6,
        weeklyTime: "14:00",
      },
    ],
    clubMembers: [
      ...active.map(([accountId], index) => ({
        id: `cm-${index}`,
        clubId: CLUB,
        accountId,
        role: index === 0 ? ("owner" as const) : index === 1 ? ("operator" as const) : ("member" as const),
        status: "active" as const,
      })),
      { id: "cm-pending", clubId: CLUB, accountId: "acc-minho", role: "member", status: "pending" },
    ],
    sessions: [
      {
        id: SES_VOTE,
        clubId: CLUB,
        dateLabel: "2026-08-29",
        timeLabel: "14:00",
        venue: "시민체육관 3코트",
        voteDeadlineLabel: "12:00",
        status: "voting",
        recurring: true,
      },
      {
        id: SES_DONE_1,
        clubId: CLUB,
        dateLabel: "2026-08-08",
        timeLabel: "14:00",
        venue: "시민체육관 3코트",
        voteDeadlineLabel: "12:00",
        status: "completed",
        recurring: true,
        matchId: MATCH_CLUB_1,
      },
      {
        id: SES_DONE_2,
        clubId: CLUB,
        dateLabel: "2026-08-15",
        timeLabel: "14:00",
        venue: "시민체육관 3코트",
        voteDeadlineLabel: "12:00",
        status: "completed",
        recurring: true,
        matchId: MATCH_CLUB_2,
      },
      {
        id: SES_DONE_3,
        clubId: CLUB,
        dateLabel: "2026-08-22",
        timeLabel: "14:00",
        venue: "시민체육관 3코트",
        voteDeadlineLabel: "12:00",
        status: "completed",
        recurring: true,
        matchId: MATCH_CLUB_3,
      },
    ],
    sessionVotes: [
      ...going.map(([accountId], index) => ({
        id: `vote-g-${index}`,
        sessionId: SES_VOTE,
        accountId,
        value: "going" as const,
      })),
      ...maybe.map(([accountId], index) => ({
        id: `vote-m-${index}`,
        sessionId: SES_VOTE,
        accountId,
        value: "maybe" as const,
      })),
      ...notGoing.map(([accountId], index) => ({
        id: `vote-n-${index}`,
        sessionId: SES_VOTE,
        accountId,
        value: "not_going" as const,
      })),
    ],
    sessionGuests: [],
    sessionAssignments: [
      ...assignment(SES_DONE_1, home1, "home", "asg1h"),
      ...assignment(SES_DONE_1, away1, "away", "asg1a"),
      ...assignment(SES_DONE_2, home2, "home", "asg2h"),
      ...assignment(SES_DONE_2, away2, "away", "asg2a"),
      ...assignment(SES_DONE_3, home3, "home", "asg3h"),
      ...assignment(SES_DONE_3, away3, "away", "asg3a"),
    ],
  };
}

function clubDoneMatch(
  id: string,
  sessionId: string,
  homeTeamId: string,
  awayTeamId: string,
  winner: "home" | "away",
  dateLabel: string,
): Match {
  const snapshot = emptySnapshot(RULES, homeTeamId, awayTeamId);
  snapshot.started = true;
  snapshot.homeScore = winner === "home" ? 62 : 55;
  snapshot.awayScore = winner === "home" ? 55 : 62;
  snapshot.clockMs = 0;
  return {
    id,
    sportId: "basketball",
    sessionId,
    homeTeamId,
    awayTeamId,
    homeLabel: "A",
    awayLabel: "B",
    homeColor: "#B91C1C",
    awayColor: "#1D4ED8",
    roundLabel: "회차",
    scheduledLabel: dateLabel,
    status: "completed",
    snapshot,
    events: [],
    winnerTeamId: winner === "home" ? homeTeamId : awayTeamId,
    winnerLabel: winner === "home" ? "A" : "B",
    isFriendly: false,
    rules: RULES,
  };
}

export const SEED_IDS = {
  COMP,
  OFFICE,
  SF1,
  SF2,
  FINAL,
  VB1,
  TT1,
  BD1,
  SQ1,
  TIGER,
  EAGLE,
  SHARK,
  WOLF,
  CLUB,
  SES_VOTE,
};
