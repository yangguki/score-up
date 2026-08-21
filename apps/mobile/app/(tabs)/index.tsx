import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { bonusFor, formatClock, quarterLabel, rulesSummary } from "@score-up/domain";
import { Btn, Card, H, P, Pill, Screen } from "@/components/ui";
import { matchHref, statusLabel } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function HomeScreen() {
  const competitions = useAppStore((s) => s.competitions);
  const matches = useAppStore((s) => s.matches);
  const live = matches.filter(
    (m) =>
      m.status === "in_progress" ||
      m.status === "paused" ||
      m.status === "confirm_period_end" ||
      m.status === "confirm_match_end",
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <H>SCORE UP</H>
        <P muted>종목 룰로 경기를 끝까지 운영합니다. mock 데이터 · 농구만.</P>

        <H style={{ fontSize: 16, marginTop: 8 }}>진행 중</H>
        {live.length === 0 ? (
          <P muted>진행 중인 경기가 없습니다.</P>
        ) : (
          live.map((match) => (
            <Link key={match.id} href={matchHref(match)} asChild>
              <Pressable>
                <Card>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <P muted>
                      {match.roundLabel} · {quarterLabel(match.snapshot.quarter, match.rules.periodCount)}{" "}
                      {formatClock(match.snapshot.clockMs)}
                    </P>
                    <Pill label={statusLabel(match.status)} tone="live" />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                    <H>
                      {match.homeLabel}  {match.snapshot.homeScore}
                    </H>
                    <H>
                      {match.snapshot.awayScore}  {match.awayLabel}
                    </H>
                  </View>
                  {bonusFor(match.snapshot, "home", match.rules) || bonusFor(match.snapshot, "away", match.rules) ? (
                    <P muted style={{ marginTop: 8 }}>
                      보너스 상황
                    </P>
                  ) : null}
                </Card>
              </Pressable>
            </Link>
          ))
        )}

        <H style={{ fontSize: 16, marginTop: 8 }}>내 대회</H>
        {competitions.map((comp) => {
          const leftover = matches.filter((m) => m.competitionId === comp.id && m.status !== "completed" && m.status !== "forfeited").length;
          return (
            <Link key={comp.id} href={`/competition/${comp.id}`} asChild>
              <Pressable>
                <Card>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <H style={{ fontSize: 18 }}>{comp.name}</H>
                    <Pill label="농구" tone="home" />
                  </View>
                  <P muted style={{ marginTop: 6 }}>
                    {rulesSummary(comp.rules)}
                  </P>
                  <P muted>남은 경기 {leftover} · {comp.dateLabel}</P>
                </Card>
              </Pressable>
            </Link>
          );
        })}

        <Link href="/competition/new" asChild>
          <Btn label="대회 만들기" />
        </Link>
        <Link href="/friendly" asChild>
          <Btn label="빠른 친선경기" variant="ghost" />
        </Link>
      </ScrollView>
    </Screen>
  );
}
