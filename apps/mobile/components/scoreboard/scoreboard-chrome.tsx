import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { P } from "@/components/ui";
import { colors } from "@/theme/tokens";

export function ScoreboardHeader({
  title,
  onLeave,
  onMore,
}: {
  title: string;
  onLeave: () => void;
  onMore: () => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
      <Pressable onPress={onLeave} style={{ minWidth: 56 }}>
        <P style={{ fontSize: 14 }}>나가기</P>
      </Pressable>
      <P muted numberOfLines={1} style={{ flex: 1, textAlign: "center", fontSize: 13 }}>
        {title}
      </P>
      <Pressable onPress={onMore} style={{ minWidth: 56, alignItems: "flex-end" }}>
        <P style={{ fontSize: 14 }}>더보기</P>
      </Pressable>
    </View>
  );
}

export function ScoreboardScrollBody({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: compact ? 6 : 12,
        gap: compact ? 8 : 14,
        justifyContent: compact ? "flex-start" : "center",
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

/** 보드용 작은 액션. 점수보다 작아야 한다. */
export function BoardKey({
  label,
  onPress,
  disabled,
  variant = "ghost",
  emphasize,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  emphasize?: boolean;
}) {
  const primary = variant === "primary" || emphasize;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: primary ? colors.primary : colors.surface2,
        opacity: disabled ? 0.35 : pressed ? 0.88 : 1,
        paddingVertical: primary ? 9 : 7,
        paddingHorizontal: primary ? 14 : 10,
        borderRadius: 8,
        minHeight: primary ? 38 : 34,
        minWidth: primary ? 64 : undefined,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: primary ? 0 : 1,
        borderColor: colors.line,
      })}
    >
      <Text
        style={{
          color: primary ? colors.primaryFg : colors.text,
          fontWeight: "800",
          fontSize: primary ? 14 : 12,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function scoreboardTeamsRow(stacked: boolean) {
  return {
    flexDirection: (stacked ? "column" : "row") as "column" | "row",
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: stacked ? 12 : 16,
    width: "100%" as const,
  };
}

export function scoreboardSideGap(compact: boolean) {
  return compact ? 4 : 8;
}

export { colors };
