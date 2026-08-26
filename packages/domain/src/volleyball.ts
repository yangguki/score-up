import type { Side, SportPreset, VolleyballRules, VolleyballSnapshot } from "./types";

export const VOLLEYBALL_CLUB_PRESET: SportPreset & { rules: VolleyballRules } = {
  id: "volleyball-club",
  sportId: "volleyball",
  scoringType: "set_target",
  label: "배구",
  summary: "세트+서브",
  official: false,
  rules: {
    setsToWin: 3,
    setTarget: 25,
    lastSetTarget: 15,
    winBy: 2,
    timeoutsPerSet: 2,
  },
};

export function isLastVolleyballSet(snapshot: VolleyballSnapshot, rules: VolleyballRules): boolean {
  return snapshot.setsWonHome === rules.setsToWin - 1 && snapshot.setsWonAway === rules.setsToWin - 1;
}

export function volleyballTarget(snapshot: VolleyballSnapshot, rules: VolleyballRules): number {
  return isLastVolleyballSet(snapshot, rules) ? rules.lastSetTarget : rules.setTarget;
}

export function emptyVolleyballSnapshot(
  rules: VolleyballRules,
  homeTeamId?: string,
  awayTeamId?: string,
  openingServe: Side = "home",
): VolleyballSnapshot {
  return {
    currentSet: 1,
    homeSetPoints: 0,
    awaySetPoints: 0,
    setsWonHome: 0,
    setsWonAway: 0,
    setHistory: [],
    serveSide: openingServe,
    setOpeningServe: openingServe,
    timeoutsLeft: {
      ...(homeTeamId ? { [homeTeamId]: rules.timeoutsPerSet } : { home: rules.timeoutsPerSet }),
      ...(awayTeamId ? { [awayTeamId]: rules.timeoutsPerSet } : { away: rules.timeoutsPerSet }),
    },
    started: false,
    deuce: false,
  };
}

export function volleyballDeuce(snapshot: VolleyballSnapshot, rules: VolleyballRules): boolean {
  const target = volleyballTarget(snapshot, rules);
  return snapshot.homeSetPoints >= target - 1 && snapshot.awaySetPoints >= target - 1;
}

export function volleyballSetPointSide(
  snapshot: VolleyballSnapshot,
  rules: VolleyballRules,
): Side | null {
  const target = volleyballTarget(snapshot, rules);
  const homeOk =
    snapshot.homeSetPoints >= target - 1 &&
    snapshot.homeSetPoints - snapshot.awaySetPoints >= rules.winBy - 1 &&
    snapshot.homeSetPoints > snapshot.awaySetPoints;
  const awayOk =
    snapshot.awaySetPoints >= target - 1 &&
    snapshot.awaySetPoints - snapshot.homeSetPoints >= rules.winBy - 1 &&
    snapshot.awaySetPoints > snapshot.homeSetPoints;
  if (homeOk) return "home";
  if (awayOk) return "away";
  return null;
}

export function canEndVolleyballSet(snapshot: VolleyballSnapshot, rules: VolleyballRules): boolean {
  const target = volleyballTarget(snapshot, rules);
  const home =
    snapshot.homeSetPoints >= target &&
    snapshot.homeSetPoints - snapshot.awaySetPoints >= rules.winBy;
  const away =
    snapshot.awaySetPoints >= target &&
    snapshot.awaySetPoints - snapshot.homeSetPoints >= rules.winBy;
  return home || away;
}

export function canEndVolleyballMatch(snapshot: VolleyballSnapshot, rules: VolleyballRules): boolean {
  return snapshot.setsWonHome >= rules.setsToWin || snapshot.setsWonAway >= rules.setsToWin;
}

export function volleyballSetLabel(snapshot: VolleyballSnapshot): string {
  return `SET ${snapshot.currentSet}`;
}

export function volleyballRulesSummary(rules: VolleyballRules): string {
  const bestOf = rules.setsToWin * 2 - 1;
  return `${bestOf}판 ${rules.setsToWin}선 · ${rules.setTarget}점(최종 ${rules.lastSetTarget}) · ${rules.winBy}점 차`;
}
