import type { BaseballRules, Match, MatchEvent, Side } from "@score-up/domain";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  emptyBaseballSnapshot,
  isBaseballMatch,
  isLastBaseballInning,
} from "@score-up/domain";
import { uid } from "./id";

function sideOfTeam(match: Match, teamId: string): Side {
  if (teamId === match.homeTeamId || teamId === "home") return "home";
  return "away";
}

function teamIdFor(match: Match, side: Side): string {
  return side === "home" ? match.homeTeamId ?? "home" : match.awayTeamId ?? "away";
}

function battingSide(match: Match): Side {
  if (!isBaseballMatch(match)) return "away";
  return match.snapshot.half === "top" ? "away" : "home";
}

function pushEvent(
  match: Match,
  partial: Omit<MatchEvent, "id" | "matchId" | "createdAt" | "revoked" | "clockMs" | "quarter"> &
    Partial<Pick<MatchEvent, "clockMs" | "quarter">>,
): MatchEvent {
  const inning = isBaseballMatch(match) ? match.snapshot.inning : 1;
  return {
    id: uid("ev"),
    matchId: match.id,
    createdAt: Date.now(),
    revoked: false,
    clockMs: 0,
    quarter: partial.quarter ?? inning,
    ...partial,
  };
}

function cloneMatch(match: Match): Match {
  if (!isBaseballMatch(match)) return match;
  return {
    ...match,
    snapshot: {
      ...match.snapshot,
      inningScores: match.snapshot.inningScores.map((row) => ({ ...row })),
    },
    events: match.events.map((e) => ({ ...e, payload: e.payload ? { ...e.payload } : undefined })),
    rules: { ...match.rules },
  };
}

function maybeWalkOff(next: Match): void {
  if (!isBaseballMatch(next)) return;
  if (next.snapshot.half !== "bottom") return;
  if (next.snapshot.inning < next.rules.inningCount) return;
  if (next.snapshot.homeScore > next.snapshot.awayScore) {
    next.status = "confirm_match_end";
  }
}

export function createBlankBaseballMatch(input: {
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
  rules: BaseballRules;
  isFriendly?: boolean;
  status?: Match["status"];
}): Match {
  const id = input.id ?? uid("match");
  return {
    id,
    sportId: "baseball",
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
    snapshot: emptyBaseballSnapshot(),
    events: [],
    isFriendly: input.isFriendly ?? false,
    rules: input.rules,
  };
}

export function startBaseballMatch(match: Match): Match {
  if (!isBaseballMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  next.status = "in_progress";
  next.snapshot.started = true;
  return next;
}

export function applyBaseballRun(match: Match, teamId?: string): Match {
  if (!isBaseballMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.started) return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  const side = teamId ? sideOfTeam(next, teamId) : battingSide(next);
  if (side === "home") next.snapshot.homeScore += 1;
  else next.snapshot.awayScore += 1;
  next.events.push(
    pushEvent(next, {
      type: "point",
      teamId: teamIdFor(next, side),
      payload: { points: 1 },
    }),
  );
  maybeWalkOff(next);
  return next;
}

export function applyBaseballOut(match: Match): Match {
  if (!isBaseballMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.started) return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  next.snapshot.outs += 1;
  next.events.push(
    pushEvent(next, {
      type: "foul",
      teamId: teamIdFor(next, battingSide(next)),
      payload: { reason: "out", teamFouls: next.snapshot.outs },
    }),
  );
  if (next.snapshot.outs >= 3) {
    next.status = "confirm_period_end";
  }
  return next;
}

export function confirmBaseballHalf(match: Match): Match {
  if (!isBaseballMatch(match)) return match;
  if (match.status !== "confirm_period_end") return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  next.events.push(
    pushEvent(next, {
      type: "period_end",
      payload: { quarter: next.snapshot.inning, reason: next.snapshot.half },
    }),
  );
  const prevHome = next.snapshot.inningScores.reduce((sum, row) => sum + row.home, 0);
  const prevAway = next.snapshot.inningScores.reduce((sum, row) => sum + row.away, 0);
  if (next.snapshot.half === "bottom") {
    next.snapshot.inningScores.push({
      home: next.snapshot.homeScore - prevHome,
      away: next.snapshot.awayScore - prevAway,
    });
  }

  const lastRegulation = isLastBaseballInning(next.snapshot, next.rules);
  if (next.snapshot.half === "top") {
    if (lastRegulation && next.snapshot.homeScore > next.snapshot.awayScore) {
      next.status = "confirm_match_end";
      next.snapshot.outs = 3;
      return next;
    }
    next.snapshot.half = "bottom";
    next.snapshot.outs = 0;
    next.status = "in_progress";
    return next;
  }

  if (lastRegulation) {
    if (next.snapshot.homeScore !== next.snapshot.awayScore) {
      next.status = "confirm_match_end";
      return next;
    }
    if (next.rules.extraInningEnabled) {
      next.snapshot.inning += 1;
      next.snapshot.half = "top";
      next.snapshot.outs = 0;
      next.status = "in_progress";
      return next;
    }
    next.status = "confirm_match_end";
    return next;
  }

  next.snapshot.inning += 1;
  next.snapshot.half = "top";
  next.snapshot.outs = 0;
  next.status = "in_progress";
  return next;
}

export function confirmBaseballMatch(match: Match): Match {
  if (!isBaseballMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  const prevHome = next.snapshot.inningScores.reduce((sum, row) => sum + row.home, 0);
  const prevAway = next.snapshot.inningScores.reduce((sum, row) => sum + row.away, 0);
  if (next.snapshot.homeScore !== prevHome || next.snapshot.awayScore !== prevAway) {
    next.snapshot.inningScores.push({
      home: next.snapshot.homeScore - prevHome,
      away: next.snapshot.awayScore - prevAway,
    });
  }
  next.status = "completed";
  if (next.snapshot.homeScore !== next.snapshot.awayScore) {
    const homeWins = next.snapshot.homeScore > next.snapshot.awayScore;
    next.winnerTeamId = homeWins ? next.homeTeamId : next.awayTeamId;
    next.winnerLabel = homeWins ? next.homeLabel : next.awayLabel;
  }
  next.events.push(
    pushEvent(next, {
      type: "match_end",
      teamId: next.winnerTeamId,
      payload: { reason: "score" },
    }),
  );
  return next;
}

export function forfeitBaseballMatch(match: Match, winnerSide: Side): Match {
  if (!isBaseballMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  if (winnerSide === "home") {
    next.snapshot.homeScore = 1;
    next.snapshot.awayScore = 0;
    next.winnerTeamId = next.homeTeamId;
    next.winnerLabel = next.homeLabel;
  } else {
    next.snapshot.awayScore = 1;
    next.snapshot.homeScore = 0;
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

export function undoBaseballLast(match: Match): Match {
  if (!isBaseballMatch(match)) return match;
  const last = [...match.events].reverse().find((e) => !e.revoked);
  if (!last) return match;
  const next = cloneMatch(match);
  if (!isBaseballMatch(next)) return match;
  const target = next.events.find((e) => e.id === last.id);
  if (target) target.revoked = true;
  next.events.push(pushEvent(next, { type: "revoke", payload: { targetEventId: last.id } }));

  if (last.type === "point") {
    const side = sideOfTeam(next, last.teamId ?? "");
    if (side === "home") next.snapshot.homeScore = Math.max(0, next.snapshot.homeScore - 1);
    else next.snapshot.awayScore = Math.max(0, next.snapshot.awayScore - 1);
    if (next.status === "confirm_match_end") next.status = "in_progress";
  } else if (last.type === "foul") {
    next.snapshot.outs = Math.max(0, next.snapshot.outs - 1);
    if (next.status === "confirm_period_end") next.status = "in_progress";
  } else if (last.type === "period_end") {
    if (next.snapshot.half === "bottom") {
      next.snapshot.half = "top";
    } else {
      const finished = next.snapshot.inningScores[next.snapshot.inningScores.length - 1];
      if (finished) next.snapshot.inningScores = next.snapshot.inningScores.slice(0, -1);
      next.snapshot.inning = Math.max(1, next.snapshot.inning - 1);
      next.snapshot.half = "bottom";
    }
    next.snapshot.outs = 3;
    next.status = "confirm_period_end";
  } else if (last.type === "match_end") {
    next.status = "confirm_match_end";
    next.winnerTeamId = undefined;
    next.winnerLabel = undefined;
  }
  return next;
}

export function baseballNotice(match: Match): string {
  if (!isBaseballMatch(match)) return "";
  const { snapshot, status } = match;
  if (status === "confirm_match_end") {
    if (snapshot.homeScore === snapshot.awayScore) return "경기 종료 · 무승부를 확정할까요?";
    const home = snapshot.homeScore > snapshot.awayScore;
    return `경기 종료 · ${snapshot.homeScore}-${snapshot.awayScore} ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (status === "confirm_period_end") {
    return `${snapshot.inning}회 ${snapshot.half === "top" ? "초" : "말"} 종료 · 3아웃`;
  }
  return "";
}

export { teamIdFor };
