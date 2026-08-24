import { Stack } from "expo-router";
import { navScreenOptions } from "@/theme/arena";

export default function MatchIdLayout() {
  return (
    <Stack screenOptions={navScreenOptions}>
      <Stack.Screen name="lineup" options={{ title: "출전 명단" }} />
      <Stack.Screen name="scoreboard" options={{ headerShown: false }} />
      <Stack.Screen name="basketball" options={{ headerShown: false, title: "농구 스코어보드" }} />
      <Stack.Screen name="volleyball" options={{ headerShown: false, title: "배구 스코어보드" }} />
      <Stack.Screen name="table-tennis" options={{ headerShown: false, title: "탁구 스코어보드" }} />
      <Stack.Screen name="timeline" options={{ title: "타임라인" }} />
      <Stack.Screen name="result" options={{ title: "결과" }} />
    </Stack>
  );
}
