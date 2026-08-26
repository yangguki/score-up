import assert from "node:assert/strict";
import test from "node:test";
import { BADMINTON_CLUB_PRESET, TABLE_TENNIS_CLUB_PRESET } from "@score-up/domain";
import {
  applyTableTennisPoint,
  confirmTableTennisMatch,
  confirmTableTennisSet,
  createBlankTableTennisMatch,
  startTableTennisMatch,
  undoTableTennisLast,
  tableTennisNotice,
} from "./table-tennis";

const RULES = TABLE_TENNIS_CLUB_PRESET.rules;

function started() {
  return startTableTennisMatch(
    createBlankTableTennisMatch({
      homeLabel: "김민수",
      awayLabel: "박지훈",
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
  for (let i = 0; i < firstCount; i += 1) next = applyTableTennisPoint(next, firstSide);
  for (let i = 0; i < secondCount; i += 1) next = applyTableTennisPoint(next, secondSide);
  return next;
}

test("탁구 알림: 10-8 세트 포인트, 10-10 듀스", () => {
  let match = rally(started(), 10, 8);
  assert.equal(tableTennisNotice(match), "세트 포인트");
  match = applyTableTennisPoint(match, "away");
  match = applyTableTennisPoint(match, "away");
  assert.equal(tableTennisNotice(match), "듀스 · 교대 서브");
});

test("11-9 세트 종료 확인 후 취소는 점수와 서브 카운트를 되돌린다", () => {
  let match = rally(started(), 11, 9);
  assert.equal(match.status, "confirm_period_end");
  match = undoTableTennisLast(match);
  assert.equal(match.status, "in_progress");
  if (match.sportId !== "table-tennis") throw new Error("expected table-tennis");
  assert.equal(match.snapshot.homeSetPoints, 10);
  assert.equal(match.snapshot.awaySetPoints, 9);
});

test("세트 확정 뒤 엔드 교대 알림", () => {
  let match = rally(started(), 11, 7);
  match = confirmTableTennisSet(match);
  assert.equal(match.status, "in_progress");
  assert.equal(tableTennisNotice(match), "엔드 교대");
  if (match.sportId !== "table-tennis") throw new Error("expected table-tennis");
  assert.equal(match.snapshot.currentSet, 2);
  assert.equal(match.snapshot.serveSide, "away");
});

test("마지막 세트 승 확정은 경기 종료 확인으로 이어진다", () => {
  let match = started();
  if (match.sportId !== "table-tennis") throw new Error("expected table-tennis");
  match.snapshot.setsWonHome = RULES.setsToWin - 1;
  match = rally(match, 11, 5);
  match = confirmTableTennisSet(match);
  assert.equal(match.status, "confirm_match_end");
  assert.match(tableTennisNotice(match), /경기 종료/);
  match = confirmTableTennisMatch(match);
  assert.equal(match.status, "completed");
  assert.equal(match.winnerLabel, "김민수");
});

test("배드민턴은 득점자가 서브를 가진다", () => {
  let match = startTableTennisMatch(
    createBlankTableTennisMatch({
      sportId: "badminton",
      homeLabel: "최은지",
      awayLabel: "한소라",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: BADMINTON_CLUB_PRESET.rules,
      isFriendly: true,
    }),
    "home",
  );
  match = applyTableTennisPoint(match, "away");
  if (match.sportId !== "badminton") throw new Error("expected badminton");
  assert.equal(match.snapshot.serveSide, "away");
  assert.equal(match.snapshot.serveCount, 1);
  assert.equal(match.snapshot.awaySetPoints, 1);
});
