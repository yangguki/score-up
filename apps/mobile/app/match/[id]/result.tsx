import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { isBasketballMatch, isVolleyballMatch } from "@score-up/domain";
import { Btn, H, P, Screen } from "@/components/ui";
import { matchDisplayScore } from "@/lib/home";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const competition = useAppStore((s) =>
    s.competitions.find((c) => c.id === match?.competitionId),
  );
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

  const score = matchDisplayScore(match);
  const periods = isBasketballMatch(match)
    ? match.snapshot.periodScores.map((row, i) => `Q${i + 1} ${row.home}-${row.away}`).join(" · ")
    : isVolleyballMatch(match)
      ? [
          `세트 ${match.snapshot.setsWonHome}-${match.snapshot.setsWonAway}`,
          ...match.snapshot.setHistory.map((row, i) => `S${i + 1} ${row.home}-${row.away}`),
        ].join(" · ")
      : "";
  const bracketLabel = competition?.format === "league" ? "순위표로" : "대진표로";

  return (
    <Screen style={{ padding: space.lg, gap: space.md }}>
      <P muted>{match.roundLabel}</P>
      <H>
        {match.homeLabel}  {score.home}  -  {score.away}  {match.awayLabel}
      </H>
      {periods ? <P muted>{periods}</P> : null}
      <P>승: {match.winnerLabel ?? "미정"}</P>
      {match.competitionId ? (
        <View style={{ gap: 10 }}>
          <Link href={`/competition/${match.competitionId}/bracket`} asChild>
            <Btn label={bracketLabel} />
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
