import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppData, Match, SessionSide, Side, SportId, SportRules, VoteValue } from "@score-up/domain";
import { APP_PERSIST_NAME, APP_PERSIST_VERSION, createAppPersistStorage, isAppData, withClubDefaults } from "./persist";
import { isBasketballMatch, isTableTennisMatch, isVolleyballMatch } from "@score-up/domain";
import {
  addPlayer,
  addTeam,
  updateTeam,
  advanceBracket,
  applyFoul,
  applyPoint,
  applySub,
  applyTimeout,
  applyVolleyballPoint,
  applyVolleyballTimeout,
  applyTableTennisPoint,
  changeTableTennisServe,
  changeVolleyballServe,
  confirmMatchEnd,
  confirmPeriodEnd,
  confirmVolleyballMatch,
  confirmVolleyballSet,
  confirmTableTennisMatch,
  confirmTableTennisSet,
  createCompetition,
  createFriendly,
  createSeedState,
  endTimeout,
  forfeitMatch,
  forfeitVolleyballMatch,
  forfeitTableTennisMatch,
  generateBracket,
  getMatch,
  pauseMatch,
  pauseTableTennisMatch,
  requestPeriodEnd,
  replaceMatch,
  resumeMatch,
  resumeTableTennisMatch,
  startMatch,
  startOvertime,
  startVolleyballMatch,
  startTableTennisMatch,
  teamIdFor,
  tickClock,
  undoLast,
  undoVolleyballLast,
  undoTableTennisLast,
  addGuest,
  cancelSession,
  closeVoting,
  confirmSplit,
  createClub,
  createSessions,
  decideJoin,
  dissolveClub,
  dropCandidate,
  requestJoin,
  setAssignment,
  setMemberGoing,
  setVote,
  signIn,
  signOut,
  syncSessionFromMatch,
  updateClub,
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
  requestPeriodEnd: (matchId: string) => void;
  confirmMatch: (matchId: string) => void;
  goOvertime: (matchId: string) => void;
  forfeit: (matchId: string, winner: Side) => void;
  abandon: (matchId: string) => void;
  beginMatch: (matchId: string, onCourtHome: string[], onCourtAway: string[]) => void;
  changeServe: (matchId: string) => void;
  startVolleyball: (matchId: string, openingServe?: Side) => void;
  startTableTennis: (matchId: string, openingServe?: Side) => void;
  createComp: (input: {
    name: string;
    dateLabel: string;
    format: "tournament" | "league";
    sportId?: SportId;
    rules: SportRules;
    officialPreset: boolean;
    teams?: { name: string; color: string }[];
    courtCount?: number;
  }) => string;
  addTeamTo: (competitionId: string, name: string, color?: string) => void;
  updateTeamAt: (teamId: string, patch: { name?: string; color?: string }) => void;
  addPlayerTo: (teamId: string, name: string, number: number) => void;
  makeBracket: (competitionId: string) => void;
  makeFriendly: (input: {
    sportId?: SportId;
    homeName: string;
    awayName: string;
    homeColor: string;
    awayColor: string;
    rules: SportRules;
    homePlayers: { name: string; number: number }[];
    awayPlayers: { name: string; number: number }[];
  }) => string;
  signInAs: (name: string) => void;
  signOutAccount: () => void;
  createClubAt: (input: { name: string; venue?: string }) => string;
  requestJoinAt: (token: string) => void;
  decideJoinAt: (memberId: string, accept: boolean) => void;
  createSessionsAt: (clubId: string, input: { dateLabel: string; timeLabel: string; venue: string; weekly: boolean }) => string;
  setVoteAt: (sessionId: string, value: VoteValue) => void;
  closeVotingAt: (sessionId: string) => void;
  addGuestAt: (sessionId: string, name: string) => void;
  setMemberGoingAt: (sessionId: string, accountId: string) => void;
  dropCandidateAt: (sessionId: string, accountId?: string, guestId?: string) => void;
  setAssignmentAt: (sessionId: string, key: { accountId?: string; guestId?: string }, side: SessionSide) => void;
  confirmSplitAt: (sessionId: string) => string;
  cancelSessionAt: (sessionId: string) => void;
  updateClubAt: (clubId: string, patch: { name?: string; venue?: string; seasonLabel?: string }) => void;
  dissolveClubAt: (clubId: string) => void;
  reset: () => void;
};

function commitMatch(data: AppData, match: Match): AppData {
  let next = replaceMatch(data, match);
  if (match.status === "completed" || match.status === "forfeited") {
    next = advanceBracket(next, match);
  }
  return syncSessionFromMatch(next, match);
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createSeedState(),
  patchMatch: (id, fn) => {
    const match = getMatch(get(), id);
    if (!match) return;
    set(commitMatch(get(), fn(match)));
  },
  addPoint: (matchId, side, points, playerId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(commitMatch(get(), applyVolleyballPoint(match, teamIdFor(match, side))));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(commitMatch(get(), applyTableTennisPoint(match, teamIdFor(match, side))));
      return;
    }
    set(commitMatch(get(), applyPoint(match, teamIdFor(match, side), points, playerId)));
  },
  addFoul: (matchId, side, playerId) => {
    const match = getMatch(get(), matchId);
    if (!match || !isBasketballMatch(match)) return { foulOut: false, nextOut: false };
    const result = applyFoul(match, match.rules, teamIdFor(match, side), playerId);
    set(commitMatch(get(), result.match));
    return { foulOut: result.foulOut, nextOut: result.nextOut };
  },
  addTimeout: (matchId, side) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(commitMatch(get(), applyVolleyballTimeout(match, teamIdFor(match, side))));
      return;
    }
    if (!isBasketballMatch(match)) return;
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
    if (isVolleyballMatch(match)) {
      set(commitMatch(get(), undoVolleyballLast(match)));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(commitMatch(get(), undoTableTennisLast(match)));
      return;
    }
    if (isBasketballMatch(match)) {
      set(commitMatch(get(), undoLast(match, match.rules)));
    }
  },
  tick: (matchId, dtMs) => {
    const match = getMatch(get(), matchId);
    if (!match || !isBasketballMatch(match)) return;
    const next = tickClock(match, dtMs, match.rules);
    if (next === match) return;
    set(replaceMatch(get(), next));
  },
  pause: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isTableTennisMatch(match)) {
      set(replaceMatch(get(), pauseTableTennisMatch(match)));
      return;
    }
    set(replaceMatch(get(), pauseMatch(match)));
  },
  resume: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isTableTennisMatch(match)) {
      set(replaceMatch(get(), resumeTableTennisMatch(match)));
      return;
    }
    set(replaceMatch(get(), resumeMatch(match)));
  },
  confirmPeriod: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(replaceMatch(get(), confirmVolleyballSet(match)));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(replaceMatch(get(), confirmTableTennisSet(match)));
      return;
    }
    if (isBasketballMatch(match)) {
      set(replaceMatch(get(), confirmPeriodEnd(match, match.rules)));
    }
  },
  requestPeriodEnd: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match || !isBasketballMatch(match)) return;
    set(replaceMatch(get(), requestPeriodEnd(match, match.rules)));
  },
  confirmMatch: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(commitMatch(get(), confirmVolleyballMatch(match)));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(commitMatch(get(), confirmTableTennisMatch(match)));
      return;
    }
    set(commitMatch(get(), confirmMatchEnd(match)));
  },
  goOvertime: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match || !isBasketballMatch(match)) return;
    set(replaceMatch(get(), startOvertime(match, match.rules)));
  },
  forfeit: (matchId, winner) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(commitMatch(get(), forfeitVolleyballMatch(match, winner)));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(commitMatch(get(), forfeitTableTennisMatch(match, winner)));
      return;
    }
    set(commitMatch(get(), forfeitMatch(match, winner)));
  },
  abandon: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isBasketballMatch(match)) {
      set(
        commitMatch(get(), {
          ...match,
          status: "abandoned",
          snapshot: { ...match.snapshot, clockRunning: false },
        }),
      );
      return;
    }
    set(replaceMatch(get(), { ...match, status: "abandoned" }));
  },
  beginMatch: (matchId, onCourtHome, onCourtAway) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(replaceMatch(get(), startVolleyballMatch(match, "home")));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(replaceMatch(get(), startTableTennisMatch(match, "home")));
      return;
    }
    set(commitMatch(get(), startMatch(match, onCourtHome, onCourtAway)));
  },
  changeServe: (matchId) => {
    const match = getMatch(get(), matchId);
    if (!match) return;
    if (isVolleyballMatch(match)) {
      set(commitMatch(get(), changeVolleyballServe(match)));
      return;
    }
    if (isTableTennisMatch(match)) {
      set(commitMatch(get(), changeTableTennisServe(match)));
    }
  },
  startVolleyball: (matchId, openingServe = "home") => {
    const match = getMatch(get(), matchId);
    if (!match || !isVolleyballMatch(match)) return;
    set(replaceMatch(get(), startVolleyballMatch(match, openingServe)));
  },
  startTableTennis: (matchId, openingServe = "home") => {
    const match = getMatch(get(), matchId);
    if (!match || !isTableTennisMatch(match)) return;
    set(replaceMatch(get(), startTableTennisMatch(match, openingServe)));
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
  signInAs: (name) => set(signIn(get(), name)),
  signOutAccount: () => set(signOut(get())),
  createClubAt: (input) => {
    const { data, id } = createClub(get(), input);
    set(data);
    return id;
  },
  requestJoinAt: (token) => set(requestJoin(get(), token)),
  decideJoinAt: (memberId, accept) => set(decideJoin(get(), memberId, accept)),
  createSessionsAt: (clubId, input) => {
    const { data, firstId } = createSessions(get(), clubId, input);
    set(data);
    return firstId;
  },
  setVoteAt: (sessionId, value) => set(setVote(get(), sessionId, value)),
  closeVotingAt: (sessionId) => set(closeVoting(get(), sessionId)),
  addGuestAt: (sessionId, name) => set(addGuest(get(), sessionId, name)),
  setMemberGoingAt: (sessionId, accountId) => set(setMemberGoing(get(), sessionId, accountId)),
  dropCandidateAt: (sessionId, accountId, guestId) => set(dropCandidate(get(), sessionId, accountId, guestId)),
  setAssignmentAt: (sessionId, key, side) => set(setAssignment(get(), sessionId, key, side)),
  confirmSplitAt: (sessionId) => {
    const { data, matchId } = confirmSplit(get(), sessionId);
    set(data);
    return matchId;
  },
  cancelSessionAt: (sessionId) => set(cancelSession(get(), sessionId)),
  updateClubAt: (clubId, patch) => set(updateClub(get(), clubId, patch)),
  dissolveClubAt: (clubId) => set(dissolveClub(get(), clubId)),
  reset: () => set(createSeedState()),
    }),
    {
      name: APP_PERSIST_NAME,
      version: APP_PERSIST_VERSION,
      skipHydration: true,
      storage: createJSONStorage(() => createAppPersistStorage()),
      partialize: (state) => ({
        competitions: state.competitions,
        teams: state.teams,
        players: state.players,
        matches: state.matches,
        brackets: state.brackets,
        accountId: state.accountId,
        accounts: state.accounts,
        clubs: state.clubs,
        clubMembers: state.clubMembers,
        sessions: state.sessions,
        sessionVotes: state.sessionVotes,
        sessionGuests: state.sessionGuests,
        sessionAssignments: state.sessionAssignments,
      }),
      merge: (persisted, current) => {
        if (!isAppData(persisted)) return current;
        return { ...current, ...withClubDefaults(persisted) };
      },
      migrate: (persisted) => {
        if (!isAppData(persisted)) return createSeedState();
        const next = withClubDefaults(persisted);
        if (next.clubs.length > 0) return next;
        const seed = createSeedState();
        return {
          ...next,
          accountId: seed.accountId,
          accounts: seed.accounts,
          clubs: seed.clubs,
          clubMembers: seed.clubMembers,
          sessions: seed.sessions,
          sessionVotes: seed.sessionVotes,
          sessionGuests: seed.sessionGuests,
          sessionAssignments: seed.sessionAssignments,
          matches: [...next.matches, ...seed.matches.filter((match) => match.sessionId)],
          teams: [
            ...next.teams,
            ...seed.teams.filter((team) => !next.teams.some((row) => row.id === team.id)),
          ],
        };
      },
    },
  ),
);
