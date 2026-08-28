import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { accountName } from "@score-up/domain";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { myClubCards } from "@/lib/club-home";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ClubsScreen() {
  const clubs = useAppStore((s) => s.clubs);
  const sessions = useAppStore((s) => s.sessions);
  const votes = useAppStore((s) => s.sessionVotes);
  const members = useAppStore((s) => s.clubMembers);
  const accounts = useAppStore((s) => s.accounts);
  const accountId = useAppStore((s) => s.accountId);
  const name = accountName(accounts, accountId);
  const cards = myClubCards(clubs, sessions, votes, accountId, members);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <SectionHead title="내 모임" hint={name ? `${name} · 참석 투표는 회차에서` : "이 기기 이름이 있으면 모임이 보입니다."} />
        {accountId ? (
          <Link href="/club/new" asChild>
            <Btn label="모임 만들기" />
          </Link>
        ) : (
          <>
            <P muted>모임 목록과 투표에는 이 기기 이름이 필요합니다.</P>
            <Link href={"/login?next=/clubs" as Href} asChild>
              <Btn label="시작" />
            </Link>
          </>
        )}
        {accountId && cards.length === 0 ? <P muted>아직 모임이 없습니다. 모임을 만들어 보세요.</P> : null}
        {cards.map(({ club, nextLine, voteLine }) => (
          <Link key={club.id} href={`/club/${club.id}`} asChild>
            <Pressable>
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <H style={{ fontSize: 18, flex: 1 }}>{club.name}</H>
                </View>
                <P muted style={{ marginTop: 8 }}>
                  {sportLabel(club.sportId)} · 다음 회차 {nextLine}
                </P>
                {voteLine ? (
                  <P style={{ marginTop: 6, fontWeight: "700" }}>내 투표 {voteLine}</P>
                ) : null}
              </Card>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}
