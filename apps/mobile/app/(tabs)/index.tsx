import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { HomeH1 } from "@/components/home/home-h1";
import { buildHomeModel } from "@/lib/home";
import { useAppStore } from "@/store/app-store";
import { arena } from "@/theme/tokens";

export default function HomeScreen() {
  const competitions = useAppStore((s) => s.competitions);
  const matches = useAppStore((s) => s.matches);
  const model = buildHomeModel(competitions, matches);

  return (
    <View style={{ flex: 1, backgroundColor: arena.bg }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <HomeH1 model={model} />
      </SafeAreaView>
    </View>
  );
}
