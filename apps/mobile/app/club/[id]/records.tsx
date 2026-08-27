import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { accountName } from "@score-up/domain";
import { Card, H, P, Screen } from "@/components/ui";
import { matchDisplayScore } from "@/lib/home";
import { sessionLine } from "@/lib/club-home";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function RecordsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accounts = useAppStore((s) => s.accounts);
  const allSessions = useAppStore((s) => s.sessions);
  const matches = useAppStore((s) => s.matches);
  const ladderMatches = useAppStore((s) => s.ladderMatches);
  const sessions = useMemo(
    () => allSessions.filter((row) => row.clubId === id && row.status === "completed"),
    [allSessions, id],
  );

  const sessionRows = sessions
    .map((session) => ({ session, match: matches.find((row) => row.id === session.matchId) }))
    .filter((row) => row.match && (row.match.status === "completed" || row.match.status === "forfeited"))
    .sort((a, b) => b.session.dateLabel.localeCompare(a.session.dateLabel));

  const ladderRows = useMemo(
    () =>
      ladderMatches
        .filter((row) => row.clubId === id)
        .slice()
        .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel)),
    [ladderMatches, id],
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>전적</H>
        {sessionRows.length === 0 && ladderRows.length === 0 ? <P muted>끝난 경기가 없습니다.</P> : null}
        {ladderRows.length ? <H style={{ fontSize: 18 }}>급수 경기</H> : null}
        {ladderRows.map((row) => (
          <Card key={row.id}>
            <P muted>{row.dateLabel} · 급수</P>
            <H style={{ fontSize: 18, marginTop: 6 }}>
              {accountName(accounts, row.homeAccountId)} {row.homeScore} - {row.awayScore}{" "}
              {accountName(accounts, row.awayAccountId)}
            </H>
            <P muted>승 {accountName(accounts, row.winnerAccountId)}</P>
          </Card>
        ))}
        {sessionRows.length ? <H style={{ fontSize: 18 }}>회차</H> : null}
        {sessionRows.map(({ session, match }) => {
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
