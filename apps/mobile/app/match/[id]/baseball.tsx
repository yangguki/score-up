import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { BaseballScoreboard } from "@/components/scoreboard/baseball-board";

export default function BaseballBoardScreen() {
  return (
    <SportBoardGuard sport="baseball">
      <BaseballScoreboard />
    </SportBoardGuard>
  );
}
