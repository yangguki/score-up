import type { BasketballRules, BasketballSnapshot, MatchEvent, Side } from "./types";
import { emptySnapshot } from "./basketball";

export type ReplayScoreState = {
  homeScore: number;
  awayScore: number;
  homeTeamFoulsInQuarter: number;
  awayTeamFoulsInQuarter: number;
  playerFouls: Record<string, number>;
  quarter: number;
};

export type BasketballEngineCtx = {
  rules: BasketballRules;
  homeTeamId?: string;
  awayTeamId?: string;
};

function sideOf(
  teamId: string | undefined,
  homeTeamId?: string,
  awayTeamId?: string,
): Side | null {
  if (!teamId) return null;
  if (teamId === "home" || teamId === homeTeamId) return "home";
  if (teamId === "away" || teamId === awayTeamId) return "away";
  return null;
}

function cloneSnap(snapshot: BasketballSnapshot): BasketballSnapshot {
  return {
    ...snapshot,
    playerFouls: { ...snapshot.playerFouls },
    onCourtHome: [...snapshot.onCourtHome],
    onCourtAway: [...snapshot.onCourtAway],
    timeoutsLeft: { ...snapshot.timeoutsLeft },
    periodScores: snapshot.periodScores.map((p) => ({ ...p })),
  };
}

/**
 * 단일 이벤트를 스냅샷에 적용한다 (득점·파울·교체·쿼터 종료).
 * 시계·작전타임·periodScores는 mock 운영 상태로 두고 여기서 건드리지 않는다.
 */
export function applyBasketballEvent(
  snapshot: BasketballSnapshot,
  event: MatchEvent,
  ctx: BasketballEngineCtx,
): BasketballSnapshot {
  if (event.revoked || event.type === "revoke") return snapshot;

  const snap = cloneSnap(snapshot);
  const side = sideOf(event.teamId, ctx.homeTeamId, ctx.awayTeamId);

  if (event.type === "point" && side) {
    const pts = event.payload?.points ?? 0;
    if (side === "home") snap.homeScore += pts;
    else snap.awayScore += pts;
    return snap;
  }

  if (event.type === "foul" && side && event.playerId) {
    const fouls = (snap.playerFouls[event.playerId] ?? 0) + 1;
    snap.playerFouls[event.playerId] = fouls;
    if (side === "home") snap.homeTeamFoulsInQuarter += 1;
    else snap.awayTeamFoulsInQuarter += 1;
    if (fouls >= ctx.rules.personalFoulLimit) {
      snap.onCourtHome = snap.onCourtHome.filter((id) => id !== event.playerId);
      snap.onCourtAway = snap.onCourtAway.filter((id) => id !== event.playerId);
    }
    return snap;
  }

  if (event.type === "substitution" && side && event.payload?.outPlayerId && event.payload.inPlayerId) {
    const court = side === "home" ? snap.onCourtHome : snap.onCourtAway;
    const idx = court.indexOf(event.payload.outPlayerId);
    if (idx >= 0) court[idx] = event.payload.inPlayerId;
    return snap;
  }

  if (event.type === "period_end") {
    snap.homeTeamFoulsInQuarter = 0;
    snap.awayTeamFoulsInQuarter = 0;
    snap.quarter += 1;
    return snap;
  }

  if (event.type === "timeout" && event.teamId) {
    const left = snap.timeoutsLeft[event.teamId] ?? 0;
    if (left > 0) snap.timeoutsLeft[event.teamId] = left - 1;
    return snap;
  }

  return snap;
}

function revokedIds(events: MatchEvent[]): Set<string> {
  return new Set(
    events
      .filter((e) => e.type === "revoke" && e.payload?.targetEventId)
      .map((e) => e.payload!.targetEventId!),
  );
}

/**
 * 이벤트 배열만으로 득점·파울·쿼터를 다시 계산한다.
 * mock 스냅샷과 어긋나면 엔진 쪽이 맞다 (Phase 5).
 */
export function replayBasketballScores(
  rules: BasketballRules,
  events: MatchEvent[],
  homeTeamId?: string,
  awayTeamId?: string,
): ReplayScoreState {
  const ctx: BasketballEngineCtx = { rules, homeTeamId, awayTeamId };
  let snap = emptySnapshot(rules, homeTeamId, awayTeamId);
  const revoked = revokedIds(events);

  for (const event of events) {
    if (event.revoked || event.type === "revoke" || revoked.has(event.id)) continue;
    snap = applyBasketballEvent(snap, event, ctx);
  }

  return {
    homeScore: snap.homeScore,
    awayScore: snap.awayScore,
    homeTeamFoulsInQuarter: snap.homeTeamFoulsInQuarter,
    awayTeamFoulsInQuarter: snap.awayTeamFoulsInQuarter,
    playerFouls: { ...snap.playerFouls },
    quarter: snap.quarter,
  };
}

/** 활성 이벤트만으로 스냅샷의 득점·파울을 맞춘다. 시계·코트·쿼터 번호는 유지. */
export function syncScoreFieldsFromEvents(
  snapshot: BasketballSnapshot,
  events: MatchEvent[],
  ctx: BasketballEngineCtx,
): BasketballSnapshot {
  const derived = replayBasketballScores(ctx.rules, events, ctx.homeTeamId, ctx.awayTeamId);
  const next = cloneSnap(snapshot);
  next.homeScore = derived.homeScore;
  next.awayScore = derived.awayScore;
  next.homeTeamFoulsInQuarter = derived.homeTeamFoulsInQuarter;
  next.awayTeamFoulsInQuarter = derived.awayTeamFoulsInQuarter;
  next.playerFouls = { ...derived.playerFouls };
  return next;
}
