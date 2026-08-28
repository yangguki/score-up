import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { accountName } from "@score-up/domain";
import { HomeH1 } from "@/components/home/home-h1";
import { HomeH8 } from "@/components/home/home-h8";
import { HomeH9 } from "@/components/home/home-h9";
import { myClubCards } from "@/lib/club-home";
import { buildHomeModel } from "@/lib/home";
import { useAppStore } from "@/store/app-store";
import { useUiPrefsStore } from "@/store/ui-prefs";
import { arena } from "@/theme/tokens";
import { lift } from "@/theme/lift";
import { play } from "@/theme/play";

export default function HomeScreen() {
  const competitions = useAppStore((s) => s.competitions);
  const matches = useAppStore((s) => s.matches);
  const clubs = useAppStore((s) => s.clubs);
  const sessions = useAppStore((s) => s.sessions);
  const votes = useAppStore((s) => s.sessionVotes);
  const members = useAppStore((s) => s.clubMembers);
  const accounts = useAppStore((s) => s.accounts);
  const accountId = useAppStore((s) => s.accountId);
  const homeVersion = useUiPrefsStore((s) => s.homeVersion);
  const model = buildHomeModel(competitions, matches);
  const clubCards = myClubCards(clubs, sessions, votes, accountId, members, { limit: 5 });
  const operatorName = accountName(accounts, accountId);
  const bg = homeVersion === "h9" ? play.bg : homeVersion === "h8" ? lift.bg : arena.bg;
  const bar = homeVersion === "h1" ? "light" : "dark";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={bar} />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {homeVersion === "h9" ? (
          <HomeH9 model={model} operatorName={operatorName} clubs={clubCards} />
        ) : homeVersion === "h8" ? (
          <HomeH8 model={model} operatorName={operatorName} clubs={clubCards} />
        ) : (
          <HomeH1 model={model} operatorName={operatorName} clubs={clubCards} />
        )}
      </SafeAreaView>
    </View>
  );
}
