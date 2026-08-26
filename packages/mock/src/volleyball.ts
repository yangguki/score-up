import type { Match, MatchEvent, Side, VolleyballRules } from "@score-up/domain";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  canEndVolleyballMatch,
  canEndVolleyballSet,
  emptyVolleyballSnapshot,
  isVolleyballMatch,
  volleyballDeuce,
  volleyballTarget,
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
  if (side === "home") next.snapshot.homeSetPoints += 1;
  else next.snapshot.awaySetPoints += 1;
  next.snapshot.serveSide = side;
  next.snapshot.deuce = volleyballDeuce(next.snapshot, next.rules);
  next.events.push(
    pushEvent(next, {
      type: "point",
      teamId,
      payload: { points: 1 },
    }),
  );
  if (canEndVolleyballSet(next.snapshot, next.rules)) {
    next.status = "confirm_period_end";
  }
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
    // 직전 활성 득점의 서브권으로 복구 (없으면 오프닝)
    const prevPoint = [...next.events]
      .reverse()
      .find((e) => !e.revoked && e.type === "point" && e.id !== last.id);
    if (prevPoint?.teamId) next.snapshot.serveSide = sideOfTeam(next, prevPoint.teamId);
    else next.snapshot.serveSide = next.snapshot.setOpeningServe;
    next.snapshot.deuce = volleyballDeuce(next.snapshot, next.rules);
    if (next.status === "confirm_period_end") next.status = "in_progress";
  } else if (last.type === "serve_change") {
    next.snapshot.serveSide = next.snapshot.serveSide === "home" ? "away" : "home";
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
  const { snapshot, rules } = match;
  if (canEndVolleyballSet(snapshot, rules)) {
    const home = snapshot.homeSetPoints > snapshot.awaySetPoints;
    return `세트 종료 · ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (volleyballDeuce(snapshot, rules)) return "듀스 · 2점 차";
  const target = volleyballTarget(snapshot, rules);
  if (snapshot.homeSetPoints === target - 1 && snapshot.homeSetPoints > snapshot.awaySetPoints) {
    return "세트 포인트";
  }
  if (snapshot.awaySetPoints === target - 1 && snapshot.awaySetPoints > snapshot.homeSetPoints) {
    return "세트 포인트";
  }
  return "";
}
