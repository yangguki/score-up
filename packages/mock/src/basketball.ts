import type { BasketballRules, Match, MatchEvent, Player } from "@score-up/domain";
import { DEFAULT_AWAY_COLOR, DEFAULT_HOME_COLOR, emptySnapshot, isRegulationOver } from "@score-up/domain";
import { uid } from "./id";

function timeoutKey(match: Match, side: "home" | "away"): string {
  return side === "home"
    ? match.homeTeamId ?? "home"
    : match.awayTeamId ?? "away";
}

function sideOfTeam(match: Match, teamId: string): "home" | "away" {
  if (teamId === match.homeTeamId || teamId === "home") return "home";
  return "away";
}

export function teamIdFor(match: Match, side: "home" | "away"): string {
  return side === "home" ? match.homeTeamId ?? "home" : match.awayTeamId ?? "away";
}

export function pushEvent(
  match: Match,
  partial: Omit<MatchEvent, "id" | "matchId" | "createdAt" | "revoked" | "clockMs" | "quarter"> &
    Partial<Pick<MatchEvent, "clockMs" | "quarter">>,
): MatchEvent {
  return {
    id: uid("ev"),
    matchId: match.id,
    createdAt: Date.now(),
    revoked: false,
    clockMs: partial.clockMs ?? match.snapshot.clockMs,
    quarter: partial.quarter ?? match.snapshot.quarter,
    ...partial,
  };
}

export function applyPoint(
  match: Match,
  teamId: string,
  points: 1 | 2 | 3,
  playerId?: string,
): Match {
  if (match.status !== "in_progress") return match;
  const side = sideOfTeam(match, teamId);
  const next = cloneMatch(match);
  if (side === "home") next.snapshot.homeScore += points;
  else next.snapshot.awayScore += points;
  next.events.push(
    pushEvent(next, {
      type: "point",
      teamId,
      playerId,
      payload: { points },
    }),
  );
  return next;
}

export function applyFoul(
  match: Match,
  rules: BasketballRules,
  teamId: string,
  playerId: string,
): { match: Match; foulOut: boolean; nextOut: boolean } {
  if (match.status !== "in_progress") {
    return { match, foulOut: false, nextOut: false };
  }
  const next = cloneMatch(match);
  const side = sideOfTeam(match, teamId);
  const fouls = (next.snapshot.playerFouls[playerId] ?? 0) + 1;
  next.snapshot.playerFouls[playerId] = fouls;
  if (side === "home") next.snapshot.homeTeamFoulsInQuarter += 1;
  else next.snapshot.awayTeamFoulsInQuarter += 1;

  const foulOut = fouls >= rules.personalFoulLimit;
  const nextOut = fouls === rules.personalFoulLimit - 1;
  if (foulOut) {
    next.snapshot.onCourtHome = next.snapshot.onCourtHome.filter((id) => id !== playerId);
    next.snapshot.onCourtAway = next.snapshot.onCourtAway.filter((id) => id !== playerId);
  }

  next.events.push(
    pushEvent(next, {
      type: "foul",
      teamId,
      playerId,
      payload: {
        personalFouls: fouls,
        teamFouls:
          side === "home"
            ? next.snapshot.homeTeamFoulsInQuarter
            : next.snapshot.awayTeamFoulsInQuarter,
      },
    }),
  );
  return { match: next, foulOut, nextOut };
}

export function applyTimeout(match: Match, teamId: string, rules: BasketballRules): Match {
  if (!match.snapshot.started) return match;
  if (match.snapshot.timeoutRunning) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  const left = next.snapshot.timeoutsLeft[teamId] ?? 0;
  if (left <= 0) return match;
  next.snapshot.timeoutsLeft[teamId] = left - 1;
  next.snapshot.clockRunning = false;
  next.snapshot.timeoutRunning = true;
  next.snapshot.timeoutTeamId = teamId;
  next.snapshot.timeoutClockMs = Math.max(1, rules.timeoutSeconds) * 1000;
  next.status = "paused";
  next.events.push(pushEvent(next, { type: "timeout", teamId }));
  return next;
}

export function endTimeout(match: Match): Match {
  if (!match.snapshot.timeoutRunning) return match;
  const next = cloneMatch(match);
  next.snapshot.timeoutRunning = false;
  next.snapshot.timeoutClockMs = 0;
  next.snapshot.timeoutTeamId = undefined;
  next.snapshot.clockRunning = false;
  if (next.status === "in_progress") next.status = "paused";
  return next;
}

export function applySub(
  match: Match,
  teamId: string,
  outPlayerId: string,
  inPlayerId: string,
): Match {
  const next = cloneMatch(match);
  const side = sideOfTeam(match, teamId);
  const court = side === "home" ? [...next.snapshot.onCourtHome] : [...next.snapshot.onCourtAway];
  const idx = court.indexOf(outPlayerId);
  if (idx < 0) return match;
  court[idx] = inPlayerId;
  if (side === "home") next.snapshot.onCourtHome = court;
  else next.snapshot.onCourtAway = court;
  next.events.push(
    pushEvent(next, {
      type: "substitution",
      teamId,
      payload: { outPlayerId, inPlayerId },
    }),
  );
  return next;
}

export function undoLast(match: Match, rules: BasketballRules): Match {
  const last = [...match.events].reverse().find((e) => !e.revoked);
  if (!last) return match;
  const next = cloneMatch(match);
  const target = next.events.find((e) => e.id === last.id);
  if (target) target.revoked = true;

  if (last.type === "point" && last.teamId) {
    const pts = last.payload?.points ?? 0;
    if (sideOfTeam(next, last.teamId) === "home") next.snapshot.homeScore = Math.max(0, next.snapshot.homeScore - pts);
    else next.snapshot.awayScore = Math.max(0, next.snapshot.awayScore - pts);
  } else if (last.type === "foul" && last.teamId && last.playerId) {
    const pf = next.snapshot.playerFouls[last.playerId] ?? 1;
    next.snapshot.playerFouls[last.playerId] = Math.max(0, pf - 1);
    if (sideOfTeam(next, last.teamId) === "home") {
      next.snapshot.homeTeamFoulsInQuarter = Math.max(0, next.snapshot.homeTeamFoulsInQuarter - 1);
    } else {
      next.snapshot.awayTeamFoulsInQuarter = Math.max(0, next.snapshot.awayTeamFoulsInQuarter - 1);
    }
  } else if (last.type === "timeout" && last.teamId) {
    next.snapshot.timeoutsLeft[last.teamId] =
      (next.snapshot.timeoutsLeft[last.teamId] ?? 0) + 1;
    next.snapshot.timeoutRunning = false;
    next.snapshot.timeoutClockMs = 0;
    next.snapshot.timeoutTeamId = undefined;
    next.snapshot.clockRunning = false;
    if (next.status === "paused") next.status = "in_progress";
  } else if (last.type === "substitution" && last.payload?.inPlayerId && last.payload.outPlayerId) {
    const side = sideOfTeam(next, last.teamId ?? "");
    const court = side === "home" ? [...next.snapshot.onCourtHome] : [...next.snapshot.onCourtAway];
    const idx = court.indexOf(last.payload.inPlayerId);
    if (idx >= 0) court[idx] = last.payload.outPlayerId;
    if (side === "home") next.snapshot.onCourtHome = court;
    else next.snapshot.onCourtAway = court;
  }

  next.events.push(
    pushEvent(next, {
      type: "revoke",
      payload: { targetEventId: last.id },
    }),
  );
  void rules;
  return next;
}

export function tickClock(match: Match, dtMs: number, rules: BasketballRules): Match {
  if (match.snapshot.timeoutRunning) {
    const next = cloneMatch(match);
    next.snapshot.timeoutClockMs = Math.max(0, next.snapshot.timeoutClockMs - dtMs);
    if (next.snapshot.timeoutClockMs > 0) return next;
    next.snapshot.timeoutRunning = false;
    next.snapshot.timeoutTeamId = undefined;
    next.snapshot.clockRunning = false;
    next.status = "paused";
    return next;
  }
  if (match.status !== "in_progress" || !match.snapshot.clockRunning) return match;
  const next = cloneMatch(match);
  next.snapshot.clockMs = Math.max(0, next.snapshot.clockMs - dtMs);
  if (next.snapshot.clockMs > 0) return next;

  next.snapshot.clockRunning = false;
  const lastReg = isRegulationOver(next.snapshot.quarter, rules.periodCount) || next.snapshot.inOvertime;
  if (lastReg && next.snapshot.homeScore !== next.snapshot.awayScore) {
    next.status = "confirm_match_end";
  } else if (lastReg && next.snapshot.homeScore === next.snapshot.awayScore) {
    next.status = "confirm_period_end";
    next.snapshot.needsOvertimeDecision = true;
  } else {
    next.status = "confirm_period_end";
  }
  return next;
}

export function confirmPeriodEnd(match: Match, rules: BasketballRules): Match {
  const next = cloneMatch(match);
  next.events.push(
    pushEvent(next, {
      type: "period_end",
      payload: { quarter: next.snapshot.quarter },
    }),
  );
  const prevHome = next.snapshot.periodScores.reduce((sum, row) => sum + row.home, 0);
  const prevAway = next.snapshot.periodScores.reduce((sum, row) => sum + row.away, 0);
  next.snapshot.periodScores.push({
    home: next.snapshot.homeScore - prevHome,
    away: next.snapshot.awayScore - prevAway,
  });
  next.snapshot.homeTeamFoulsInQuarter = 0;
  next.snapshot.awayTeamFoulsInQuarter = 0;
  next.snapshot.quarter += 1;
  next.snapshot.clockMs = rules.periodMinutes * 60 * 1000;
  next.snapshot.clockRunning = false;
  next.snapshot.timeoutRunning = false;
  next.snapshot.timeoutClockMs = 0;
  next.snapshot.timeoutTeamId = undefined;
  next.snapshot.needsOvertimeDecision = false;
  next.status = "period_break";
  return next;
}

export function startOvertime(match: Match, rules: BasketballRules): Match {
  const next = cloneMatch(match);
  const alreadyOt = match.snapshot.inOvertime;
  next.snapshot.inOvertime = true;
  next.snapshot.needsOvertimeDecision = false;
  next.snapshot.quarter = alreadyOt ? match.snapshot.quarter + 1 : rules.periodCount + 1;
  next.snapshot.homeTeamFoulsInQuarter = 0;
  next.snapshot.awayTeamFoulsInQuarter = 0;
  next.snapshot.clockMs = rules.overtimeMinutes * 60 * 1000;
  next.snapshot.clockRunning = false;
  next.status = "period_break";
  return next;
}

export function confirmMatchEnd(match: Match): Match {
  const next = cloneMatch(match);
  const prevHome = next.snapshot.periodScores.reduce((sum, row) => sum + row.home, 0);
  const prevAway = next.snapshot.periodScores.reduce((sum, row) => sum + row.away, 0);
  if (next.snapshot.homeScore !== prevHome || next.snapshot.awayScore !== prevAway) {
    next.snapshot.periodScores.push({
      home: next.snapshot.homeScore - prevHome,
      away: next.snapshot.awayScore - prevAway,
    });
  }
  const homeWins = next.snapshot.homeScore > next.snapshot.awayScore;
  next.status = "completed";
  next.snapshot.clockRunning = false;
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

export function forfeitMatch(match: Match, winnerSide: "home" | "away"): Match {
  const next = cloneMatch(match);
  const score = next.rules.forfeitScore;
  if (winnerSide === "home") {
    next.snapshot.homeScore = score;
    next.snapshot.awayScore = 0;
    next.winnerTeamId = next.homeTeamId;
    next.winnerLabel = next.homeLabel;
  } else {
    next.snapshot.awayScore = score;
    next.snapshot.homeScore = 0;
    next.winnerTeamId = next.awayTeamId;
    next.winnerLabel = next.awayLabel;
  }
  next.status = "forfeited";
  next.snapshot.clockRunning = false;
  next.events.push(
    pushEvent(next, {
      type: "match_end",
      teamId: next.winnerTeamId,
      payload: { reason: "forfeit" },
    }),
  );
  return next;
}

export function startMatch(match: Match, onCourtHome: string[], onCourtAway: string[]): Match {
  const next = cloneMatch(match);
  next.status = "in_progress";
  next.snapshot.onCourtHome = onCourtHome;
  next.snapshot.onCourtAway = onCourtAway;
  next.snapshot.clockRunning = false;
  next.snapshot.started = false;
  return next;
}

export function pauseMatch(match: Match): Match {
  if (match.snapshot.timeoutRunning) return match;
  const next = cloneMatch(match);
  next.snapshot.clockRunning = false;
  if (next.status === "in_progress") next.status = "paused";
  return next;
}

export function resumeMatch(match: Match): Match {
  if (match.snapshot.timeoutRunning) return match;
  const next = cloneMatch(match);
  next.snapshot.clockRunning = true;
  next.snapshot.started = true;
  next.snapshot.timeoutRunning = false;
  next.snapshot.timeoutClockMs = 0;
  next.snapshot.timeoutTeamId = undefined;
  next.status = "in_progress";
  return next;
}

export function resetClockForPeriod(match: Match, rules: BasketballRules): Match {
  const next = cloneMatch(match);
  if (next.snapshot.inOvertime) {
    next.snapshot.clockMs = rules.overtimeMinutes * 60 * 1000;
  } else {
    next.snapshot.clockMs = rules.periodMinutes * 60 * 1000;
  }
  return next;
}

export function createBlankMatch(input: {
  id?: string;
  sportId?: Match["sportId"];
  competitionId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel: string;
  awayLabel: string;
  homeColor?: string;
  awayColor?: string;
  roundLabel: string;
  scheduledLabel: string;
  rules: BasketballRules;
  isFriendly?: boolean;
  status?: Match["status"];
}): Match {
  const id = input.id ?? uid("match");
  return {
    id,
    sportId: input.sportId ?? "basketball",
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
    snapshot: emptySnapshot(input.rules, input.homeTeamId, input.awayTeamId),
    events: [],
    isFriendly: input.isFriendly ?? false,
    rules: input.rules,
  };
}

function cloneMatch(match: Match): Match {
  return {
    ...match,
    snapshot: {
      ...match.snapshot,
      playerFouls: { ...match.snapshot.playerFouls },
      onCourtHome: [...match.snapshot.onCourtHome],
      onCourtAway: [...match.snapshot.onCourtAway],
      timeoutsLeft: { ...match.snapshot.timeoutsLeft },
      periodScores: match.snapshot.periodScores.map((p) => ({ ...p })),
    },
    events: match.events.map((e) => ({ ...e, payload: e.payload ? { ...e.payload } : undefined })),
  };
}

export function playerById(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export { timeoutKey };
