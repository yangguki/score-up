import { create } from "zustand";
import type { AppData, BasketballRules, Match, Side } from "@score-up/domain";
import {
  addPlayer,
  addTeam,
  updateTeam,
  advanceBracket,
  applyFoul,
  applyPoint,
  applySub,
  applyTimeout,
  confirmMatchEnd,
  endTimeout,
  confirmPeriodEnd,
  createCompetition,
  createFriendly,
  createSeedState,
  forfeitMatch,
  generateBracket,
  getMatch,
  pauseMatch,
  replaceMatch,
  resumeMatch,
  startMatch,
  startOvertime,
  teamIdFor,
  tickClock,
  undoLast,
} from "@score-up/mock";

type Store = AppData & {
  patchMatch: (id: string, fn: (match: Match) => Match) => void;
  addPoint: (matchId: string, side: Side, points: 1 | 2 | 3, playerId?: string) => void;
  addFoul: (matchId: string, side: Side, playerId: string) => { foulOut: boolean; nextOut: boolean };
  addTimeout: (matchId: string, side: Side) => void;
  finishTimeout: (matchId: string) => void;
  sub: (matchId: string, side: Side, outPlayerId: string, inPlayerId: string) => void;
  undo: (matchId: string) => void;
  tick: (matchId: string, dtMs: number) => void;
  pause: (matchId: string) => void;
  resume: (matchId: string) => void;
  confirmPeriod: (matchId: string) => void;
  confirmMatch: (matchId: string) => void;
  goOvertime: (matchId: string) => void;
  forfeit: (matchId: string, winner: Side) => void;
  abandon: (matchId: string) => void;
  beginMatch: (matchId: string, onCourtHome: string[], onCourtAway: string[]) => void;
  createComp: (input: {
    name: string;
    dateLabel: string;
    format: "tournament" | "league";
    rules: BasketballRules;
    officialPreset: boolean;
    teams?: { name: string; color: string }[];
  }) => string;
  addTeamTo: (competitionId: string, name: string, color?: string) => void;
  updateTeamAt: (teamId: string, patch: { name?: string; color?: string }) => void;
  addPlayerTo: (teamId: string, name: string, number: number) => void;
  makeBracket: (competitionId: string) => void;
  makeFriendly: (input: {
    homeName: string;
    awayName: string;
    homeColor: string;
    awayColor: string;
    rules: BasketballRules;
    homePlayers: { name: string; number: number }[];
    awayPlayers: { name: string; number: number }[];
  }) => string;
  reset: () => void;
};

function commitMatch(data: AppData, match: Match): AppData {
  let next = replaceMatch(data, match);
  if (match.status === "completed" || match.status === "forfeited") {
    next = advanceBracket(next, match);
  }
  return next;
}

export const useAppStore = create<Store>((set, get) => ({
  ...createSeedState(),
  patchMatch: (id, fn) => {
    const match = getMatch(get(), id);
    if (!match) return;
    set(commitMatch(get(), fn(match)));
  },
  addPoint: (matchId, side, points, playerId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(commitMatch(get(), applyPoint(match, teamIdFor(match, side), points, playerId)));
  },
  addFoul: (matchId, side, playerId) => {
    const match = getMatch(get(), matchId);
    if (!match) return { foulOut: false, nextOut: false };
    const result = applyFoul(match, match.rules, teamIdFor(match, side), playerId);
    set(commitMatch(get(), result.match));
    return { foulOut: result.foulOut, nextOut: result.nextOut };
  },
  addTimeout: (matchId, side) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(commitMatch(get(), applyTimeout(match, teamIdFor(match, side), match.rules)));
  },
  finishTimeout: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), endTimeout(match)));
  },
  sub: (matchId, side, outPlayerId, inPlayerId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(commitMatch(get(), applySub(match, teamIdFor(match, side), outPlayerId, inPlayerId)));
  },
  undo: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(commitMatch(get(), undoLast(match, match.rules)));
  },
  tick: (matchId, dtMs) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    const next = tickClock(match, dtMs, match.rules);
    if (next === match) return;
    set(replaceMatch(get(), next));
  },
  pause: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), pauseMatch(match)));
  },
  resume: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), resumeMatch(match)));
  },
  confirmPeriod: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), confirmPeriodEnd(match, match.rules)));
  },
  confirmMatch: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(commitMatch(get(), confirmMatchEnd(match)));
  },
  goOvertime: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), startOvertime(match, match.rules)));
  },
  forfeit: (matchId, winner) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(commitMatch(get(), forfeitMatch(match, winner)));
  },
  abandon: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), { ...match, status: "abandoned", snapshot: { ...match.snapshot, clockRunning: false } }));
  },
  beginMatch: (matchId, onCourtHome, onCourtAway) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    set(replaceMatch(get(), startMatch(match, onCourtHome, onCourtAway)));
  },
  createComp: (input) => {
    const { data, id } = createCompetition(get(), input);
    set(data);
    return id;
  },
  addTeamTo: (competitionId, name, color) => set(addTeam(get(), competitionId, name, color)),
  updateTeamAt: (teamId, patch) => set(updateTeam(get(), teamId, patch)),
  addPlayerTo: (teamId, name, number) => set(addPlayer(get(), teamId, name, number)),
  makeBracket: (competitionId) => set(generateBracket(get(), competitionId)),
  makeFriendly: (input) => {
    const { data, matchId } = createFriendly(get(), input);
    set(data);
    return matchId;
  },
  reset: () => set({ ...createSeedState() }),
}));
