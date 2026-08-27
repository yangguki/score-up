export type SportId =
  | "basketball"
  | "volleyball"
  | "table-tennis"
  | "badminton"
  | "squash"
  | "soccer"
  | "futsal"
  | "baseball";
export type RallySetSportId = "table-tennis" | "badminton" | "squash";
export type PitchSportId = "soccer" | "futsal";

export type MatchStatus =
  | "scheduled"
  | "lineup"
  | "in_progress"
  | "period_break"
  | "paused"
  | "confirm_period_end"
  | "confirm_match_end"
  | "completed"
  | "forfeited"
  | "abandoned";

export type CompetitionStatus = "prep" | "in_progress" | "completed";
export type CompetitionFormat = "tournament" | "league";

export type MatchEventType =
  | "point"
  | "foul"
  | "timeout"
  | "substitution"
  | "serve_change"
  | "sanction"
  | "period_end"
  | "match_end"
  | "revoke";

export type Side = "home" | "away";

export interface BasketballRules {
  periodCount: number;
  periodMinutes: number;
  overtimeMinutes: number;
  overtimeEnabled: boolean;
  personalFoulLimit: number;
  teamFoulBonusAt: number;
  timeoutsPerGame: number;
  timeoutSeconds: number;
  starters: number;
  forfeitScore: number;
}

export interface VolleyballRules {
  setsToWin: number;
  setTarget: number;
  lastSetTarget: number;
  winBy: number;
  timeoutsPerSet: number;
  /** 켜면 전열 번호만 표시. 로테이션 반칙 판정은 하지 않는다. */
  rotationEnabled: boolean;
}

export type RallyServeMode = "count" | "scorer";

export interface TableTennisRules {
  setsToWin: number;
  setTarget: number;
  winBy: number;
  serveLimit: number;
  deuceServeLimit: number;
  changeEndsAt: number;
  /** count = 탁구 2점 교대. scorer = 배드민턴·스쿼시처럼 득점자가 서브. */
  serveMode: RallyServeMode;
  /** 이름만 복식. 위치·서브 순서는 강제하지 않는다. */
  doubles: boolean;
}

export interface PitchRules {
  periodCount: number;
  periodMinutes: number;
  overtimeEnabled: boolean;
  overtimeMinutes: number;
  /** 0이면 팀 누적 파울 힌트 없음. 풋살은 6. */
  teamFoulPenaltyAt: number;
}

export interface BaseballRules {
  inningCount: number;
  extraInningEnabled: boolean;
}

export type SportRules = BasketballRules | VolleyballRules | TableTennisRules | PitchRules | BaseballRules;

export interface SportPreset {
  id: string;
  sportId: SportId;
  scoringType: "timed_total" | "set_target" | "inning_chance";
  label: string;
  summary: string;
  official: boolean;
  rules: SportRules;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  number: number;
}

export interface Team {
  id: string;
  competitionId?: string;
  name: string;
  color: string;
}

export interface Competition {
  id: string;
  name: string;
  sportId: SportId;
  status: CompetitionStatus;
  format: CompetitionFormat;
  dateLabel: string;
  courtCount?: number;
  rules: SportRules;
  officialPreset: boolean;
}

export type BracketRound = "sf" | "final" | "champion";

export interface BracketSlot {
  id: string;
  competitionId: string;
  round: BracketRound;
  label: string;
  homeTeamId?: string;
  awayTeamId?: string;
  matchId?: string;
  bye?: boolean;
}

export interface PeriodScore {
  home: number;
  away: number;
}

export interface BasketballSnapshot {
  quarter: number;
  clockMs: number;
  clockRunning: boolean;
  started: boolean;
  homeScore: number;
  awayScore: number;
  homeTeamFoulsInQuarter: number;
  awayTeamFoulsInQuarter: number;
  playerFouls: Record<string, number>;
  onCourtHome: string[];
  onCourtAway: string[];
  timeoutsLeft: Record<string, number>;
  timeoutClockMs: number;
  timeoutRunning: boolean;
  timeoutTeamId?: string;
  inOvertime: boolean;
  periodScores: PeriodScore[];
  needsOvertimeDecision: boolean;
}

export interface VolleyballSetScore {
  home: number;
  away: number;
  winner: Side;
}

export interface VolleyballSanction {
  side: Side;
  level: "yellow" | "red";
}

export interface VolleyballSnapshot {
  currentSet: number;
  homeSetPoints: number;
  awaySetPoints: number;
  setsWonHome: number;
  setsWonAway: number;
  setHistory: VolleyballSetScore[];
  serveSide: Side;
  setOpeningServe: Side;
  timeoutsLeft: Record<string, number>;
  started: boolean;
  deuce: boolean;
  rotationHome: number[];
  rotationAway: number[];
  sanctions: VolleyballSanction[];
}

export interface TableTennisSetScore {
  home: number;
  away: number;
  winner: Side;
}

export interface TableTennisSnapshot {
  currentSet: number;
  homeSetPoints: number;
  awaySetPoints: number;
  setsWonHome: number;
  setsWonAway: number;
  setHistory: TableTennisSetScore[];
  serveSide: Side;
  setOpeningServe: Side;
  serveCount: number;
  started: boolean;
  deuce: boolean;
  endChangeHint: boolean;
  endChangeAtFiveDone: boolean;
}

export interface PitchSnapshot {
  period: number;
  clockMs: number;
  clockRunning: boolean;
  started: boolean;
  homeScore: number;
  awayScore: number;
  periodScores: PeriodScore[];
  yellowHome: number;
  yellowAway: number;
  redHome: number;
  redAway: number;
  teamFoulsHome: number;
  teamFoulsAway: number;
  inOvertime: boolean;
  needsOvertimeDecision: boolean;
}

export interface BaseballSnapshot {
  inning: number;
  half: "top" | "bottom";
  outs: number;
  started: boolean;
  homeScore: number;
  awayScore: number;
  inningScores: PeriodScore[];
}

export type SportSnapshot =
  | BasketballSnapshot
  | VolleyballSnapshot
  | TableTennisSnapshot
  | PitchSnapshot
  | BaseballSnapshot;

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  teamId?: string;
  playerId?: string;
  payload?: {
    points?: number;
    inPlayerId?: string;
    outPlayerId?: string;
    quarter?: number;
    reason?: string;
    targetEventId?: string;
    personalFouls?: number;
    teamFouls?: number;
    prevServeCount?: number;
    prevServeSide?: Side;
  };
  clockMs: number;
  quarter: number;
  createdAt: number;
  revoked: boolean;
}

export type ClubRole = "owner" | "operator" | "member";
export type ClubMemberStatus = "active" | "pending";
export type MemberGrade = "beginner" | "intermediate" | "advanced";
export type ClubChallengeStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";
export type RecurrenceKind = "weekly" | "monthlyNth" | "monthlyDate";
export type NthWeek = 1 | 2 | 3 | 4 | 5;
export type SessionStatus =
  | "draft"
  | "voting"
  | "confirming"
  | "matched"
  | "in_play"
  | "completed"
  | "cancelled";
export type VoteValue = "going" | "not_going" | "maybe" | "none";
export type SessionSide = "home" | "away" | "bench";
export type ClubSplitFormat = "5v5" | "4v4";
export type RallyClubFormat = "singles" | "doubles";
export type ClubSessionFormat = ClubSplitFormat | RallyClubFormat;

export interface Account {
  id: string;
  name: string;
}

export interface Club {
  id: string;
  name: string;
  sportId: SportId;
  venue?: string;
  inviteToken: string;
  ownerAccountId: string;
  seasonLabel: string;
  recurrenceKind?: RecurrenceKind;
  weekday?: number;
  weeklyTime?: string;
  nthWeek?: NthWeek;
  monthDay?: number;
}

export interface ClubMember {
  id: string;
  clubId: string;
  accountId: string;
  role: ClubRole;
  status: ClubMemberStatus;
  /** 기본 중급. 운영자가 지정. ELO 아님. */
  grade: MemberGrade;
}

export interface ClubSession {
  id: string;
  clubId: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  voteDeadlineLabel: string;
  status: SessionStatus;
  recurring: boolean;
  /** 농구 5v5/4v4. 배드민턴 singles/doubles. */
  format: ClubSessionFormat;
  matchId?: string;
}

export interface SessionVote {
  id: string;
  sessionId: string;
  accountId: string;
  value: VoteValue;
}

export interface SessionGuest {
  id: string;
  sessionId: string;
  name: string;
}

export interface SessionAssignment {
  id: string;
  sessionId: string;
  accountId?: string;
  guestId?: string;
  side: SessionSide;
}

export interface ClubChallenge {
  id: string;
  clubId: string;
  fromAccountId: string;
  toAccountId: string;
  status: ClubChallengeStatus;
  ladderMatchId?: string;
}

/** 보드 없는 멤버 대 멤버 전적. 대회 Match와 섞지 않는다. */
export interface ClubLadderMatch {
  id: string;
  clubId: string;
  challengeId?: string;
  homeAccountId: string;
  awayAccountId: string;
  homeScore: number;
  awayScore: number;
  winnerAccountId: string;
  dateLabel: string;
}

export interface Match {
  id: string;
  sportId: SportId;
  competitionId?: string;
  sessionId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel: string;
  awayLabel: string;
  homeColor: string;
  awayColor: string;
  roundLabel: string;
  status: MatchStatus;
  scheduledLabel: string;
  snapshot: SportSnapshot;
  events: MatchEvent[];
  winnerTeamId?: string;
  winnerLabel?: string;
  isFriendly: boolean;
  rules: SportRules;
}

export function isBasketballMatch(
  match: Match,
): match is Match & { sportId: "basketball"; snapshot: BasketballSnapshot; rules: BasketballRules } {
  return match.sportId === "basketball";
}

export function isVolleyballMatch(
  match: Match,
): match is Match & { sportId: "volleyball"; snapshot: VolleyballSnapshot; rules: VolleyballRules } {
  return match.sportId === "volleyball";
}

export function isTableTennisMatch(
  match: Match,
): match is Match & { sportId: "table-tennis"; snapshot: TableTennisSnapshot; rules: TableTennisRules } {
  return match.sportId === "table-tennis";
}

export function isRallySetSport(sportId: SportId): sportId is RallySetSportId {
  return sportId === "table-tennis" || sportId === "badminton" || sportId === "squash";
}

export function isSetSport(sportId: SportId): boolean {
  return sportId === "volleyball" || isRallySetSport(sportId);
}

export function isRallySetMatch(
  match: Match,
): match is Match & { sportId: RallySetSportId; snapshot: TableTennisSnapshot; rules: TableTennisRules } {
  return isRallySetSport(match.sportId);
}

export function isPitchSport(sportId: SportId): sportId is PitchSportId {
  return sportId === "soccer" || sportId === "futsal";
}

export function isPitchMatch(
  match: Match,
): match is Match & { sportId: PitchSportId; snapshot: PitchSnapshot; rules: PitchRules } {
  return isPitchSport(match.sportId);
}

export function isBaseballMatch(
  match: Match,
): match is Match & { sportId: "baseball"; snapshot: BaseballSnapshot; rules: BaseballRules } {
  return match.sportId === "baseball";
}

export interface AppData {
  competitions: Competition[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  brackets: BracketSlot[];
  accountId: string | null;
  accounts: Account[];
  clubs: Club[];
  clubMembers: ClubMember[];
  sessions: ClubSession[];
  sessionVotes: SessionVote[];
  sessionGuests: SessionGuest[];
  sessionAssignments: SessionAssignment[];
  challenges: ClubChallenge[];
  ladderMatches: ClubLadderMatch[];
}
