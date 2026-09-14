import type { SportPreset, TableTennisRules } from "./types";

export const BADMINTON_SET_TARGET_MIN = 11;
export const BADMINTON_SET_TARGET_MAX = 30;
export const BADMINTON_SET_TARGET_PRESETS: readonly number[] = [21, 25] as const;
export const BADMINTON_SETS_TO_WIN_MIN = 1;
export const BADMINTON_SETS_TO_WIN_MAX = 5;
export const BADMINTON_SETS_TO_WIN_PRESETS: readonly number[] = [1, 2, 3] as const;

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

export const BADMINTON_COMPETITION_PRESET: SportPreset & { rules: TableTennisRules } = {
  id: "badminton-competition",
  sportId: "badminton",
  scoringType: "set_target",
  label: "배드민턴 대회",
  summary: "1판 21점",
  official: false,
  rules: {
    setsToWin: 1,
    setTarget: 21,
    winBy: 2,
    serveLimit: 1,
    deuceServeLimit: 1,
    changeEndsAt: 11,
    serveMode: "scorer",
    doubles: false,
  },
};

export function badmintonSetsLabel(setsToWin: number): string {
  if (setsToWin === 1) return "1판";
  const bestOf = setsToWin * 2 - 1;
  return `${bestOf}판 ${setsToWin}선`;
}
