import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { VolleyballScoreboard } from "@/components/scoreboard/volleyball-board";

export default function VolleyballBoardScreen() {
  return (
    <SportBoardGuard sport="volleyball">
      <VolleyballScoreboard />
    </SportBoardGuard>
  );
}
