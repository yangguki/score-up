import type { SportPreset, TableTennisRules } from "./types";

export const BADMINTON_CLUB_PRESET: SportPreset & { rules: TableTennisRules } = {
  id: "badminton-club",
  sportId: "badminton",
  scoringType: "set_target",
  label: "배드민턴",
  summary: "랠리 세트제",
  official: false,
  rules: {
    setsToWin: 2,
    setTarget: 21,
    winBy: 2,
    serveLimit: 1,
    deuceServeLimit: 1,
    changeEndsAt: 11,
    serveMode: "scorer",
    doubles: false,
  },
};
