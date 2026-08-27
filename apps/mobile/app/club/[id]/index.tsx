import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { canOperateClub, memberOf, recurrenceLabel, sessionStatusLabel, voteLabel } from "@score-up/domain";
import { Btn, Card, H, P, Pill, Screen, SectionHead } from "@/components/ui";
import { myVoteValue, nextClubSession, sessionLine } from "@/lib/club-home";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ClubOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const club = useAppStore((s) => s.clubs.find((row) => row.id === id));
  const members = useAppStore((s) => s.clubMembers);
  const sessions = useAppStore((s) => s.sessions);
  const votes = useAppStore((s) => s.sessionVotes);

  if (!accountId) return <Redirect href={`/login?next=/club/${id}`} />;
  if (!club) {
    return (
      <Screen>
        <P>모임을 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const mine = memberOf(members, club.id, accountId);
  if (!mine || mine.status === "pending") return <Redirect href={`/club/join/${club.inviteToken}`} />;

  const activeCount = members.filter((row) => row.clubId === club.id && row.status === "active").length;
  const next = nextClubSession(club.id, sessions);
  const operate = canOperateClub(mine.role);
  const upcoming = sessions
    .filter((row) => row.clubId === club.id && row.status !== "completed" && row.status !== "cancelled")
    .slice(0, 4);
  const myVote = next ? voteLabel(myVoteValue(next.id, accountId, votes)) : undefined;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <SectionHead title={club.name} hint={`${sportLabel(club.sportId)} · 멤버 ${activeCount}`} />
            {recurrenceLabel(club) !== "정기 없음" ? <P muted>{recurrenceLabel(club)}</P> : null}
          </View>
          {operate ? (
            <Link href={`/club/${club.id}/settings`} asChild>
              <Btn label="설정" variant="ghost" style={{ minHeight: 44, paddingHorizontal: 12 }} />
            </Link>
          ) : null}
        </View>
        {next ? (
          <Card>
            <P muted>다음 회차</P>
            <H style={{ fontSize: 18, marginTop: 6 }}>{sessionLine(next)}</H>
            {next.venue ? <P muted>{next.venue}</P> : null}
            {next.status === "voting" ? <P style={{ marginTop: 8 }}>내 투표 {myVote}</P> : null}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Link href={`/club/${club.id}/sessions/${next.id}`} asChild>
                  <Btn label="회차 열기" />
                </Link>
              </View>
              <View style={{ flex: 1 }}>
                <Link href={`/club/${club.id}/members`} asChild>
                  <Btn label="멤버" variant="ghost" />
                </Link>
              </View>
            </View>
          </Card>
        ) : (
          <Card>
            <P>다음 회차를 만들면 참석 투표를 받을 수 있습니다.</P>
            {operate ? (
              <Link href={`/club/${club.id}/sessions/new`} asChild>
                <Btn label="회차 만들기" style={{ marginTop: 12 }} />
              </Link>
            ) : null}
          </Card>
        )}

        {upcoming.length ? (
          <>
            <H style={{ fontSize: 18 }}>다가오는 회차</H>
            {upcoming.map((session) => {
              const going = votes.filter((row) => row.sessionId === session.id && row.value === "going").length;
              const maybe = votes.filter((row) => row.sessionId === session.id && row.value === "maybe").length;
              return (
                <Link key={session.id} href={`/club/${club.id}/sessions/${session.id}`} asChild>
                  <Card>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <P>{sessionLine(session)}</P>
                      <Pill label={sessionStatusLabel(session.status)} />
                    </View>
                    {session.status === "voting" ? (
                      <P muted style={{ marginTop: 6 }}>
                        참석 {going} · 미정 {maybe}
                      </P>
                    ) : null}
                  </Card>
                </Link>
              );
            })}
          </>
        ) : null}

        {operate && next ? (
          <Link href={`/club/${club.id}/sessions/new`} asChild>
            <Btn label="회차 만들기" variant="ghost" />
          </Link>
        ) : null}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Link href={`/club/${club.id}/ranking`} asChild>
              <Btn label="랭킹" variant="ghost" />
            </Link>
          </View>
          <View style={{ flex: 1 }}>
            <Link href={`/club/${club.id}/records`} asChild>
              <Btn label="전적" variant="ghost" />
            </Link>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Link href={`/club/${club.id}/challenges`} asChild>
              <Btn label="도전" variant="ghost" />
            </Link>
          </View>
          <View style={{ flex: 1 }}>
            <Link href={`/club/${club.id}/ladder/new`} asChild>
              <Btn label="결과 넣기" variant="ghost" />
            </Link>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
