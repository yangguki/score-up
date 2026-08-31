import { Pressable, Text, View } from "react-native";
import { useAppKit } from "@/components/theme-provider";
import { HOME_VERSIONS, useUiPrefsStore, type HomeVersion } from "@/store/ui-prefs";
import { lift } from "@/theme/lift";
import { arena } from "@/theme/arena";
import { play } from "@/theme/play";

export function HomeVersionSwitch({ tone }: { tone?: "dark" | "light" | "play" }) {
  const kit = useAppKit();
  const version = useUiPrefsStore((s) => s.homeVersion);
  const setHomeVersion = useUiPrefsStore((s) => s.setHomeVersion);
  const palette =
    tone === "dark"
      ? { bg: arena.surface2, line: arena.line, idle: arena.muted, ink: arena.text, on: arena.primary, onFg: arena.primaryFg }
      : tone === "play"
        ? { bg: play.surface2, line: play.line, idle: play.muted, ink: play.text, on: play.navy, onFg: play.navyFg }
        : tone === "light"
          ? { bg: lift.surface, line: lift.line, idle: lift.muted, ink: lift.text, on: lift.primary, onFg: lift.primaryFg }
          : { bg: kit.surface2, line: kit.line, idle: kit.muted, ink: kit.text, on: kit.primary, onFg: kit.primaryFg };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: palette.line,
        borderRadius: 999,
        padding: 3,
        gap: 3,
      }}
    >
      {HOME_VERSIONS.map((row) => {
        const on = version === row.id;
        return (
          <Pressable
            key={row.id}
            onPress={() => setHomeVersion(row.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: on ? palette.on : "transparent",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: on ? palette.onFg : palette.idle }}>{row.id.toUpperCase()}</Text>
            <Text style={{ fontSize: 9, fontWeight: "600", color: on ? palette.onFg : palette.ink, marginTop: 1 }}>{row.short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function HomeVersionHint({ version }: { version: HomeVersion }) {
  const row = HOME_VERSIONS.find((item) => item.id === version);
  return row?.note ?? "";
}
