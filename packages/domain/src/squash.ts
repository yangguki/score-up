import type { SportPreset, TableTennisRules } from "./types";

export const SQUASH_CLUB_PRESET: SportPreset & { rules: TableTennisRules } = {
  id: "squash-club",
  sportId: "squash",
  scoringType: "set_target",
  label: "스쿼시",
  summary: "랠리 세트제",
  official: false,
  rules: {
    setsToWin: 3,
    setTarget: 11,
    winBy: 2,
    serveLimit: 1,
    deuceServeLimit: 1,
    changeEndsAt: 0,
    serveMode: "scorer",
    doubles: false,
  },
};
