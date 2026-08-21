import type { BasketballRules, BasketballSnapshot, SportPreset } from "./types";

export const BASKETBALL_CLUB_PRESET: SportPreset = {
  id: "basketball-club",
  sportId: "basketball",
  scoringType: "timed_total",
  label: "농구",
  summary: "시간+파울",
  official: false,
  rules: {
    periodCount: 4,
    periodMinutes: 8,
    overtimeMinutes: 3,
    overtimeEnabled: true,
    personalFoulLimit: 6,
    teamFoulBonusAt: 5,
    timeoutsPerGame: 2,
    timeoutSeconds: 60,
    starters: 5,
    forfeitScore: 20,
  },
};

export const BASKETBALL_PERIOD_COUNT_MIN = 2;
export const BASKETBALL_PERIOD_COUNT_MAX = 4;
export const BASKETBALL_PERIOD_MINUTES = [4, 6, 8, 10, 12] as const;
export const BASKETBALL_TIMEOUT_SECONDS = [30, 45, 60, 90] as const;

export const BASKETBALL_OFFICIAL_PRESET: SportPreset = {
  ...BASKETBALL_CLUB_PRESET,
  id: "basketball-official",
  official: true,
  rules: {
    ...BASKETBALL_CLUB_PRESET.rules,
    periodMinutes: 10,
    overtimeMinutes: 5,
    personalFoulLimit: 5,
  },
};

export function emptySnapshot(
  rules: BasketballRules,
  homeTeamId?: string,
  awayTeamId?: string,
): BasketballSnapshot {
  return {
    quarter: 1,
    clockMs: rules.periodMinutes * 60 * 1000,
    clockRunning: false,
    started: false,
    homeScore: 0,
    awayScore: 0,
    homeTeamFoulsInQuarter: 0,
    awayTeamFoulsInQuarter: 0,
    playerFouls: {},
    onCourtHome: [],
    onCourtAway: [],
    timeoutsLeft: {
      ...(homeTeamId ? { [homeTeamId]: rules.timeoutsPerGame } : { home: rules.timeoutsPerGame }),
      ...(awayTeamId ? { [awayTeamId]: rules.timeoutsPerGame } : { away: rules.timeoutsPerGame }),
    },
    timeoutClockMs: 0,
    timeoutRunning: false,
    inOvertime: false,
    periodScores: [],
    needsOvertimeDecision: false,
  };
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function quarterLabel(quarter: number, periodCount: number): string {
  if (quarter > periodCount) {
    return `OT${quarter - periodCount}`;
  }
  return `Q${quarter}`;
}

export function isRegulationOver(quarter: number, periodCount: number): boolean {
  return quarter >= periodCount;
}

export function bonusFor(
  snapshot: BasketballSnapshot,
  side: "home" | "away",
  rules: BasketballRules,
): boolean {
  const fouls =
    side === "home"
      ? snapshot.awayTeamFoulsInQuarter
      : snapshot.homeTeamFoulsInQuarter;
  return fouls >= rules.teamFoulBonusAt;
}

export function rulesSummary(rules: BasketballRules): string {
  const ot = rules.overtimeEnabled ? `연장 ${rules.overtimeMinutes}분` : "연장 없음";
  return `${rules.periodMinutes}분 × ${rules.periodCount}쿼터 · 작전타임 ${rules.timeoutSeconds}초 · 파울 ${rules.personalFoulLimit}아웃 · 보너스 ${rules.teamFoulBonusAt} · ${ot}`;
}

export function canEndPeriod(
  _sport: "basketball",
  snapshot: BasketballSnapshot,
  _rules: BasketballRules,
): boolean {
  return snapshot.clockMs <= 0;
}

export function canEndMatch(
  _sport: "basketball",
  snapshot: BasketballSnapshot,
  rules: BasketballRules,
): boolean {
  if (snapshot.clockMs > 0) return false;
  if (snapshot.quarter < rules.periodCount && !snapshot.inOvertime) return false;
  if (snapshot.inOvertime && snapshot.homeScore === snapshot.awayScore) return false;
  if (snapshot.quarter === rules.periodCount && snapshot.homeScore === snapshot.awayScore) {
    return false;
  }
  return snapshot.homeScore !== snapshot.awayScore;
}
