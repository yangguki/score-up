import type { Href } from "expo-router";
import type { Match, SportId } from "@score-up/domain";

export const SPORT_BOARD_SEGMENT: Record<SportId, string> = {
  basketball: "basketball",
  volleyball: "volleyball",
  "table-tennis": "table-tennis",
};

export function scoreboardHref(match: Pick<Match, "id" | "sportId">): Href {
  return `/match/${match.id}/${SPORT_BOARD_SEGMENT[match.sportId]}` as Href;
}

export function sportLabel(sportId: SportId): string {
  switch (sportId) {
    case "basketball":
      return "농구";
    case "volleyball":
      return "배구";
    case "table-tennis":
      return "탁구";
  }
}
