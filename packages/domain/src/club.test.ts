import assert from "node:assert/strict";
import test from "node:test";
import { computeClubRanking, voteLabel } from "./club";
import { BASKETBALL_CLUB_PRESET, emptySnapshot } from "./basketball";
import type { Match, SessionAssignment } from "./types";

test("voteLabel uses 참석/불참/미정", () => {
  assert.equal(voteLabel("going"), "참석");
  assert.equal(voteLabel("not_going"), "불참");
  assert.equal(voteLabel("maybe"), "미정");
  assert.equal(voteLabel("none"), "없음");
});

test("computeClubRanking counts session matches only and skips guests", () => {
  const rules = BASKETBALL_CLUB_PRESET.rules;
  const match = (id: string, sessionId: string, winner: "h" | "a"): Match => ({
    id,
    sportId: "basketball",
    sessionId,
    homeTeamId: "ta",
    awayTeamId: "tb",
    homeLabel: "A",
    awayLabel: "B",
    homeColor: "#111",
    awayColor: "#222",
    roundLabel: "회차",
    scheduledLabel: "지난 회차",
    status: "completed",
    snapshot: emptySnapshot(rules),
    events: [],
    winnerTeamId: winner === "h" ? "ta" : "tb",
    winnerLabel: winner === "h" ? "A" : "B",
    isFriendly: false,
    rules,
  });
  const assignments: SessionAssignment[] = [
    { id: "1", sessionId: "s1", accountId: "a", side: "home" },
    { id: "2", sessionId: "s1", accountId: "b", side: "away" },
    { id: "3", sessionId: "s1", guestId: "g1", side: "home" },
    { id: "4", sessionId: "s2", accountId: "a", side: "away" },
    { id: "5", sessionId: "s2", accountId: "b", side: "home" },
  ];
  const rows = computeClubRanking(
    [
      { accountId: "a", name: "김민수" },
      { accountId: "b", name: "박지훈" },
      { accountId: "c", name: "한지호" },
    ],
    [match("m1", "s1", "h"), match("m2", "s2", "h")],
    assignments,
  );
  assert.equal(rows[0]?.accountId, "a");
  assert.equal(rows[0]?.wins, 1);
  assert.equal(rows[0]?.losses, 1);
  assert.equal(rows.find((row) => row.accountId === "c")?.played, 0);
  assert.equal(rows.find((row) => row.accountId === "c")?.winRate, null);
});
