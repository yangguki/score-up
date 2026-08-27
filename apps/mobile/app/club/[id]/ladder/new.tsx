import { useMemo, useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  accountName,
  canOperateClub,
  gradeLabel,
  memberOf,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function LadderResultScreen() {
  const { id, challengeId } = useLocalSearchParams<{ id: string; challengeId?: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const accounts = useAppStore((s) => s.accounts);
  const clubMembers = useAppStore((s) => s.clubMembers);
  const challenges = useAppStore((s) => s.challenges);
  const recordLadderResultAt = useAppStore((s) => s.recordLadderResultAt);
  const members = useMemo(
    () => clubMembers.filter((row) => row.clubId === id && row.status === "active"),
    [clubMembers, id],
  );
  const mine = memberOf(members, id ?? "", accountId);
  const operate = canOperateClub(mine?.role);
  const challenge = challenges.find((row) => row.id === challengeId && row.clubId === id);

  const lockedPair = challenge
    ? [challenge.fromAccountId, challenge.toAccountId]
    : null;
  const [homeId, setHomeId] = useState(lockedPair?.[0] ?? accountId ?? "");
  const [awayId, setAwayId] = useState(lockedPair?.[1] ?? "");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [error, setError] = useState("");

  if (!mine) return <Redirect href={`/club/${id}`} />;

  const acceptedMine = challenges.filter(
    (row) =>
      row.clubId === id &&
      row.status === "accepted" &&
      (operate || row.fromAccountId === accountId || row.toAccountId === accountId),
  );

  if (!operate && !challenge) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
          <H>결과 넣기</H>
          <P muted>수락된 도전에서 결과를 넣으세요. 보드는 열리지 않습니다.</P>
          {acceptedMine.length === 0 ? <P muted>수락된 도전이 없습니다.</P> : null}
          {acceptedMine.map((row) => (
            <Card key={row.id}>
              <P>
                {accountName(accounts, row.fromAccountId)} vs {accountName(accounts, row.toAccountId)}
              </P>
              <Btn
                label="이 도전 결과 넣기"
                style={{ marginTop: 10 }}
                onPress={() => router.replace(`/club/${id}/ladder/new?challengeId=${row.id}`)}
              />
            </Card>
          ))}
        </ScrollView>
      </Screen>
    );
  }

  const pickable = lockedPair
    ? members.filter((row) => lockedPair.includes(row.accountId))
    : members;

  const submit = () => {
    const home = Number.parseInt(homeScore, 10);
    const away = Number.parseInt(awayScore, 10);
    if (!homeId || !awayId) {
      setError("두 멤버를 고르세요.");
      return;
    }
    confirmAction("결과 확정", "점수를 넣고 랭킹에 반영할까요? 보드는 열리지 않습니다.", () => {
      try {
        recordLadderResultAt(id ?? "", {
          challengeId: challenge?.id,
          homeAccountId: homeId,
          awayAccountId: awayId,
          homeScore: home,
          awayScore: away,
        });
        router.replace(`/club/${id}/ranking`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "결과를 넣지 못했습니다.");
      }
    });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>결과 넣기</H>
        <P muted>보드는 열리지 않습니다. 승패가 나야 랭킹에 넣습니다.</P>
        {challenge ? (
          <P muted>
            도전 · {accountName(accounts, challenge.fromAccountId)} vs {accountName(accounts, challenge.toAccountId)}
          </P>
        ) : null}

        <H style={{ fontSize: 18 }}>홈</H>
        {pickable.map((row) => (
          <Pressable key={`h-${row.id}`} onPress={() => setHomeId(row.accountId)}>
            <Card style={{ borderColor: homeId === row.accountId ? colors.primary : colors.line }}>
              <P>
                {accountName(accounts, row.accountId)} · {gradeLabel(row.grade)}
              </P>
            </Card>
          </Pressable>
        ))}

        <H style={{ fontSize: 18 }}>어웨이</H>
        {pickable.map((row) => (
          <Pressable key={`a-${row.id}`} onPress={() => setAwayId(row.accountId)}>
            <Card style={{ borderColor: awayId === row.accountId ? colors.primary : colors.line }}>
              <P>
                {accountName(accounts, row.accountId)} · {gradeLabel(row.grade)}
              </P>
            </Card>
          </Pressable>
        ))}

        <H style={{ fontSize: 18 }}>점수</H>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={homeScore}
            onChangeText={setHomeScore}
            keyboardType="number-pad"
            placeholder="홈"
            placeholderTextColor={colors.muted}
            style={inputStyle}
          />
          <P>-</P>
          <TextInput
            value={awayScore}
            onChangeText={setAwayScore}
            keyboardType="number-pad"
            placeholder="어웨이"
            placeholderTextColor={colors.muted}
            style={inputStyle}
          />
        </View>
        {error ? <P muted>{error}</P> : null}
        <Btn label="결과 확정" onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const inputStyle = {
  flex: 1,
  backgroundColor: colors.surface,
  color: colors.text,
  borderRadius: 12,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.line,
  fontSize: 16,
};
