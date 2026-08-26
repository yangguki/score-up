import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { Card, H, P, Screen } from "@/components/ui";
import { matchDisplayScore } from "@/lib/home";
import { sessionLine } from "@/lib/club-home";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function RecordsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const allSessions = useAppStore((s) => s.sessions);
  const matches = useAppStore((s) => s.matches);
  const sessions = useMemo(
    () => allSessions.filter((row) => row.clubId === id && row.status === "completed"),
    [allSessions, id],
  );

  const rows = sessions
    .map((session) => ({ session, match: matches.find((row) => row.id === session.matchId) }))
    .filter((row) => row.match && (row.match.status === "completed" || row.match.status === "forfeited"))
    .sort((a, b) => b.session.dateLabel.localeCompare(a.session.dateLabel));

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>전적</H>
        {rows.length === 0 ? <P muted>끝난 회차 경기가 없습니다.</P> : null}
        {rows.map(({ session, match }) => {
          if (!match) return null;
          const score = matchDisplayScore(match);
          return (
            <Link key={session.id} href={`/match/${match.id}/result`} asChild>
              <Card>
                <P muted>{sessionLine(session)}</P>
                <H style={{ fontSize: 18, marginTop: 6 }}>
                  {match.homeLabel} {score.home} - {score.away} {match.awayLabel}
                </H>
                {match.winnerLabel ? <P muted>승 {match.winnerLabel}</P> : null}
              </Card>
            </Link>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
