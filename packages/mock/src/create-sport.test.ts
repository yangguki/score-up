import assert from "node:assert/strict";
import test from "node:test";
import { BADMINTON_CLUB_PRESET, TABLE_TENNIS_CLUB_PRESET, VOLLEYBALL_CLUB_PRESET } from "@score-up/domain";
import { addTeam, createCompetition, createFriendly, createSeedState, generateBracket } from "./repo";

test("createCompetition volleyball then bracket makes volleyball matches", () => {
  let data = createSeedState();
  const { data: withComp, id } = createCompetition(data, {
    name: "배구 컵",
    dateLabel: "2026-08-26",
    format: "tournament",
    sportId: "volleyball",
    rules: VOLLEYBALL_CLUB_PRESET.rules,
    officialPreset: false,
  });
  data = addTeam(withComp, id, "블루");
  data = addTeam(data, id, "레드");
  data = generateBracket(data, id);
  const match = data.matches.find((row) => row.competitionId === id);
  assert.equal(match?.sportId, "volleyball");
  assert.equal(match?.rules, VOLLEYBALL_CLUB_PRESET.rules);
});

test("createFriendly table tennis skips basketball clock snapshot", () => {
  const { data, matchId } = createFriendly(createSeedState(), {
    sportId: "table-tennis",
    homeName: "김민수",
    awayName: "박지훈",
    rules: TABLE_TENNIS_CLUB_PRESET.rules,
  });
  const match = data.matches.find((row) => row.id === matchId);
  assert.equal(match?.sportId, "table-tennis");
  assert.equal(match?.status, "in_progress");
  assert.equal(match?.isFriendly, true);
});

test("createFriendly badminton uses rally snapshot and scorer serve", () => {
  const { data, matchId } = createFriendly(createSeedState(), {
    sportId: "badminton",
    homeName: "최은지",
    awayName: "한소라",
    rules: BADMINTON_CLUB_PRESET.rules,
  });
  const match = data.matches.find((row) => row.id === matchId);
  assert.equal(match?.sportId, "badminton");
  assert.equal(match?.rules, BADMINTON_CLUB_PRESET.rules);
});
