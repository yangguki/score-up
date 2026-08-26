import assert from "node:assert/strict";
import test from "node:test";
import { BASEBALL_CLUB_PRESET } from "@score-up/domain";
import {
  applyBaseballOut,
  applyBaseballRun,
  confirmBaseballHalf,
  confirmBaseballMatch,
  createBlankBaseballMatch,
  startBaseballMatch,
} from "./baseball";

function started() {
  return startBaseballMatch(
    createBlankBaseballMatch({
      homeLabel: "홈",
      awayLabel: "어웨이",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: BASEBALL_CLUB_PRESET.rules,
      isFriendly: true,
    }),
  );
}

test("baseball three outs ask to confirm the half", () => {
  let match = started();
  match = applyBaseballOut(match);
  match = applyBaseballOut(match);
  match = applyBaseballOut(match);
  assert.equal(match.status, "confirm_period_end");
  if (match.sportId !== "baseball") throw new Error("expected baseball");
  assert.equal(match.snapshot.outs, 3);
  const next = confirmBaseballHalf(match);
  if (next.sportId !== "baseball") throw new Error("expected baseball");
  assert.equal(next.snapshot.half, "bottom");
  assert.equal(next.snapshot.outs, 0);
  assert.equal(next.status, "in_progress");
});

test("baseball walk-off in last inning asks to confirm match", () => {
  let match = started();
  if (match.sportId !== "baseball") throw new Error("expected baseball");
  match = {
    ...match,
    snapshot: { ...match.snapshot, inning: 7, half: "bottom", awayScore: 1, homeScore: 1, outs: 1 },
  };
  match = applyBaseballRun(match);
  assert.equal(match.status, "confirm_match_end");
  const done = confirmBaseballMatch(match);
  assert.equal(done.status, "completed");
  assert.equal(done.winnerLabel, "홈");
});
