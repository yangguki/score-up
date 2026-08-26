import type {
  BaseballRules,
  BasketballRules,
  PitchRules,
  PitchSportId,
  SportId,
  SportRules,
  TableTennisRules,
  VolleyballRules,
} from "./types";
import { BASKETBALL_CLUB_PRESET, rulesSummary } from "./basketball";
import { BADMINTON_CLUB_PRESET } from "./badminton";
import { BASEBALL_CLUB_PRESET, baseballRulesSummary } from "./baseball";
import { FUTSAL_CLUB_PRESET, pitchRulesSummary, SOCCER_CLUB_PRESET } from "./pitch";
import { SQUASH_CLUB_PRESET } from "./squash";
import { TABLE_TENNIS_CLUB_PRESET, tableTennisRulesSummary } from "./table-tennis";
import { VOLLEYBALL_CLUB_PRESET, volleyballRulesSummary } from "./volleyball";

export const ALL_SPORT_IDS: SportId[] = [
  "basketball",
  "volleyball",
  "table-tennis",
  "soccer",
  "baseball",
  "badminton",
  "squash",
  "futsal",
];

export function isSportId(value: string | undefined): value is SportId {
  return !!value && (ALL_SPORT_IDS as string[]).includes(value);
}

export function sportRulesSummary(sportId: SportId, rules: SportRules): string {
  if (sportId === "basketball") return rulesSummary(rules as BasketballRules);
  if (sportId === "volleyball") return volleyballRulesSummary(rules as VolleyballRules);
  if (sportId === "soccer" || sportId === "futsal") {
    return pitchRulesSummary(rules as PitchRules, sportId as PitchSportId);
  }
  if (sportId === "baseball") return baseballRulesSummary(rules as BaseballRules);
  return tableTennisRulesSummary(rules as TableTennisRules);
}

export function clubRulesFor(sportId: SportId): SportRules {
  if (sportId === "volleyball") return VOLLEYBALL_CLUB_PRESET.rules;
  if (sportId === "table-tennis") return TABLE_TENNIS_CLUB_PRESET.rules;
  if (sportId === "badminton") return BADMINTON_CLUB_PRESET.rules;
  if (sportId === "squash") return SQUASH_CLUB_PRESET.rules;
  if (sportId === "soccer") return SOCCER_CLUB_PRESET.rules;
  if (sportId === "futsal") return FUTSAL_CLUB_PRESET.rules;
  if (sportId === "baseball") return BASEBALL_CLUB_PRESET.rules;
  return BASKETBALL_CLUB_PRESET.rules;
}
