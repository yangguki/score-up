export type SportId = "basketball" | "volleyball" | "table-tennis";

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
}

export interface TableTennisRules {
  setsToWin: number;
  setTarget: number;
  winBy: number;
  serveLimit: number;
  deuceServeLimit: number;
  changeEndsAt: number;
}

export type SportRules = BasketballRules | VolleyballRules | TableTennisRules;

export interface SportPreset {
  id: string;
  sportId: SportId;
  scoringType: "timed_total" | "set_target";
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

export type SportSnapshot = BasketballSnapshot | VolleyballSnapshot | TableTennisSnapshot;

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
  weekday?: number;
  weeklyTime?: string;
}

export interface ClubMember {
  id: string;
  clubId: string;
  accountId: string;
  role: ClubRole;
  status: ClubMemberStatus;
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
}
