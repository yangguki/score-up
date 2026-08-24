import { Stack } from "expo-router";
import { navScreenOptions } from "@/theme/arena";

export default function MatchLayout() {
  return (
    <Stack screenOptions={navScreenOptions}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
