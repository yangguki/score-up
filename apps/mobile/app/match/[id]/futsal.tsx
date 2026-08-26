import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { PitchScoreboard } from "@/components/scoreboard/pitch-board";

export default function FutsalBoardScreen() {
  return (
    <SportBoardGuard sport="futsal">
      <PitchScoreboard />
    </SportBoardGuard>
  );
}
