import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { HydrateGate } from "@/components/hydrate-gate";
import { ThemeProvider, useAppKit } from "@/components/theme-provider";
import { navOptionsForKit } from "@/theme/home-kits";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <HydrateGate>
      <ThemeProvider>
        <RootNav />
      </ThemeProvider>
    </HydrateGate>
  );
}

function RootNav() {
  const kit = useAppKit();
  return (
    <>
      <StatusBar style={kit.statusBar} />
      <Stack screenOptions={navOptionsForKit(kit)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="competition" options={{ headerShown: false }} />
        <Stack.Screen name="match" options={{ headerShown: false }} />
        <Stack.Screen name="club" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "시작" }} />
        <Stack.Screen name="friendly" options={{ title: "빠른 친선경기" }} />
        <Stack.Screen name="kit" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
