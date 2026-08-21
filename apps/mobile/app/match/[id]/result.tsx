import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Btn, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const next = useAppStore((s) =>
    s.matches.find(
      (m) => m.competitionId === match?.competitionId && (m.status === "scheduled" || m.status === "lineup"),
    ),
  );

  if (!match) {
    return (
      <Screen>
        <P>경기를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const periods = match.snapshot.periodScores
    .map((row, i) => `Q${i + 1} ${row.home}-${row.away}`)
    .join(" · ");

  return (
    <Screen style={{ padding: space.lg, gap: space.md }}>
      <P muted>{match.roundLabel}</P>
      <H>
        {match.homeLabel}  {match.snapshot.homeScore}  -  {match.snapshot.awayScore}  {match.awayLabel}
      </H>
      {periods ? <P muted>{periods}</P> : null}
      <P>승: {match.winnerLabel ?? "미정"}</P>
      {match.competitionId ? (
        <View style={{ gap: 10 }}>
          <Link href={`/competition/${match.competitionId}/bracket`} asChild>
            <Btn label="대진표로" />
          </Link>
          {next ? (
            <Link href={`/match/${next.id}/lineup`} asChild>
              <Btn label="다음 경기" variant="ghost" />
            </Link>
          ) : null}
        </View>
      ) : (
        <Link href="/" asChild>
          <Btn label="홈으로" />
        </Link>
      )}
    </Screen>
  );
}
