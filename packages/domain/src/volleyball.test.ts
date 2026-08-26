import assert from "node:assert/strict";
import test from "node:test";
import {
  VOLLEYBALL_CLUB_PRESET,
  canEndVolleyballMatch,
  canEndVolleyballSet,
  emptyVolleyballSnapshot,
  volleyballDeuce,
} from "../src/index";

const RULES = VOLLEYBALL_CLUB_PRESET.rules;

test("canEndVolleyballSet: 25점·2점 차", () => {
  const snap = emptyVolleyballSnapshot(RULES);
  snap.homeSetPoints = 25;
  snap.awaySetPoints = 23;
  assert.equal(canEndVolleyballSet(snap, RULES), true);
  snap.awaySetPoints = 24;
  assert.equal(canEndVolleyballSet(snap, RULES), false);
});

test("volleyballDeuce: 24-24", () => {
  const snap = emptyVolleyballSnapshot(RULES);
  snap.homeSetPoints = 24;
  snap.awaySetPoints = 24;
  assert.equal(volleyballDeuce(snap, RULES), true);
});

test("canEndVolleyballMatch: setsToWin", () => {
  const snap = emptyVolleyballSnapshot(RULES);
  snap.setsWonHome = 3;
  assert.equal(canEndVolleyballMatch(snap, RULES), true);
});
