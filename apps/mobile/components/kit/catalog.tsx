import { type ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { arena } from "@/theme/arena";
import { space } from "@/theme/tokens";

export function CatalogSection({
  title,
  hint,
  children,
  dark,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  dark?: boolean;
}) {
  const muted = dark ? arena.muted : "#5A7190";
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", color: muted }}>
          {title}
        </Text>
        {hint ? <Text style={{ fontSize: 13, lineHeight: 19, color: muted }}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function Swatch({ color, label, dark }: { color: string; label: string; dark?: boolean }) {
  return (
    <View style={{ width: "31%", minWidth: 96, flexGrow: 1, gap: 6 }}>
      <View
        style={{
          height: 52,
          borderRadius: 14,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: dark ? arena.line : "rgba(12,27,46,0.08)",
        }}
      />
      <Text style={{ fontSize: 11, fontWeight: "700", color: dark ? arena.text : "#0C1B2E" }}>{label}</Text>
      <Text style={{ fontSize: 10, color: dark ? arena.muted : "#5A7190" }}>{color}</Text>
    </View>
  );
}

export function CatalogNote({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: dark ? arena.surface : "#FFFFFF",
        borderWidth: 1,
        borderColor: dark ? arena.line : "rgba(47,128,237,0.16)",
        borderRadius: 16,
        padding: space.md,
      }}
    >
      <Text style={{ fontSize: 14, lineHeight: 21, color: dark ? arena.text : "#0C1B2E", fontWeight: "600" }}>{children}</Text>
    </View>
  );
}

export function CatalogRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{children}</View>;
}

export function CopyChip({ value }: { value: string }) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: "rgba(47,128,237,0.08)",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: "#2F80ED" }}>{value}</Text>
    </View>
  );
}

export function CatalogScreen({
  bg,
  children,
}: {
  bg: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 64 }}
    >
      {children}
    </ScrollView>
  );
}

export function PreviewPress({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: "700", color: "#2F80ED" }}>{label}</Text>
    </Pressable>
  );
}
