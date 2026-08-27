import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  MONTH_DAY_MAX,
  NTH_WEEK_LABELS,
  WEEKDAY_LABELS,
  clampMonthDay,
  clubRecurrenceKind,
  memberOf,
  recurrenceLabel,
  type NthWeek,
  type RecurrenceKind,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
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
  const [kind, setKind] = useState<RecurrenceKind | "none">(club ? clubRecurrenceKind(club) ?? "none" : "none");
  const [time, setTime] = useState(club?.weeklyTime ?? "14:00");
  const [weekday, setWeekday] = useState(club?.weekday ?? 6);
  const [nthWeek, setNthWeek] = useState<NthWeek>(club?.nthWeek ?? 1);
  const [monthDay, setMonthDay] = useState(String(club?.monthDay ?? 15));

  if (!club) {
    return (
      <Screen>
        <P>모임을 찾을 수 없습니다.</P>
      </Screen>
    );
  }
  const mine = memberOf(members, club.id, accountId);
  if (mine?.role !== "owner") return <Redirect href={`/club/${club.id}`} />;

  const save = () => {
    updateClubAt(club.id, {
      name,
      venue,
      seasonLabel,
      weeklyTime: time,
      recurrenceKind: kind === "none" ? null : kind,
      weekday: kind === "none" || kind === "monthlyDate" ? null : weekday,
      nthWeek: kind === "monthlyNth" ? nthWeek : null,
      monthDay: kind === "monthlyDate" ? clampMonthDay(Number.parseInt(monthDay, 10)) : null,
    });
  };

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
        <P muted>정기 규칙</P>
        <P>
          {recurrenceLabel({
            ...club,
            recurrenceKind: kind === "none" ? undefined : kind,
            weekday: kind === "none" || kind === "monthlyDate" ? undefined : weekday,
            weeklyTime: time,
            nthWeek,
            monthDay: Number.parseInt(monthDay, 10),
          })}
        </P>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Chip label="없음" selected={kind === "none"} onPress={() => setKind("none")} />
          <Chip label="매주" selected={kind === "weekly"} onPress={() => setKind("weekly")} />
          <Chip label="매달 N번째" selected={kind === "monthlyNth"} onPress={() => setKind("monthlyNth")} />
          <Chip label="매달 n일" selected={kind === "monthlyDate"} onPress={() => setKind("monthlyDate")} />
        </View>
        {kind === "weekly" || kind === "monthlyNth" ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {WEEKDAY_LABELS.map((label, value) => (
              <Chip key={label} label={label} selected={weekday === value} onPress={() => setWeekday(value)} />
            ))}
          </View>
        ) : null}
        {kind === "monthlyNth" ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {([1, 2, 3, 4, 5] as const).map((value) => (
              <Chip key={value} label={NTH_WEEK_LABELS[value]} selected={nthWeek === value} onPress={() => setNthWeek(value)} />
            ))}
          </View>
        ) : null}
        {kind === "monthlyDate" ? (
          <>
            <TextInput
              value={monthDay}
              onChangeText={setMonthDay}
              keyboardType="number-pad"
              placeholder={`1~${MONTH_DAY_MAX}`}
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
            <P muted>말일은 28일로 두세요.</P>
          </>
        ) : null}
        {kind !== "none" ? (
          <>
            <P muted>시각</P>
            <TextInput value={time} onChangeText={setTime} placeholder="14:00" placeholderTextColor={colors.muted} style={inputStyle} />
          </>
        ) : null}
        <P muted>이미 만든 회차는 그대로입니다. 새 회차는 회차 만들기에서 만듭니다.</P>
        <Btn label="저장" onPress={save} />
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

function Chip({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ borderColor: selected ? colors.primary : colors.line, paddingVertical: 8, paddingHorizontal: 12 }}>
        <P>{label}</P>
      </Card>
    </Pressable>
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
