import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Pressable, ScrollView, TextInput } from "react-native";
import { type ClubSportId } from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

const CLUB_SPORTS: { id: ClubSportId; line: string; nameHint: string; venueHint: string }[] = [
  { id: "basketball", line: "5대5 · 인원 미달 시 4대4", nameHint: "주말 농구 모임", venueHint: "시민체육관 3코트" },
  { id: "volleyball", line: "6대6 · 인원 미달 시 4대4", nameHint: "화요일 배구", venueHint: "시민체육관 배구장" },
  { id: "futsal", line: "5대5 · 인원 미달 시 4대4", nameHint: "목요일 풋살", venueHint: "실내풋살장 A" },
  { id: "table-tennis", line: "단식 · 복식 한 판", nameHint: "금요일 탁구", venueHint: "시민체육관 탁구장" },
  { id: "badminton", line: "단식 · 복식 한 판", nameHint: "수요일 배드민턴", venueHint: "시민체육관 배드민턴장" },
];

export default function NewClubScreen() {
  const accountId = useAppStore((s) => s.accountId);
  const createClubAt = useAppStore((s) => s.createClubAt);
  const [sportId, setSportId] = useState<ClubSportId>("basketball");
  const [name, setName] = useState("");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");

  if (!accountId) return <Redirect href={"/login?next=/club/new"} />;

  const hint = CLUB_SPORTS.find((sport) => sport.id === sportId) ?? CLUB_SPORTS[0]!;

  const submit = () => {
    try {
      const id = createClubAt({ name, venue, sportId });
      router.replace(`/club/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "모임을 만들지 못했습니다.");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>종목</H>
        {CLUB_SPORTS.map((sport) => (
          <Pressable key={sport.id} onPress={() => setSportId(sport.id)}>
            <Card style={sportId === sport.id ? { borderColor: colors.primary } : undefined}>
              <H style={{ fontSize: 18 }}>{sportLabel(sport.id)}</H>
              <P muted>{sport.line}</P>
            </Card>
          </Pressable>
        ))}
        <P muted>이름</P>
        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError("");
          }}
          placeholder={hint.nameHint}
          placeholderTextColor={colors.muted}
          style={inputStyle}
        />
        <P muted>기본 장소 (선택)</P>
        <TextInput
          value={venue}
          onChangeText={setVenue}
          placeholder={hint.venueHint}
          placeholderTextColor={colors.muted}
          style={inputStyle}
        />
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        <Btn label="모임 만들기" onPress={submit} disabled={!name.trim()} />
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
