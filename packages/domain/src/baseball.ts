import type { BaseballRules, BaseballSnapshot, SportPreset } from "./types";

export const BASEBALL_CLUB_PRESET: SportPreset & { rules: BaseballRules } = {
  id: "baseball-club",
  sportId: "baseball",
  scoringType: "inning_chance",
  label: "야구",
  summary: "이닝제",
  official: false,
  rules: {
    inningCount: 7,
    extraInningEnabled: true,
  },
};

export function emptyBaseballSnapshot(): BaseballSnapshot {
  return {
    inning: 1,
    half: "top",
    outs: 0,
    started: false,
    homeScore: 0,
    awayScore: 0,
    inningScores: [],
  };
}

export function baseballHalfLabel(snapshot: BaseballSnapshot): string {
  return `${snapshot.inning}회 ${snapshot.half === "top" ? "초" : "말"}`;
}

export function baseballRulesSummary(rules: BaseballRules): string {
  return `${rules.inningCount}이닝${rules.extraInningEnabled ? " · 연장 가능" : ""}`;
}

export function isLastBaseballInning(snapshot: BaseballSnapshot, rules: BaseballRules): boolean {
  return snapshot.inning >= rules.inningCount;
}
