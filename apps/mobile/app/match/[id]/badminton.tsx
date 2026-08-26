import { SportBoardGuard } from "@/components/scoreboard/sport-board-guard";
import { TableTennisScoreboard } from "@/components/scoreboard/table-tennis-board";

export default function BadmintonBoardScreen() {
  return (
    <SportBoardGuard sport="badminton">
      <TableTennisScoreboard />
    </SportBoardGuard>
  );
}
