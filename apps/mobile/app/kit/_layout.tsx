import { Stack } from "expo-router";
import { arena } from "@/theme/arena";
import { lift, liftNavScreenOptions } from "@/theme/lift";

export default function KitLayout() {
  return (
    <Stack
      screenOptions={{
        ...liftNavScreenOptions,
        headerBackTitle: "뒤로",
      }}
    >
      <Stack.Screen name="index" options={{ title: "디자인 키트" }} />
      <Stack.Screen
        name="arena"
        options={{
          title: "Arena 키트",
          headerStyle: { backgroundColor: arena.bg },
          headerTintColor: arena.text,
          contentStyle: { backgroundColor: arena.bg },
        }}
      />
      <Stack.Screen
        name="lift"
        options={{
          title: "Lift 키트",
          headerStyle: { backgroundColor: lift.bg },
          headerTintColor: lift.text,
          contentStyle: { backgroundColor: lift.bg },
        }}
      />
      <Stack.Screen
        name="play"
        options={{
          title: "Play 키트",
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#111827",
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      />
    </Stack>
  );
}
