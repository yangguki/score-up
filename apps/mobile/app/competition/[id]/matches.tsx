import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { formatClock, quarterLabel } from "@score-up/domain";
import { Card, H, P, Pill, Screen } from "@/components/ui";
import { matchHref, statusLabel } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function MatchesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const allMatches = useAppStore((s) => s.matches);
  const matches = allMatches.filter((m) => m.competitionId === id);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        {matches.map((match) => (
          <Link key={match.id} href={matchHref(match)} asChild>
            <Pressable>
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <P muted>
                    {match.scheduledLabel} · {match.roundLabel}
                  </P>
                  <Pill label={statusLabel(match.status)} tone={match.status === "in_progress" ? "live" : "muted"} />
                </View>
                <H style={{ fontSize: 18, marginTop: 8 }}>
                  {match.homeLabel} vs {match.awayLabel}
                </H>
                {match.status !== "scheduled" ? (
                  <P muted>
                    {match.snapshot.homeScore}-{match.snapshot.awayScore}{" "}
                    {quarterLabel(match.snapshot.quarter, match.rules.periodCount)} {formatClock(match.snapshot.clockMs)}
                  </P>
                ) : null}
              </Card>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}
