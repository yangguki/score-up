import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { rulesSummary } from "@score-up/domain";
import { Btn, Card, H, P, Pill, Screen, SectionHead } from "@/components/ui";
import { matchHref, statusLabel } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function CompetitionOverview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === id));
  const allTeams = useAppStore((s) => s.teams);
  const allMatches = useAppStore((s) => s.matches);
  const teams = allTeams.filter((t) => t.competitionId === id);
  const matches = allMatches.filter((m) => m.competitionId === id);
  const next = matches.find((m) => m.status === "scheduled" || m.status === "lineup");
  const done = matches.filter((m) => m.status === "completed" || m.status === "forfeited").length;

  if (!competition) {
    return (
      <Screen>
        <P>대회를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pill label="농구" tone="home" />
          <Pill
            label={competition.status === "prep" ? "준비" : competition.status === "completed" ? "종료" : "진행"}
            tone={competition.status === "completed" ? "ok" : competition.status === "prep" ? "muted" : "live"}
          />
        </View>
        <SectionHead title={competition.name} hint={rulesSummary(competition.rules)} />
        <P muted>
          종료 {done} / {matches.length || 0} · 참가 팀 {teams.length}
        </P>
        {next ? (
          <Card>
            <P muted>다음 경기</P>
            <H style={{ fontSize: 18, marginTop: 6 }}>
              {next.homeLabel} vs {next.awayLabel}
            </H>
            <Link href={matchHref(next)} asChild>
              <Btn label="경기 열기" style={{ marginTop: 12 }} />
            </Link>
          </Card>
        ) : null}
        {teams.length === 0 ? <P>참가 팀/선수를 등록하세요.</P> : null}
        <Link href={`/competition/${id}/roster`} asChild>
          <Btn label="참가 관리" variant="ghost" />
        </Link>
        <Link href={`/competition/${id}/bracket`} asChild>
          <Btn label="대진 보기" variant="ghost" />
        </Link>
        <Link href={`/competition/${id}/matches`} asChild>
          <Btn label="경기 목록" variant="ghost" />
        </Link>
      </ScrollView>
    </Screen>
  );
}
