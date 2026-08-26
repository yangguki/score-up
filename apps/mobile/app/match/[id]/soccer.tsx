import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { PitchScoreboard } from "@/components/scoreboard/pitch-board";

export default function SoccerBoardScreen() {
  return (
    <SportBoardGuard sport="soccer">
      <PitchScoreboard />
    </SportBoardGuard>
  );
}
