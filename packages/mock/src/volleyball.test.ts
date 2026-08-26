import assert from "node:assert/strict";
import test from "node:test";
import { VOLLEYBALL_CLUB_PRESET } from "@score-up/domain";
import {
  applyVolleyballPoint,
  applyVolleyballTimeout,
  confirmVolleyballMatch,
  confirmVolleyballSet,
  createBlankVolleyballMatch,
  startVolleyballMatch,
  undoVolleyballLast,
  volleyballNotice,
} from "./volleyball";

const RULES = VOLLEYBALL_CLUB_PRESET.rules;

function started() {
  return startVolleyballMatch(
    createBlankVolleyballMatch({
      homeLabel: "블루",
      awayLabel: "레드",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: RULES,
      isFriendly: true,
    }),
    "home",
  );
}

function rally(match: ReturnType<typeof started>, home: number, away: number) {
  let next = match;
  const trailHome = home <= away;
  const firstCount = trailHome ? home : away;
  const firstSide = trailHome ? "home" : "away";
  const secondCount = trailHome ? away : home;
  const secondSide = trailHome ? "away" : "home";
  for (let i = 0; i < firstCount; i += 1) next = applyVolleyballPoint(next, firstSide);
  for (let i = 0; i < secondCount; i += 1) next = applyVolleyballPoint(next, secondSide);
  return next;
}

test("volleyballNotice: 24-23 세트 포인트, 24-24 듀스, 25-24 세트 포인트", () => {
  let match = rally(started(), 24, 23);
  assert.equal(volleyballNotice(match), "세트 포인트");
  match = applyVolleyballPoint(match, "away");
  assert.equal(volleyballNotice(match), "듀스 · 2점 차 필요");
  match = applyVolleyballPoint(match, "home");
  assert.equal(volleyballNotice(match), "세트 포인트");
});

test("세트 종료 확인 후 마지막 점수 취소가 점수와 서브권을 되돌린다", () => {
  let match = rally(started(), 25, 23);
  assert.equal(match.status, "confirm_period_end");
  assert.match(volleyballNotice(match), /세트 종료/);
  match = undoVolleyballLast(match);
  assert.equal(match.status, "in_progress");
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  assert.equal(match.snapshot.homeSetPoints, 24);
  assert.equal(match.snapshot.awaySetPoints, 23);
  assert.equal(match.snapshot.serveSide, "home");
});

test("타임아웃은 횟수만 줄고, 취소하면 되돌린다", () => {
  let match = started();
  match = applyVolleyballTimeout(match, "home");
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  assert.equal(match.snapshot.timeoutsLeft.home, RULES.timeoutsPerSet - 1);
  match = undoVolleyballLast(match);
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  assert.equal(match.snapshot.timeoutsLeft.home, RULES.timeoutsPerSet);
});

test("마지막 세트 승 확정은 경기 종료 확인으로 이어진다", () => {
  let match = started();
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  match.snapshot.setsWonHome = RULES.setsToWin - 1;
  match = rally(match, 25, 20);
  match = confirmVolleyballSet(match);
  assert.equal(match.status, "confirm_match_end");
  assert.match(volleyballNotice(match), /경기 종료/);
  match = confirmVolleyballMatch(match);
  assert.equal(match.status, "completed");
  assert.equal(match.winnerLabel, "블루");
});

test("로테이션 켜면 사이드아웃 때 득점 팀 전열이 돌고, 취소하면 되돌린다", () => {
  const rules = { ...RULES, rotationEnabled: true };
  let match = startVolleyballMatch(
    createBlankVolleyballMatch({
      homeLabel: "블루",
      awayLabel: "레드",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules,
      isFriendly: true,
    }),
    "home",
  );
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  assert.deepEqual(match.snapshot.rotationAway, [1, 2, 3, 4, 5, 6]);
  match = applyVolleyballPoint(match, "away");
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  assert.equal(match.snapshot.serveSide, "away");
  assert.deepEqual(match.snapshot.rotationAway, [2, 3, 4, 5, 6, 1]);
  match = undoVolleyballLast(match);
  if (match.sportId !== "volleyball") throw new Error("expected volleyball");
  assert.deepEqual(match.snapshot.rotationAway, [1, 2, 3, 4, 5, 6]);
});
