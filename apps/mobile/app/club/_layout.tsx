import { Stack } from "expo-router";
import { navScreenOptions } from "@/theme/arena";

export default function ClubLayout() {
  return (
    <Stack screenOptions={navScreenOptions}>
      <Stack.Screen name="new" options={{ title: "모임 만들기" }} />
      <Stack.Screen name="join/[token]" options={{ title: "가입 요청" }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
