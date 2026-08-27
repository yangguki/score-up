import { useMemo, useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView } from "react-native";
import {
  accountName,
  canChallengeGrade,
  canSendChallenge,
  challengeGradeLockCopy,
  gradeLabel,
  hasOpenChallenge,
  memberOf,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function NewChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const accounts = useAppStore((s) => s.accounts);
  const clubMembers = useAppStore((s) => s.clubMembers);
  const challenges = useAppStore((s) => s.challenges);
  const sendChallengeAt = useAppStore((s) => s.sendChallengeAt);
  const members = useMemo(
    () => clubMembers.filter((row) => row.clubId === id && row.status === "active"),
    [clubMembers, id],
  );
  const mine = memberOf(members, id ?? "", accountId);
  const [picked, setPicked] = useState("");
  const [error, setError] = useState("");

  if (!mine || !accountId) return <Redirect href={`/club/${id}`} />;

  const opponents = members.filter((row) => row.accountId !== accountId);

  const submit = (toAccountId: string, name: string) => {
    const to = members.find((row) => row.accountId === toAccountId);
    const check = canSendChallenge({
      fromAccountId: accountId,
      toAccountId,
      fromGrade: mine.grade,
      toGrade: to?.grade,
      fromActive: true,
      toActive: Boolean(to),
      openBetween: hasOpenChallenge(challenges, id ?? "", accountId, toAccountId),
    });
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    confirmAction("도전 보내기", `${name}에게 도전을 보낼까요?`, () => {
      try {
        sendChallengeAt(id ?? "", toAccountId);
        router.replace(`/club/${id}/challenges`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "도전을 보내지 못했습니다.");
      }
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>도전 보내기</H>
        <P muted>같은 급수 또는 한 칸 차이만 보낼 수 있습니다.</P>
        {opponents.map((row) => {
          const locked = !canChallengeGrade(mine.grade, row.grade);
          const open = hasOpenChallenge(challenges, id ?? "", accountId, row.accountId);
          const disabled = locked || open;
          return (
            <Pressable
              key={row.id}
              onPress={() => {
                setPicked(row.accountId);
                if (disabled) {
                  setError(locked ? challengeGradeLockCopy() : "이미 대기 중이거나 수락된 도전이 있습니다.");
                  return;
                }
                setError("");
                submit(row.accountId, accountName(accounts, row.accountId));
              }}
            >
              <Card style={{ borderColor: picked === row.accountId ? colors.primary : colors.line }}>
                <P>{accountName(accounts, row.accountId)}</P>
                <P muted style={{ marginTop: 4 }}>
                  {gradeLabel(row.grade)}
                  {locked ? ` · ${challengeGradeLockCopy()}` : open ? " · 이미 열린 도전" : ""}
                </P>
              </Card>
            </Pressable>
          );
        })}
        {error ? <P muted>{error}</P> : null}
        <Btn label="목록으로" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}
