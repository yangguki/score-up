import { SportPlaceholderBoard } from "@/components/scoreboard/sport-placeholder";
import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";

export default function TableTennisBoardScreen() {
  return (
    <SportBoardGuard sport="table-tennis">
      <SportPlaceholderBoard sport="table-tennis" />
    </SportBoardGuard>
  );
}
