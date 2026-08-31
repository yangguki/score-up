import { Stack } from "expo-router";
import { useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export default function MatchLayout() {
  const kit = useAppKit();
  return (
    <Stack screenOptions={navOptionsForKit(kit)}>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
