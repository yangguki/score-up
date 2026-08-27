import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { accountName } from "@score-up/domain";
import { HomeB } from "@/components/home/home-b";
import { HomeC } from "@/components/home/home-c";
import { HomeH1 } from "@/components/home/home-h1";
import { myClubCards } from "@/lib/club-home";
import { buildHomeModel } from "@/lib/home";
import { useAppStore } from "@/store/app-store";
import { useUiPrefsStore } from "@/store/ui-prefs";
import { arena } from "@/theme/tokens";

export default function HomeScreen() {
  const competitions = useAppStore((s) => s.competitions);
  const matches = useAppStore((s) => s.matches);
  const clubs = useAppStore((s) => s.clubs);
  const sessions = useAppStore((s) => s.sessions);
  const votes = useAppStore((s) => s.sessionVotes);
  const members = useAppStore((s) => s.clubMembers);
  const accounts = useAppStore((s) => s.accounts);
  const accountId = useAppStore((s) => s.accountId);
  const homeDirection = useUiPrefsStore((s) => s.homeDirection);
  const model = buildHomeModel(competitions, matches);
  const clubCards = myClubCards(clubs, sessions, votes, accountId, members);
  const operatorName = accountName(accounts, accountId);
  const props = { model, operatorName, clubs: clubCards };

  return (
    <View style={{ flex: 1, backgroundColor: arena.bg }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {homeDirection === "b" ? <HomeB {...props} /> : null}
        {homeDirection === "c" ? <HomeC {...props} /> : null}
        {homeDirection === "a" ? <HomeH1 {...props} /> : null}
      </SafeAreaView>
    </View>
  );
}
