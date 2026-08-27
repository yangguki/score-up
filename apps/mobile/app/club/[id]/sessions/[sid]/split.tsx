import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { accountName, canOperateClub, memberOf, type SessionSide } from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function SplitScreen() {
  const { id, sid } = useLocalSearchParams<{ id: string; sid: string }>();
  const data = useAppStore();
  const session = data.sessions.find((row) => row.id === sid);
  const club = data.clubs.find((row) => row.id === id);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (!club || !session) {
    return (
      <Screen>
        <P>회차를 찾을 수 없습니다.</P>
      </Screen>
    );
  }
  const mine = memberOf(data.clubMembers, club.id, data.accountId);
  if (!canOperateClub(mine?.role)) return <Redirect href={`/club/${club.id}/sessions/${session.id}`} />;

  const going = data.sessionVotes
    .filter((row) => row.sessionId === session.id && row.value === "going")
    .map((row) => ({
      accountId: row.accountId as string,
      guestId: undefined as string | undefined,
      name: accountName(data.accounts, row.accountId),
    }));
  const guests = data.sessionGuests
    .filter((row) => row.sessionId === session.id)
    .map((row) => ({
      accountId: undefined as string | undefined,
      guestId: row.id,
      name: `게스트 ${row.name}`,
    }));
  const people = [...going, ...guests];
  const sideOf = (person: (typeof people)[number]): SessionSide =>
    data.sessionAssignments.find(
      (row) =>
        row.sessionId === session.id &&
        ((person.accountId && row.accountId === person.accountId) || (person.guestId && row.guestId === person.guestId)),
    )?.side ?? "bench";
  const home = people.filter((person) => sideOf(person) === "home");
  const away = people.filter((person) => sideOf(person) === "away");
  const bench = people.filter((person) => sideOf(person) === "bench");
  const move = (person: (typeof people)[number], side: SessionSide) =>
    data.setAssignmentAt(session.id, { accountId: person.accountId, guestId: person.guestId }, side);

  const propose = (balanceByWinRate: boolean) => {
    const result = data.proposeSplitAt(session.id, balanceByWinRate);
    if (!result.ok) {
      setError(result.reason ?? "제안을 만들지 못했습니다.");
      setNotice("");
      return;
    }
    setError("");
    setNotice(balanceByWinRate ? "승률 스네이크 제안 · 수정 후 확정하세요" : "무작위 제안 · 수정 후 확정하세요");
  };

  const confirm = () => {
    confirmAction("매칭 확정", "팀을 확정하고 경기를 만들까요? 이후 변경은 다시 나누기입니다.", () => {
      try {
        const matchId = data.confirmSplitAt(session.id);
        router.replace(`/match/${matchId}/lineup`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "확정하지 못했습니다.");
      }
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>팀 나누기</H>
        {error ? <P>{error}</P> : null}
        {notice ? <P muted>{notice}</P> : null}
        <P muted>
          후보 {people.length}명 · 출전 5+5 · 나머지 대기
        </P>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Btn label="자동 제안" size="sm" variant="ghost" onPress={() => propose(false)} />
          </View>
          <View style={{ flex: 1 }}>
            <Btn label="승률 밸런스" size="sm" variant="ghost" onPress={() => propose(true)} />
          </View>
        </View>
        <H style={{ fontSize: 16 }}>A 팀 {home.length}</H>
        {home.map((person) => (
          <Card key={person.accountId ?? person.guestId}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <P>{person.name}</P>
              <Btn label="→" variant="ghost" size="sm" onPress={() => move(person, "away")} />
            </View>
          </Card>
        ))}
        <H style={{ fontSize: 16 }}>B 팀 {away.length}</H>
        {away.map((person) => (
          <Card key={person.accountId ?? person.guestId}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Btn label="←" variant="ghost" size="sm" onPress={() => move(person, "home")} />
              <P>{person.name}</P>
            </View>
          </Card>
        ))}
        <H style={{ fontSize: 16 }}>대기</H>
        {bench.map((person) => (
          <Card key={person.accountId ?? person.guestId}>
            <P>{person.name}</P>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn label="A" variant="ghost" size="sm" onPress={() => move(person, "home")} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label="B" variant="ghost" size="sm" onPress={() => move(person, "away")} />
              </View>
            </View>
          </Card>
        ))}
        <Btn label="매칭 확정" disabled={home.length !== 5 || away.length !== 5} onPress={confirm} />
      </ScrollView>
    </Screen>
  );
}
