import { Stack } from "expo-router";
import { useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export default function CompetitionIdLayout() {
  const kit = useAppKit();
  return (
    <Stack screenOptions={navOptionsForKit(kit)}>
      <Stack.Screen name="index" options={{ title: "대회" }} />
      <Stack.Screen name="rules" options={{ title: "룰" }} />
      <Stack.Screen name="roster" options={{ title: "참가 팀" }} />
      <Stack.Screen name="bracket" options={{ title: "대진표" }} />
      <Stack.Screen name="matches" options={{ title: "경기 목록" }} />
    </Stack>
  );
}
