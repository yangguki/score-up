import type { Match, MatchEvent, RallySetSportId, Side, TableTennisRules } from "@score-up/domain";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  advanceTableTennisServe,
  canEndTableTennisMatch,
  canEndTableTennisSet,
  emptyTableTennisSnapshot,
  isLastTableTennisSet,
  isRallySetMatch,
  tableTennisDeuce,
  tableTennisServeLimit,
  tableTennisSetPointSide,
} from "@score-up/domain";
import { uid } from "./id";

function sideOfTeam(match: Match, teamId: string): Side {
  if (teamId === match.homeTeamId || teamId === "home") return "home";
  return "away";
}

function teamIdFor(match: Match, side: Side): string {
  return side === "home" ? match.homeTeamId ?? "home" : match.awayTeamId ?? "away";
}

function pushEvent(
  match: Match,
  partial: Omit<MatchEvent, "id" | "matchId" | "createdAt" | "revoked" | "clockMs" | "quarter"> &
    Partial<Pick<MatchEvent, "clockMs" | "quarter">>,
): MatchEvent {
  const set = isRallySetMatch(match) ? match.snapshot.currentSet : 1;
  return {
    id: uid("ev"),
    matchId: match.id,
    createdAt: Date.now(),
    revoked: false,
    clockMs: 0,
    quarter: partial.quarter ?? set,
    ...partial,
  };
}

function cloneMatch(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  return {
    ...match,
    snapshot: {
      ...match.snapshot,
      setHistory: match.snapshot.setHistory.map((row) => ({ ...row })),
    },
    events: match.events.map((e) => ({ ...e, payload: e.payload ? { ...e.payload } : undefined })),
    rules: { ...match.rules },
  };
}

function maybeEndChangeAtFive(next: Match): void {
  if (!isRallySetMatch(next)) return;
  if (!next.rules.changeEndsAt) return;
  if (next.snapshot.endChangeAtFiveDone) return;
  if (!isLastTableTennisSet(next.snapshot, next.rules)) return;
  const at = next.rules.changeEndsAt;
  if (next.snapshot.homeSetPoints >= at || next.snapshot.awaySetPoints >= at) {
    next.snapshot.endChangeHint = true;
    next.snapshot.endChangeAtFiveDone = true;
  }
}

export function createBlankTableTennisMatch(input: {
  id?: string;
  sportId?: RallySetSportId;
  competitionId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel: string;
  awayLabel: string;
  homeColor?: string;
  awayColor?: string;
  roundLabel: string;
  scheduledLabel: string;
  rules: TableTennisRules;
  isFriendly?: boolean;
  status?: Match["status"];
  sessionId?: string;
}): Match {
  const id = input.id ?? uid("match");
  return {
    id,
    sportId: input.sportId ?? "table-tennis",
    competitionId: input.competitionId,
    sessionId: input.sessionId,
    homeTeamId: input.homeTeamId,
    awayTeamId: input.awayTeamId,
    homeLabel: input.homeLabel,
    awayLabel: input.awayLabel,
    homeColor: input.homeColor ?? DEFAULT_HOME_COLOR,
    awayColor: input.awayColor ?? DEFAULT_AWAY_COLOR,
    roundLabel: input.roundLabel,
    scheduledLabel: input.scheduledLabel,
    status: input.status ?? "scheduled",
    snapshot: emptyTableTennisSnapshot(),
    events: [],
    isFriendly: input.isFriendly ?? false,
    rules: input.rules,
  };
}

export function startTableTennisMatch(match: Match, openingServe: Side = "home"): Match {
  if (!isRallySetMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  next.status = "in_progress";
  next.snapshot.started = true;
  next.snapshot.serveSide = openingServe;
  next.snapshot.setOpeningServe = openingServe;
  next.snapshot.serveCount = 1;
  return next;
}

export function applyTableTennisPoint(match: Match, teamId: string): Match {
  if (!isRallySetMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.started) return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  const side = sideOfTeam(next, teamId);
  const prevServeSide = next.snapshot.serveSide;
  const prevServeCount = next.snapshot.serveCount;
  if (side === "home") next.snapshot.homeSetPoints += 1;
  else next.snapshot.awaySetPoints += 1;
  next.snapshot.deuce = tableTennisDeuce(next.snapshot, next.rules);
  next.snapshot.endChangeHint = false;
  if (next.rules.serveMode === "scorer") {
    next.snapshot.serveSide = side;
    next.snapshot.serveCount = 1;
  } else {
    advanceTableTennisServe(next.snapshot, next.rules);
  }
  maybeEndChangeAtFive(next);
  next.events.push(
    pushEvent(next, {
      type: "point",
      teamId,
      payload: { points: 1, prevServeSide, prevServeCount },
    }),
  );
  if (canEndTableTennisSet(next.snapshot, next.rules)) {
    next.status = "confirm_period_end";
  }
  return next;
}

export function changeTableTennisServe(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  const prevServeSide = next.snapshot.serveSide;
  const prevServeCount = next.snapshot.serveCount;
  next.snapshot.serveSide = next.snapshot.serveSide === "home" ? "away" : "home";
  next.snapshot.serveCount = 1;
  next.events.push(
    pushEvent(next, {
      type: "serve_change",
      teamId: teamIdFor(next, next.snapshot.serveSide),
      payload: { prevServeSide, prevServeCount },
    }),
  );
  return next;
}

export function pauseTableTennisMatch(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  if (match.status !== "in_progress") return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  next.status = "paused";
  return next;
}

export function resumeTableTennisMatch(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  if (match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  next.status = "in_progress";
  return next;
}

export function undoTableTennisLast(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  const last = [...match.events].reverse().find((e) => !e.revoked);
  if (!last) return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  const target = next.events.find((e) => e.id === last.id);
  if (target) target.revoked = true;
  next.events.push(pushEvent(next, { type: "revoke", payload: { targetEventId: last.id } }));

  if (last.type === "point" && last.teamId) {
    const side = sideOfTeam(next, last.teamId);
    if (side === "home") next.snapshot.homeSetPoints = Math.max(0, next.snapshot.homeSetPoints - 1);
    else next.snapshot.awaySetPoints = Math.max(0, next.snapshot.awaySetPoints - 1);
    next.snapshot.serveSide = last.payload?.prevServeSide ?? next.snapshot.setOpeningServe;
    next.snapshot.serveCount = last.payload?.prevServeCount ?? 1;
    next.snapshot.deuce = tableTennisDeuce(next.snapshot, next.rules);
    next.snapshot.endChangeHint = false;
    if (next.status === "confirm_period_end") next.status = "in_progress";
  } else if (last.type === "serve_change") {
    next.snapshot.serveSide = last.payload?.prevServeSide ?? (next.snapshot.serveSide === "home" ? "away" : "home");
    next.snapshot.serveCount = last.payload?.prevServeCount ?? 1;
  } else if (last.type === "period_end") {
    const finished = next.snapshot.setHistory[next.snapshot.setHistory.length - 1];
    if (!finished) return match;
    const wasMatchConfirm = next.status === "confirm_match_end";
    next.snapshot.setHistory = next.snapshot.setHistory.slice(0, -1);
    if (finished.winner === "home") next.snapshot.setsWonHome = Math.max(0, next.snapshot.setsWonHome - 1);
    else next.snapshot.setsWonAway = Math.max(0, next.snapshot.setsWonAway - 1);
    if (!wasMatchConfirm) {
      next.snapshot.setOpeningServe = next.snapshot.setOpeningServe === "home" ? "away" : "home";
    }
    next.snapshot.currentSet = next.snapshot.setHistory.length + 1;
    next.snapshot.homeSetPoints = finished.home;
    next.snapshot.awaySetPoints = finished.away;
    next.snapshot.serveSide = last.payload?.prevServeSide ?? finished.winner;
    next.snapshot.serveCount = last.payload?.prevServeCount ?? 1;
    next.snapshot.deuce = tableTennisDeuce(next.snapshot, next.rules);
    next.snapshot.endChangeHint = false;
    next.status = "confirm_period_end";
  }
  return next;
}

export function confirmTableTennisSet(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  if (match.status !== "confirm_period_end") return match;
  if (!canEndTableTennisSet(match.snapshot, match.rules)) return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  const homeWins = next.snapshot.homeSetPoints > next.snapshot.awaySetPoints;
  const winner: Side = homeWins ? "home" : "away";
  next.events.push(
    pushEvent(next, {
      type: "period_end",
      payload: {
        quarter: next.snapshot.currentSet,
        prevServeSide: next.snapshot.serveSide,
        prevServeCount: next.snapshot.serveCount,
      },
    }),
  );
  next.snapshot.setHistory.push({
    home: next.snapshot.homeSetPoints,
    away: next.snapshot.awaySetPoints,
    winner,
  });
  if (homeWins) next.snapshot.setsWonHome += 1;
  else next.snapshot.setsWonAway += 1;

  if (canEndTableTennisMatch(next.snapshot, next.rules)) {
    next.status = "confirm_match_end";
    next.snapshot.endChangeHint = false;
    return next;
  }

  const nextOpening: Side = next.snapshot.setOpeningServe === "home" ? "away" : "home";
  next.snapshot.currentSet += 1;
  next.snapshot.homeSetPoints = 0;
  next.snapshot.awaySetPoints = 0;
  next.snapshot.setOpeningServe = nextOpening;
  next.snapshot.serveSide = nextOpening;
  next.snapshot.serveCount = 1;
  next.snapshot.deuce = false;
  next.snapshot.endChangeHint = true;
  next.snapshot.endChangeAtFiveDone = false;
  next.status = "in_progress";
  return next;
}

export function confirmTableTennisMatch(match: Match): Match {
  if (!isRallySetMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  const homeWins = next.snapshot.setsWonHome > next.snapshot.setsWonAway;
  next.status = "completed";
  next.winnerTeamId = homeWins ? next.homeTeamId : next.awayTeamId;
  next.winnerLabel = homeWins ? next.homeLabel : next.awayLabel;
  next.events.push(
    pushEvent(next, {
      type: "match_end",
      teamId: next.winnerTeamId,
      payload: { reason: "score" },
    }),
  );
  return next;
}

export function forfeitTableTennisMatch(match: Match, winnerSide: Side): Match {
  if (!isRallySetMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isRallySetMatch(next)) return match;
  if (winnerSide === "home") {
    next.snapshot.setsWonHome = next.rules.setsToWin;
    next.snapshot.setsWonAway = 0;
    next.winnerTeamId = next.homeTeamId;
    next.winnerLabel = next.homeLabel;
  } else {
    next.snapshot.setsWonAway = next.rules.setsToWin;
    next.snapshot.setsWonHome = 0;
    next.winnerTeamId = next.awayTeamId;
    next.winnerLabel = next.awayLabel;
  }
  next.status = "forfeited";
  next.events.push(
    pushEvent(next, {
      type: "match_end",
      teamId: next.winnerTeamId,
      payload: { reason: "forfeit" },
    }),
  );
  return next;
}

export function tableTennisNotice(match: Match): string {
  if (!isRallySetMatch(match)) return "";
  const { snapshot, rules, status } = match;
  if (status === "confirm_match_end") {
    const home = snapshot.setsWonHome > snapshot.setsWonAway;
    return `경기 종료 · ${snapshot.setsWonHome}-${snapshot.setsWonAway} ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (status === "confirm_period_end" || canEndTableTennisSet(snapshot, rules)) {
    const home = snapshot.homeSetPoints > snapshot.awaySetPoints;
    return `세트 종료 · ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (snapshot.endChangeHint) return "엔드 교대";
  if (tableTennisDeuce(snapshot, rules) && snapshot.homeSetPoints === snapshot.awaySetPoints) {
    return "듀스 · 교대 서브";
  }
  if (tableTennisSetPointSide(snapshot, rules)) return "세트 포인트";
  return "";
}

export function tableTennisServeLine(match: Match, playerLabel: string): string {
  if (!isRallySetMatch(match)) return "";
  const limit = tableTennisServeLimit(match.snapshot, match.rules);
  return `${playerLabel} 서브 ${match.snapshot.serveCount}/${limit}`;
}
