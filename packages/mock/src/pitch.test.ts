import assert from "node:assert/strict";
import test from "node:test";
import { FUTSAL_CLUB_PRESET, SOCCER_CLUB_PRESET } from "@score-up/domain";
import {
  applyPitchPoint,
  applyPitchSanction,
  applyPitchTeamFoul,
  confirmPitchMatch,
  confirmPitchPeriod,
  createBlankPitchMatch,
  startPitchMatch,
  tickPitchClock,
} from "./pitch";

test("soccer clock 0 at end of first half asks to confirm period", () => {
  let match = startPitchMatch(
    createBlankPitchMatch({
      sportId: "soccer",
      homeLabel: "블루",
      awayLabel: "레드",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: SOCCER_CLUB_PRESET.rules,
      isFriendly: true,
    }),
  );
  match = { ...match, snapshot: { ...match.snapshot, clockRunning: true, clockMs: 100 } };
  const next = tickPitchClock(match, 200);
  assert.equal(next.status, "confirm_period_end");
  if (next.sportId !== "soccer") throw new Error("expected soccer");
  assert.equal(next.snapshot.clockMs, 0);
});

test("soccer two yellows add a red memo", () => {
  let match = startPitchMatch(
    createBlankPitchMatch({
      sportId: "soccer",
      homeLabel: "블루",
      awayLabel: "레드",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: SOCCER_CLUB_PRESET.rules,
      isFriendly: true,
    }),
  );
  match = applyPitchSanction(match, "home", "yellow");
  match = applyPitchSanction(match, "home", "yellow");
  if (match.sportId !== "soccer") throw new Error("expected soccer");
  assert.equal(match.snapshot.yellowHome, 2);
  assert.equal(match.snapshot.redHome, 1);
});

test("futsal sixth team foul is a PK hint only", () => {
  let match = startPitchMatch(
    createBlankPitchMatch({
      sportId: "futsal",
      homeLabel: "홈",
      awayLabel: "어웨이",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: FUTSAL_CLUB_PRESET.rules,
      isFriendly: true,
    }),
  );
  for (let i = 0; i < 6; i += 1) match = applyPitchTeamFoul(match, "home");
  if (match.sportId !== "futsal") throw new Error("expected futsal");
  assert.equal(match.snapshot.teamFoulsHome, 6);
  assert.equal(match.status, "in_progress");
});

test("soccer second half unequal score asks to confirm match", () => {
  let match = startPitchMatch(
    createBlankPitchMatch({
      sportId: "soccer",
      homeLabel: "블루",
      awayLabel: "레드",
      roundLabel: "친선",
      scheduledLabel: "오늘",
      rules: SOCCER_CLUB_PRESET.rules,
      isFriendly: true,
    }),
  );
  match = {
    ...match,
    status: "confirm_period_end",
    snapshot: { ...match.snapshot, clockMs: 0 },
  };
  match = confirmPitchPeriod(match);
  match = {
    ...match,
    status: "in_progress",
    snapshot: { ...match.snapshot, started: true, clockRunning: false },
  };
  match = applyPitchPoint(match, "home");
  match = tickPitchClock(
    { ...match, snapshot: { ...match.snapshot, clockRunning: true, clockMs: 50 } },
    80,
  );
  assert.equal(match.status, "confirm_match_end");
  const done = confirmPitchMatch(match);
  assert.equal(done.status, "completed");
  assert.equal(done.winnerLabel, "블루");
});
