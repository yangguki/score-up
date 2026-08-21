import { Stack } from "expo-router";

export default function MatchLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0B0E13" },
        headerTintColor: "#F5F7FA",
        contentStyle: { backgroundColor: "#0B0E13" },
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
