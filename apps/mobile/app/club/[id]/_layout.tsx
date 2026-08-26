import { Stack } from "expo-router";
import { navScreenOptions } from "@/theme/arena";

export default function ClubIdLayout() {
  return (
    <Stack screenOptions={navScreenOptions}>
      <Stack.Screen name="index" options={{ title: "모임" }} />
      <Stack.Screen name="members" options={{ title: "멤버" }} />
      <Stack.Screen name="sessions/index" options={{ title: "회차" }} />
      <Stack.Screen name="sessions/new" options={{ title: "회차 만들기" }} />
      <Stack.Screen name="sessions/[sid]/index" options={{ title: "회차" }} />
      <Stack.Screen name="sessions/[sid]/split" options={{ title: "팀 나누기" }} />
      <Stack.Screen name="ranking" options={{ title: "랭킹" }} />
      <Stack.Screen name="records" options={{ title: "전적" }} />
      <Stack.Screen name="settings" options={{ title: "모임 설정" }} />
    </Stack>
  );
}
