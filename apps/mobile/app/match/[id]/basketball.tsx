import { BasketballScoreboard } from "@/components/scoreboard/basketball-board";
import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";

export default function BasketballBoardScreen() {
  return (
    <SportBoardGuard sport="basketball">
      <BasketballScoreboard />
    </SportBoardGuard>
  );
}
