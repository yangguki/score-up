import { SportPlaceholderBoard } from "@/components/scoreboard/sport-placeholder";
import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";

export default function VolleyballBoardScreen() {
  return (
    <SportBoardGuard sport="volleyball">
      <SportPlaceholderBoard sport="volleyball" />
    </SportBoardGuard>
  );
}
