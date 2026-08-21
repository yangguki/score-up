import { Redirect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { P } from "@/components/ui";
import { scoreboardHref } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export default function ScoreboardAliasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));

  if (!match) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 }}>
        <P>경기를 찾을 수 없습니다.</P>
      </View>
    );
  }

  return <Redirect href={scoreboardHref(match)} />;
}
