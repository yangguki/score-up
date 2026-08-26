import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ScrollView, TextInput } from "react-native";
import { memberOf } from "@score-up/domain";
import { Btn, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function ClubSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const club = useAppStore((s) => s.clubs.find((row) => row.id === id));
  const accountId = useAppStore((s) => s.accountId);
  const members = useAppStore((s) => s.clubMembers);
  const updateClubAt = useAppStore((s) => s.updateClubAt);
  const dissolveClubAt = useAppStore((s) => s.dissolveClubAt);
  const [name, setName] = useState(club?.name ?? "");
  const [venue, setVenue] = useState(club?.venue ?? "");
  const [seasonLabel, setSeasonLabel] = useState(club?.seasonLabel ?? "2026");

  if (!club) {
    return (
      <Screen>
        <P>모임을 찾을 수 없습니다.</P>
      </Screen>
    );
  }
  const mine = memberOf(members, club.id, accountId);
  if (mine?.role !== "owner") return <Redirect href={`/club/${club.id}`} />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>모임 설정</H>
        <P muted>이름</P>
        <TextInput value={name} onChangeText={setName} style={inputStyle} />
        <P muted>기본 장소</P>
        <TextInput value={venue} onChangeText={setVenue} style={inputStyle} />
        <P muted>시즌</P>
        <TextInput value={seasonLabel} onChangeText={setSeasonLabel} style={inputStyle} />
        <Btn label="저장" onPress={() => updateClubAt(club.id, { name, venue, seasonLabel })} />
        <Btn
          label="모임 해체"
          variant="danger"
          onPress={() =>
            confirmAction("모임 해체", "모임을 해체할까요? 회차와 멤버가 이 기기에서 사라집니다.", () => {
              dissolveClubAt(club.id);
              router.replace("/");
            })
          }
        />
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
