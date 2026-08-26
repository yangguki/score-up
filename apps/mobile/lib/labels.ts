import type { Match, MatchEvent, MatchStatus, Player, SportId } from "@score-up/domain";
import { isPitchSport, isSetSport } from "@score-up/domain";
import type { Href } from "expo-router";
import { scoreboardHref } from "@/lib/match-routes";

function periodNoun(sportId?: SportId): string {
  if (!sportId) return "쿼터";
  if (isSetSport(sportId)) return "세트";
  if (isPitchSport(sportId)) return "전후반";
  if (sportId === "baseball") return "이닝";
  return "쿼터";
}

export function statusLabel(status: MatchStatus, sportId?: SportId): string {
  switch (status) {
    case "scheduled":
      return "대기";
    case "lineup":
      return "출전 확인";
    case "in_progress":
      return "진행";
    case "paused":
      return "일시정지";
    case "period_break":
      return `${periodNoun(sportId)} 사이`;
    case "confirm_period_end":
      return `${periodNoun(sportId)} 종료 확인`;
    case "confirm_match_end":
      return "경기 종료 확인";
    case "completed":
      return "종료";
    case "forfeited":
      return "몰수";
    case "abandoned":
      return "중단";
    default:
      return status;
  }
}

export function matchHref(match: Match): Href {
  if (match.status === "completed" || match.status === "forfeited" || match.status === "abandoned") {
    return `/match/${match.id}/result` as Href;
  }
  if (match.sportId !== "basketball") {
    return scoreboardHref(match);
  }
  if (match.status === "scheduled" || match.status === "lineup") {
    return `/match/${match.id}/lineup` as Href;
  }
  return scoreboardHref(match);
}

export function eventLine(
  event: MatchEvent,
  players: Player[],
  match: { homeTeamId?: string; awayTeamId?: string; homeLabel: string; awayLabel: string; sportId?: SportId },
): string {
  const player = players.find((p) => p.id === event.playerId);
  const who = player
    ? `${player.number}번 ${player.name}`
    : event.teamId
      ? teamName(event.teamId, match)
      : "";
  if (event.revoked) return `(취소됨)`;
  switch (event.type) {
    case "point":
      return `${who} +${event.payload?.points ?? 0}`;
    case "foul":
      return match.sportId === "baseball"
        ? `${who} 아웃 (${event.payload?.teamFouls ?? "-"})`
        : `${who} 파울 (${event.payload?.personalFouls ?? event.payload?.teamFouls ?? "-"})`;
    case "sanction":
      return `${who} ${event.payload?.reason === "red" ? "레드" : "경고"}`;
    case "timeout":
      return `${who} 타임아웃`;
    case "substitution":
      return "교체";
    case "period_end":
      return `${periodNoun(match.sportId)} ${event.payload?.quarter ?? event.quarter} 종료`;
    case "serve_change":
      return `${who} 서브 변경`;
    case "match_end":
      return event.payload?.reason === "forfeit" ? "몰수 종료" : "경기 종료";
    case "revoke":
      return "실행 취소";
    default:
      return event.type;
  }
}

function teamName(
  teamId: string,
  match: { homeTeamId?: string; awayTeamId?: string; homeLabel: string; awayLabel: string },
) {
  if (teamId === "home" || teamId === match.homeTeamId) return match.homeLabel;
  if (teamId === "away" || teamId === match.awayTeamId) return match.awayLabel;
  return match.homeLabel;
}
