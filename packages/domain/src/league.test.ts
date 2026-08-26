import assert from "node:assert/strict";
import test from "node:test";
import { LEAGUE_WIN_POINTS, computeLeagueStandings } from "../src/league";

const TEAMS = [
  { id: "a", name: "호랑이" },
  { id: "b", name: "독수리" },
  { id: "c", name: "상어" },
];

test("computeLeagueStandings: 승3/패0 · 득실 정렬", () => {
  const rows = computeLeagueStandings(TEAMS, [
    {
      status: "completed",
      homeTeamId: "a",
      awayTeamId: "b",
      winnerTeamId: "a",
      homeScore: 40,
      awayScore: 30,
    },
    {
      status: "completed",
      homeTeamId: "b",
      awayTeamId: "c",
      winnerTeamId: "b",
      homeScore: 22,
      awayScore: 20,
    },
    {
      status: "scheduled",
      homeTeamId: "a",
      awayTeamId: "c",
      homeScore: 0,
      awayScore: 0,
    },
  ]);
  assert.equal(rows[0].teamId, "a");
  assert.equal(rows[0].points, LEAGUE_WIN_POINTS);
  assert.equal(rows[0].pointDiff, 10);
  assert.equal(rows[1].teamId, "b");
  assert.equal(rows[1].points, LEAGUE_WIN_POINTS);
  assert.equal(rows[1].pointDiff, -8);
  assert.equal(rows[2].teamId, "c");
  assert.equal(rows[2].wins, 0);
  assert.equal(rows[2].played, 1);
});

test("computeLeagueStandings: 진행 중 경기는 집계 제외", () => {
  const rows = computeLeagueStandings(TEAMS, [
    {
      status: "in_progress",
      homeTeamId: "a",
      awayTeamId: "b",
      homeScore: 10,
      awayScore: 8,
    },
  ]);
  assert.equal(rows.every((r) => r.played === 0), true);
});
