import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Btn, Card, H, P, Pill, Screen } from "@/components/ui";
import { matchHref, statusLabel } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function BracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const allTeams = useAppStore((s) => s.teams);
  const allSlots = useAppStore((s) => s.brackets);
  const matches = useAppStore((s) => s.matches);
  const teams = allTeams.filter((t) => t.competitionId === id);
  const slots = allSlots.filter((b) => b.competitionId === id);
  const makeBracket = useAppStore((s) => s.makeBracket);

  const nameOf = (teamId?: string) => teams.find((t) => t.id === teamId)?.name ?? (teamId ? "" : "—");

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        {slots.length === 0 ? (
          <>
            <P muted>참가 {teams.length}팀. 2팀 이상이면 대진을 만들 수 있습니다.</P>
            <Btn label="대진 생성" disabled={teams.length < 2} onPress={() => makeBracket(id!)} />
          </>
        ) : null}
        {["sf", "final", "champion"].map((round) => {
          const rows = slots.filter((s) => s.round === round);
          if (rows.length === 0) return null;
          return (
            <View key={round} style={{ gap: 8 }}>
              <H style={{ fontSize: 16 }}>{round === "sf" ? "4강" : round === "final" ? "결승" : "우승"}</H>
              {rows.map((slot) => {
                const match = matches.find((m) => m.id === slot.matchId);
                return (
                  <Link key={slot.id} href={match ? matchHref(match) : `/competition/${id}`} asChild>
                    <Pressable>
                      <Card>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <P>
                            {slot.bye ? `${nameOf(slot.homeTeamId)} · BYE` : `${nameOf(slot.homeTeamId) || match?.homeLabel || "대기"} vs ${nameOf(slot.awayTeamId) || match?.awayLabel || "대기"}`}
                          </P>
                          {match ? <Pill label={statusLabel(match.status)} tone={match.status === "in_progress" ? "live" : "muted"} /> : null}
                        </View>
                        {match && (match.status === "in_progress" || match.status === "completed") ? (
                          <H style={{ fontSize: 20, marginTop: 8 }}>
                            {match.snapshot.homeScore} - {match.snapshot.awayScore}
                          </H>
                        ) : null}
                        {match?.winnerLabel ? <P muted>승 {match.winnerLabel}</P> : null}
                      </Card>
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
