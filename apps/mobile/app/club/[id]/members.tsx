import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { accountName, canOperateClub, memberOf } from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { copyText } from "@/lib/copy-text";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ClubMembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const club = useAppStore((s) => s.clubs.find((row) => row.id === id));
  const accounts = useAppStore((s) => s.accounts);
  const clubMembers = useAppStore((s) => s.clubMembers);
  const members = useMemo(() => clubMembers.filter((row) => row.clubId === id), [clubMembers, id]);
  const decideJoinAt = useAppStore((s) => s.decideJoinAt);
  const [notice, setNotice] = useState("");

  if (!club) {
    return (
      <Screen>
        <P>모임을 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const mine = memberOf(members, club.id, accountId);
  const operate = canOperateClub(mine?.role);
  const pending = members.filter((row) => row.status === "pending");
  const active = members.filter((row) => row.status === "active");
  const roleLabel = (role: string) => (role === "owner" ? "모임장" : role === "operator" ? "운영" : "멤버");

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>초대 링크</H>
        <Card>
          <P>score-up.app/c/{club.inviteToken}</P>
          <P muted style={{ marginTop: 6 }}>
            가입은 승인 후 멤버가 됩니다.
          </P>
          <Btn
            label="복사"
            variant="ghost"
            style={{ marginTop: 12 }}
            onPress={async () => {
              const ok = await copyText(`/club/join/${club.inviteToken}`);
              setNotice(ok ? "복사됨" : "복사하지 못했습니다");
            }}
          />
          {notice ? <P muted>{notice}</P> : null}
        </Card>

        {pending.length ? (
          <>
            <H style={{ fontSize: 18 }}>대기 {pending.length}</H>
            {pending.map((row) => (
              <Card key={row.id}>
                <P>{accountName(accounts, row.accountId)}</P>
                {operate ? (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Btn label="수락" onPress={() => decideJoinAt(row.id, true)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Btn
                        label="거절"
                        variant="ghost"
                        onPress={() =>
                          confirmAction("가입 거절", "가입 요청을 거절할까요?", () => decideJoinAt(row.id, false))
                        }
                      />
                    </View>
                  </View>
                ) : null}
              </Card>
            ))}
          </>
        ) : null}

        <H style={{ fontSize: 18 }}>멤버 {active.length}</H>
        {active.map((row) => (
          <Card key={row.id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <P>{accountName(accounts, row.accountId)}</P>
              <P muted>{roleLabel(row.role)}</P>
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
