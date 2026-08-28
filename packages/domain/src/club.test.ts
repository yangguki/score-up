import assert from "node:assert/strict";
import test from "node:test";
import { canEnterRallyBout, computeClubRanking, proposeClubSplit, sessionSideLabel, voteLabel } from "./club";
import { BASKETBALL_CLUB_PRESET, emptySnapshot } from "./basketball";
import type { Match, SessionAssignment } from "./types";

test("sessionSideLabel maps A / B / 대기", () => {
  assert.equal(sessionSideLabel("home"), "A");
  assert.equal(sessionSideLabel("away"), "B");
  assert.equal(sessionSideLabel("bench"), "대기");
});

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
  assert.equal(rows.find((row) => row.accountId === "a")?.grade, "intermediate");
});

test("canEnterRallyBout uses 2 for singles and 4 for doubles", () => {
  assert.equal(canEnterRallyBout(1, "singles"), false);
  assert.equal(canEnterRallyBout(2, "singles"), true);
  assert.equal(canEnterRallyBout(3, "doubles"), false);
  assert.equal(canEnterRallyBout(4, "doubles"), true);
});

test("proposeClubSplit locks under 10", () => {
  const people = Array.from({ length: 7 }, (_, i) => ({
    accountId: `a${i}`,
    name: `P${i}`,
    winRate: null as number | null,
  }));
  const proposal = proposeClubSplit(people, { balanceByWinRate: true });
  assert.equal(proposal.ok, false);
  assert.equal(proposal.bench.length, 7);
  assert.match(proposal.reason ?? "", /10명/);
});

test("proposeClubSplit 4v4 locks under 8 and splits 8 into 4+4", () => {
  const seven = Array.from({ length: 7 }, (_, i) => ({
    accountId: `a${i}`,
    name: `P${i}`,
    winRate: null as number | null,
  }));
  const locked = proposeClubSplit(seven, { format: "4v4" });
  assert.equal(locked.ok, false);
  assert.match(locked.reason ?? "", /8명/);

  const eight = Array.from({ length: 8 }, (_, i) => ({
    accountId: `a${i}`,
    name: `P${i}`,
    winRate: 1 - i * 0.08,
  }));
  const split = proposeClubSplit(eight, { format: "4v4", balanceByWinRate: true });
  assert.equal(split.ok, true);
  assert.equal(split.home.length, 4);
  assert.equal(split.away.length, 4);
  assert.equal(split.bench.length, 0);
});

test("proposeClubSplit 4v4 puts the 9th on bench", () => {
  const people = Array.from({ length: 9 }, (_, i) => ({
    accountId: `a${i}`,
    name: `P${i}`,
    winRate: null as number | null,
  }));
  const proposal = proposeClubSplit(people, { format: "4v4", balanceByWinRate: false, random: () => 0 });
  assert.equal(proposal.ok, true);
  assert.equal(proposal.home.length, 4);
  assert.equal(proposal.away.length, 4);
  assert.equal(proposal.bench.length, 1);
});

test("proposeClubSplit snake balances by win rate", () => {
  const people = Array.from({ length: 10 }, (_, i) => ({
    accountId: `a${i}`,
    name: `P${i}`,
    winRate: 1 - i * 0.08,
  }));
  const proposal = proposeClubSplit(people, { balanceByWinRate: true });
  assert.equal(proposal.ok, true);
  assert.equal(proposal.home.length, 5);
  assert.equal(proposal.away.length, 5);
  assert.equal(proposal.home[0]?.accountId, "a0");
  assert.equal(proposal.away[0]?.accountId, "a1");
  assert.equal(proposal.away[1]?.accountId, "a2");
  assert.equal(proposal.home[1]?.accountId, "a3");
});

test("proposeClubSplit random puts extras on bench", () => {
  let n = 0;
  const random = () => {
    n += 1;
    return (n % 10) / 10;
  };
  const people = Array.from({ length: 12 }, (_, i) => ({
    accountId: `a${i}`,
    name: `P${i}`,
    winRate: null as number | null,
  }));
  const proposal = proposeClubSplit(people, { balanceByWinRate: false, random });
  assert.equal(proposal.ok, true);
  assert.equal(proposal.home.length + proposal.away.length, 10);
  assert.equal(proposal.bench.length, 2);
});
