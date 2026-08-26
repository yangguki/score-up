import type { Href } from "expo-router";
import type { Competition, Match, MatchStatus } from "@score-up/domain";
import {
  formatClock,
  isBasketballMatch,
  isRallySetMatch,
  isVolleyballMatch,
  quarterLabel,
  tableTennisSetLabel,
  volleyballSetLabel,
} from "@score-up/domain";
import { matchHref, statusLabel } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";

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

export function matchDisplayScore(match: Match): { home: number; away: number } {
  if (isVolleyballMatch(match)) {
    return { home: match.snapshot.homeSetPoints, away: match.snapshot.awaySetPoints };
  }
  if (isRallySetMatch(match)) {
    return { home: match.snapshot.homeSetPoints, away: match.snapshot.awaySetPoints };
  }
  if (isBasketballMatch(match)) {
    return { home: match.snapshot.homeScore, away: match.snapshot.awayScore };
  }
  return { home: 0, away: 0 };
}

export function matchClockLine(match: Match) {
  if (isVolleyballMatch(match)) {
    const snap = match.snapshot;
    return `${volleyballSetLabel(snap)} · 세트 ${snap.setsWonHome}-${snap.setsWonAway}`;
  }
  if (isRallySetMatch(match)) {
    const snap = match.snapshot;
    return `${tableTennisSetLabel(snap)} · 세트 ${snap.setsWonHome}-${snap.setsWonAway}`;
  }
  if (isBasketballMatch(match)) {
    return `${quarterLabel(match.snapshot.quarter, match.rules.periodCount)} ${formatClock(match.snapshot.clockMs)}`;
  }
  return match.roundLabel;
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
      subtitle: `${matchClockLine(live)} · ${statusLabel(live.status, live.sportId)}`,
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

export function buildHomeModel(competitions: Competition[], matches: Match[]) {
  const now = nowMatches(matches);
  return {
    now: now.slice(0, NOW_LIMIT),
    nowOverflow: now.length > NOW_LIMIT,
    competitions: myCompetitions(competitions).map((competition) => ({
      competition,
      leftover: leftoverCount(competition.id, matches),
    })),
    action: nextHomeAction(competitions, matches),
    empty: competitions.length === 0 && matches.length === 0,
  };
}
