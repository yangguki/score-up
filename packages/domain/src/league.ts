import type { MatchStatus } from "./types";

export const LEAGUE_WIN_POINTS = 3;
export const LEAGUE_LOSS_POINTS = 0;

export type LeagueStandingRow = {
  rank: number;
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  points: number;
};

type StandingMatch = {
  status: MatchStatus;
  homeTeamId?: string;
  awayTeamId?: string;
  winnerTeamId?: string;
  homeScore: number;
  awayScore: number;
};

const COUNTED: MatchStatus[] = ["completed", "forfeited"];

/**
 * 리그 순위. MVP 승점 = 승 3 / 패 0.
 * 정렬: 승점 → 득실 → 득점 → 팀명.
 */
export function computeLeagueStandings(
  teams: { id: string; name: string }[],
  matches: StandingMatch[],
): LeagueStandingRow[] {
  const rows = new Map<string, Omit<LeagueStandingRow, "rank">>();
  for (const team of teams) {
    rows.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (!COUNTED.includes(match.status)) continue;
    if (!match.homeTeamId || !match.awayTeamId) continue;
    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.pointsFor += match.homeScore;
    home.pointsAgainst += match.awayScore;
    away.pointsFor += match.awayScore;
    away.pointsAgainst += match.homeScore;

    const homeWins =
      match.winnerTeamId === match.homeTeamId ||
      (!match.winnerTeamId && match.homeScore > match.awayScore);
    const awayWins =
      match.winnerTeamId === match.awayTeamId ||
      (!match.winnerTeamId && match.awayScore > match.homeScore);

    if (homeWins) {
      home.wins += 1;
      home.points += LEAGUE_WIN_POINTS;
      away.losses += 1;
      away.points += LEAGUE_LOSS_POINTS;
    } else if (awayWins) {
      away.wins += 1;
      away.points += LEAGUE_WIN_POINTS;
      home.losses += 1;
      home.points += LEAGUE_LOSS_POINTS;
    }
  }

  const sorted = [...rows.values()]
    .map((row) => ({
      ...row,
      pointDiff: row.pointsFor - row.pointsAgainst,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
      if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
      return a.teamName.localeCompare(b.teamName, "ko");
    });

  return sorted.map((row, i) => ({ ...row, rank: i + 1 }));
}
