import { Stack } from "expo-router";
import { useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export default function ClubLayout() {
  const kit = useAppKit();
  return (
    <Stack screenOptions={navOptionsForKit(kit)}>
      <Stack.Screen name="new" options={{ title: "모임 만들기" }} />
      <Stack.Screen name="join/[token]" options={{ title: "가입 요청" }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
