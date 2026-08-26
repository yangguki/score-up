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

export type SportRules = BasketballRules | VolleyballRules;

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
  rules: BasketballRules;
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

export type SportSnapshot = BasketballSnapshot | VolleyballSnapshot;

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
  };
  clockMs: number;
  quarter: number;
  createdAt: number;
  revoked: boolean;
}

export interface Match {
  id: string;
  sportId: SportId;
  competitionId?: string;
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

export interface AppData {
  competitions: Competition[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  brackets: BracketSlot[];
}
