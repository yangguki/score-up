import assert from "node:assert/strict";
import test from "node:test";
import {
  BASKETBALL_CLUB_PRESET,
  applyBasketballEvent,
  canEndMatch,
  canEndPeriod,
  emptySnapshot,
  replayBasketballScores,
  syncScoreFieldsFromEvents,
} from "../src/index";
import type { MatchEvent } from "../src/types";

const RULES = BASKETBALL_CLUB_PRESET.rules;
const HOME = "team-home";
const AWAY = "team-away";
const CTX = { rules: RULES, homeTeamId: HOME, awayTeamId: AWAY };

function ev(partial: Partial<MatchEvent> & Pick<MatchEvent, "id" | "type">): MatchEvent {
  return {
    matchId: "m1",
    clockMs: 60_000,
    quarter: 1,
    createdAt: 1,
    revoked: false,
    ...partial,
  };
}

test("canEndPeriod: 시계 0일 때만", () => {
  const snap = emptySnapshot(RULES, HOME, AWAY);
  assert.equal(canEndPeriod("basketball", snap, RULES), false);
  snap.clockMs = 0;
  assert.equal(canEndPeriod("basketball", snap, RULES), true);
});

test("canEndMatch: 마지막 쿼터·시계 0·동점 아님", () => {
  const snap = emptySnapshot(RULES, HOME, AWAY);
  snap.quarter = RULES.periodCount;
  snap.clockMs = 0;
  snap.homeScore = 20;
  snap.awayScore = 18;
  assert.equal(canEndMatch("basketball", snap, RULES), true);
  snap.awayScore = 20;
  assert.equal(canEndMatch("basketball", snap, RULES), false);
});

test("applyBasketballEvent: point·foul·sub", () => {
  let snap = emptySnapshot(RULES, HOME, AWAY);
  snap.onCourtHome = ["p1", "p2", "p3", "p4", "p5"];
  snap = applyBasketballEvent(
    snap,
    ev({ id: "1", type: "point", teamId: HOME, payload: { points: 3 } }),
    CTX,
  );
  assert.equal(snap.homeScore, 3);
  snap = applyBasketballEvent(
    snap,
    ev({ id: "2", type: "foul", teamId: HOME, playerId: "p1" }),
    CTX,
  );
  assert.equal(snap.playerFouls.p1, 1);
  assert.equal(snap.homeTeamFoulsInQuarter, 1);
  snap = applyBasketballEvent(
    snap,
    ev({
      id: "3",
      type: "substitution",
      teamId: HOME,
      payload: { outPlayerId: "p1", inPlayerId: "p6" },
    }),
    CTX,
  );
  assert.deepEqual(snap.onCourtHome, ["p6", "p2", "p3", "p4", "p5"]);
});

test("applyBasketballEvent: personal foul out removes from court", () => {
  let snap = emptySnapshot(RULES, HOME, AWAY);
  snap.onCourtHome = ["p1", "p2", "p3", "p4", "p5"];
  snap.playerFouls.p1 = RULES.personalFoulLimit - 1;
  snap = applyBasketballEvent(
    snap,
    ev({ id: "1", type: "foul", teamId: HOME, playerId: "p1" }),
    CTX,
  );
  assert.equal(snap.playerFouls.p1, RULES.personalFoulLimit);
  assert.equal(snap.onCourtHome.includes("p1"), false);
});

test("replayBasketballScores: 득점·취소·파울", () => {
  const events: MatchEvent[] = [
    ev({ id: "1", type: "point", teamId: HOME, payload: { points: 2 } }),
    ev({ id: "2", type: "point", teamId: AWAY, payload: { points: 3 } }),
    ev({ id: "3", type: "foul", teamId: HOME, playerId: "p1", payload: { personalFouls: 1 } }),
    ev({ id: "4", type: "revoke", payload: { targetEventId: "2" } }),
  ];
  const state = replayBasketballScores(RULES, events, HOME, AWAY);
  assert.equal(state.homeScore, 2);
  assert.equal(state.awayScore, 0);
  assert.equal(state.playerFouls.p1, 1);
  assert.equal(state.homeTeamFoulsInQuarter, 1);
});

test("replayBasketballScores: period_end면 팀 파울 리셋·쿼터 증가", () => {
  const events: MatchEvent[] = [
    ev({ id: "1", type: "foul", teamId: AWAY, playerId: "p2" }),
    ev({ id: "2", type: "foul", teamId: AWAY, playerId: "p3" }),
    ev({ id: "3", type: "period_end", payload: { quarter: 1 } }),
  ];
  const state = replayBasketballScores(RULES, events, HOME, AWAY);
  assert.equal(state.awayTeamFoulsInQuarter, 0);
  assert.equal(state.quarter, 2);
  assert.equal(state.playerFouls.p2, 1);
});

test("syncScoreFieldsFromEvents: revoke 후 점수 맞춤", () => {
  const snap = emptySnapshot(RULES, HOME, AWAY);
  snap.homeScore = 5;
  snap.awayScore = 3;
  snap.clockMs = 12_000;
  const events: MatchEvent[] = [
    { ...ev({ id: "1", type: "point", teamId: HOME, payload: { points: 2 } }), revoked: true },
    ev({ id: "2", type: "point", teamId: AWAY, payload: { points: 3 } }),
    ev({ id: "3", type: "revoke", payload: { targetEventId: "1" } }),
  ];
  const synced = syncScoreFieldsFromEvents(snap, events, CTX);
  assert.equal(synced.homeScore, 0);
  assert.equal(synced.awayScore, 3);
  assert.equal(synced.clockMs, 12_000);
});
