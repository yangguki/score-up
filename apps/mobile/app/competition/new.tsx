import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { BASKETBALL_CLUB_PRESET, type BasketballRules } from "@score-up/domain";
import { RulesEditor } from "@/components/rules-editor";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

const STEPS = 4;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function periodError(start: string, end: string): string | null {
  const a = start.trim();
  const b = end.trim();
  if (!a || !b) return "기간의 시작과 끝을 입력하세요.";
  if (ISO.test(a) && ISO.test(b) && a > b) return "끝나는 날이 시작보다 빠릅니다.";
  return null;
}

export default function NewCompetitionScreen() {
  const createComp = useAppStore((s) => s.createComp);
  const [step, setStep] = useState(1);
  const [official, setOfficial] = useState(false);
  const [rules, setRules] = useState<BasketballRules>(BASKETBALL_CLUB_PRESET.rules);
  const [format, setFormat] = useState<"tournament" | "league">("tournament");
  const [name, setName] = useState("새 농구 대회");
  const [dateMode, setDateMode] = useState<"day" | "range">("day");
  const [dateStart, setDateStart] = useState("2026-08-26");
  const [dateEnd, setDateEnd] = useState("2026-08-27");
  const [courtCount, setCourtCount] = useState(0);
  const [error, setError] = useState("");

  const tournamentBlocked = format === "tournament" && !rules.overtimeEnabled;
  const nameOk = name.trim().length > 0;
  const rangeErr = dateMode === "range" ? periodError(dateStart, dateEnd) : null;
  const canSubmit = nameOk && !rangeErr;

  const dateLabel =
    dateMode === "range" ? `${dateStart.trim()} ~ ${dateEnd.trim()}` : dateStart.trim();

  const next = () => {
    if (step === 3 && tournamentBlocked) {
      setError("토너먼트는 승부를 가려야 합니다. 이전에서 연장을 켜 주세요.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const back = () => {
    setError("");
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  };

  const submit = () => {
    if (!nameOk) {
      setError("대회 이름을 입력하세요.");
      return;
    }
    if (rangeErr) {
      setError(rangeErr);
      return;
    }
    const id = createComp({
      name: name.trim(),
      dateLabel,
      format,
      rules,
      officialPreset: official,
      courtCount: courtCount > 0 ? courtCount : undefined,
    });
    router.replace(`/competition/${id}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <P muted>
          {step} / {STEPS}
        </P>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i < step ? colors.primary : colors.line,
              }}
            />
          ))}
        </View>

        {step === 1 && (
          <>
            <H>종목</H>
            <Card style={{ borderColor: colors.primary }}>
              <H style={{ fontSize: 18 }}>농구</H>
              <P muted>시간+파울</P>
            </Card>
            <Card style={{ opacity: 0.45 }}>
              <H style={{ fontSize: 18 }}>배구</H>
              <P muted>세트+서브 · 지금은 선택할 수 없습니다</P>
            </Card>
            <Card style={{ opacity: 0.45 }}>
              <H style={{ fontSize: 18 }}>탁구</H>
              <P muted>개인 세트제 · 지금은 선택할 수 없습니다</P>
            </Card>
          </>
        )}

        {step === 2 && (
          <>
            <H>룰</H>
            <RulesEditor rules={rules} official={official} onRules={setRules} onOfficial={setOfficial} />
          </>
        )}

        {step === 3 && (
          <>
            <H>형식</H>
            <Pressable
              onPress={() => {
                setFormat("tournament");
                setError("");
              }}
            >
              <Card style={{ borderColor: format === "tournament" ? colors.primary : colors.line }}>
                <H style={{ fontSize: 18 }}>토너먼트</H>
                <P muted>싱글 엘리미네이션</P>
              </Card>
            </Pressable>
            <Pressable
              onPress={() => {
                setFormat("league");
                setError("");
              }}
            >
              <Card style={{ borderColor: format === "league" ? colors.primary : colors.line }}>
                <H style={{ fontSize: 18 }}>리그</H>
                <P muted>전원 대 전원 · 승 3 / 패 0</P>
              </Card>
            </Pressable>
            {tournamentBlocked ? (
              <P style={{ color: colors.danger }}>토너먼트는 승부를 가려야 합니다. 이전에서 연장을 켜 주세요.</P>
            ) : null}
          </>
        )}

        {step === 4 && (
          <>
            <H>기본 정보</H>
            <P muted>대회 이름</P>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError("");
              }}
              placeholder="대회 이름"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
            <P muted>날짜</P>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setDateMode("day")} style={{ flex: 1 }}>
                <Card style={{ borderColor: dateMode === "day" ? colors.primary : colors.line }}>
                  <P>하루</P>
                </Card>
              </Pressable>
              <Pressable onPress={() => setDateMode("range")} style={{ flex: 1 }}>
                <Card style={{ borderColor: dateMode === "range" ? colors.primary : colors.line }}>
                  <P>기간</P>
                </Card>
              </Pressable>
            </View>
            <TextInput
              value={dateStart}
              onChangeText={setDateStart}
              placeholder={dateMode === "range" ? "시작 날짜" : "날짜"}
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
            {dateMode === "range" ? (
              <TextInput
                value={dateEnd}
                onChangeText={setDateEnd}
                placeholder="끝 날짜"
                placeholderTextColor={colors.muted}
                style={inputStyle}
              />
            ) : null}
            <P muted>코트 수 (선택)</P>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Btn
                label="−"
                variant="ghost"
                onPress={() => setCourtCount((n) => Math.max(0, n - 1))}
                style={{ minWidth: 52, paddingHorizontal: 0 }}
              />
              <P style={{ fontWeight: "800", minWidth: 72, textAlign: "center" }}>{courtCount === 0 ? "없음" : `${courtCount}`}</P>
              <Btn
                label="+"
                variant="ghost"
                onPress={() => setCourtCount((n) => Math.min(8, n + 1))}
                style={{ minWidth: 52, paddingHorizontal: 0 }}
              />
            </View>
          </>
        )}

        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}

        {step < STEPS ? (
          <Btn
            label="다음"
            onPress={next}
            disabled={step === 3 && tournamentBlocked}
          />
        ) : (
          <Btn label="대회 만들기" onPress={submit} disabled={!canSubmit} />
        )}
        <Btn label="이전" variant="ghost" onPress={back} />
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
