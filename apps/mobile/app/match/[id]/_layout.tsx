import { Stack } from "expo-router";
import { useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export default function MatchIdLayout() {
  const kit = useAppKit();
  return (
    <Stack screenOptions={navOptionsForKit(kit)}>
      <Stack.Screen name="lineup" options={{ title: "출전 명단" }} />
      <Stack.Screen name="scoreboard" options={{ headerShown: false }} />
      <Stack.Screen name="basketball" options={{ headerShown: false, title: "농구 스코어보드" }} />
      <Stack.Screen name="volleyball" options={{ headerShown: false, title: "배구 스코어보드" }} />
      <Stack.Screen name="table-tennis" options={{ headerShown: false, title: "탁구 스코어보드" }} />
      <Stack.Screen name="badminton" options={{ headerShown: false, title: "배드민턴 스코어보드" }} />
      <Stack.Screen name="squash" options={{ headerShown: false, title: "스쿼시 스코어보드" }} />
      <Stack.Screen name="soccer" options={{ headerShown: false, title: "축구 스코어보드" }} />
      <Stack.Screen name="futsal" options={{ headerShown: false, title: "풋살 스코어보드" }} />
      <Stack.Screen name="baseball" options={{ headerShown: false, title: "야구 스코어보드" }} />
      <Stack.Screen name="timeline" options={{ title: "타임라인" }} />
      <Stack.Screen name="result" options={{ title: "결과" }} />
    </Stack>
  );
}
