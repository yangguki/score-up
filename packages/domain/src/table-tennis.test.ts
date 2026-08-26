import assert from "node:assert/strict";
import test from "node:test";
import {
  TABLE_TENNIS_CLUB_PRESET,
  advanceTableTennisServe,
  canEndTableTennisMatch,
  canEndTableTennisSet,
  emptyTableTennisSnapshot,
  tableTennisDeuce,
  tableTennisServeLimit,
  tableTennisSetPointSide,
} from "../src/index";

const RULES = TABLE_TENNIS_CLUB_PRESET.rules;

test("canEndTableTennisSet: 11점·2점 차", () => {
  const snap = emptyTableTennisSnapshot();
  snap.homeSetPoints = 11;
  snap.awaySetPoints = 9;
  assert.equal(canEndTableTennisSet(snap, RULES), true);
  snap.awaySetPoints = 10;
  assert.equal(canEndTableTennisSet(snap, RULES), false);
});

test("tableTennisDeuce: 10-10", () => {
  const snap = emptyTableTennisSnapshot();
  snap.homeSetPoints = 10;
  snap.awaySetPoints = 10;
  assert.equal(tableTennisDeuce(snap, RULES), true);
  assert.equal(tableTennisServeLimit(snap, RULES), 1);
});

test("tableTennisSetPointSide: 10-8은 세트 포인트", () => {
  const snap = emptyTableTennisSnapshot();
  snap.homeSetPoints = 10;
  snap.awaySetPoints = 8;
  assert.equal(tableTennisSetPointSide(snap, RULES), "home");
});

test("서브는 2점마다 교대, 듀스 이후 1점마다", () => {
  const snap = emptyTableTennisSnapshot("home");
  advanceTableTennisServe(snap, RULES);
  assert.equal(snap.serveSide, "home");
  assert.equal(snap.serveCount, 2);
  advanceTableTennisServe(snap, RULES);
  assert.equal(snap.serveSide, "away");
  assert.equal(snap.serveCount, 1);
  snap.homeSetPoints = 10;
  snap.awaySetPoints = 10;
  snap.serveCount = 1;
  snap.serveSide = "home";
  advanceTableTennisServe(snap, RULES);
  assert.equal(snap.serveSide, "away");
  assert.equal(snap.serveCount, 1);
});

test("canEndTableTennisMatch: setsToWin", () => {
  const snap = emptyTableTennisSnapshot();
  snap.setsWonHome = 3;
  assert.equal(canEndTableTennisMatch(snap, RULES), true);
});
