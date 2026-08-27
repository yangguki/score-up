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

export type SplitCandidate = {
  accountId?: string;
  guestId?: string;
  name: string;
  /** 시즌 승률. 게스트·경기 0은 null → 밸런스 시 0.5로 취급 */
  winRate: number | null;
};

export type SplitProposal = {
  home: SplitCandidate[];
  away: SplitCandidate[];
  bench: SplitCandidate[];
  ok: boolean;
  reason?: string;
};

const COURT = 5;

function candidateKey(row: SplitCandidate) {
  return row.accountId ? `a:${row.accountId}` : `g:${row.guestId ?? row.name}`;
}

function balanceScore(row: SplitCandidate) {
  return row.winRate ?? 0.5;
}

/** 농구 5v5 자동 매칭 제안. 확정은 운영자. */
export function proposeClubSplit(
  candidates: SplitCandidate[],
  options: { balanceByWinRate?: boolean; random?: () => number } = {},
): SplitProposal {
  const balance = options.balanceByWinRate ?? false;
  const random = options.random ?? Math.random;

  if (candidates.length < COURT * 2) {
    return {
      home: [],
      away: [],
      bench: [...candidates],
      ok: false,
      reason: `5대5는 참석 ${COURT * 2}명이 필요합니다. 게스트를 추가하세요.`,
    };
  }

  let ordered: SplitCandidate[];
  if (balance) {
    ordered = [...candidates].sort((a, b) => {
      const diff = balanceScore(b) - balanceScore(a);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, "ko");
    });
  } else {
    ordered = [...candidates];
    for (let i = ordered.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
    }
  }

  const starters = ordered.slice(0, COURT * 2);
  const bench = ordered.slice(COURT * 2);
  const home: SplitCandidate[] = [];
  const away: SplitCandidate[] = [];

  if (balance) {
    // 스네이크: 1홈 2어웨이 3어웨이 4홈 …
    for (let i = 0; i < starters.length; i += 1) {
      const round = Math.floor(i / 2);
      const firstInRound = i % 2 === 0;
      const toHome = round % 2 === 0 ? firstInRound : !firstInRound;
      (toHome ? home : away).push(starters[i]!);
    }
  } else {
    for (let i = 0; i < starters.length; i += 1) {
      (i < COURT ? home : away).push(starters[i]!);
    }
  }

  return { home, away, bench, ok: true };
}

export { candidateKey };
