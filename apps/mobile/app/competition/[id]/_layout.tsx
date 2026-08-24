import { Stack } from "expo-router";
import { navScreenOptions } from "@/theme/arena";

export default function CompetitionIdLayout() {
  return (
    <Stack screenOptions={navScreenOptions}>
      <Stack.Screen name="index" options={{ title: "대회" }} />
      <Stack.Screen name="roster" options={{ title: "참가 팀" }} />
      <Stack.Screen name="bracket" options={{ title: "대진표" }} />
      <Stack.Screen name="matches" options={{ title: "경기 목록" }} />
    </Stack>
  );
}
