import assert from "node:assert/strict";
import test from "node:test";
import { createSeedState } from "./seed";
import { closeVoting, confirmRallyBout, confirmSplit, applySplitProposal, createClub, createSessions, kickMember, recordLadderResult, reopenSessionMatch, requestJoin, respondChallenge, sendChallenge, setAssignment, setMemberRole, setSessionFormat, setVote, signIn, signOut } from "./club";
import { isBasketballMatch, isRallySetMatch } from "@score-up/domain";

test("seed operator is signed in and weekend club is voting", () => {
  const data = createSeedState();
  assert.equal(data.accountId, "acc-minsu");
  assert.equal(data.clubs[0]?.name, "주말 농구 모임");
  const session = data.sessions.find((row) => row.id === "ses-vote");
  assert.equal(session?.status, "voting");
  assert.equal(data.sessionVotes.filter((row) => row.sessionId === "ses-vote" && row.value === "going").length, 8);
  assert.equal(data.sessionVotes.filter((row) => row.sessionId === "ses-vote" && row.value === "maybe").length, 2);
});

test("signIn reuses the same name and signOut clears accountId", () => {
  let data = signOut(createSeedState());
  data = signIn(data, "김민수");
  assert.equal(data.accountId, "acc-minsu");
  data = signOut(data);
  assert.equal(data.accountId, null);
});

test("member can change vote while voting then operator closes it", () => {
  let data = createSeedState();
  data = setVote(data, "ses-vote", "not_going");
  const mine = data.sessionVotes.find((row) => row.sessionId === "ses-vote" && row.accountId === "acc-minsu");
  assert.equal(mine?.value, "not_going");
  data = closeVoting(data, "ses-vote");
  assert.equal(data.sessions.find((row) => row.id === "ses-vote")?.status, "confirming");
  data = setVote(data, "ses-vote", "going");
  const after = data.sessionVotes.find((row) => row.sessionId === "ses-vote" && row.accountId === "acc-minsu");
  assert.equal(after?.value, "not_going");
});

test("join token creates pending member", () => {
  let data = signOut(createSeedState());
  data = signIn(data, "새멤버");
  data = requestJoin(data, "ab12cd");
  const pending = data.clubMembers.find((row) => row.accountId === data.accountId);
  assert.equal(pending?.status, "pending");
});

test("createClub makes basketball owner", () => {
  let data = createSeedState();
  const created = createClub(data, { name: "새벽 농구", venue: "체육관" });
  const club = created.data.clubs.find((row) => row.id === created.id);
  assert.equal(club?.sportId, "basketball");
  const owner = created.data.clubMembers.find((row) => row.clubId === created.id);
  assert.equal(owner?.role, "owner");
});

test("createSessions monthly nth makes 8 first-saturday drafts", () => {
  let data = createSeedState();
  const created = createClub(data, { name: "월례 농구", venue: "체육관" });
  data = created.data;
  const result = createSessions(data, created.id, {
    dateLabel: "2026-08-01",
    timeLabel: "10:00",
    venue: "체육관",
    kind: "monthlyNth",
    nthWeek: 1,
    weekday: 6,
  });
  const sessions = result.data.sessions.filter((row) => row.clubId === created.id);
  assert.equal(sessions.length, 8);
  assert.equal(sessions[0]?.dateLabel, "2026-08-01");
  assert.equal(sessions[1]?.dateLabel, "2026-09-05");
  assert.equal(result.data.clubs.find((row) => row.id === created.id)?.recurrenceKind, "monthlyNth");
});

test("createSessions skips a date that already exists", () => {
  let data = createSeedState();
  const result = createSessions(data, "club-weekend", {
    dateLabel: "2026-08-29",
    timeLabel: "14:00",
    venue: "",
    kind: "weekly",
  });
  const dates = result.data.sessions.filter((row) => row.clubId === "club-weekend" && row.status === "voting").map((row) => row.dateLabel);
  assert.equal(dates.includes("2026-08-29"), true);
  assert.equal(dates.filter((day) => day === "2026-08-29").length, 1);
  assert.ok(dates.includes("2026-09-05"));
});

test("confirmSplit 4v4 writes starters 4 onto the match", () => {
  let data = closeVoting(createSeedState(), "ses-vote");
  data = setSessionFormat(data, "ses-vote", "4v4");
  const proposed = applySplitProposal(data, "ses-vote", { balanceByWinRate: false });
  assert.equal(proposed.ok, true);
  data = proposed.data;
  const { data: next, matchId } = confirmSplit(data, "ses-vote");
  const match = next.matches.find((row) => row.id === matchId);
  assert.ok(match);
  assert.ok(isBasketballMatch(match));
  assert.equal(match.rules.starters, 4);
  assert.equal(match.snapshot.onCourtHome.length, 4);
  assert.equal(match.snapshot.onCourtAway.length, 4);
  assert.equal(next.sessions.find((row) => row.id === "ses-vote")?.format, "4v4");
});

test("seed has a pending challenge to the signed-in owner", () => {
  const data = createSeedState();
  const pending = data.challenges.find((row) => row.id === "ch-pending");
  assert.equal(pending?.toAccountId, "acc-minsu");
  assert.equal(pending?.status, "pending");
  assert.equal(data.ladderMatches[0]?.homeScore, 21);
});

test("sendChallenge locks beginner vs advanced", () => {
  let data = signOut(createSeedState());
  data = signIn(data, "한지호");
  assert.throws(() => sendChallenge(data, "club-weekend", "acc-seoyeon"), /초급과 상급/);
});

test("accept challenge then record result updates ranking source", () => {
  let data = createSeedState();
  data = respondChallenge(data, "ch-pending", true);
  assert.equal(data.challenges.find((row) => row.id === "ch-pending")?.status, "accepted");
  data = recordLadderResult(data, "club-weekend", {
    challengeId: "ch-pending",
    homeAccountId: "acc-jiho",
    awayAccountId: "acc-minsu",
    homeScore: 15,
    awayScore: 21,
  });
  const done = data.challenges.find((row) => row.id === "ch-pending");
  assert.equal(done?.status, "completed");
  const match = data.ladderMatches.find((row) => row.challengeId === "ch-pending");
  assert.equal(match?.winnerAccountId, "acc-minsu");
});

test("createClub badminton and rejects volleyball", () => {
  const data = createSeedState();
  const created = createClub(data, { name: "수요일 민턴", sportId: "badminton" });
  assert.equal(created.data.clubs.find((row) => row.id === created.id)?.sportId, "badminton");
  assert.throws(() => createClub(data, { name: "배구", sportId: "volleyball" }), /농구 또는 배드민턴/);
});

test("createSessions badminton defaults doubles", () => {
  const created = createClub(createSeedState(), { name: "민턴", sportId: "badminton" });
  const result = createSessions(created.data, created.id, {
    dateLabel: "2026-09-02",
    timeLabel: "20:00",
    venue: "",
    kind: "once",
  });
  assert.equal(result.data.sessions.find((row) => row.id === result.firstId)?.format, "doubles");
});

test("seed badminton club is voting with 4 going", () => {
  const data = createSeedState();
  const club = data.clubs.find((row) => row.id === "club-bd");
  assert.equal(club?.sportId, "badminton");
  const session = data.sessions.find((row) => row.id === "ses-bd-vote");
  assert.equal(session?.format, "doubles");
  assert.equal(data.sessionVotes.filter((row) => row.sessionId === "ses-bd-vote" && row.value === "going").length, 4);
});

test("confirmRallyBout doubles writes slash labels onto the match", () => {
  let data = closeVoting(createSeedState(), "ses-bd-vote");
  data = setSessionFormat(data, "ses-bd-vote", "doubles");
  const going = data.sessionVotes
    .filter((row) => row.sessionId === "ses-bd-vote" && row.value === "going")
    .map((row) => row.accountId as string);
  data = setAssignment(data, "ses-bd-vote", { accountId: going[0] }, "home");
  data = setAssignment(data, "ses-bd-vote", { accountId: going[1] }, "home");
  data = setAssignment(data, "ses-bd-vote", { accountId: going[2] }, "away");
  data = setAssignment(data, "ses-bd-vote", { accountId: going[3] }, "away");
  const { data: next, matchId } = confirmRallyBout(data, "ses-bd-vote");
  const match = next.matches.find((row) => row.id === matchId);
  assert.ok(match);
  assert.ok(isRallySetMatch(match));
  assert.equal(match.sportId, "badminton");
  assert.equal(match.sessionId, "ses-bd-vote");
  assert.equal(match.rules.doubles, true);
  assert.ok(match.homeLabel.includes(" / "));
  assert.equal(next.sessions.find((row) => row.id === "ses-bd-vote")?.status, "matched");
});

test("confirmRallyBout singles locks until both sides have one player", () => {
  let data = closeVoting(createSeedState(), "ses-bd-vote");
  data = setSessionFormat(data, "ses-bd-vote", "singles");
  assert.throws(() => confirmRallyBout(data, "ses-bd-vote"), /양쪽 1명/);
});

test("reopenSessionMatch after confirmSplit returns confirming and keeps assignments", () => {
  let data = closeVoting(createSeedState(), "ses-vote");
  data = setSessionFormat(data, "ses-vote", "4v4");
  const proposed = applySplitProposal(data, "ses-vote", { balanceByWinRate: false });
  data = proposed.data;
  const { data: matched, matchId } = confirmSplit(data, "ses-vote");
  const next = reopenSessionMatch(matched, "ses-vote");
  const session = next.sessions.find((row) => row.id === "ses-vote");
  assert.equal(session?.status, "confirming");
  assert.equal(session?.matchId, undefined);
  assert.equal(next.matches.some((row) => row.id === matchId), false);
  assert.ok(next.sessionAssignments.some((row) => row.sessionId === "ses-vote" && row.side === "home"));
});

test("owner can kick a member and cannot kick the owner", () => {
  const data = createSeedState();
  const next = kickMember(data, "cm-2");
  assert.equal(next.clubMembers.some((row) => row.id === "cm-2"), false);
  assert.throws(() => kickMember(data, "cm-0"), /모임장은 강퇴/);
});

test("owner can promote a member to operator", () => {
  const data = createSeedState();
  const next = setMemberRole(data, "cm-2", "operator");
  assert.equal(next.clubMembers.find((row) => row.id === "cm-2")?.role, "operator");
});

test("applySplitProposal rejects a badminton session", () => {
  const data = closeVoting(createSeedState(), "ses-bd-vote");
  const result = applySplitProposal(data, "ses-bd-vote");
  assert.equal(result.ok, false);
  assert.match(result.reason ?? "", /한 판 열기/);
});

test("operator can record a ladder result without a challenge and ties are locked", () => {
  const data = createSeedState();
  const next = recordLadderResult(data, "club-weekend", {
    homeAccountId: "acc-minsu",
    awayAccountId: "acc-seoyeon",
    homeScore: 21,
    awayScore: 19,
  });
  assert.equal(next.ladderMatches.at(-1)?.homeScore, 21);
  assert.throws(
    () =>
      recordLadderResult(data, "club-weekend", {
        homeAccountId: "acc-minsu",
        awayAccountId: "acc-jihun",
        homeScore: 10,
        awayScore: 10,
      }),
    /승패가 나야/,
  );
});
