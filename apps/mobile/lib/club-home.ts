import type { Club, ClubSession, SessionVote, VoteValue } from "@score-up/domain";
import { voteLabel } from "@score-up/domain";

export function nextClubSession(clubId: string, sessions: ClubSession[]) {
  const open = sessions.filter(
    (row) =>
      row.clubId === clubId &&
      row.status !== "completed" &&
      row.status !== "cancelled",
  );
  const voting = open.find((row) => row.status === "voting");
  return voting ?? open[0];
}

export function myVoteValue(
  sessionId: string | undefined,
  accountId: string | null,
  votes: SessionVote[],
): VoteValue {
  if (!sessionId || !accountId) return "none";
  return votes.find((row) => row.sessionId === sessionId && row.accountId === accountId)?.value ?? "none";
}

export function sessionLine(session: ClubSession) {
  return `${session.dateLabel} ${session.timeLabel}`;
}

export type HomeClubCard = {
  club: Club;
  nextLine: string;
  voteLine?: string;
  sessionId?: string;
  sessionStatus?: ClubSession["status"];
};

export function myClubCards(
  clubs: Club[],
  sessions: ClubSession[],
  votes: SessionVote[],
  accountId: string | null,
  memberships: { clubId: string; accountId: string; status: string }[],
): HomeClubCard[] {
  if (!accountId) return [];
  const mine = new Set(
    memberships.filter((row) => row.accountId === accountId && row.status === "active").map((row) => row.clubId),
  );
  return clubs
    .filter((club) => mine.has(club.id))
    .slice(0, 5)
    .map((club) => {
      const next = nextClubSession(club.id, sessions);
      const vote = next?.status === "voting" ? voteLabel(myVoteValue(next.id, accountId, votes)) : undefined;
      return {
        club,
        nextLine: next ? sessionLine(next) : "다음 회차 없음",
        voteLine: vote,
        sessionId: next?.id,
        sessionStatus: next?.status,
      };
    });
}
