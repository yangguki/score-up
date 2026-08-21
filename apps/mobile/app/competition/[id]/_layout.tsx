import { Stack } from "expo-router";

export default function CompetitionIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0B0E13" },
        headerTintColor: "#F5F7FA",
        contentStyle: { backgroundColor: "#0B0E13" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "대회" }} />
      <Stack.Screen name="roster" options={{ title: "참가 팀" }} />
      <Stack.Screen name="bracket" options={{ title: "대진표" }} />
      <Stack.Screen name="matches" options={{ title: "경기 목록" }} />
    </Stack>
  );
}
