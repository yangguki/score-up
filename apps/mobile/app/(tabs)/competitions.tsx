import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { Card, H, P, Pill, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function CompetitionsScreen() {
  const competitions = useAppStore((s) => s.competitions);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <P muted>생성된 대회 목록입니다.</P>
        {competitions.map((comp) => (
          <Link key={comp.id} href={`/competition/${comp.id}`} asChild>
            <Pressable>
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <H style={{ fontSize: 18 }}>{comp.name}</H>
                  <Pill label={comp.status === "completed" ? "종료" : "진행"} tone={comp.status === "completed" ? "ok" : "live"} />
                </View>
                <P muted style={{ marginTop: 6 }}>
                  농구 · {comp.format === "tournament" ? "토너먼트" : "리그"} · {comp.dateLabel}
                </P>
              </Card>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}
