import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { TableTennisScoreboard } from "@/components/scoreboard/table-tennis-board";

export default function TableTennisBoardScreen() {
  return (
    <SportBoardGuard sport="table-tennis">
      <TableTennisScoreboard />
    </SportBoardGuard>
  );
}
