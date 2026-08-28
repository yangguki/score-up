import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { play } from "@/theme/play";

export type PlayDockTab = "sports" | "activity";

export function PlayDock({ tab, onChange }: { tab: PlayDockTab; onChange: (tab: PlayDockTab) => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: play.line,
        backgroundColor: play.surface,
        shadowColor: "#0F172A",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <DockItem
        active={tab === "sports"}
        label="스포츠"
        onPress={() => onChange("sports")}
        icon={<SportsMark on={tab === "sports"} />}
      />
      <DockItem
        active={tab === "activity"}
        label="최근 활동"
        onPress={() => onChange("activity")}
        icon={<ClockMark on={tab === "activity"} />}
      />
    </View>
  );
}

function DockItem({
  active,
  label,
  onPress,
  icon,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  icon: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 58,
        backgroundColor: active ? play.navy : "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 8,
      }}
    >
      {icon}
      <Text style={{ fontSize: 12, fontWeight: "800", color: active ? "#FFFFFF" : play.muted }}>{label}</Text>
    </Pressable>
  );
}

function SportsMark({ on }: { on: boolean }) {
  const c = on ? "#FFFFFF" : play.muted;
  return (
    <View style={{ width: 22, height: 22, flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
      <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
      <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
      <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
      <View style={{ width: 9, height: 9, borderRadius: 2, borderWidth: 1.5, borderColor: c, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c, fontSize: 8, fontWeight: "900", marginTop: -1 }}>+</Text>
      </View>
    </View>
  );
}

function ClockMark({ on }: { on: boolean }) {
  const c = on ? "#FFFFFF" : play.muted;
  return (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 2, height: 6, backgroundColor: c, borderRadius: 1, marginBottom: 2 }} />
      <View style={{ position: "absolute", width: 5, height: 2, backgroundColor: c, right: 4, top: 10, borderRadius: 1 }} />
    </View>
  );
}
