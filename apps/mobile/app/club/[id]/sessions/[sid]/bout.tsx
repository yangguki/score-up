import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { accountName, canOperateClub, isRallyClubSport, memberOf, rallySideSize, sessionRallyFormat, type SessionSide } from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { scoreboardHref } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function BoutScreen() {
  const { id, sid } = useLocalSearchParams<{ id: string; sid: string }>();
  const data = useAppStore();
  const session = data.sessions.find((row) => row.id === sid);
  const club = data.clubs.find((row) => row.id === id);
  const [error, setError] = useState("");

  if (!club || !session) {
    return (
      <Screen>
        <P>회차를 찾을 수 없습니다.</P>
      </Screen>
    );
  }
  if (!isRallyClubSport(club.sportId)) return <Redirect href={`/club/${club.id}/sessions/${session.id}/split`} />;
  const mine = memberOf(data.clubMembers, club.id, data.accountId);
  if (!canOperateClub(mine?.role)) return <Redirect href={`/club/${club.id}/sessions/${session.id}`} />;

  const format = sessionRallyFormat(session);
  const court = rallySideSize(format);
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
  if (people.length < court * 2) return <Redirect href={`/club/${club.id}/sessions/${session.id}`} />;

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

  const confirm = () => {
    confirmAction("한 판 열기", "한 판을 만들고 보드로 갈까요?", () => {
      try {
        const matchId = data.confirmRallyBoutAt(session.id);
        router.replace(scoreboardHref({ id: matchId, sportId: club.sportId }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "한 판을 열지 못했습니다.");
      }
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>한 판 열기</H>
        {error ? <P>{error}</P> : null}
        <P muted>
          {format === "singles" ? "단식" : "복식"} · 후보 {people.length}명 · 출전 {court}+{court} · 나머지 대기
        </P>
        <H style={{ fontSize: 16 }}>홈 {home.length}</H>
        {home.map((person) => (
          <Card key={person.accountId ?? person.guestId}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <P>{person.name}</P>
              <Btn label="→" variant="ghost" size="sm" onPress={() => move(person, "away")} />
            </View>
          </Card>
        ))}
        <H style={{ fontSize: 16 }}>어웨이 {away.length}</H>
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
                <Btn label="홈" variant="ghost" size="sm" onPress={() => move(person, "home")} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label="어웨이" variant="ghost" size="sm" onPress={() => move(person, "away")} />
              </View>
            </View>
          </Card>
        ))}
        <Btn label="한 판 열기" disabled={home.length !== court || away.length !== court} onPress={confirm} />
      </ScrollView>
    </Screen>
  );
}
