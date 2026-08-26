import assert from "node:assert/strict";
import test from "node:test";
import { createSeedState } from "./seed";
import { closeVoting, createClub, requestJoin, setVote, signIn, signOut } from "./club";

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
