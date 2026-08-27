import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  MONTH_DAY_MAX,
  MONTH_DAY_MIN,
  NTH_WEEK_LABELS,
  WEEKDAY_LABELS,
  canOperateClub,
  clampMonthDay,
  memberOf,
  weekdayOf,
  type NthWeek,
  type RecurrenceKind,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

type RepeatKind = "once" | RecurrenceKind;
type MonthlyMode = "monthlyNth" | "monthlyDate";

export default function NewSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = useAppStore((s) => s.accountId);
  const club = useAppStore((s) => s.clubs.find((row) => row.id === id));
  const members = useAppStore((s) => s.clubMembers);
  const createSessionsAt = useAppStore((s) => s.createSessionsAt);
  const [repeat, setRepeat] = useState<RepeatKind>("once");
  const [monthlyMode, setMonthlyMode] = useState<MonthlyMode>("monthlyNth");
  const [dateLabel, setDateLabel] = useState("2026-08-29");
  const [timeLabel, setTimeLabel] = useState(club?.weeklyTime ?? "14:00");
  const [venue, setVenue] = useState(club?.venue ?? "");
  const [nthWeek, setNthWeek] = useState<NthWeek>(1);
  const [weekday, setWeekday] = useState(weekdayOf("2026-08-29") ?? 6);
  const [monthDay, setMonthDay] = useState("15");
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

  const kind: RepeatKind = repeat === "monthlyNth" || repeat === "monthlyDate" ? monthlyMode : repeat;

  const submit = () => {
    try {
      const sid = createSessionsAt(club.id, {
        dateLabel,
        timeLabel,
        venue,
        kind,
        nthWeek,
        weekday,
        monthDay: clampMonthDay(Number.parseInt(monthDay, 10)),
      });
      router.replace(`/club/${club.id}/sessions/${sid}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회차를 만들지 못했습니다.");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>회차 만들기</H>
        <Choice selected={repeat === "once"} label="한 번만" onPress={() => setRepeat("once")} />
        <Choice selected={repeat === "weekly"} label="매주 반복" onPress={() => setRepeat("weekly")} />
        <Choice
          selected={repeat === "monthlyNth" || repeat === "monthlyDate"}
          label="매달 반복"
          onPress={() => setRepeat(monthlyMode)}
        />
        {repeat === "monthlyNth" || repeat === "monthlyDate" ? (
          <>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Choice selected={monthlyMode === "monthlyNth"} label="매달 N번째 요일" onPress={() => { setMonthlyMode("monthlyNth"); setRepeat("monthlyNth"); }} />
              </View>
              <View style={{ flex: 1 }}>
                <Choice selected={monthlyMode === "monthlyDate"} label="매달 n일" onPress={() => { setMonthlyMode("monthlyDate"); setRepeat("monthlyDate"); }} />
              </View>
            </View>
            {monthlyMode === "monthlyNth" ? (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {([1, 2, 3, 4, 5] as const).map((value) => (
                    <Chip key={value} label={NTH_WEEK_LABELS[value]} selected={nthWeek === value} onPress={() => setNthWeek(value)} />
                  ))}
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {WEEKDAY_LABELS.map((label, value) => (
                    <Chip key={label} label={label} selected={weekday === value} onPress={() => setWeekday(value)} />
                  ))}
                </View>
              </>
            ) : (
              <>
                <P muted>일자 (1~{MONTH_DAY_MAX})</P>
                <TextInput
                  value={monthDay}
                  onChangeText={setMonthDay}
                  keyboardType="number-pad"
                  placeholder={`${MONTH_DAY_MIN}~${MONTH_DAY_MAX}`}
                  placeholderTextColor={colors.muted}
                  style={inputStyle}
                />
                <P muted>말일은 28일로 두세요.</P>
              </>
            )}
          </>
        ) : null}
        <P muted>날짜 · 시각</P>
        <TextInput
          value={dateLabel}
          onChangeText={(value) => {
            setDateLabel(value);
            const day = weekdayOf(value);
            if (day != null) setWeekday(day);
          }}
          placeholder="날짜"
          placeholderTextColor={colors.muted}
          style={inputStyle}
        />
        <TextInput value={timeLabel} onChangeText={setTimeLabel} placeholder="시각" placeholderTextColor={colors.muted} style={inputStyle} />
        {repeat !== "once" ? <P muted>앞 8회 회차가 투표 중으로 만들어집니다.</P> : null}
        <P muted>장소</P>
        <TextInput value={venue} onChangeText={setVenue} placeholder="장소" placeholderTextColor={colors.muted} style={inputStyle} />
        <P muted>투표 마감은 시작 2시간 전입니다.</P>
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        <Btn label="회차 만들기" onPress={submit} disabled={!dateLabel.trim()} />
      </ScrollView>
    </Screen>
  );
}

function Choice({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ borderColor: selected ? colors.primary : colors.line }}>
        <P>{label}</P>
      </Card>
    </Pressable>
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
