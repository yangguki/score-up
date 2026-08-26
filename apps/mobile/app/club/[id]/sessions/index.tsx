import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { sessionStatusLabel } from "@score-up/domain";
import { Card, H, P, Screen } from "@/components/ui";
import { sessionLine } from "@/lib/club-home";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ClubSessionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const allSessions = useAppStore((s) => s.sessions);
  const sessions = useMemo(() => allSessions.filter((row) => row.clubId === id), [allSessions, id]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>회차</H>
        {sessions.length === 0 ? <P muted>회차가 없습니다.</P> : null}
        {sessions.map((session) => (
          <Link key={session.id} href={`/club/${id}/sessions/${session.id}`} asChild>
            <Card>
              <P>
                {sessionLine(session)} · {sessionStatusLabel(session.status)}
              </P>
            </Card>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}
