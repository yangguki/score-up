import type { BracketSlot, Competition, LeagueStandingRow, Match } from "@score-up/domain";
import { isBaseballMatch, isBasketballMatch, isPitchMatch, isRallySetMatch, isVolleyballMatch } from "@score-up/domain";
import { formatLabel, isLiveMatch, matchDisplayScore } from "@/lib/home";
import { statusLabel } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";

const ROUND_TITLE: Record<string, string> = {
  sf: "4강",
  final: "결승",
  champion: "우승",
};

export function matchPeriodLine(match: Match): string {
  if (isBasketballMatch(match)) {
    return match.snapshot.periodScores.map((row, i) => `Q${i + 1} ${row.home}-${row.away}`).join(" · ");
  }
  if (isVolleyballMatch(match) || isRallySetMatch(match)) {
    return [
      `세트 ${match.snapshot.setsWonHome}-${match.snapshot.setsWonAway}`,
      ...match.snapshot.setHistory.map((row, i) => `S${i + 1} ${row.home}-${row.away}`),
    ].join(" · ");
  }
  if (isPitchMatch(match)) {
    return match.snapshot.periodScores
      .map((row, i) => `${i === 0 ? "전반" : i === 1 ? "후반" : "연장"} ${row.home}-${row.away}`)
      .join(" · ");
  }
  if (isBaseballMatch(match)) {
    return match.snapshot.inningScores.map((row, i) => `${i + 1}회 ${row.home}-${row.away}`).join(" · ");
  }
  return "";
}

function hasPostedScore(match: Match) {
  return isLiveMatch(match) || match.status === "completed" || match.status === "forfeited";
}

function matchVersusLine(match: Match) {
  if (!hasPostedScore(match)) return `${match.homeLabel} vs ${match.awayLabel}`;
  const score = matchDisplayScore(match);
  return `${match.homeLabel} ${score.home}-${score.away} ${match.awayLabel}`;
}

export function matchResultShareText(match: Match, competitionName?: string): string {
  const lines = ["SCORE UP"];
  if (competitionName) lines.push(competitionName);
  else if (match.isFriendly) lines.push("친선");
  lines.push(`${sportLabel(match.sportId)} · ${match.roundLabel}`);
  const score = matchDisplayScore(match);
  lines.push(`${match.homeLabel}  ${score.home}  -  ${score.away}  ${match.awayLabel}`);
  const periods = matchPeriodLine(match);
  if (periods) lines.push(periods);
  lines.push(statusLabel(match.status, match.sportId));
  if (match.winnerLabel) lines.push(`승: ${match.winnerLabel}`);
  return lines.join("\n");
}

function slotShareLine(
  slot: BracketSlot,
  match: Match | undefined,
  nameOf: (teamId?: string) => string,
): string {
  if (slot.bye) return `${nameOf(slot.homeTeamId)} · BYE`;
  if (match) {
    const winner = match.winnerLabel ? ` · 승 ${match.winnerLabel}` : "";
    return `${matchVersusLine(match)} · ${statusLabel(match.status, match.sportId)}${winner}`;
  }
  const home = nameOf(slot.homeTeamId);
  const away = nameOf(slot.awayTeamId);
  const homeLabel = home && home !== "—" ? home : "";
  const awayLabel = away && away !== "—" ? away : "";
  if (!homeLabel && !awayLabel) return "미정";
  return `${homeLabel || "대기"} vs ${awayLabel || "대기"}`;
}

export function tournamentShareText(
  competition: Competition,
  slots: BracketSlot[],
  matches: Match[],
  nameOf: (teamId?: string) => string,
): string {
  const lines = ["SCORE UP", `${competition.name} · ${formatLabel(competition.format)}`];
  for (const round of ["sf", "final", "champion"] as const) {
    const rows = slots.filter((slot) => slot.round === round);
    if (rows.length === 0) continue;
    lines.push("");
    lines.push(ROUND_TITLE[round] ?? round);
    for (const slot of rows) {
      const match = matches.find((row) => row.id === slot.matchId);
      lines.push(slotShareLine(slot, match, nameOf));
    }
  }
  return lines.join("\n");
}

export function leagueShareText(
  competition: Competition,
  standings: LeagueStandingRow[],
  matches: Match[],
): string {
  const lines = [
    "SCORE UP",
    `${competition.name} · ${formatLabel(competition.format)}`,
    "승점 승 3 · 패 0",
    "",
  ];
  for (const row of standings) {
    const diff = row.pointDiff > 0 ? `+${row.pointDiff}` : String(row.pointDiff);
    lines.push(`${row.rank} ${row.teamName}  승${row.wins} 패${row.losses} 득실${diff} 점${row.points}`);
  }
  const rounds = [...new Set(matches.map((match) => match.roundLabel))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );
  for (const roundLabel of rounds) {
    lines.push("");
    lines.push(roundLabel);
    for (const match of matches.filter((row) => row.roundLabel === roundLabel)) {
      const winner = match.winnerLabel ? ` · 승 ${match.winnerLabel}` : "";
      lines.push(`${matchVersusLine(match)} · ${statusLabel(match.status, match.sportId)}${winner}`);
    }
  }
  return lines.join("\n");
}
