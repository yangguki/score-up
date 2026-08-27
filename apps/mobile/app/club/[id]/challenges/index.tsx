import { useMemo } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import {
  accountName,
  canOperateClub,
  challengeStatusLabel,
  gradeLabel,
  memberOf,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ChallengesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const accounts = useAppStore((s) => s.accounts);
  const clubMembers = useAppStore((s) => s.clubMembers);
  const challenges = useAppStore((s) => s.challenges);
  const ladderMatches = useAppStore((s) => s.ladderMatches);
  const members = useMemo(() => clubMembers.filter((row) => row.clubId === id), [clubMembers, id]);
  const mine = memberOf(members, id ?? "", accountId);
  const operate = canOperateClub(mine?.role);
  const respondChallengeAt = useAppStore((s) => s.respondChallengeAt);
  const cancelChallengeAt = useAppStore((s) => s.cancelChallengeAt);

  const rows = challenges.filter((row) => row.clubId === id);
  const incoming = rows.filter((row) => row.status === "pending" && row.toAccountId === accountId);
  const outgoing = rows.filter((row) => row.status === "pending" && row.fromAccountId === accountId);
  const accepted = rows.filter((row) => row.status === "accepted");
  const done = rows.filter((row) => row.status === "completed");
  const gradeOf = (accountIdValue: string) =>
    gradeLabel(members.find((row) => row.accountId === accountIdValue)?.grade);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>도전</H>
        <Link href={`/club/${id}/challenges/new`} asChild>
          <Btn label="도전 보내기" />
        </Link>

        <H style={{ fontSize: 18 }}>받은 요청</H>
        {incoming.length === 0 ? <P muted>받은 요청이 없습니다.</P> : null}
        {incoming.map((row) => (
          <Card key={row.id}>
            <P>
              {accountName(accounts, row.fromAccountId)} → 나
            </P>
            <P muted style={{ marginTop: 4 }}>
              {gradeOf(row.fromAccountId)} · {challengeStatusLabel(row.status)}
            </P>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Btn
                  label="수락"
                  onPress={() =>
                    confirmAction("도전 수락", `${accountName(accounts, row.fromAccountId)}의 도전을 받을까요?`, () =>
                      respondChallengeAt(row.id, true),
                    )
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Btn
                  label="거절"
                  variant="ghost"
                  onPress={() =>
                    confirmAction("도전 거절", "도전을 거절할까요?", () => respondChallengeAt(row.id, false))
                  }
                />
              </View>
            </View>
          </Card>
        ))}

        <H style={{ fontSize: 18 }}>보낸 요청</H>
        {outgoing.length === 0 ? <P muted>보낸 요청이 없습니다.</P> : null}
        {outgoing.map((row) => (
          <Card key={row.id}>
            <P>
              나 → {accountName(accounts, row.toAccountId)}
            </P>
            <P muted style={{ marginTop: 4 }}>
              {gradeOf(row.toAccountId)} · 대기
            </P>
            {row.fromAccountId === accountId || operate ? (
              <Btn
                label="취소"
                variant="ghost"
                style={{ marginTop: 10 }}
                onPress={() => confirmAction("도전 취소", "보낸 도전을 취소할까요?", () => cancelChallengeAt(row.id))}
              />
            ) : null}
          </Card>
        ))}

        <H style={{ fontSize: 18 }}>수락됨</H>
        {accepted.length === 0 ? <P muted>결과 넣을 도전이 없습니다.</P> : null}
        {accepted.map((row) => {
          const party = row.fromAccountId === accountId || row.toAccountId === accountId || operate;
          return (
            <Card key={row.id}>
              <P>
                {accountName(accounts, row.fromAccountId)} vs {accountName(accounts, row.toAccountId)}
              </P>
              {party ? (
                <Link href={`/club/${id}/ladder/new?challengeId=${row.id}`} asChild>
                  <Btn label="결과 넣기" style={{ marginTop: 10 }} />
                </Link>
              ) : null}
            </Card>
          );
        })}

        <H style={{ fontSize: 18 }}>완료</H>
        {done.length === 0 ? <P muted>끝난 도전이 없습니다.</P> : null}
        {done.map((row) => {
          const match = ladderMatches.find((item) => item.id === row.ladderMatchId);
          return (
            <Card key={row.id}>
              {match ? (
                <H style={{ fontSize: 18 }}>
                  {accountName(accounts, match.homeAccountId)} {match.homeScore} - {match.awayScore}{" "}
                  {accountName(accounts, match.awayAccountId)}
                </H>
              ) : (
                <P>
                  {accountName(accounts, row.fromAccountId)} vs {accountName(accounts, row.toAccountId)}
                </P>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
