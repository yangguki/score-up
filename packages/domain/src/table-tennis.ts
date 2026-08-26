import type { Side, SportPreset, TableTennisRules, TableTennisSnapshot } from "./types";

export const TABLE_TENNIS_CLUB_PRESET: SportPreset & { rules: TableTennisRules } = {
  id: "table-tennis-club",
  sportId: "table-tennis",
  scoringType: "set_target",
  label: "탁구",
  summary: "개인 세트제",
  official: false,
  rules: {
    setsToWin: 3,
    setTarget: 11,
    winBy: 2,
    serveLimit: 2,
    deuceServeLimit: 1,
    changeEndsAt: 5,
    serveMode: "count",
    doubles: false,
  },
};

export function isLastTableTennisSet(snapshot: TableTennisSnapshot, rules: TableTennisRules): boolean {
  return snapshot.setsWonHome === rules.setsToWin - 1 && snapshot.setsWonAway === rules.setsToWin - 1;
}

export function emptyTableTennisSnapshot(openingServe: Side = "home"): TableTennisSnapshot {
  return {
    currentSet: 1,
    homeSetPoints: 0,
    awaySetPoints: 0,
    setsWonHome: 0,
    setsWonAway: 0,
    setHistory: [],
    serveSide: openingServe,
    setOpeningServe: openingServe,
    serveCount: 1,
    started: false,
    deuce: false,
    endChangeHint: false,
    endChangeAtFiveDone: false,
  };
}

export function tableTennisDeuce(snapshot: TableTennisSnapshot, rules: TableTennisRules): boolean {
  return snapshot.homeSetPoints >= rules.setTarget - 1 && snapshot.awaySetPoints >= rules.setTarget - 1;
}

export function tableTennisServeLimit(snapshot: TableTennisSnapshot, rules: TableTennisRules): number {
  return tableTennisDeuce(snapshot, rules) ? rules.deuceServeLimit : rules.serveLimit;
}

export function tableTennisSetPointSide(
  snapshot: TableTennisSnapshot,
  rules: TableTennisRules,
): Side | null {
  const target = rules.setTarget;
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

export function canEndTableTennisSet(snapshot: TableTennisSnapshot, rules: TableTennisRules): boolean {
  const target = rules.setTarget;
  const home =
    snapshot.homeSetPoints >= target && snapshot.homeSetPoints - snapshot.awaySetPoints >= rules.winBy;
  const away =
    snapshot.awaySetPoints >= target && snapshot.awaySetPoints - snapshot.homeSetPoints >= rules.winBy;
  return home || away;
}

export function canEndTableTennisMatch(snapshot: TableTennisSnapshot, rules: TableTennisRules): boolean {
  return snapshot.setsWonHome >= rules.setsToWin || snapshot.setsWonAway >= rules.setsToWin;
}

export function tableTennisSetLabel(snapshot: TableTennisSnapshot): string {
  return `SET ${snapshot.currentSet}`;
}

export function tableTennisRulesSummary(rules: TableTennisRules): string {
  const bestOf = rules.setsToWin * 2 - 1;
  const serve = rules.serveMode === "scorer" ? "득점자 서브" : `서브 ${rules.serveLimit}점`;
  const doubles = rules.doubles ? " · 복식" : "";
  return `${bestOf}판 ${rules.setsToWin}선 · ${rules.setTarget}점 · ${rules.winBy}점 차 · ${serve}${doubles}`;
}

export function advanceTableTennisServe(snapshot: TableTennisSnapshot, rules: TableTennisRules): void {
  if (rules.serveMode === "scorer") return;
  const limit = tableTennisServeLimit(snapshot, rules);
  if (snapshot.serveCount >= limit) {
    snapshot.serveSide = snapshot.serveSide === "home" ? "away" : "home";
    snapshot.serveCount = 1;
  } else {
    snapshot.serveCount += 1;
  }
}
