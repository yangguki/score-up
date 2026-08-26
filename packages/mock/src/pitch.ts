import type { Match, MatchEvent, PitchRules, PitchSportId, Side } from "@score-up/domain";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  emptyPitchSnapshot,
  isPitchMatch,
  isPitchRegulationOver,
  pitchPeriodLabel,
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
  const period = isPitchMatch(match) ? match.snapshot.period : 1;
  return {
    id: uid("ev"),
    matchId: match.id,
    createdAt: Date.now(),
    revoked: false,
    clockMs: isPitchMatch(match) ? match.snapshot.clockMs : 0,
    quarter: partial.quarter ?? period,
    ...partial,
  };
}

function cloneMatch(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  return {
    ...match,
    snapshot: {
      ...match.snapshot,
      periodScores: match.snapshot.periodScores.map((row) => ({ ...row })),
    },
    events: match.events.map((e) => ({ ...e, payload: e.payload ? { ...e.payload } : undefined })),
    rules: { ...match.rules },
  };
}

function clockMsFor(snapshot: Match["snapshot"] & { inOvertime?: boolean }, rules: PitchRules): number {
  if ("inOvertime" in snapshot && snapshot.inOvertime) return rules.overtimeMinutes * 60 * 1000;
  return rules.periodMinutes * 60 * 1000;
}

function maybeEndClock(next: Match): void {
  if (!isPitchMatch(next)) return;
  next.snapshot.clockRunning = false;
  const last = isPitchRegulationOver(next.snapshot, next.rules) || next.snapshot.inOvertime;
  if (last && next.snapshot.homeScore !== next.snapshot.awayScore) {
    next.status = "confirm_match_end";
    next.snapshot.needsOvertimeDecision = false;
    return;
  }
  if (last && next.snapshot.homeScore === next.snapshot.awayScore) {
    if (next.rules.overtimeEnabled && !next.snapshot.inOvertime) {
      next.status = "confirm_period_end";
      next.snapshot.needsOvertimeDecision = true;
      return;
    }
    next.status = "confirm_match_end";
    next.snapshot.needsOvertimeDecision = false;
    return;
  }
  next.status = "confirm_period_end";
  next.snapshot.needsOvertimeDecision = false;
}

export function createBlankPitchMatch(input: {
  id?: string;
  sportId: PitchSportId;
  competitionId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel: string;
  awayLabel: string;
  homeColor?: string;
  awayColor?: string;
  roundLabel: string;
  scheduledLabel: string;
  rules: PitchRules;
  isFriendly?: boolean;
  status?: Match["status"];
}): Match {
  const id = input.id ?? uid("match");
  return {
    id,
    sportId: input.sportId,
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
    snapshot: emptyPitchSnapshot(input.rules),
    events: [],
    isFriendly: input.isFriendly ?? false,
    rules: input.rules,
  };
}

export function startPitchMatch(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  next.status = "in_progress";
  next.snapshot.started = true;
  next.snapshot.clockRunning = false;
  return next;
}

export function applyPitchPoint(match: Match, teamId: string): Match {
  if (!isPitchMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.started) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  const side = sideOfTeam(next, teamId);
  if (side === "home") next.snapshot.homeScore += 1;
  else next.snapshot.awayScore += 1;
  next.events.push(
    pushEvent(next, {
      type: "point",
      teamId,
      payload: { points: 1 },
    }),
  );
  return next;
}

export function applyPitchSanction(match: Match, teamId: string, level: "yellow" | "red"): Match {
  if (!isPitchMatch(match)) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  const side = sideOfTeam(next, teamId);
  if (level === "yellow") {
    if (side === "home") next.snapshot.yellowHome += 1;
    else next.snapshot.yellowAway += 1;
    const yellows = side === "home" ? next.snapshot.yellowHome : next.snapshot.yellowAway;
    if (next.sportId === "soccer" && yellows === 2) {
      if (side === "home") next.snapshot.redHome += 1;
      else next.snapshot.redAway += 1;
    }
  } else if (side === "home") next.snapshot.redHome += 1;
  else next.snapshot.redAway += 1;
  next.events.push(pushEvent(next, { type: "sanction", teamId, payload: { reason: level } }));
  return next;
}

export function applyPitchTeamFoul(match: Match, teamId: string): Match {
  if (!isPitchMatch(match)) return match;
  if (match.rules.teamFoulPenaltyAt <= 0) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  const side = sideOfTeam(next, teamId);
  if (side === "home") next.snapshot.teamFoulsHome += 1;
  else next.snapshot.teamFoulsAway += 1;
  const fouls = side === "home" ? next.snapshot.teamFoulsHome : next.snapshot.teamFoulsAway;
  next.events.push(
    pushEvent(next, {
      type: "foul",
      teamId,
      payload: { teamFouls: fouls },
    }),
  );
  return next;
}

export function tickPitchClock(match: Match, dtMs: number): Match {
  if (!isPitchMatch(match)) return match;
  if (match.status !== "in_progress" || !match.snapshot.clockRunning) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  next.snapshot.clockMs = Math.max(0, next.snapshot.clockMs - dtMs);
  if (next.snapshot.clockMs > 0) return next;
  maybeEndClock(next);
  return next;
}

export function requestPitchPeriodEnd(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  if (match.status !== "in_progress" && match.status !== "paused") return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  next.snapshot.clockMs = 0;
  maybeEndClock(next);
  return next;
}

export function confirmPitchPeriod(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  if (match.status !== "confirm_period_end") return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  if (next.snapshot.needsOvertimeDecision) {
    next.snapshot.needsOvertimeDecision = false;
    next.snapshot.inOvertime = true;
    next.snapshot.period += 1;
    next.snapshot.clockMs = clockMsFor(next.snapshot, next.rules);
    next.snapshot.clockRunning = false;
    next.snapshot.teamFoulsHome = 0;
    next.snapshot.teamFoulsAway = 0;
    next.status = "period_break";
    return next;
  }
  next.events.push(
    pushEvent(next, {
      type: "period_end",
      payload: { quarter: next.snapshot.period },
    }),
  );
  const prevHome = next.snapshot.periodScores.reduce((sum, row) => sum + row.home, 0);
  const prevAway = next.snapshot.periodScores.reduce((sum, row) => sum + row.away, 0);
  next.snapshot.periodScores.push({
    home: next.snapshot.homeScore - prevHome,
    away: next.snapshot.awayScore - prevAway,
  });
  next.snapshot.period += 1;
  next.snapshot.clockMs = clockMsFor(next.snapshot, next.rules);
  next.snapshot.clockRunning = false;
  next.snapshot.teamFoulsHome = 0;
  next.snapshot.teamFoulsAway = 0;
  next.status = "period_break";
  return next;
}

export function startPitchOvertime(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  if (!match.rules.overtimeEnabled) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  next.snapshot.needsOvertimeDecision = false;
  next.snapshot.inOvertime = true;
  next.snapshot.period = match.rules.periodCount + 1;
  next.snapshot.clockMs = match.rules.overtimeMinutes * 60 * 1000;
  next.snapshot.clockRunning = false;
  next.snapshot.teamFoulsHome = 0;
  next.snapshot.teamFoulsAway = 0;
  next.status = "period_break";
  return next;
}

export function confirmPitchMatch(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  const prevHome = next.snapshot.periodScores.reduce((sum, row) => sum + row.home, 0);
  const prevAway = next.snapshot.periodScores.reduce((sum, row) => sum + row.away, 0);
  if (next.snapshot.homeScore !== prevHome || next.snapshot.awayScore !== prevAway) {
    next.snapshot.periodScores.push({
      home: next.snapshot.homeScore - prevHome,
      away: next.snapshot.awayScore - prevAway,
    });
  }
  next.status = "completed";
  next.snapshot.clockRunning = false;
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

export function forfeitPitchMatch(match: Match, winnerSide: Side): Match {
  if (!isPitchMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
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

export function pausePitchMatch(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  next.snapshot.clockRunning = false;
  if (next.status === "in_progress") next.status = "paused";
  return next;
}

export function resumePitchMatch(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  next.snapshot.clockRunning = true;
  next.snapshot.started = true;
  next.status = "in_progress";
  return next;
}

export function undoPitchLast(match: Match): Match {
  if (!isPitchMatch(match)) return match;
  const last = [...match.events].reverse().find((e) => !e.revoked);
  if (!last) return match;
  const next = cloneMatch(match);
  if (!isPitchMatch(next)) return match;
  const target = next.events.find((e) => e.id === last.id);
  if (target) target.revoked = true;
  next.events.push(pushEvent(next, { type: "revoke", payload: { targetEventId: last.id } }));

  if (last.type === "point") {
    const side = sideOfTeam(next, last.teamId ?? "");
    if (side === "home") next.snapshot.homeScore = Math.max(0, next.snapshot.homeScore - 1);
    else next.snapshot.awayScore = Math.max(0, next.snapshot.awayScore - 1);
    if (next.status === "confirm_match_end") next.status = "in_progress";
  } else if (last.type === "sanction") {
    const side = sideOfTeam(next, last.teamId ?? "");
    if (last.payload?.reason === "red") {
      if (side === "home") next.snapshot.redHome = Math.max(0, next.snapshot.redHome - 1);
      else next.snapshot.redAway = Math.max(0, next.snapshot.redAway - 1);
    } else {
      if (side === "home") next.snapshot.yellowHome = Math.max(0, next.snapshot.yellowHome - 1);
      else next.snapshot.yellowAway = Math.max(0, next.snapshot.yellowAway - 1);
      if (next.sportId === "soccer") {
        const yellows = side === "home" ? next.snapshot.yellowHome : next.snapshot.yellowAway;
        if (yellows === 1) {
          if (side === "home") next.snapshot.redHome = Math.max(0, next.snapshot.redHome - 1);
          else next.snapshot.redAway = Math.max(0, next.snapshot.redAway - 1);
        }
      }
    }
  } else if (last.type === "foul") {
    const side = sideOfTeam(next, last.teamId ?? "");
    if (side === "home") next.snapshot.teamFoulsHome = Math.max(0, next.snapshot.teamFoulsHome - 1);
    else next.snapshot.teamFoulsAway = Math.max(0, next.snapshot.teamFoulsAway - 1);
  } else if (last.type === "period_end") {
    const finished = next.snapshot.periodScores[next.snapshot.periodScores.length - 1];
    if (finished) next.snapshot.periodScores = next.snapshot.periodScores.slice(0, -1);
    next.snapshot.period = Math.max(1, next.snapshot.period - 1);
    next.snapshot.clockMs = 0;
    next.snapshot.clockRunning = false;
    next.snapshot.inOvertime = next.snapshot.period > next.rules.periodCount;
    next.status = "confirm_period_end";
  } else if (last.type === "match_end") {
    next.status = "confirm_match_end";
    next.winnerTeamId = undefined;
    next.winnerLabel = undefined;
  }
  return next;
}

export function pitchNotice(match: Match): string {
  if (!isPitchMatch(match)) return "";
  const { snapshot, rules, status, sportId } = match;
  if (status === "confirm_match_end") {
    if (snapshot.homeScore === snapshot.awayScore) return "경기 종료 · 무승부를 확정할까요?";
    const home = snapshot.homeScore > snapshot.awayScore;
    return `경기 종료 · ${snapshot.homeScore}-${snapshot.awayScore} ${home ? match.homeLabel : match.awayLabel} 승을 확정할까요?`;
  }
  if (status === "confirm_period_end" && snapshot.needsOvertimeDecision) {
    return "동점 · 연장을 시작할까요?";
  }
  if (status === "confirm_period_end") {
    return `${pitchPeriodLabel(snapshot, rules)} 종료를 확정할까요?`;
  }
  if (rules.teamFoulPenaltyAt > 0) {
    const homePk = snapshot.teamFoulsHome >= rules.teamFoulPenaltyAt;
    const awayPk = snapshot.teamFoulsAway >= rules.teamFoulPenaltyAt;
    if (homePk || awayPk) {
      const who = homePk ? match.homeLabel : match.awayLabel;
      return `누적 파울 · PK 힌트 (${who})`;
    }
  }
  if (sportId === "soccer") {
    if (snapshot.yellowHome === 2 || snapshot.yellowAway === 2) {
      const who = snapshot.yellowHome === 2 ? match.homeLabel : match.awayLabel;
      return `${who} 2번째 경고 · 레드 메모`;
    }
  }
  return "";
}

export { teamIdFor };
