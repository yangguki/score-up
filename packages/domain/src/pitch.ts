import type { PitchRules, PitchSnapshot, PitchSportId, SportPreset } from "./types";
import { formatClock } from "./basketball";

export const SOCCER_CLUB_PRESET: SportPreset & { rules: PitchRules } = {
  id: "soccer-club",
  sportId: "soccer",
  scoringType: "timed_total",
  label: "축구",
  summary: "전후반+카드",
  official: false,
  rules: {
    periodCount: 2,
    periodMinutes: 20,
    overtimeEnabled: false,
    overtimeMinutes: 5,
    teamFoulPenaltyAt: 0,
  },
};

export const FUTSAL_CLUB_PRESET: SportPreset & { rules: PitchRules } = {
  id: "futsal-club",
  sportId: "futsal",
  scoringType: "timed_total",
  label: "풋살",
  summary: "전후반+누적파울",
  official: false,
  rules: {
    periodCount: 2,
    periodMinutes: 20,
    overtimeEnabled: false,
    overtimeMinutes: 5,
    teamFoulPenaltyAt: 6,
  },
};

export function emptyPitchSnapshot(rules: PitchRules): PitchSnapshot {
  return {
    period: 1,
    clockMs: rules.periodMinutes * 60 * 1000,
    clockRunning: false,
    started: false,
    homeScore: 0,
    awayScore: 0,
    periodScores: [],
    yellowHome: 0,
    yellowAway: 0,
    redHome: 0,
    redAway: 0,
    teamFoulsHome: 0,
    teamFoulsAway: 0,
    inOvertime: false,
    needsOvertimeDecision: false,
  };
}

export function pitchPeriodLabel(snapshot: PitchSnapshot, rules: PitchRules): string {
  if (snapshot.inOvertime) return "연장";
  return snapshot.period >= rules.periodCount ? "후반" : "전반";
}

export function pitchRulesSummary(rules: PitchRules, sportId: PitchSportId): string {
  const half = `${rules.periodMinutes}분 × ${rules.periodCount}`;
  const extra = rules.overtimeEnabled ? ` · 연장 ${rules.overtimeMinutes}분` : "";
  const fouls = rules.teamFoulPenaltyAt > 0 ? ` · 누적 파울 ${rules.teamFoulPenaltyAt}번째 PK 힌트` : " · 카드";
  return `${sportId === "futsal" ? "풋살" : "축구"} · ${half}${extra}${fouls}`;
}

export function isPitchRegulationOver(snapshot: PitchSnapshot, rules: PitchRules): boolean {
  return snapshot.inOvertime || snapshot.period >= rules.periodCount;
}

export { formatClock };
