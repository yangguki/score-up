import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { navScreenOptions } from "@/theme/arena";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={navScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="competition" options={{ headerShown: false }} />
        <Stack.Screen name="match" options={{ headerShown: false }} />
        <Stack.Screen name="friendly" options={{ title: "빠른 친선경기" }} />
      </Stack>
    </>
  );
}
