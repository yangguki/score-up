import type { Match, MatchEvent, Side, VolleyballRules } from "@score-up/domain";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  VOLLEYBALL_COURT_ORDER,
  canEndVolleyballMatch,
  canEndVolleyballSet,
  emptyVolleyballSnapshot,
  isVolleyballMatch,
  rotateVolleyballCourt,
  unrotateVolleyballCourt,
  volleyballDeuce,
  volleyballSetPointSide,
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
  const set = isVolleyballMatch(match) ? match.snapshot.currentSet : 1;
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
  if (!isVolleyballMatch(match)) return match;
  return {
    ...match,
    snapshot: {
      ...match.snapshot,
      setHistory: match.snapshot.setHistory.map((s) => ({ ...s })),
      timeoutsLeft: { ...match.snapshot.timeoutsLeft },
      rotationHome: [...(match.snapshot.rotationHome ?? VOLLEYBALL_COURT_ORDER)],
      rotationAway: [...(match.snapshot.rotationAway ?? VOLLEYBALL_COURT_ORDER)],
      sanctions: (match.snapshot.sanctions ?? []).map((row) => ({ ...row })),
    },
    events: match.events.map((e) => ({ ...e, payload: e.payload ? { ...e.payload } : undefined })),
    rules: { ...match.rules },
  };
}

export function createBlankVolleyballMatch(input: {
  id?: string;
  competitionId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel: string;
  awayLabel: string;
  homeColor?: string;
  awayColor?: string;
  roundLabel: string;
  scheduledLabel: string;
  rules: VolleyballRules;
  isFriendly?: boolean;
  status?: Match["status"];
}): Match {
  const id = input.id ?? uid("match");
  return {
    id,
    sportId: "volleyball",
    competitionId: input.competitionId,
    homeTeamId: input.homeTeamId,
    awayTeamId: input.awayTeamId,
    homeLabel: input.homeLabel,
    awayLabel: input.awayLabel,
    homeColor: input.homeColor ?? DEFAULT_HOME_COLOR,
    awayColor: input.awayColor ?? DEFAULT_AWAY_COLOR,
    roundLabel: input.roundLabel,
    scheduledLabel: input.scheduledLabel,
    status: input.status ?? "scheduled",
    snapshot: emptyVolleyballSnapshot(input.rules, input.homeTeamId, input.awayTeamId),
    events: [],
    isFriendly: input.isFriendly ?? false,
    rules: input.rules,
  };
}

export function startVolleyballMatch(match: Match, openingServe: Side = "home"): Match {
  if (!isVolleyballMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  next.status = "in_progress";
  next.snapshot.started = true;
  next.snapshot.serveSide = openingServe;
  next.snapshot.setOpeningServe = openingServe;
  return next;
}

export function applyVolleyballPoint(match: Match, teamId: string): Match {
  if (!isVolleyballMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.started) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  const side = sideOfTeam(next, teamId);
  const prevServeSide = next.snapshot.serveSide;
  if (side === "home") next.snapshot.homeSetPoints += 1;
  else next.snapshot.awaySetPoints += 1;
  const gainedServe = prevServeSide !== side;
  if (next.rules.rotationEnabled && gainedServe) {
    if (side === "home") {
      next.snapshot.rotationHome = rotateVolleyballCourt(next.snapshot.rotationHome);
    } else {
      next.snapshot.rotationAway = rotateVolleyballCourt(next.snapshot.rotationAway);
    }
  }
  next.snapshot.serveSide = side;
  next.snapshot.deuce = volleyballDeuce(next.snapshot, next.rules);
  next.events.push(
    pushEvent(next, {
      type: "point",
      teamId,
      payload: { points: 1, prevServeSide },
    }),
  );
  if (canEndVolleyballSet(next.snapshot, next.rules)) {
    next.status = "confirm_period_end";
  }
  return next;
}

export function applyVolleyballTimeout(match: Match, teamId: string): Match {
  if (!isVolleyballMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.started) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  const left = next.snapshot.timeoutsLeft[teamId] ?? 0;
  if (left <= 0) return match;
  next.snapshot.timeoutsLeft[teamId] = left - 1;
  next.events.push(pushEvent(next, { type: "timeout", teamId }));
  return next;
}

export function applyVolleyballSanction(match: Match, teamId: string, level: "yellow" | "red"): Match {
  if (!isVolleyballMatch(match)) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  const side = sideOfTeam(next, teamId);
  next.snapshot.sanctions = [...(next.snapshot.sanctions ?? []), { side, level }];
  next.events.push(pushEvent(next, { type: "sanction", teamId, payload: { reason: level } }));
  return next;
}

export function changeVolleyballServe(match: Match): Match {
  if (!isVolleyballMatch(match)) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  next.snapshot.serveSide = next.snapshot.serveSide === "home" ? "away" : "home";
  next.events.push(
    pushEvent(next, {
      type: "serve_change",
      teamId: teamIdFor(next, next.snapshot.serveSide),
    }),
  );
  return next;
}

export function undoVolleyballLast(match: Match): Match {
  if (!isVolleyballMatch(match)) return match;
  const last = [...match.events].reverse().find((e) => !e.revoked);
  if (!last) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  const target = next.events.find((e) => e.id === last.id);
  if (target) target.revoked = true;
  next.events.push(pushEvent(next, { type: "revoke", payload: { targetEventId: last.id } }));

  if (last.type === "point" && last.teamId) {
    const side = sideOfTeam(next, last.teamId);
    if (side === "home") next.snapshot.homeSetPoints = Math.max(0, next.snapshot.homeSetPoints - 1);
    else next.snapshot.awaySetPoints = Math.max(0, next.snapshot.awaySetPoints - 1);
    const prevPoint = [...next.events]
      .reverse()
      .find((e) => !e.revoked && e.type === "point" && e.id !== last.id);
    if (prevPoint?.teamId) next.snapshot.serveSide = sideOfTeam(next, prevPoint.teamId);
    else next.snapshot.serveSide = next.snapshot.setOpeningServe;
    if (
      next.rules.rotationEnabled &&
      last.payload?.prevServeSide !== undefined &&
      last.payload.prevServeSide !== side
    ) {
      if (side === "home") next.snapshot.rotationHome = unrotateVolleyballCourt(next.snapshot.rotationHome);
      else next.snapshot.rotationAway = unrotateVolleyballCourt(next.snapshot.rotationAway);
    }
    next.snapshot.deuce = volleyballDeuce(next.snapshot, next.rules);
    if (next.status === "confirm_period_end") next.status = "in_progress";
  } else if (last.type === "serve_change") {
    next.snapshot.serveSide = next.snapshot.serveSide === "home" ? "away" : "home";
  } else if (last.type === "timeout" && last.teamId) {
    next.snapshot.timeoutsLeft[last.teamId] = (next.snapshot.timeoutsLeft[last.teamId] ?? 0) + 1;
  } else if (last.type === "sanction") {
    next.snapshot.sanctions = (next.snapshot.sanctions ?? []).slice(0, -1);
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
    next.snapshot.serveSide = finished.winner;
    next.snapshot.deuce = volleyballDeuce(next.snapshot, next.rules);
    next.status = "confirm_period_end";
  }
  return next;
}

export function confirmVolleyballSet(match: Match): Match {
  if (!isVolleyballMatch(match)) return match;
  if (match.status !== "confirm_period_end") return match;
  if (!canEndVolleyballSet(match.snapshot, match.rules)) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
  const homeWins = next.snapshot.homeSetPoints > next.snapshot.awaySetPoints;
  const winner: Side = homeWins ? "home" : "away";
  next.events.push(
    pushEvent(next, {
      type: "period_end",
      payload: { quarter: next.snapshot.currentSet },
    }),
  );
  next.snapshot.setHistory.push({
    home: next.snapshot.homeSetPoints,
    away: next.snapshot.awaySetPoints,
    winner,
  });
  if (homeWins) next.snapshot.setsWonHome += 1;
  else next.snapshot.setsWonAway += 1;

  if (canEndVolleyballMatch(next.snapshot, next.rules)) {
    next.status = "confirm_match_end";
    return next;
  }

  const nextOpening: Side = next.snapshot.setOpeningServe === "home" ? "away" : "home";
  next.snapshot.currentSet += 1;
  next.snapshot.homeSetPoints = 0;
  next.snapshot.awaySetPoints = 0;
  next.snapshot.setOpeningServe = nextOpening;
  next.snapshot.serveSide = nextOpening;
  next.snapshot.deuce = false;
  next.snapshot.timeoutsLeft = {
    ...(next.homeTeamId
      ? { [next.homeTeamId]: next.rules.timeoutsPerSet }
      : { home: next.rules.timeoutsPerSet }),
    ...(next.awayTeamId
      ? { [next.awayTeamId]: next.rules.timeoutsPerSet }
      : { away: next.rules.timeoutsPerSet }),
  };
  next.status = "in_progress";
  return next;
}

export function confirmVolleyballMatch(match: Match): Match {
  if (!isVolleyballMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
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

export function forfeitVolleyballMatch(match: Match, winnerSide: Side): Match {
  if (!isVolleyballMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isVolleyballMatch(next)) return match;
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

export function volleyballNotice(match: Match): string {
  if (!isVolleyballMatch(match)) return "";
  const { snapshot, rules, status } = match;
  if (status === "confirm_match_end") {
    const home = snapshot.setsWonHome > snapshot.setsWonAway;
    return `경기 종료 · ${snapshot.setsWonHome}-${snapshot.setsWonAway} ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (status === "confirm_period_end" || canEndVolleyballSet(snapshot, rules)) {
    const home = snapshot.homeSetPoints > snapshot.awaySetPoints;
    return `세트 종료 · ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (volleyballDeuce(snapshot, rules) && snapshot.homeSetPoints === snapshot.awaySetPoints) {
    return "듀스 · 2점 차 필요";
  }
  if (volleyballSetPointSide(snapshot, rules)) return "세트 포인트";
  return "";
}
