import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { HomeVersionBar } from "@/components/home/version-bar";
import { HomeV1 } from "@/components/home/home-v1";
import { HomeV2 } from "@/components/home/home-v2";
import { HomeV3 } from "@/components/home/home-v3";
import { HomeH1 } from "@/components/home/home-h1";
import { HomeH2 } from "@/components/home/home-h2";
import { HomeH3 } from "@/components/home/home-h3";
import { HomeH4 } from "@/components/home/home-h4";
import { HomeH5 } from "@/components/home/home-h5";
import { HomeH6 } from "@/components/home/home-h6";
import { HomeH7 } from "@/components/home/home-h7";
import { buildHomeModel, type HomeVersion } from "@/lib/home";
import { useAppStore } from "@/store/app-store";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

function HomeBody({ version, model }: { version: HomeVersion; model: ReturnType<typeof buildHomeModel> }) {
  switch (version) {
    case "v2":
      return <HomeV2 model={model} />;
    case "v3":
      return <HomeV3 model={model} />;
    case "h1":
      return <HomeH1 model={model} />;
    case "h2":
      return <HomeH2 model={model} />;
    case "h3":
      return <HomeH3 model={model} />;
    case "h4":
      return <HomeH4 model={model} />;
    case "h5":
      return <HomeH5 model={model} />;
    case "h6":
      return <HomeH6 model={model} />;
    case "h7":
      return <HomeH7 model={model} />;
    default:
      return <HomeV1 model={model} />;
  }
}

export default function HomeScreen() {
  const competitions = useAppStore((s) => s.competitions);
  const matches = useAppStore((s) => s.matches);
  const homeVersion = useAppStore((s) => s.homeVersion);
  const homeEmptyPreview = useAppStore((s) => s.homeEmptyPreview);
  const setHomeVersion = useAppStore((s) => s.setHomeVersion);
  const setHomeEmptyPreview = useAppStore((s) => s.setHomeEmptyPreview);
  const model = buildHomeModel(competitions, matches, homeEmptyPreview);
  const kit = HOME_KITS[homeVersion];

  return (
    <View style={{ flex: 1, backgroundColor: kit.bg }}>
      <StatusBar style={kit.statusBar} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm }}>
          <HomeVersionBar
            version={homeVersion}
            emptyPreview={homeEmptyPreview}
            onVersion={setHomeVersion}
            onEmptyPreview={setHomeEmptyPreview}
          />
        </View>
        <HomeBody version={homeVersion} model={model} />
      </SafeAreaView>
    </View>
  );
}
