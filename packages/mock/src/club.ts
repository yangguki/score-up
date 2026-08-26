import type {
  AppData,
  Club,
  ClubSession,
  SessionAssignment,
  SessionSide,
  SportId,
  VoteValue,
} from "@score-up/domain";
import { BASKETBALL_CLUB_PRESET, canOperateClub, isBasketballMatch, memberOf } from "@score-up/domain";
import { createBlankMatch } from "./basketball";
import { uid } from "./id";

function requireAccount(data: AppData) {
  if (!data.accountId) throw new Error("이름을 먼저 시작하세요.");
  return data.accountId;
}

export function signIn(data: AppData, name: string): AppData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("이름을 입력하세요.");
  const existing = data.accounts.find((row) => row.name === trimmed);
  if (existing) return { ...data, accountId: existing.id };
  const account = { id: uid("acc"), name: trimmed };
  return { ...data, accounts: [...data.accounts, account], accountId: account.id };
}

export function signOut(data: AppData): AppData {
  return { ...data, accountId: null };
}

export function createClub(
  data: AppData,
  input: { name: string; sportId?: SportId; venue?: string },
): { data: AppData; id: string } {
  const accountId = requireAccount(data);
  const name = input.name.trim();
  if (!name) throw new Error("모임 이름을 입력하세요.");
  const sportId = input.sportId ?? "basketball";
  if (sportId !== "basketball") throw new Error("1차 모임은 농구만 만듭니다.");
  const id = uid("club");
  const club: Club = {
    id,
    name,
    sportId,
    venue: input.venue?.trim() || undefined,
    inviteToken: uid("c").slice(2, 8),
    ownerAccountId: accountId,
    seasonLabel: "2026",
  };
  return {
    data: {
      ...data,
      clubs: [...data.clubs, club],
      clubMembers: [
        ...data.clubMembers,
        { id: uid("cm"), clubId: id, accountId, role: "owner", status: "active" },
      ],
    },
    id,
  };
}

export function requestJoin(data: AppData, token: string): AppData {
  const accountId = requireAccount(data);
  const club = data.clubs.find((row) => row.inviteToken === token);
  if (!club) throw new Error("링크가 유효하지 않습니다. 모임장에게 다시 받으세요.");
  const existing = memberOf(data.clubMembers, club.id, accountId);
  if (existing?.status === "active") return data;
  if (existing?.status === "pending") return data;
  return {
    ...data,
    clubMembers: [
      ...data.clubMembers,
      { id: uid("cm"), clubId: club.id, accountId, role: "member", status: "pending" },
    ],
  };
}

export function decideJoin(data: AppData, memberId: string, accept: boolean): AppData {
  const accountId = requireAccount(data);
  const member = data.clubMembers.find((row) => row.id === memberId);
  if (!member) return data;
  const me = memberOf(data.clubMembers, member.clubId, accountId);
  if (!canOperateClub(me?.role) || me?.status !== "active") return data;
  if (member.status !== "pending") return data;
  if (!accept) {
    return { ...data, clubMembers: data.clubMembers.filter((row) => row.id !== memberId) };
  }
  return {
    ...data,
    clubMembers: data.clubMembers.map((row) =>
      row.id === memberId ? { ...row, status: "active" as const } : row,
    ),
  };
}

function nextDateLabel(start: string, weekIndex: number) {
  const base = new Date(`${start}T00:00:00`);
  if (Number.isNaN(base.getTime())) return start;
  base.setDate(base.getDate() + weekIndex * 7);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function deadlineBefore(timeLabel: string) {
  const [h, m] = timeLabel.split(":").map((part) => Number(part));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "12:00";
  const total = h * 60 + m - 120;
  const hh = Math.max(0, Math.floor(total / 60));
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function createSessions(
  data: AppData,
  clubId: string,
  input: { dateLabel: string; timeLabel: string; venue: string; weekly: boolean },
): { data: AppData; firstId: string } {
  const accountId = requireAccount(data);
  const me = memberOf(data.clubMembers, clubId, accountId);
  if (!canOperateClub(me?.role)) throw new Error("회차는 모임장·운영만 만들 수 있습니다.");
  const club = data.clubs.find((row) => row.id === clubId);
  if (!club) throw new Error("모임을 찾을 수 없습니다.");
  const dateLabel = input.dateLabel.trim();
  const timeLabel = input.timeLabel.trim() || "14:00";
  if (!dateLabel) throw new Error("날짜를 입력하세요.");
  const count = input.weekly ? 8 : 1;
  const created: ClubSession[] = [];
  for (let i = 0; i < count; i++) {
    created.push({
      id: uid("ses"),
      clubId,
      dateLabel: nextDateLabel(dateLabel, i),
      timeLabel,
      venue: input.venue.trim() || club.venue || "",
      voteDeadlineLabel: deadlineBefore(timeLabel),
      status: "voting",
      recurring: input.weekly,
    });
  }
  const firstId = created[0]!.id;
  let clubs = data.clubs;
  if (input.weekly) {
    const weekday = new Date(`${dateLabel}T00:00:00`).getDay();
    clubs = data.clubs.map((row) =>
      row.id === clubId ? { ...row, weekday, weeklyTime: timeLabel, venue: input.venue.trim() || row.venue } : row,
    );
  }
  return { data: { ...data, clubs, sessions: [...data.sessions, ...created] }, firstId };
}

export function setVote(data: AppData, sessionId: string, value: VoteValue): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) return data;
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!me || me.status !== "active") return data;
  if (session.status !== "voting") return data;
  const existing = data.sessionVotes.find((row) => row.sessionId === sessionId && row.accountId === accountId);
  if (existing) {
    return {
      ...data,
      sessionVotes: data.sessionVotes.map((row) => (row.id === existing.id ? { ...row, value } : row)),
    };
  }
  return {
    ...data,
    sessionVotes: [...data.sessionVotes, { id: uid("vote"), sessionId, accountId, value }],
  };
}

export function closeVoting(data: AppData, sessionId: string): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session || session.status !== "voting") return data;
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) return data;
  return {
    ...data,
    sessions: data.sessions.map((row) => (row.id === sessionId ? { ...row, status: "confirming" as const } : row)),
  };
}

export function addGuest(data: AppData, sessionId: string, name: string): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session || (session.status !== "confirming" && session.status !== "voting")) return data;
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) return data;
  const trimmed = name.trim();
  if (!trimmed) throw new Error("게스트 이름을 입력하세요.");
  return {
    ...data,
    sessionGuests: [...data.sessionGuests, { id: uid("gst"), sessionId, name: trimmed }],
  };
}

export function setMemberGoing(data: AppData, sessionId: string, targetAccountId: string): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session || session.status !== "confirming") return data;
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) return data;
  const existing = data.sessionVotes.find((row) => row.sessionId === sessionId && row.accountId === targetAccountId);
  if (existing) {
    return {
      ...data,
      sessionVotes: data.sessionVotes.map((row) =>
        row.id === existing.id ? { ...row, value: "going" as const } : row,
      ),
    };
  }
  return {
    ...data,
    sessionVotes: [...data.sessionVotes, { id: uid("vote"), sessionId, accountId: targetAccountId, value: "going" }],
  };
}

export function dropCandidate(data: AppData, sessionId: string, accountId?: string, guestId?: string): AppData {
  const operatorId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session || session.status !== "confirming") return data;
  const me = memberOf(data.clubMembers, session.clubId, operatorId);
  if (!canOperateClub(me?.role)) return data;
  if (guestId) {
    return { ...data, sessionGuests: data.sessionGuests.filter((row) => row.id !== guestId) };
  }
  if (!accountId) return data;
  return {
    ...data,
    sessionVotes: data.sessionVotes.map((row) =>
      row.sessionId === sessionId && row.accountId === accountId ? { ...row, value: "not_going" as const } : row,
    ),
  };
}

export function candidateCount(data: AppData, sessionId: string) {
  const going = data.sessionVotes.filter((row) => row.sessionId === sessionId && row.value === "going").length;
  const guests = data.sessionGuests.filter((row) => row.sessionId === sessionId).length;
  return going + guests;
}

export function setAssignment(data: AppData, sessionId: string, key: { accountId?: string; guestId?: string }, side: SessionSide): AppData {
  const operatorId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) return data;
  const me = memberOf(data.clubMembers, session.clubId, operatorId);
  if (!canOperateClub(me?.role)) return data;
  const existing = data.sessionAssignments.find(
    (row) =>
      row.sessionId === sessionId &&
      ((key.accountId && row.accountId === key.accountId) || (key.guestId && row.guestId === key.guestId)),
  );
  if (existing) {
    return {
      ...data,
      sessionAssignments: data.sessionAssignments.map((row) => (row.id === existing.id ? { ...row, side } : row)),
    };
  }
  const next: SessionAssignment = {
    id: uid("asg"),
    sessionId,
    accountId: key.accountId,
    guestId: key.guestId,
    side,
  };
  return { ...data, sessionAssignments: [...data.sessionAssignments, next] };
}

export function confirmSplit(data: AppData, sessionId: string): { data: AppData; matchId: string } {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) throw new Error("회차를 찾을 수 없습니다.");
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) throw new Error("팀 나누기는 모임장·운영만 할 수 있습니다.");
  const club = data.clubs.find((row) => row.id === session.clubId);
  if (!club) throw new Error("모임을 찾을 수 없습니다.");
  const home = data.sessionAssignments.filter((row) => row.sessionId === sessionId && row.side === "home");
  const away = data.sessionAssignments.filter((row) => row.sessionId === sessionId && row.side === "away");
  if (home.length !== 5 || away.length !== 5) throw new Error("A 5 · B 5 이어야 매칭을 확정할 수 있습니다.");

  const nameOf = (row: SessionAssignment) => {
    if (row.accountId) return data.accounts.find((acc) => acc.id === row.accountId)?.name ?? "멤버";
    return data.sessionGuests.find((gst) => gst.id === row.guestId)?.name ?? "게스트";
  };

  const homeTeam = { id: uid("team"), name: "A", color: "#B91C1C" };
  const awayTeam = { id: uid("team"), name: "B", color: "#1D4ED8" };
  const players = [...home, ...away].map((row, index) => ({
    id: uid("p"),
    teamId: row.side === "home" ? homeTeam.id : awayTeam.id,
    name: nameOf(row),
    number: index + 1,
  }));
  const homeOn = players.filter((p) => p.teamId === homeTeam.id).map((p) => p.id);
  const awayOn = players.filter((p) => p.teamId === awayTeam.id).map((p) => p.id);
  const match = createBlankMatch({
    sessionId,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeLabel: "A",
    awayLabel: "B",
    homeColor: homeTeam.color,
    awayColor: awayTeam.color,
    roundLabel: "회차",
    scheduledLabel: `${session.dateLabel} ${session.timeLabel}`,
    rules: BASKETBALL_CLUB_PRESET.rules,
    status: "lineup",
  });
  if (isBasketballMatch(match)) {
    match.snapshot.onCourtHome = homeOn;
    match.snapshot.onCourtAway = awayOn;
  }

  return {
    data: {
      ...data,
      teams: [...data.teams, homeTeam, awayTeam],
      players: [...data.players, ...players],
      matches: [...data.matches, match],
      sessions: data.sessions.map((row) =>
        row.id === sessionId ? { ...row, status: "matched" as const, matchId: match.id } : row,
      ),
    },
    matchId: match.id,
  };
}

export function cancelSession(data: AppData, sessionId: string): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) return data;
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) return data;
  if (session.status === "in_play" || session.status === "completed") return data;
  return {
    ...data,
    sessions: data.sessions.map((row) => (row.id === sessionId ? { ...row, status: "cancelled" as const } : row)),
  };
}

export function updateClub(
  data: AppData,
  clubId: string,
  patch: { name?: string; venue?: string; seasonLabel?: string },
): AppData {
  const accountId = requireAccount(data);
  const me = memberOf(data.clubMembers, clubId, accountId);
  if (me?.role !== "owner") return data;
  return {
    ...data,
    clubs: data.clubs.map((row) =>
      row.id === clubId
        ? {
            ...row,
            name: patch.name?.trim() || row.name,
            venue: patch.venue?.trim() || row.venue,
            seasonLabel: patch.seasonLabel?.trim() || row.seasonLabel,
          }
        : row,
    ),
  };
}

export function syncSessionFromMatch(data: AppData, match: { sessionId?: string; status: string }): AppData {
  if (!match.sessionId) return data;
  const live =
    match.status === "in_progress" ||
    match.status === "paused" ||
    match.status === "period_break" ||
    match.status === "confirm_period_end" ||
    match.status === "confirm_match_end";
  const done = match.status === "completed" || match.status === "forfeited" || match.status === "abandoned";
  const nextStatus = done ? "completed" : live ? "in_play" : undefined;
  if (!nextStatus) return data;
  return {
    ...data,
    sessions: data.sessions.map((row) =>
      row.id === match.sessionId ? { ...row, status: nextStatus as typeof row.status } : row,
    ),
  };
}

export function dissolveClub(data: AppData, clubId: string): AppData {
  const accountId = requireAccount(data);
  const me = memberOf(data.clubMembers, clubId, accountId);
  if (me?.role !== "owner") return data;
  const sessionIds = data.sessions.filter((row) => row.clubId === clubId).map((row) => row.id);
  return {
    ...data,
    clubs: data.clubs.filter((row) => row.id !== clubId),
    clubMembers: data.clubMembers.filter((row) => row.clubId !== clubId),
    sessions: data.sessions.filter((row) => row.clubId !== clubId),
    sessionVotes: data.sessionVotes.filter((row) => !sessionIds.includes(row.sessionId)),
    sessionGuests: data.sessionGuests.filter((row) => !sessionIds.includes(row.sessionId)),
    sessionAssignments: data.sessionAssignments.filter((row) => !sessionIds.includes(row.sessionId)),
  };
}
