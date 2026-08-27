import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { accountName, computeClubRanking, groupClubRanking } from "@score-up/domain";
import { Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

function rate(value: number | null) {
  if (value === null) return "—";
  return `.${String(Math.round(value * 1000)).padStart(3, "0")}`;
}

export default function RankingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const club = useAppStore((s) => s.clubs.find((row) => row.id === id));
  const accounts = useAppStore((s) => s.accounts);
  const clubMembers = useAppStore((s) => s.clubMembers);
  const allSessions = useAppStore((s) => s.sessions);
  const allMatches = useAppStore((s) => s.matches);
  const assignments = useAppStore((s) => s.sessionAssignments);
  const ladderMatches = useAppStore((s) => s.ladderMatches);
  const members = useMemo(
    () => clubMembers.filter((row) => row.clubId === id && row.status === "active"),
    [clubMembers, id],
  );
  const sessions = useMemo(() => allSessions.filter((row) => row.clubId === id), [allSessions, id]);
  const sessionIds = useMemo(() => new Set(sessions.map((row) => row.id)), [sessions]);
  const matches = useMemo(
    () => allMatches.filter((row) => row.sessionId && sessionIds.has(row.sessionId)),
    [allMatches, sessionIds],
  );
  const rows = computeClubRanking(
    members.map((row) => ({
      accountId: row.accountId,
      name: accountName(accounts, row.accountId),
      grade: row.grade,
    })),
    matches,
    assignments,
    ladderMatches.filter((row) => row.clubId === id),
  );
  const groups = groupClubRanking(rows);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>랭킹</H>
        <P muted>시즌 {club?.seasonLabel ?? "2026"} · 회차 경기와 급수 경기가 반영됩니다</P>
        {groups.map((group) => (
          <Card key={group.grade}>
            <H style={{ fontSize: 18, marginBottom: 8 }}>{group.label}</H>
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <P muted style={{ width: 28 }}>
                #
              </P>
              <P muted style={{ flex: 1 }}>
                이름
              </P>
              <P muted style={{ width: 28, textAlign: "right" }}>
                승
              </P>
              <P muted style={{ width: 28, textAlign: "right" }}>
                패
              </P>
              <P muted style={{ width: 48, textAlign: "right" }}>
                승률
              </P>
              <P muted style={{ width: 36, textAlign: "right" }}>
                경기
              </P>
            </View>
            {group.rows.map((row) => (
              <View key={row.accountId} style={{ flexDirection: "row", paddingVertical: 6 }}>
                <P style={{ width: 28 }}>{row.rank}</P>
                <P style={{ flex: 1 }}>{row.name}</P>
                <P style={{ width: 28, textAlign: "right" }}>{row.wins}</P>
                <P style={{ width: 28, textAlign: "right" }}>{row.losses}</P>
                <P style={{ width: 48, textAlign: "right" }}>{rate(row.winRate)}</P>
                <P style={{ width: 36, textAlign: "right" }}>{row.played}</P>
              </View>
            ))}
          </Card>
        ))}
        <P muted>회차 경기와 급수 경기가 반영됩니다</P>
      </ScrollView>
    </Screen>
  );
}
