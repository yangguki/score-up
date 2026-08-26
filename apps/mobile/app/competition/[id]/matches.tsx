import { useMemo, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Card, H, P, Pill, Screen } from "@/components/ui";
import { matchClockLine, matchDisplayScore } from "@/lib/home";
import { matchHref, statusLabel } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

type Filter = "all" | "today" | "waiting" | "live" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "today", label: "오늘" },
  { id: "waiting", label: "대기" },
  { id: "live", label: "진행" },
  { id: "done", label: "종료" },
];

function matchesFilter(
  match: {
    status: string;
    scheduledLabel: string;
  },
  filter: Filter,
) {
  if (filter === "all") return true;
  if (filter === "today") return match.scheduledLabel.includes("오늘");
  if (filter === "waiting") return match.status === "scheduled" || match.status === "lineup";
  if (filter === "live") {
    return (
      match.status === "in_progress" ||
      match.status === "paused" ||
      match.status === "period_break" ||
      match.status === "confirm_period_end" ||
      match.status === "confirm_match_end"
    );
  }
  return match.status === "completed" || match.status === "forfeited" || match.status === "abandoned";
}

export default function MatchesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const allMatches = useAppStore((s) => s.matches);
  const matches = allMatches.filter((m) => m.competitionId === id);
  const [filter, setFilter] = useState<Filter>("all");
  const rows = useMemo(() => matches.filter((m) => matchesFilter(m, filter)), [matches, filter]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H style={{ fontSize: 18 }}>경기 목록</H>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {FILTERS.map((item) => (
            <Pressable key={item.id} onPress={() => setFilter(item.id)}>
              <Pill label={item.label} tone={filter === item.id ? "live" : "muted"} />
            </Pressable>
          ))}
        </View>
        {rows.length === 0 ? (
          <P muted>
            {matches.length === 0
              ? "경기가 없습니다. 대진을 만들면 여기에 나타납니다."
              : "이 필터에 해당하는 경기가 없습니다."}
          </P>
        ) : null}
        {rows.map((match) => {
          const score = matchDisplayScore(match);
          return (
            <Link key={match.id} href={matchHref(match)} asChild>
              <Pressable>
                <Card>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <P muted>
                      {match.scheduledLabel} · {match.roundLabel}
                    </P>
                    <Pill
                      label={statusLabel(match.status, match.sportId)}
                      tone={match.status === "in_progress" ? "live" : "muted"}
                    />
                  </View>
                  <H style={{ fontSize: 18, marginTop: 8 }}>
                    {match.homeLabel} vs {match.awayLabel}
                  </H>
                  {match.status === "scheduled" || match.status === "lineup" ? null : (
                    <P muted>
                      {score.home}-{score.away} · {matchClockLine(match)}
                    </P>
                  )}
                </Card>
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
