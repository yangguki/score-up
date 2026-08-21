import {
  BASKETBALL_CLUB_PRESET,
  type AppData,
  type Match,
  type MatchEvent,
  type Player,
} from "@score-up/domain";
import { emptySnapshot } from "@score-up/domain";

const RULES = BASKETBALL_CLUB_PRESET.rules;

const TIGER = "team-tiger";
const EAGLE = "team-eagle";
const SHARK = "team-shark";
const WOLF = "team-wolf";
const COMP = "comp-weekend";
const SF1 = "match-sf1";
const SF2 = "match-sf2";
const FINAL = "match-final";

function p(id: string, teamId: string, number: number, name: string): Player {
  return { id, teamId, number, name };
}

function ev(
  id: string,
  type: MatchEvent["type"],
  quarter: number,
  clockMs: number,
  extra: Partial<MatchEvent> = {},
): MatchEvent {
  return {
    id,
    matchId: SF1,
    type,
    quarter,
    clockMs,
    createdAt: Date.now() - 600_000,
    revoked: false,
    ...extra,
  };
}

function seededSf1(): Match {
  const snapshot = emptySnapshot(RULES, TIGER, EAGLE);
  snapshot.quarter = 2;
  snapshot.clockMs = (5 * 60 + 32) * 1000;
  snapshot.clockRunning = false;
  snapshot.started = true;
  snapshot.homeScore = 24;
  snapshot.awayScore = 18;
  snapshot.homeTeamFoulsInQuarter = 3;
  snapshot.awayTeamFoulsInQuarter = 4;
  snapshot.periodScores = [{ home: 18, away: 16 }];
  snapshot.onCourtHome = ["p-t12", "p-t5", "p-t7", "p-t8", "p-t11"];
  snapshot.onCourtAway = ["p-e4", "p-e9", "p-e15", "p-e2", "p-e6"];
  snapshot.playerFouls = {
    "p-t12": 2,
    "p-t5": 5,
    "p-t7": 1,
    "p-e4": 3,
    "p-e9": 2,
  };
  snapshot.timeoutsLeft = { [TIGER]: 1, [EAGLE]: 2 };

  const events: MatchEvent[] = [
    ev("ev-1", "timeout", 2, (6 * 60 + 10) * 1000, {
      teamId: TIGER,
    }),
    ev("ev-2", "foul", 2, (5 * 60 + 48) * 1000, {
      teamId: EAGLE,
      playerId: "p-e4",
      payload: { personalFouls: 3, teamFouls: 4 },
    }),
    ev("ev-3", "point", 2, (5 * 60 + 32) * 1000, {
      teamId: TIGER,
      playerId: "p-t12",
      payload: { points: 2 },
    }),
  ];

  return {
    id: SF1,
    sportId: "basketball",
    competitionId: COMP,
    homeTeamId: TIGER,
    awayTeamId: EAGLE,
    homeLabel: "호랑이",
    awayLabel: "독수리",
    homeColor: "#B91C1C",
    awayColor: "#1D4ED8",
    roundLabel: "4강",
    scheduledLabel: "오늘 14:00",
    status: "in_progress",
    snapshot,
    events,
    isFriendly: false,
    rules: RULES,
  };
}

export function createSeedState(): AppData {
  return {
    competitions: [
      {
        id: COMP,
        name: "주말 농구 토너먼트",
        sportId: "basketball",
        status: "in_progress",
        format: "tournament",
        dateLabel: "2026-08-22",
        rules: RULES,
        officialPreset: false,
      },
    ],
    teams: [
      { id: TIGER, competitionId: COMP, name: "호랑이", color: "#B91C1C" },
      { id: EAGLE, competitionId: COMP, name: "독수리", color: "#1D4ED8" },
      { id: SHARK, competitionId: COMP, name: "상어", color: "#0F766E" },
      { id: WOLF, competitionId: COMP, name: "늑대", color: "#111827" },
    ],
    players: [
      p("p-t12", TIGER, 12, "김민수"),
      p("p-t5", TIGER, 5, "박지훈"),
      p("p-t7", TIGER, 7, "이서연"),
      p("p-t21", TIGER, 21, "한지호"),
      p("p-t8", TIGER, 8, "정우성"),
      p("p-t11", TIGER, 11, "오세훈"),
      p("p-t3", TIGER, 3, "윤다혜"),
      p("p-e4", EAGLE, 4, "최유진"),
      p("p-e9", EAGLE, 9, "강태민"),
      p("p-e15", EAGLE, 15, "문하늘"),
      p("p-e2", EAGLE, 2, "서지호"),
      p("p-e6", EAGLE, 6, "배도윤"),
      p("p-e22", EAGLE, 22, "임하린"),
      p("p-e10", EAGLE, 10, "조은우"),
      p("p-s1", SHARK, 1, "신재혁"),
      p("p-s8", SHARK, 8, "노지민"),
      p("p-s13", SHARK, 13, "하준서"),
      p("p-s4", SHARK, 4, "권소율"),
      p("p-s11", SHARK, 11, "표시우"),
      p("p-s7", SHARK, 7, "안예준"),
      p("p-w5", WOLF, 5, "유태양"),
      p("p-w9", WOLF, 9, "백서아"),
      p("p-w14", WOLF, 14, "홍지성"),
      p("p-w3", WOLF, 3, "남도하"),
      p("p-w21", WOLF, 21, "채민재"),
      p("p-w8", WOLF, 8, "설아린"),
    ],
    matches: [
      seededSf1(),
      {
        id: SF2,
        sportId: "basketball",
        competitionId: COMP,
        homeTeamId: SHARK,
        awayTeamId: WOLF,
        homeLabel: "상어",
        awayLabel: "늑대",
        homeColor: "#0F766E",
        awayColor: "#111827",
        roundLabel: "4강",
        scheduledLabel: "오늘 15:30",
        status: "scheduled",
        snapshot: emptySnapshot(RULES, SHARK, WOLF),
        events: [],
        isFriendly: false,
        rules: RULES,
      },
      {
        id: FINAL,
        sportId: "basketball",
        competitionId: COMP,
        homeLabel: "승자",
        awayLabel: "승자",
        homeColor: "#1D4ED8",
        awayColor: "#B91C1C",
        roundLabel: "결승",
        scheduledLabel: "오늘 17:00",
        status: "scheduled",
        snapshot: emptySnapshot(RULES),
        events: [],
        isFriendly: false,
        rules: RULES,
      },
    ],
    brackets: [
      {
        id: "br-sf1",
        competitionId: COMP,
        round: "sf",
        label: "4강",
        homeTeamId: TIGER,
        awayTeamId: EAGLE,
        matchId: SF1,
      },
      {
        id: "br-sf2",
        competitionId: COMP,
        round: "sf",
        label: "4강",
        homeTeamId: SHARK,
        awayTeamId: WOLF,
        matchId: SF2,
      },
      {
        id: "br-final",
        competitionId: COMP,
        round: "final",
        label: "결승",
        matchId: FINAL,
      },
      { id: "br-champ", competitionId: COMP, round: "champion", label: "우승" },
    ],
  };
}

export const SEED_IDS = { COMP, SF1, SF2, FINAL, TIGER, EAGLE, SHARK, WOLF };
