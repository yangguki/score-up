import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, TextInput } from "react-native";
import {
  BASKETBALL_CLUB_PRESET,
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  nextTeamColor,
  type BasketballRules,
} from "@score-up/domain";
import { TeamEditor } from "@/components/team-editor";
import { RulesEditor } from "@/components/rules-editor";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

type DraftTeam = { name: string; color: string };

export default function NewCompetitionScreen() {
  const createComp = useAppStore((s) => s.createComp);
  const [step, setStep] = useState(1);
  const [official, setOfficial] = useState(false);
  const [rules, setRules] = useState<BasketballRules>(BASKETBALL_CLUB_PRESET.rules);
  const [format, setFormat] = useState<"tournament" | "league">("tournament");
  const [name, setName] = useState("새 농구 대회");
  const [dateLabel, setDateLabel] = useState("2026-08-23");
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<DraftTeam[]>([
    { name: "홈", color: DEFAULT_HOME_COLOR },
    { name: "어웨이", color: DEFAULT_AWAY_COLOR },
  ]);

  const next = () => {
    if (step === 3 && format === "tournament" && !rules.overtimeEnabled) {
      setError("토너먼트는 승부를 가려야 합니다. 연장을 켜 주세요.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const submit = () => {
    const id = createComp({
      name,
      dateLabel,
      format,
      rules,
      officialPreset: official,
      teams: teams.filter((t) => t.name.trim()),
    });
    router.replace(`/competition/${id}`);
  };

  const setTeam = (index: number, patch: Partial<DraftTeam>) => {
    setTeams((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <P muted>{step} / 5</P>
        {step === 1 && (
          <>
            <H>종목</H>
            <Card>
              <H style={{ fontSize: 18 }}>농구</H>
              <P muted>시간+파울</P>
            </Card>
            <Card style={{ opacity: 0.45 }}>
              <H style={{ fontSize: 18 }}>배구</H>
              <P muted>다음 종목 · 지금은 선택할 수 없습니다</P>
            </Card>
            <Card style={{ opacity: 0.45 }}>
              <H style={{ fontSize: 18 }}>탁구</H>
              <P muted>다음 종목 · 지금은 선택할 수 없습니다</P>
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
            <Pressable onPress={() => setFormat("tournament")}>
              <Card style={{ borderColor: format === "tournament" ? colors.home : colors.line }}>
                <H style={{ fontSize: 18 }}>토너먼트</H>
                <P muted>싱글 엘리미네이션</P>
              </Card>
            </Pressable>
            <Pressable onPress={() => setFormat("league")}>
              <Card style={{ borderColor: format === "league" ? colors.home : colors.line }}>
                <H style={{ fontSize: 18 }}>리그</H>
                <P muted>MVP는 승 3 / 패 0</P>
              </Card>
            </Pressable>
          </>
        )}
        {step === 4 && (
          <>
            <H>기본 정보</H>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="대회 이름"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
            <TextInput
              value={dateLabel}
              onChangeText={setDateLabel}
              placeholder="날짜"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
          </>
        )}
        {step === 5 && (
          <>
            <H>참가 팀</H>
            <P muted>이름과 색을 정합니다. 이후 참가 화면에서 더 넣을 수 있습니다.</P>
            {teams.map((team, index) => (
              <Card key={index}>
                <TeamEditor
                  title={`팀 ${index + 1}`}
                  name={team.name}
                  color={team.color}
                  onName={(value) => setTeam(index, { name: value })}
                  onColor={(value) => setTeam(index, { color: value })}
                />
              </Card>
            ))}
            <Btn
              label="팀 추가"
              variant="ghost"
              onPress={() =>
                setTeams((prev) => [...prev, { name: `팀 ${prev.length + 1}`, color: nextTeamColor(prev.map((t) => t.color)) }])
              }
            />
          </>
        )}
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        {step < 5 ? <Btn label="다음" onPress={next} /> : <Btn label="대회 만들기" onPress={submit} />}
        {step > 1 ? <Btn label="이전" variant="ghost" onPress={() => setStep((s) => s - 1)} /> : null}
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
