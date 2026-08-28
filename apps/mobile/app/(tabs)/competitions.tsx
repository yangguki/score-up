import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Card, H, P, Pill, Screen, SectionHead } from "@/components/ui";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function CompetitionsScreen() {
  const competitions = useAppStore((s) => s.competitions);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <SectionHead title="내 대회" hint="생성된 대회 목록입니다." />
        {competitions.length === 0 ? (
          <P muted>아직 대회가 없습니다. 홈에서 대회를 만들어 보세요.</P>
        ) : null}
        {competitions.map((comp) => (
          <Link key={comp.id} href={`/competition/${comp.id}`} asChild>
            <Pressable>
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <H style={{ fontSize: 18, flex: 1 }}>{comp.name}</H>
                  <Pill
                    label={comp.status === "completed" ? "종료" : comp.status === "prep" ? "준비" : "진행"}
                    tone={comp.status === "completed" ? "ok" : comp.status === "prep" ? "muted" : "live"}
                  />
                </View>
                <P muted style={{ marginTop: 8 }}>
                  {sportLabel(comp.sportId)} · {comp.format === "tournament" ? "토너먼트" : "리그"} · {comp.dateLabel}
                </P>
              </Card>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}
