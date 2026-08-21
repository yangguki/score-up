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

export interface SportPreset {
  id: string;
  sportId: SportId;
  scoringType: "timed_total";
  label: string;
  summary: string;
  official: boolean;
  rules: BasketballRules;
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
  snapshot: BasketballSnapshot;
  events: MatchEvent[];
  winnerTeamId?: string;
  winnerLabel?: string;
  isFriendly: boolean;
  rules: BasketballRules;
}

export interface AppData {
  competitions: Competition[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  brackets: BracketSlot[];
}
