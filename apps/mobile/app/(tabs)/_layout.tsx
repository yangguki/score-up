import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { colors } from "@/theme/tokens";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
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
