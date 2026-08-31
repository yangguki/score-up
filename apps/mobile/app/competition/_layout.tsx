import { Stack } from "expo-router";
import { useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export default function CompetitionLayout() {
  const kit = useAppKit();
  return (
    <Stack screenOptions={navOptionsForKit(kit)}>
      <Stack.Screen name="new" options={{ title: "대회 만들기" }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
