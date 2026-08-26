import assert from "node:assert/strict";
import test from "node:test";
import {
  VOLLEYBALL_CLUB_PRESET,
  canEndVolleyballMatch,
  canEndVolleyballSet,
  emptyVolleyballSnapshot,
  volleyballDeuce,
  volleyballSetPointSide,
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

test("volleyballSetPointSide: 24-23은 세트 포인트, 25-24도 세트 포인트", () => {
  const snap = emptyVolleyballSnapshot(RULES);
  snap.homeSetPoints = 24;
  snap.awaySetPoints = 23;
  assert.equal(volleyballSetPointSide(snap, RULES), "home");
  snap.homeSetPoints = 25;
  snap.awaySetPoints = 24;
  assert.equal(volleyballSetPointSide(snap, RULES), "home");
});

test("volleyballDeuce: 24-24만 동점 듀스, 25-24는 아님", () => {
  const snap = emptyVolleyballSnapshot(RULES);
  snap.homeSetPoints = 24;
  snap.awaySetPoints = 24;
  assert.equal(volleyballDeuce(snap, RULES), true);
  snap.homeSetPoints = 25;
  assert.equal(volleyballDeuce(snap, RULES) && snap.homeSetPoints === snap.awaySetPoints, false);
});

test("canEndVolleyballMatch: setsToWin", () => {
  const snap = emptyVolleyballSnapshot(RULES);
  snap.setsWonHome = 3;
  assert.equal(canEndVolleyballMatch(snap, RULES), true);
});
