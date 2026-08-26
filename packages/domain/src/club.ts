import type {
  Account,
  ClubMember,
  ClubSession,
  Match,
  SessionAssignment,
  SessionStatus,
  VoteValue,
} from "./types";

export function voteLabel(value: VoteValue): string {
  if (value === "going") return "참석";
  if (value === "not_going") return "불참";
  if (value === "maybe") return "미정";
  return "없음";
}

export function sessionStatusLabel(status: SessionStatus): string {
  switch (status) {
    case "draft":
      return "초안";
    case "voting":
      return "투표 중";
    case "confirming":
      return "인원 확정";
    case "matched":
      return "팀 확정";
    case "in_play":
      return "경기 중";
    case "completed":
      return "종료";
    case "cancelled":
      return "취소";
  }
}

export type ClubRankingRow = {
  rank: number;
  accountId: string;
  name: string;
  wins: number;
  losses: number;
  played: number;
  winRate: number | null;
};

export function computeClubRanking(
  members: { accountId: string; name: string }[],
  matches: Match[],
  assignments: SessionAssignment[],
): ClubRankingRow[] {
  const rows = new Map<string, { wins: number; losses: number }>();
  for (const member of members) {
    rows.set(member.accountId, { wins: 0, losses: 0 });
  }

  const counted = matches.filter(
    (match) =>
      match.sessionId &&
      (match.status === "completed" || match.status === "forfeited") &&
      match.winnerTeamId &&
      match.homeTeamId &&
      match.awayTeamId,
  );

  for (const match of counted) {
    const sessionRows = assignments.filter((row) => row.sessionId === match.sessionId && row.accountId);
    const homeWon = match.winnerTeamId === match.homeTeamId;
    for (const row of sessionRows) {
      if (!row.accountId || (row.side !== "home" && row.side !== "away")) continue;
      const stat = rows.get(row.accountId);
      if (!stat) continue;
      const won = row.side === "home" ? homeWon : !homeWon;
      if (won) stat.wins += 1;
      else stat.losses += 1;
    }
  }

  return members
    .map((member) => {
      const stat = rows.get(member.accountId) ?? { wins: 0, losses: 0 };
      const played = stat.wins + stat.losses;
      return {
        accountId: member.accountId,
        name: member.name,
        wins: stat.wins,
        losses: stat.losses,
        played,
        winRate: played === 0 ? null : stat.wins / played,
        rank: 0,
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const ar = a.winRate ?? -1;
      const br = b.winRate ?? -1;
      if (br !== ar) return br - ar;
      if (b.played !== a.played) return b.played - a.played;
      return a.name.localeCompare(b.name, "ko");
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export function accountName(accounts: Account[], accountId?: string | null) {
  if (!accountId) return "";
  return accounts.find((row) => row.id === accountId)?.name ?? "";
}

export function memberOf(members: ClubMember[], clubId: string, accountId: string | null) {
  if (!accountId) return undefined;
  return members.find((row) => row.clubId === clubId && row.accountId === accountId);
}

export function canOperateClub(role?: ClubMember["role"]) {
  return role === "owner" || role === "operator";
}
