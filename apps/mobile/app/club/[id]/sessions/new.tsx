import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { canOperateClub, memberOf } from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function NewSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const club = useAppStore((s) => s.clubs.find((row) => row.id === id));
  const members = useAppStore((s) => s.clubMembers);
  const createSessionsAt = useAppStore((s) => s.createSessionsAt);
  const [weekly, setWeekly] = useState(false);
  const [dateLabel, setDateLabel] = useState("2026-08-29");
  const [timeLabel, setTimeLabel] = useState("14:00");
  const [venue, setVenue] = useState(club?.venue ?? "");
  const [error, setError] = useState("");

  if (!club) {
    return (
      <Screen>
        <P>모임을 찾을 수 없습니다.</P>
      </Screen>
    );
  }
  const mine = memberOf(members, club.id, accountId);
  if (!canOperateClub(mine?.role)) return <Redirect href={`/club/${club.id}`} />;

  const submit = () => {
    try {
      const sid = createSessionsAt(club.id, { dateLabel, timeLabel, venue, weekly });
      router.replace(`/club/${club.id}/sessions/${sid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회차를 만들지 못했습니다.");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>회차 만들기</H>
        <Pressable onPress={() => setWeekly(false)}>
          <Card style={{ borderColor: !weekly ? colors.primary : colors.line }}>
            <P>한 번만</P>
          </Card>
        </Pressable>
        <Pressable onPress={() => setWeekly(true)}>
          <Card style={{ borderColor: weekly ? colors.primary : colors.line }}>
            <P>매주 반복</P>
          </Card>
        </Pressable>
        <P muted>날짜 · 시각</P>
        <TextInput value={dateLabel} onChangeText={setDateLabel} placeholder="날짜" placeholderTextColor={colors.muted} style={inputStyle} />
        <TextInput value={timeLabel} onChangeText={setTimeLabel} placeholder="시각" placeholderTextColor={colors.muted} style={inputStyle} />
        {weekly ? <P muted>앞 8주 회차가 투표 중으로 만들어집니다.</P> : null}
        <P muted>장소</P>
        <TextInput value={venue} onChangeText={setVenue} placeholder="장소" placeholderTextColor={colors.muted} style={inputStyle} />
        <P muted>투표 마감은 시작 2시간 전입니다.</P>
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        <Btn label="회차 만들기" onPress={submit} disabled={!dateLabel.trim()} />
      </ScrollView>
    </Screen>
  );
}

const inputStyle = {
  backgroundColor: colors.surface,
  color: colors.text,
  borderRadius: 12,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.line,
  fontSize: 16,
};
