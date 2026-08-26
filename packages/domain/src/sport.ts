import type { BasketballRules, SportId, SportRules, TableTennisRules, VolleyballRules } from "./types";
import { rulesSummary } from "./basketball";
import { tableTennisRulesSummary } from "./table-tennis";
import { volleyballRulesSummary } from "./volleyball";

export function sportRulesSummary(sportId: SportId, rules: SportRules): string {
  if (sportId === "basketball") return rulesSummary(rules as BasketballRules);
  if (sportId === "volleyball") return volleyballRulesSummary(rules as VolleyballRules);
  return tableTennisRulesSummary(rules as TableTennisRules);
}
