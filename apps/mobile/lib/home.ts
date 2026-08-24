import type { Href } from "expo-router";
import type { Competition, Match, MatchStatus } from "@score-up/domain";
import { formatClock, quarterLabel } from "@score-up/domain";
import { matchHref, statusLabel } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";

export type HomeVersion = "v1" | "v2" | "v3" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "h7";

export const HOME_VERSIONS: {
  id: HomeVersion;
  label: string;
  name: string;
  blurb: string;
  group: "kit" | "hub" | "trend";
}[] = [
  { id: "v1", label: "V1", name: "기획 원안", blurb: "shadcn · sticky CTA", group: "kit" },
  { id: "v2", label: "V2", name: "지금 할 일", blurb: "daisyUI · 히어로", group: "kit" },
  { id: "v3", label: "V3", name: "라이브 핀", blurb: "Eva Dark", group: "kit" },
  { id: "h1", label: "H1", name: "브랜드 허브", blurb: "Arena 확정 · 비교 기준", group: "hub" },
  { id: "h2", label: "H2", name: "라이브 우선", blurb: "오늘 코트 · 핀 먼저", group: "hub" },
  { id: "h3", label: "H3", name: "종목 모자이크", blurb: "종목이 히어로", group: "hub" },
  { id: "h4", label: "H4", name: "이중 진입", blurb: "대회 vs 친선 두 문", group: "hub" },
  { id: "h5", label: "H5", name: "벤토 2026", blurb: "Arena 색 유지 · 모듈만", group: "trend" },
  { id: "h6", label: "H6", name: "라이트 데스크", blurb: "Strava식 · H1과 완전 다른 톤", group: "trend" },
  { id: "h7", label: "H7", name: "브리즈 아레나", blurb: "H1 동일 UX · 상쾌한 민트/스카이", group: "trend" },
];

const LIVE: MatchStatus[] = [
  "in_progress",
  "paused",
  "period_break",
  "confirm_period_end",
  "confirm_match_end",
];

const DONE: MatchStatus[] = ["completed", "forfeited", "abandoned"];

export function isLiveMatch(match: Match) {
  return LIVE.includes(match.status);
}

export function isOpenMatch(match: Match) {
  return !DONE.includes(match.status);
}

export function isTodayMatch(match: Match) {
  return match.scheduledLabel.includes("오늘") && isOpenMatch(match);
}

export function nowMatches(matches: Match[]) {
  const live = matches.filter(isLiveMatch);
  const today = matches.filter((match) => isTodayMatch(match) && !isLiveMatch(match));
  return [...live, ...today];
}

export function leftoverCount(competitionId: string, matches: Match[]) {
  return matches.filter((match) => match.competitionId === competitionId && isOpenMatch(match)).length;
}

export function myCompetitions(competitions: Competition[]) {
  return competitions.filter((comp) => comp.status !== "completed").slice(0, 5);
}

export function matchClockLine(match: Match) {
  return `${quarterLabel(match.snapshot.quarter, match.rules.periodCount)} ${formatClock(match.snapshot.clockMs)}`;
}

export function matchSportLine(match: Match) {
  return `${sportLabel(match.sportId)} · ${match.roundLabel}`;
}

export function formatLabel(format: Competition["format"]) {
  return format === "tournament" ? "토너먼트" : "리그";
}

export function competitionStatusLabel(status: Competition["status"]) {
  if (status === "prep") return "준비";
  if (status === "completed") return "종료";
  return "진행";
}

export function leftoverLine(count: number) {
  return count === 0 ? "다음 미진행 없음" : `다음 미진행 ${count}경기`;
}

export type HomeAction = {
  title: string;
  subtitle: string;
  href: Href;
  cta: string;
};

export function nextHomeAction(competitions: Competition[], matches: Match[]): HomeAction {
  const now = nowMatches(matches);
  const live = now.find(isLiveMatch);
  if (live) {
    return {
      title: `${live.homeLabel} vs ${live.awayLabel}`,
      subtitle: `${matchClockLine(live)} · ${statusLabel(live.status)}`,
      href: matchHref(live),
      cta: "이어하기",
    };
  }
  const upcoming = now[0];
  if (upcoming) {
    return {
      title: `${upcoming.homeLabel} vs ${upcoming.awayLabel}`,
      subtitle: `${upcoming.scheduledLabel} · ${upcoming.roundLabel}`,
      href: matchHref(upcoming),
      cta: upcoming.status === "lineup" ? "출전 확인" : "경기 열기",
    };
  }
  const prep = competitions.find((comp) => comp.status === "prep");
  if (prep) {
    return {
      title: prep.name,
      subtitle: leftoverCount(prep.id, matches) === 0 ? "참가 팀을 등록하세요" : leftoverLine(leftoverCount(prep.id, matches)),
      href: `/competition/${prep.id}`,
      cta: "대회 열기",
    };
  }
  const active = myCompetitions(competitions)[0];
  if (active) {
    return {
      title: active.name,
      subtitle: leftoverLine(leftoverCount(active.id, matches)),
      href: `/competition/${active.id}`,
      cta: "대진 보기",
    };
  }
  return {
    title: "첫 대회 만들기",
    subtitle: "선수, 대진, 스코어가 하나로 이어집니다.",
    href: "/competition/new",
    cta: "대회 만들기",
  };
}

export const EMPTY_HOME_COPY = "첫 대회를 만들면 선수, 대진, 스코어가 하나로 이어집니다.";

const NOW_LIMIT = 5;

export function buildHomeModel(competitions: Competition[], matches: Match[], emptyPreview: boolean) {
  const comps = emptyPreview ? [] : competitions;
  const list = emptyPreview ? [] : matches;
  const now = nowMatches(list);
  return {
    now: now.slice(0, NOW_LIMIT),
    nowOverflow: now.length > NOW_LIMIT,
    competitions: myCompetitions(comps).map((competition) => ({
      competition,
      leftover: leftoverCount(competition.id, list),
    })),
    action: nextHomeAction(comps, list),
    empty: comps.length === 0 && list.length === 0,
  };
}
