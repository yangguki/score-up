import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { sportRulesSummary, type SportRules } from "@score-up/domain";
import { SportRulesEditor } from "@/components/rules-editor";
import { Btn, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function CompetitionRulesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competition = useAppStore((s) => s.competitions.find((row) => row.id === id));
  const updateCompRulesAt = useAppStore((s) => s.updateCompRulesAt);
  const [rules, setRules] = useState<SportRules | undefined>(competition?.rules);
  const [official, setOfficial] = useState(competition?.officialPreset ?? false);
  const [error, setError] = useState("");

  if (!competition) {
    return (
      <Screen>
        <P>대회를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const locked = competition.status !== "prep";
  const current = rules ?? competition.rules;

  const save = () => {
    try {
      updateCompRulesAt(competition.id, current, official);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "룰을 저장하지 못했습니다.");
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>룰</H>
        <P muted>{sportRulesSummary(competition.sportId, current)}</P>
        {locked ? (
          <P muted>경기가 생기면 룰을 바꾸지 않습니다.</P>
        ) : (
          <P muted>이 대회에 적용됩니다. 대진을 만든 뒤에는 바꿀 수 없습니다.</P>
        )}
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}
        {locked ? null : (
          <>
            <SportRulesEditor
              sportId={competition.sportId}
              rules={current}
              official={official}
              onRules={setRules}
              onOfficial={setOfficial}
            />
            <Btn label="저장" onPress={save} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
