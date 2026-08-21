import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0B0E13" },
          headerTintColor: "#F5F7FA",
          contentStyle: { backgroundColor: "#0B0E13" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="competition" options={{ headerShown: false }} />
        <Stack.Screen name="match" options={{ headerShown: false }} />
        <Stack.Screen name="friendly" options={{ title: "빠른 친선경기" }} />
      </Stack>
    </ThemeProvider>
  );
}
