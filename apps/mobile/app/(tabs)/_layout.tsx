import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { useUiPrefsStore } from "@/store/ui-prefs";
import { colors } from "@/theme/tokens";
import { lift } from "@/theme/lift";
import { play } from "@/theme/play";

export default function TabLayout() {
  const homeVersion = useUiPrefsStore((s) => s.homeVersion);
  const chrome =
    homeVersion === "h9"
      ? { bg: play.bg, line: play.line, muted: play.muted, active: play.navy }
      : homeVersion === "h8"
        ? { bg: lift.bg, line: lift.line, muted: lift.muted, active: lift.primary }
        : { bg: colors.bg, line: colors.line, muted: colors.muted, active: colors.primary };

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: chrome.bg,
          borderTopColor: chrome.line,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: chrome.active,
        tabBarInactiveTintColor: chrome.muted,
        tabBarLabelStyle: { fontWeight: "700", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "house.fill", android: "home", web: "home" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="competitions"
        options={{
          title: "대회",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "trophy.fill", android: "emoji-events", web: "trophy" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: "모임",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "person.3.fill", android: "groups", web: "group" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "gearshape.fill", android: "settings", web: "settings" }} tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
