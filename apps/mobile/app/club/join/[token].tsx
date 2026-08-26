import { Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { memberOf } from "@score-up/domain";
import { Btn, H, P, Screen } from "@/components/ui";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function JoinClubScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const clubs = useAppStore((s) => s.clubs);
  const members = useAppStore((s) => s.clubMembers);
  const requestJoinAt = useAppStore((s) => s.requestJoinAt);
  const club = clubs.find((row) => row.inviteToken === token);

  if (!accountId) {
    return <Redirect href={`/login?next=/club/join/${token ?? ""}`} />;
  }
  if (!club) {
    return (
      <Screen>
        <P style={{ padding: space.lg }}>링크가 유효하지 않습니다. 모임장에게 다시 받으세요.</P>
      </Screen>
    );
  }

  const mine = memberOf(members, club.id, accountId);
  if (mine?.status === "active") return <Redirect href={`/club/${club.id}`} />;
  const pending = mine?.status === "pending";
  const count = members.filter((row) => row.clubId === club.id && row.status === "active").length;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>{club.name}</H>
        <P muted>
          {sportLabel(club.sportId)} · 멤버 {count}
        </P>
        <P>이 모임에 가입하려면 모임장 승인이 필요합니다.</P>
        {pending ? <P muted>승인을 기다리는 중입니다.</P> : null}
        <Btn
          label="가입 요청"
          disabled={pending}
          onPress={() => requestJoinAt(club.inviteToken)}
        />
      </ScrollView>
    </Screen>
  );
}
