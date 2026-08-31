import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";
import { useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export default function TabLayout() {
  const kit = useAppKit();
  const nav = navOptionsForKit(kit);

  return (
    <Tabs
      screenOptions={{
        ...nav,
        tabBarStyle: {
          backgroundColor: kit.bg,
          borderTopColor: kit.line,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: kit.primary,
        tabBarInactiveTintColor: kit.muted,
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
