import assert from "node:assert/strict";
import test from "node:test";
import { canSendChallenge, canChallengeGrade, gradeLabel, memberGrade } from "./ladder";
import { computeClubRanking, groupClubRanking } from "./club";
import { BASKETBALL_CLUB_PRESET, emptySnapshot } from "./basketball";
import type { ClubLadderMatch, Match, SessionAssignment } from "./types";

test("gradeLabel is 초급/중급/상급 and defaults to 중급", () => {
  assert.equal(gradeLabel("beginner"), "초급");
  assert.equal(gradeLabel("intermediate"), "중급");
  assert.equal(gradeLabel("advanced"), "상급");
  assert.equal(memberGrade(undefined), "intermediate");
});

test("canChallengeGrade locks beginner vs advanced", () => {
  assert.equal(canChallengeGrade("beginner", "intermediate"), true);
  assert.equal(canChallengeGrade("intermediate", "advanced"), true);
  assert.equal(canChallengeGrade("beginner", "advanced"), false);
});

test("canSendChallenge blocks self, inactive, open, and two-step grade", () => {
  assert.equal(
    canSendChallenge({
      fromAccountId: "a",
      toAccountId: "a",
      fromActive: true,
      toActive: true,
      openBetween: false,
    }).ok,
    false,
  );
  assert.equal(
    canSendChallenge({
      fromAccountId: "a",
      toAccountId: "b",
      fromActive: true,
      toActive: true,
      openBetween: true,
    }).ok,
    false,
  );
  const locked = canSendChallenge({
    fromAccountId: "a",
    toAccountId: "b",
    fromGrade: "beginner",
    toGrade: "advanced",
    fromActive: true,
    toActive: true,
    openBetween: false,
  });
  assert.equal(locked.ok, false);
  if (!locked.ok) assert.match(locked.reason, /초급과 상급/);
});

test("computeClubRanking adds ladder matches and groupClubRanking splits by grade", () => {
  const rules = BASKETBALL_CLUB_PRESET.rules;
  const match: Match = {
    id: "m1",
    sportId: "basketball",
    sessionId: "s1",
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
    winnerTeamId: "ta",
    winnerLabel: "A",
    isFriendly: false,
    rules,
  };
  const assignments: SessionAssignment[] = [
    { id: "1", sessionId: "s1", accountId: "a", side: "home" },
    { id: "2", sessionId: "s1", accountId: "b", side: "away" },
  ];
  const ladder: ClubLadderMatch[] = [
    {
      id: "lad-1",
      clubId: "c",
      homeAccountId: "a",
      awayAccountId: "c",
      homeScore: 21,
      awayScore: 18,
      winnerAccountId: "a",
      dateLabel: "2026-08-20",
    },
  ];
  const rows = computeClubRanking(
    [
      { accountId: "a", name: "김민수", grade: "intermediate" },
      { accountId: "b", name: "박지훈", grade: "intermediate" },
      { accountId: "c", name: "이서연", grade: "advanced" },
    ],
    [match],
    assignments,
    ladder,
  );
  assert.equal(rows.find((row) => row.accountId === "a")?.wins, 2);
  assert.equal(rows.find((row) => row.accountId === "c")?.losses, 1);
  const groups = groupClubRanking(rows);
  assert.equal(groups[0]?.grade, "advanced");
  assert.equal(groups[0]?.rows[0]?.rank, 1);
  assert.equal(groups.find((group) => group.grade === "intermediate")?.rows.length, 2);
});
