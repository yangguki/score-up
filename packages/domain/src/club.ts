import type {
  Account,
  ClubLadderMatch,
  ClubMember,
  ClubSession,
  ClubSessionFormat,
  ClubSplitFormat,
  RallyClubFormat,
  Match,
  MemberGrade,
  SessionAssignment,
  SessionSide,
  SessionStatus,
  SportId,
  VoteValue,
} from "./types";
import { GRADE_RANK_ORDER, gradeLabel, memberGrade } from "./ladder";

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

export function sessionSideLabel(side: SessionSide): string {
  if (side === "home") return "A";
  if (side === "away") return "B";
  return "대기";
}

export type ClubRankingRow = {
  rank: number;
  accountId: string;
  name: string;
  grade: MemberGrade;
  wins: number;
  losses: number;
  played: number;
  winRate: number | null;
};

export function computeClubRanking(
  members: { accountId: string; name: string; grade?: MemberGrade }[],
  matches: Match[],
  assignments: SessionAssignment[],
  ladderMatches: ClubLadderMatch[] = [],
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

  for (const match of ladderMatches) {
    const home = rows.get(match.homeAccountId);
    const away = rows.get(match.awayAccountId);
    if (home) {
      if (match.winnerAccountId === match.homeAccountId) home.wins += 1;
      else home.losses += 1;
    }
    if (away) {
      if (match.winnerAccountId === match.awayAccountId) away.wins += 1;
      else away.losses += 1;
    }
  }

  return members
    .map((member) => {
      const stat = rows.get(member.accountId) ?? { wins: 0, losses: 0 };
      const played = stat.wins + stat.losses;
      return {
        accountId: member.accountId,
        name: member.name,
        grade: memberGrade(member.grade),
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

export function groupClubRanking(rows: ClubRankingRow[]) {
  return GRADE_RANK_ORDER.map((grade) => ({
    grade,
    label: gradeLabel(grade),
    rows: rows
      .filter((row) => row.grade === grade)
      .map((row, index) => ({ ...row, rank: index + 1 })),
  })).filter((group) => group.rows.length > 0);
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

export const CLUB_SPORT_IDS = ["basketball", "volleyball", "futsal", "table-tennis", "badminton"] as const;
export type ClubSportId = (typeof CLUB_SPORT_IDS)[number];

export function isClubSportId(id: string | undefined): id is ClubSportId {
  return !!id && (CLUB_SPORT_IDS as readonly string[]).includes(id);
}

export function isRallyClubSport(sportId: SportId) {
  return sportId === "badminton" || sportId === "table-tennis";
}

export function isSplitClubSport(sportId: SportId) {
  return sportId === "basketball" || sportId === "volleyball" || sportId === "futsal";
}

export function defaultClubFormat(sportId: SportId): ClubSessionFormat {
  if (isRallyClubSport(sportId)) return "doubles";
  if (sportId === "volleyball") return "6v6";
  return "5v5";
}

export function clubFullSplitFormat(sportId: SportId): ClubSplitFormat {
  return sportId === "volleyball" ? "6v6" : "5v5";
}

export function clubVotingHintCopy(sportId: SportId) {
  if (isRallyClubSport(sportId)) {
    return "마감 후 단식 2명 또는 복식 4명이면 한 판을 열 수 있습니다.";
  }
  if (sportId === "volleyball") {
    return "마감 후 참석 12명이면 6대6, 8~11명이면 4대4로 나눌 수 있습니다.";
  }
  return "마감 후 참석 10명이면 5대5, 8~9명이면 4대4로 나눌 수 있습니다.";
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

const COURT = { "6v6": 6, "5v5": 5, "4v4": 4 } as const;

export function sessionSplitFormat(session: Pick<ClubSession, "format"> | { format?: ClubSessionFormat }): ClubSplitFormat {
  if (session.format === "6v6") return "6v6";
  if (session.format === "4v4") return "4v4";
  return "5v5";
}

export function isRallyClubFormat(format?: ClubSessionFormat | string): format is RallyClubFormat {
  return format === "singles" || format === "doubles";
}

export function sessionRallyFormat(session: Pick<ClubSession, "format"> | { format?: ClubSessionFormat }): RallyClubFormat {
  return session.format === "singles" ? "singles" : "doubles";
}

export function rallySideSize(format: RallyClubFormat = "doubles"): 1 | 2 {
  return format === "singles" ? 1 : 2;
}

export function canEnterRallyBout(candidates: number, format: RallyClubFormat = "doubles") {
  return candidates >= rallySideSize(format) * 2;
}

export function rallyBoutLockCopy(format: RallyClubFormat = "doubles") {
  return format === "singles"
    ? "단식은 참석 2명이 필요합니다. 게스트를 추가하세요."
    : "복식은 참석 4명이 필요합니다. 게스트를 추가하세요.";
}

export function clubCourtSize(format: ClubSplitFormat = "5v5"): 6 | 5 | 4 {
  return COURT[format];
}

export function canEnterFiveOnFiveSplit(candidates: number) {
  return candidates >= COURT["5v5"] * 2;
}

/** 인원 미달 슬라이스. 10명 이상이면 5v5만. */
export function canEnterFourOnFourSplit(candidates: number) {
  return candidates >= COURT["4v4"] * 2 && candidates < COURT["5v5"] * 2;
}

export function canEnterFullClubSplit(candidates: number, sportId: SportId) {
  return candidates >= clubCourtSize(clubFullSplitFormat(sportId)) * 2;
}

export function canEnterShortClubSplit(candidates: number, sportId: SportId) {
  const full = clubCourtSize(clubFullSplitFormat(sportId));
  return candidates >= COURT["4v4"] * 2 && candidates < full * 2;
}

export function clubFiveOnFiveLockCopy(candidates: number) {
  if (canEnterFourOnFourSplit(candidates)) {
    return "5대5는 참석 10명이 필요합니다. 게스트를 추가하거나 4대4로 나누세요.";
  }
  return "5대5는 참석 10명이 필요합니다. 게스트를 추가하세요.";
}

export function clubSixOnSixLockCopy(candidates: number) {
  if (candidates >= COURT["4v4"] * 2 && candidates < COURT["6v6"] * 2) {
    return "6대6는 참석 12명이 필요합니다. 게스트를 추가하거나 4대4로 나누세요.";
  }
  return "6대6는 참석 12명이 필요합니다. 게스트를 추가하세요.";
}

export function clubFullSplitLockCopy(candidates: number, sportId: SportId) {
  return sportId === "volleyball" ? clubSixOnSixLockCopy(candidates) : clubFiveOnFiveLockCopy(candidates);
}

export function clubFourOnFourLockCopy() {
  return "4대4는 참석 8명이 필요합니다. 게스트를 추가하세요.";
}

function candidateKey(row: SplitCandidate) {
  return row.accountId ? `a:${row.accountId}` : `g:${row.guestId ?? row.name}`;
}

function balanceScore(row: SplitCandidate) {
  return row.winRate ?? 0.5;
}

/** 팀 종목 회차 자동 매칭 제안. 확정은 운영자. format 기본 5v5. */
export function proposeClubSplit(
  candidates: SplitCandidate[],
  options: { format?: ClubSplitFormat; balanceByWinRate?: boolean; random?: () => number } = {},
): SplitProposal {
  const format: ClubSplitFormat =
    options.format === "6v6" || options.format === "4v4" || options.format === "5v5" ? options.format : "5v5";
  const court = clubCourtSize(format);
  const min = court * 2;
  const balance = options.balanceByWinRate ?? false;
  const random = options.random ?? Math.random;

  if (candidates.length < min) {
    return {
      home: [],
      away: [],
      bench: [...candidates],
      ok: false,
      reason:
        format === "4v4"
          ? clubFourOnFourLockCopy()
          : format === "6v6"
            ? clubSixOnSixLockCopy(candidates.length)
            : clubFiveOnFiveLockCopy(candidates.length),
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

  const starters = ordered.slice(0, min);
  const bench = ordered.slice(min);
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
      (i < court ? home : away).push(starters[i]!);
    }
  }

  return { home, away, bench, ok: true };
}

export { candidateKey };
