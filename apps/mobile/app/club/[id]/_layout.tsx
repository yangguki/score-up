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
      <Stack.Screen name="sessions/[sid]/bout" options={{ title: "한 판 열기" }} />
      <Stack.Screen name="ranking" options={{ title: "랭킹" }} />
      <Stack.Screen name="records" options={{ title: "전적" }} />
      <Stack.Screen name="challenges/index" options={{ title: "도전" }} />
      <Stack.Screen name="challenges/new" options={{ title: "도전 보내기" }} />
      <Stack.Screen name="ladder/new" options={{ title: "결과 넣기" }} />
      <Stack.Screen name="settings" options={{ title: "모임 설정" }} />
    </Stack>
  );
}
