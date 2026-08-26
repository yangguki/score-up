import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { TableTennisScoreboard } from "@/components/scoreboard/table-tennis-board";

export default function SquashBoardScreen() {
  return (
    <SportBoardGuard sport="squash">
      <TableTennisScoreboard />
    </SportBoardGuard>
  );
}
