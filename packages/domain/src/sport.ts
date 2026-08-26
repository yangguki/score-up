import type { BasketballRules, SportId, SportRules, TableTennisRules, VolleyballRules } from "./types";
import { BASKETBALL_CLUB_PRESET, rulesSummary } from "./basketball";
import { BADMINTON_CLUB_PRESET } from "./badminton";
import { SQUASH_CLUB_PRESET } from "./squash";
import { TABLE_TENNIS_CLUB_PRESET, tableTennisRulesSummary } from "./table-tennis";
import { VOLLEYBALL_CLUB_PRESET, volleyballRulesSummary } from "./volleyball";

export function sportRulesSummary(sportId: SportId, rules: SportRules): string {
  if (sportId === "basketball") return rulesSummary(rules as BasketballRules);
  if (sportId === "volleyball") return volleyballRulesSummary(rules as VolleyballRules);
  return tableTennisRulesSummary(rules as TableTennisRules);
}

export function clubRulesFor(sportId: SportId): SportRules {
  if (sportId === "volleyball") return VOLLEYBALL_CLUB_PRESET.rules;
  if (sportId === "table-tennis") return TABLE_TENNIS_CLUB_PRESET.rules;
  if (sportId === "badminton") return BADMINTON_CLUB_PRESET.rules;
  if (sportId === "squash") return SQUASH_CLUB_PRESET.rules;
  return BASKETBALL_CLUB_PRESET.rules;
}
