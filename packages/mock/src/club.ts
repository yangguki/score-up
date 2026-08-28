import type {
  AppData,
  Club,
  ClubSession,
  ClubSessionFormat,
  MemberGrade,
  NthWeek,
  RecurrenceKind,
  SessionAssignment,
  SessionSide,
  SportId,
  VoteValue,
} from "@score-up/domain";
import {
  BADMINTON_CLUB_PRESET,
  BASKETBALL_CLUB_PRESET,
  FUTSAL_CLUB_PRESET,
  TABLE_TENNIS_CLUB_PRESET,
  VOLLEYBALL_CLUB_PRESET,
  canChallengeGrade,
  canOperateClub,
  canSendChallenge,
  challengeGradeLockCopy,
  clampMonthDay,
  clubCourtSize,
  computeClubRanking,
  defaultClubFormat,
  hasOpenChallenge,
  isBasketballMatch,
  isClubSportId,
  isRallyClubFormat,
  isRallyClubSport,
  memberGrade,
  memberOf,
  monthlyDayDates,
  monthlyNthDates,
  parseDateLabel,
  proposeClubSplit,
  rallySideSize,
  sessionRallyFormat,
  sessionSplitFormat,
  weekdayOf,
  weeklyDates,
} from "@score-up/domain";
import { createBlankMatch } from "./basketball";
import { createBlankPitchMatch } from "./pitch";
import { createBlankTableTennisMatch } from "./table-tennis";
import { createBlankVolleyballMatch } from "./volleyball";
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
  if (!isClubSportId(sportId)) {
    throw new Error("모임은 농구·배구·풋살·탁구·배드민턴만 만듭니다.");
  }
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
        { id: uid("cm"), clubId: id, accountId, role: "owner", status: "active", grade: "intermediate" },
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
      { id: uid("cm"), clubId: club.id, accountId, role: "member", status: "pending", grade: "intermediate" },
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

function deadlineBefore(timeLabel: string) {
  const [h, m] = timeLabel.split(":").map((part) => Number(part));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "12:00";
  const total = h * 60 + m - 120;
  const hh = Math.max(0, Math.floor(total / 60));
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export type CreateSessionsInput = {
  dateLabel: string;
  timeLabel: string;
  venue: string;
  kind: "once" | RecurrenceKind;
  nthWeek?: NthWeek;
  weekday?: number;
  monthDay?: number;
};

function datesForSessions(input: CreateSessionsInput, dateLabel: string): string[] {
  if (input.kind === "weekly") return weeklyDates(dateLabel);
  if (input.kind === "monthlyNth") {
    const weekday = input.weekday ?? weekdayOf(dateLabel);
    if (weekday == null) return [];
    return monthlyNthDates(dateLabel, weekday, input.nthWeek ?? 1);
  }
  if (input.kind === "monthlyDate") {
    const day = input.monthDay ?? Number.parseInt(dateLabel.slice(-2), 10);
    return monthlyDayDates(dateLabel, day);
  }
  return [dateLabel];
}

export function createSessions(data: AppData, clubId: string, input: CreateSessionsInput): { data: AppData; firstId: string } {
  const accountId = requireAccount(data);
  const me = memberOf(data.clubMembers, clubId, accountId);
  if (!canOperateClub(me?.role)) throw new Error("회차는 모임장·운영만 만들 수 있습니다.");
  const club = data.clubs.find((row) => row.id === clubId);
  if (!club) throw new Error("모임을 찾을 수 없습니다.");
  const dateLabel = input.dateLabel.trim();
  const timeLabel = input.timeLabel.trim() || "14:00";
  if (!parseDateLabel(dateLabel)) throw new Error("날짜를 YYYY-MM-DD로 입력하세요.");
  if (input.kind === "monthlyDate") {
    const day = input.monthDay ?? Number.parseInt(dateLabel.slice(-2), 10);
    if (!Number.isFinite(day) || day < 1 || day > 28) throw new Error("말일은 28일로 두세요.");
  }
  const taken = new Set(
    data.sessions
      .filter((row) => row.clubId === clubId && row.status !== "cancelled")
      .map((row) => row.dateLabel),
  );
  const dates = datesForSessions(input, dateLabel).filter((day) => !taken.has(day));
  if (dates.length === 0) throw new Error("이미 같은 날짜 회차가 있습니다.");

  const created: ClubSession[] = dates.map((day) => ({
    id: uid("ses"),
    clubId,
    dateLabel: day,
    timeLabel,
    venue: input.venue.trim() || club.venue || "",
    voteDeadlineLabel: deadlineBefore(timeLabel),
    status: "voting",
    recurring: input.kind !== "once",
    format: defaultClubFormat(club.sportId),
  }));
  const firstId = created[0]!.id;
  let clubs = data.clubs;
  if (input.kind !== "once") {
    const weekday = input.weekday ?? weekdayOf(dateLabel) ?? club.weekday;
    clubs = data.clubs.map((row) =>
      row.id === clubId
        ? {
            ...row,
            recurrenceKind: input.kind,
            weekday: input.kind === "monthlyDate" ? row.weekday : weekday,
            weeklyTime: timeLabel,
            nthWeek: input.kind === "monthlyNth" ? (input.nthWeek ?? 1) : row.nthWeek,
            monthDay: input.kind === "monthlyDate" ? clampMonthDay(input.monthDay ?? 1) : row.monthDay,
            venue: input.venue.trim() || row.venue,
          }
        : row,
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

export function setSessionFormat(data: AppData, sessionId: string, format: ClubSessionFormat): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) return data;
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) return data;
  if (session.status !== "confirming") return data;
  const club = data.clubs.find((row) => row.id === session.clubId);
  if (club && isRallyClubSport(club.sportId) && !isRallyClubFormat(format)) return data;
  if (club && !isRallyClubSport(club.sportId) && isRallyClubFormat(format)) return data;
  return {
    ...data,
    sessions: data.sessions.map((row) => (row.id === sessionId ? { ...row, format } : row)),
  };
}

/** 자동 매칭 제안 → 배정에 반영. 확정은 confirmSplit. */
export function applySplitProposal(
  data: AppData,
  sessionId: string,
  options: { balanceByWinRate?: boolean } = {},
): { data: AppData; ok: boolean; reason?: string } {
  const operatorId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) return { data, ok: false, reason: "회차를 찾을 수 없습니다." };
  const me = memberOf(data.clubMembers, session.clubId, operatorId);
  if (!canOperateClub(me?.role)) return { data, ok: false, reason: "팀 나누기는 모임장·운영만 할 수 있습니다." };
  const club = data.clubs.find((row) => row.id === session.clubId);
  if (club && isRallyClubSport(club.sportId)) {
    return { data, ok: false, reason: "이 종목 회차는 한 판 열기를 쓰세요." };
  }

  const members = data.clubMembers
    .filter((row) => row.clubId === session.clubId && row.status === "active")
    .map((row) => ({
      accountId: row.accountId,
      name: data.accounts.find((acc) => acc.id === row.accountId)?.name ?? "멤버",
    }));
  const ranking = computeClubRanking(
    members,
    data.matches.filter((match) => match.sessionId && data.sessions.some((s) => s.id === match.sessionId && s.clubId === session.clubId)),
    data.sessionAssignments,
    data.ladderMatches.filter((row) => row.clubId === session.clubId),
  );
  const rateOf = (accountId?: string) => ranking.find((row) => row.accountId === accountId)?.winRate ?? null;

  const going = data.sessionVotes
    .filter((row) => row.sessionId === sessionId && row.value === "going" && row.accountId)
    .map((row) => ({
      accountId: row.accountId!,
      name: data.accounts.find((acc) => acc.id === row.accountId)?.name ?? "멤버",
      winRate: rateOf(row.accountId),
    }));
  const guests = data.sessionGuests
    .filter((row) => row.sessionId === sessionId)
    .map((row) => ({
      guestId: row.id,
      name: row.name,
      winRate: null as number | null,
    }));
  const candidates = [...going, ...guests];
  const format = sessionSplitFormat(session);
  const proposal = proposeClubSplit(candidates, { format, balanceByWinRate: options.balanceByWinRate });
  if (!proposal.ok) return { data, ok: false, reason: proposal.reason };

  const cleared = {
    ...data,
    sessionAssignments: data.sessionAssignments.filter((row) => row.sessionId !== sessionId),
  };
  let next = cleared;
  for (const person of proposal.home) {
    next = setAssignment(next, sessionId, { accountId: person.accountId, guestId: person.guestId }, "home");
  }
  for (const person of proposal.away) {
    next = setAssignment(next, sessionId, { accountId: person.accountId, guestId: person.guestId }, "away");
  }
  for (const person of proposal.bench) {
    next = setAssignment(next, sessionId, { accountId: person.accountId, guestId: person.guestId }, "bench");
  }
  return { data: next, ok: true };
}

export function confirmSplit(data: AppData, sessionId: string): { data: AppData; matchId: string } {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) throw new Error("회차를 찾을 수 없습니다.");
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) throw new Error("팀 나누기는 모임장·운영만 할 수 있습니다.");
  const club = data.clubs.find((row) => row.id === session.clubId);
  if (!club) throw new Error("모임을 찾을 수 없습니다.");
  if (isRallyClubSport(club.sportId)) throw new Error("이 종목 회차는 한 판 열기를 쓰세요.");
  const home = data.sessionAssignments.filter((row) => row.sessionId === sessionId && row.side === "home");
  const away = data.sessionAssignments.filter((row) => row.sessionId === sessionId && row.side === "away");
  const format = sessionSplitFormat(session);
  const court = clubCourtSize(format);
  if (home.length !== court || away.length !== court) {
    throw new Error(`A ${court} · B ${court} 이어야 매칭을 확정할 수 있습니다.`);
  }

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
  const scheduledLabel = `${session.dateLabel} ${session.timeLabel}`;
  const match =
    club.sportId === "volleyball"
      ? createBlankVolleyballMatch({
          sessionId,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeLabel: "A",
          awayLabel: "B",
          homeColor: homeTeam.color,
          awayColor: awayTeam.color,
          roundLabel: "회차",
          scheduledLabel,
          rules: VOLLEYBALL_CLUB_PRESET.rules,
          status: "scheduled",
        })
      : club.sportId === "futsal"
        ? createBlankPitchMatch({
            sportId: "futsal",
            sessionId,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            homeLabel: "A",
            awayLabel: "B",
            homeColor: homeTeam.color,
            awayColor: awayTeam.color,
            roundLabel: "회차",
            scheduledLabel,
            rules: FUTSAL_CLUB_PRESET.rules,
            status: "scheduled",
          })
        : createBlankMatch({
            sessionId,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            homeLabel: "A",
            awayLabel: "B",
            homeColor: homeTeam.color,
            awayColor: awayTeam.color,
            roundLabel: "회차",
            scheduledLabel,
            rules: { ...BASKETBALL_CLUB_PRESET.rules, starters: court },
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

export function confirmRallyBout(data: AppData, sessionId: string): { data: AppData; matchId: string } {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) throw new Error("회차를 찾을 수 없습니다.");
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) throw new Error("한 판 열기는 모임장·운영만 할 수 있습니다.");
  const club = data.clubs.find((row) => row.id === session.clubId);
  if (!club) throw new Error("모임을 찾을 수 없습니다.");
  if (club.sportId !== "badminton" && club.sportId !== "table-tennis") {
    throw new Error("한 판 열기는 배드민턴·탁구 모임만 씁니다.");
  }
  const format = sessionRallyFormat(session);
  const court = rallySideSize(format);
  const home = data.sessionAssignments.filter((row) => row.sessionId === sessionId && row.side === "home");
  const away = data.sessionAssignments.filter((row) => row.sessionId === sessionId && row.side === "away");
  if (home.length !== court || away.length !== court) {
    throw new Error(format === "singles" ? "양쪽 1명을 고르세요." : "양쪽 2명을 고르세요.");
  }

  const nameOf = (row: SessionAssignment) => {
    if (row.accountId) return data.accounts.find((acc) => acc.id === row.accountId)?.name ?? "멤버";
    return data.sessionGuests.find((gst) => gst.id === row.guestId)?.name ?? "게스트";
  };
  const labelOf = (rows: SessionAssignment[]) => rows.map(nameOf).join(" / ");

  const homeTeam = { id: uid("team"), name: labelOf(home), color: "#B91C1C" };
  const awayTeam = { id: uid("team"), name: labelOf(away), color: "#1D4ED8" };
  const players = [...home, ...away].map((row, index) => ({
    id: uid("p"),
    teamId: row.side === "home" ? homeTeam.id : awayTeam.id,
    name: nameOf(row),
    number: index + 1,
  }));
  const rallyRules =
    club.sportId === "table-tennis"
      ? { ...TABLE_TENNIS_CLUB_PRESET.rules, doubles: format === "doubles" }
      : { ...BADMINTON_CLUB_PRESET.rules, doubles: format === "doubles" };
  const match = createBlankTableTennisMatch({
    sportId: club.sportId,
    sessionId,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeLabel: homeTeam.name,
    awayLabel: awayTeam.name,
    homeColor: homeTeam.color,
    awayColor: awayTeam.color,
    roundLabel: format === "singles" ? "단식" : "복식",
    scheduledLabel: `${session.dateLabel} ${session.timeLabel}`,
    rules: rallyRules,
    status: "scheduled",
  });

  return {
    data: {
      ...data,
      teams: [...data.teams, homeTeam, awayTeam],
      players: [...data.players, ...players],
      matches: [...data.matches, match],
      sessions: data.sessions.map((row) =>
        row.id === sessionId ? { ...row, status: "matched" as const, matchId: match.id, format } : row,
      ),
    },
    matchId: match.id,
  };
}

/** 팁오프 전 matched → confirming. 배정은 남기고 만든 경기만 지운다. */
export function reopenSessionMatch(data: AppData, sessionId: string): AppData {
  const accountId = requireAccount(data);
  const session = data.sessions.find((row) => row.id === sessionId);
  if (!session) throw new Error("회차를 찾을 수 없습니다.");
  const me = memberOf(data.clubMembers, session.clubId, accountId);
  if (!canOperateClub(me?.role)) throw new Error("다시 나누기는 모임장·운영만 할 수 있습니다.");
  if (session.status !== "matched") throw new Error("팀 확정 뒤에만 다시 나눌 수 있습니다.");
  const match = session.matchId ? data.matches.find((row) => row.id === session.matchId) : undefined;
  if (!match) throw new Error("경기를 찾을 수 없습니다.");
  if (match.status !== "scheduled" && match.status !== "lineup") {
    throw new Error("경기가 시작되면 다시 나누지 않습니다.");
  }
  const teamIds = [match.homeTeamId, match.awayTeamId].filter((id): id is string => Boolean(id));
  return {
    ...data,
    matches: data.matches.filter((row) => row.id !== match.id),
    teams: data.teams.filter((row) => !teamIds.includes(row.id)),
    players: data.players.filter((row) => !teamIds.includes(row.teamId)),
    sessions: data.sessions.map((row) =>
      row.id === sessionId ? { ...row, status: "confirming" as const, matchId: undefined } : row,
    ),
  };
}

export function kickMember(data: AppData, memberId: string): AppData {
  const accountId = requireAccount(data);
  const member = data.clubMembers.find((row) => row.id === memberId);
  if (!member) throw new Error("멤버를 찾을 수 없습니다.");
  const me = memberOf(data.clubMembers, member.clubId, accountId);
  if (me?.role !== "owner" || me.status !== "active") throw new Error("강퇴는 모임장만 할 수 있습니다.");
  if (member.role === "owner") throw new Error("모임장은 강퇴할 수 없습니다.");
  if (member.accountId === accountId) throw new Error("자신을 강퇴할 수 없습니다.");
  if (member.status !== "active") return data;
  const openSessionIds = data.sessions
    .filter((row) => row.clubId === member.clubId && (row.status === "voting" || row.status === "confirming"))
    .map((row) => row.id);
  return {
    ...data,
    clubMembers: data.clubMembers.filter((row) => row.id !== memberId),
    sessionVotes: data.sessionVotes.filter(
      (row) => !(row.accountId === member.accountId && openSessionIds.includes(row.sessionId)),
    ),
    sessionAssignments: data.sessionAssignments.filter(
      (row) => !(row.accountId === member.accountId && openSessionIds.includes(row.sessionId)),
    ),
    challenges: data.challenges.map((row) =>
      row.clubId === member.clubId &&
      row.status === "pending" &&
      (row.fromAccountId === member.accountId || row.toAccountId === member.accountId)
        ? { ...row, status: "cancelled" as const }
        : row,
    ),
  };
}

export function setMemberRole(data: AppData, memberId: string, role: "operator" | "member"): AppData {
  const accountId = requireAccount(data);
  const member = data.clubMembers.find((row) => row.id === memberId);
  if (!member) throw new Error("멤버를 찾을 수 없습니다.");
  const me = memberOf(data.clubMembers, member.clubId, accountId);
  if (me?.role !== "owner" || me.status !== "active") throw new Error("역할 변경은 모임장만 할 수 있습니다.");
  if (member.role === "owner") throw new Error("모임장 역할은 바꾸지 않습니다.");
  if (member.status !== "active") return data;
  return {
    ...data,
    clubMembers: data.clubMembers.map((row) => (row.id === memberId ? { ...row, role } : row)),
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
  patch: {
    name?: string;
    venue?: string;
    seasonLabel?: string;
    recurrenceKind?: RecurrenceKind | null;
    weekday?: number | null;
    weeklyTime?: string;
    nthWeek?: NthWeek | null;
    monthDay?: number | null;
  },
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
            recurrenceKind: patch.recurrenceKind === null ? undefined : (patch.recurrenceKind ?? row.recurrenceKind),
            weekday: patch.weekday === null ? undefined : (patch.weekday ?? row.weekday),
            weeklyTime: patch.weeklyTime?.trim() || row.weeklyTime,
            nthWeek: patch.nthWeek === null ? undefined : (patch.nthWeek ?? row.nthWeek),
            monthDay: patch.monthDay === null ? undefined : patch.monthDay != null ? clampMonthDay(patch.monthDay) : row.monthDay,
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
    challenges: data.challenges.filter((row) => row.clubId !== clubId),
    ladderMatches: data.ladderMatches.filter((row) => row.clubId !== clubId),
  };
}

function todayLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function activeMember(data: AppData, clubId: string, accountId: string) {
  return data.clubMembers.find(
    (row) => row.clubId === clubId && row.accountId === accountId && row.status === "active",
  );
}

export function setMemberGrade(data: AppData, memberId: string, grade: MemberGrade): AppData {
  const accountId = requireAccount(data);
  const member = data.clubMembers.find((row) => row.id === memberId);
  if (!member) return data;
  const me = memberOf(data.clubMembers, member.clubId, accountId);
  if (!canOperateClub(me?.role) || me?.status !== "active") {
    throw new Error("급수는 모임장·운영만 지정할 수 있습니다.");
  }
  if (member.status !== "active") return data;
  return {
    ...data,
    clubMembers: data.clubMembers.map((row) =>
      row.id === memberId ? { ...row, grade: memberGrade(grade) } : row,
    ),
  };
}

export function sendChallenge(data: AppData, clubId: string, toAccountId: string): AppData {
  const fromAccountId = requireAccount(data);
  const from = activeMember(data, clubId, fromAccountId);
  const to = activeMember(data, clubId, toAccountId);
  const check = canSendChallenge({
    fromAccountId,
    toAccountId,
    fromGrade: from?.grade,
    toGrade: to?.grade,
    fromActive: Boolean(from),
    toActive: Boolean(to),
    openBetween: hasOpenChallenge(data.challenges, clubId, fromAccountId, toAccountId),
  });
  if (!check.ok) throw new Error(check.reason);
  return {
    ...data,
    challenges: [
      ...data.challenges,
      {
        id: uid("ch"),
        clubId,
        fromAccountId,
        toAccountId,
        status: "pending",
      },
    ],
  };
}

export function respondChallenge(data: AppData, challengeId: string, accept: boolean): AppData {
  const accountId = requireAccount(data);
  const challenge = data.challenges.find((row) => row.id === challengeId);
  if (!challenge || challenge.status !== "pending") return data;
  if (challenge.toAccountId !== accountId) {
    throw new Error("받은 사람만 수락하거나 거절할 수 있습니다.");
  }
  return {
    ...data,
    challenges: data.challenges.map((row) =>
      row.id === challengeId ? { ...row, status: accept ? ("accepted" as const) : ("declined" as const) } : row,
    ),
  };
}

export function cancelChallenge(data: AppData, challengeId: string): AppData {
  const accountId = requireAccount(data);
  const challenge = data.challenges.find((row) => row.id === challengeId);
  if (!challenge || challenge.status !== "pending") return data;
  const me = memberOf(data.clubMembers, challenge.clubId, accountId);
  if (challenge.fromAccountId !== accountId && !canOperateClub(me?.role)) {
    throw new Error("보낸 사람 또는 운영만 취소할 수 있습니다.");
  }
  return {
    ...data,
    challenges: data.challenges.map((row) =>
      row.id === challengeId ? { ...row, status: "cancelled" as const } : row,
    ),
  };
}

export function recordLadderResult(
  data: AppData,
  clubId: string,
  input: {
    challengeId?: string;
    homeAccountId: string;
    awayAccountId: string;
    homeScore: number;
    awayScore: number;
  },
): AppData {
  const accountId = requireAccount(data);
  const me = memberOf(data.clubMembers, clubId, accountId);
  if (!me || me.status !== "active") throw new Error("멤버만 결과를 넣을 수 있습니다.");

  const homeScore = Number(input.homeScore);
  const awayScore = Number(input.awayScore);
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
    throw new Error("점수는 0 이상 정수로 넣으세요.");
  }
  if (homeScore === awayScore) throw new Error("승패가 나야 랭킹에 넣습니다.");
  if (input.homeAccountId === input.awayAccountId) throw new Error("서로 다른 멤버여야 합니다.");

  const home = activeMember(data, clubId, input.homeAccountId);
  const away = activeMember(data, clubId, input.awayAccountId);
  if (!home || !away) throw new Error("활성 멤버만 급수 경기에 넣을 수 있습니다.");
  if (!canChallengeGrade(home.grade, away.grade)) throw new Error(challengeGradeLockCopy());

  const challenge = input.challengeId
    ? data.challenges.find((row) => row.id === input.challengeId && row.clubId === clubId)
    : undefined;

  if (challenge) {
    if (challenge.status !== "accepted") throw new Error("수락된 도전만 결과를 넣을 수 있습니다.");
    const pair = [challenge.fromAccountId, challenge.toAccountId];
    if (!pair.includes(input.homeAccountId) || !pair.includes(input.awayAccountId)) {
      throw new Error("도전한 두 사람으로 점수를 넣으세요.");
    }
    const party = accountId === challenge.fromAccountId || accountId === challenge.toAccountId;
    if (!party && !canOperateClub(me.role)) throw new Error("당사자 또는 운영만 결과를 넣을 수 있습니다.");
  } else if (!canOperateClub(me.role)) {
    throw new Error("도전 없는 결과는 모임장·운영만 넣을 수 있습니다.");
  }

  const winnerAccountId = homeScore > awayScore ? input.homeAccountId : input.awayAccountId;
  const id = uid("lad");
  return {
    ...data,
    ladderMatches: [
      ...data.ladderMatches,
      {
        id,
        clubId,
        challengeId: challenge?.id,
        homeAccountId: input.homeAccountId,
        awayAccountId: input.awayAccountId,
        homeScore,
        awayScore,
        winnerAccountId,
        dateLabel: todayLabel(),
      },
    ],
    challenges: challenge
      ? data.challenges.map((row) =>
          row.id === challenge.id ? { ...row, status: "completed" as const, ladderMatchId: id } : row,
        )
      : data.challenges,
  };
}
