import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { formatClock, quarterLabel } from "@score-up/domain";
import { Btn, P, Screen } from "@/components/ui";
import { eventLine } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function TimelineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const undo = useAppStore((s) => s.undo);

  if (!match) {
    return (
      <Screen>
        <P>경기를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const rows = [...match.events].reverse();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: 4 }}>
        {rows.map((event) => (
          <View
            key={event.id}
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.line,
              opacity: event.revoked || event.type === "revoke" ? 0.45 : 1,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {quarterLabel(event.quarter, match.rules.periodCount)} {formatClock(event.clockMs)}
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                textDecorationLine: event.revoked ? "line-through" : "none",
              }}
            >
              {eventLine(event, players, match)}
            </Text>
          </View>
        ))}
        <Btn label="실행 취소" variant="ghost" onPress={() => undo(match.id)} />
      </ScrollView>
    </Screen>
  );
}
