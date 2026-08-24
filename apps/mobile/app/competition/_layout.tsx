import { Stack } from "expo-router";
import { navScreenOptions } from "@/theme/arena";

export default function CompetitionLayout() {
  return (
    <Stack screenOptions={navScreenOptions}>
      <Stack.Screen name="new" options={{ title: "대회 만들기" }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
