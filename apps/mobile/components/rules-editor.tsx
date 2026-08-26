import { Pressable, View, Alert, Platform } from "react-native";
import {
  BASKETBALL_CLUB_PRESET,
  BASKETBALL_OFFICIAL_PRESET,
  BASKETBALL_PERIOD_COUNT_MAX,
  BASKETBALL_PERIOD_COUNT_MIN,
  BASKETBALL_PERIOD_MINUTES,
  BASKETBALL_TIMEOUT_SECONDS,
  rulesSummary,
  tableTennisRulesSummary,
  volleyballRulesSummary,
  type BasketballRules,
  type SportId,
  type SportRules,
  type TableTennisRules,
  type VolleyballRules,
} from "@score-up/domain";
import { Card, P } from "@/components/ui";
import { colors } from "@/theme/tokens";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function nextOption(options: readonly number[], current: number, delta: number) {
  const idx = options.indexOf(current);
  if (idx < 0) return options[delta > 0 ? 0 : options.length - 1] ?? current;
  return options[(idx + delta + options.length) % options.length] ?? current;
}

export function SportRulesEditor({
  sportId,
  rules,
  official,
  onRules,
  onOfficial,
}: {
  sportId: SportId;
  rules: SportRules;
  official: boolean;
  onRules: (rules: SportRules) => void;
  onOfficial: (official: boolean) => void;
}) {
  if (sportId === "volleyball") {
    return <VolleyballRulesEditor rules={rules as VolleyballRules} onRules={onRules} />;
  }
  if (sportId === "basketball") {
    return (
      <RulesEditor
        rules={rules as BasketballRules}
        official={official}
        onRules={onRules}
        onOfficial={onOfficial}
      />
    );
  }
  return <TableTennisRulesEditor sportId={sportId} rules={rules as TableTennisRules} onRules={onRules} />;
}

function VolleyballRulesEditor({
  rules,
  onRules,
}: {
  rules: VolleyballRules;
  onRules: (rules: VolleyballRules) => void;
}) {
  return (
    <>
      <P muted>이 대회에 적용됩니다. 경기 시작 후에는 바꿀 수 없습니다.</P>
      <P>{volleyballRulesSummary(rules)}</P>
      <RowToggle
        label={rules.setsToWin === 3 ? "5판 3선승" : "3판 2선승"}
        onPress={() => onRules({ ...rules, setsToWin: rules.setsToWin === 3 ? 2 : 3 })}
      />
      <RowToggle
        label={`세트 ${rules.setTarget}점`}
        onPress={() => onRules({ ...rules, setTarget: rules.setTarget === 25 ? 21 : 25 })}
      />
      <RowToggle
        label={`최종 세트 ${rules.lastSetTarget}점`}
        onPress={() => onRules({ ...rules, lastSetTarget: rules.lastSetTarget === 15 ? 21 : 15 })}
      />
      <RowToggle
        label={`${rules.winBy}점 차`}
        onPress={() => onRules({ ...rules, winBy: rules.winBy === 2 ? 1 : 2 })}
      />
      <RowToggle
        label={`타임아웃 세트당 ${rules.timeoutsPerSet}회`}
        onPress={() => onRules({ ...rules, timeoutsPerSet: rules.timeoutsPerSet === 2 ? 1 : 2 })}
      />
      <RowToggle
        label={rules.rotationEnabled ? "로테이션 표시 켜짐" : "로테이션 표시 꺼짐"}
        onPress={() => onRules({ ...rules, rotationEnabled: !rules.rotationEnabled })}
      />
      <P muted>로테이션은 전열 번호만 보여 줍니다. 반칙 판정은 없습니다.</P>
    </>
  );
}

function TableTennisRulesEditor({
  sportId,
  rules,
  onRules,
}: {
  sportId: SportId;
  rules: TableTennisRules;
  onRules: (rules: TableTennisRules) => void;
}) {
  return (
    <>
      <P muted>이 대회에 적용됩니다. 경기 시작 후에는 바꿀 수 없습니다.</P>
      <P>{tableTennisRulesSummary(rules)}</P>
      <RowToggle
        label={rules.setsToWin === 3 ? "5판 3선승" : "3판 2선승"}
        onPress={() => onRules({ ...rules, setsToWin: rules.setsToWin === 3 ? 2 : 3 })}
      />
      <RowToggle
        label={`세트 ${rules.setTarget}점`}
        onPress={() => onRules({ ...rules, setTarget: rules.setTarget === 11 ? 21 : 11 })}
      />
      <RowToggle
        label={`${rules.winBy}점 차`}
        onPress={() => onRules({ ...rules, winBy: rules.winBy === 2 ? 1 : 2 })}
      />
      {sportId === "table-tennis" || sportId === "badminton" ? (
        <RowToggle
          label={rules.doubles ? "복식 (이름만)" : "단식"}
          onPress={() => onRules({ ...rules, doubles: !rules.doubles })}
        />
      ) : null}
      {rules.doubles ? (
        <P muted>복식은 이름만 바꿉니다. 위치·서브 순서는 강제하지 않습니다.</P>
      ) : null}
    </>
  );
}

export function RulesEditor({
  rules,
  official,
  onRules,
  onOfficial,
}: {
  rules: BasketballRules;
  official: boolean;
  onRules: (rules: BasketballRules) => void;
  onOfficial: (official: boolean) => void;
}) {
  const applyOfficial = (value: boolean) => {
    onOfficial(value);
    onRules(value ? BASKETBALL_OFFICIAL_PRESET.rules : BASKETBALL_CLUB_PRESET.rules);
  };

  const confirmPreset = () => {
    const next = !official;
    const title = next ? "공식 프리셋으로 바꿀까요?" : "동호회 기본값으로 되돌릴까요?";
    const apply = () => applyOfficial(next);
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${title}\n지금 바꾼 룰은 덮어씁니다.`)) apply();
      return;
    }
    Alert.alert(title, "지금 바꾼 룰은 덮어씁니다.", [
      { text: "취소", style: "cancel" },
      { text: "바꾸기", onPress: apply },
    ]);
  };

  return (
    <>
      <P muted>이 대회에 적용됩니다. 경기 시작 후에는 바꿀 수 없습니다.</P>
      <Pressable onPress={confirmPreset}>
        <Card>
          <P>{official ? "공식 프리셋" : "동호회 기본값"} · 탭해서 전환</P>
        </Card>
      </Pressable>
      <P>{rulesSummary(rules)}</P>
      <StepRow
        label="쿼터 수"
        value={`${rules.periodCount}개`}
        onMinus={() =>
          onRules({ ...rules, periodCount: clamp(rules.periodCount - 1, BASKETBALL_PERIOD_COUNT_MIN, BASKETBALL_PERIOD_COUNT_MAX) })
        }
        onPlus={() =>
          onRules({ ...rules, periodCount: clamp(rules.periodCount + 1, BASKETBALL_PERIOD_COUNT_MIN, BASKETBALL_PERIOD_COUNT_MAX) })
        }
      />
      <StepRow
        label="쿼터 시간"
        value={`${rules.periodMinutes}분`}
        onMinus={() => onRules({ ...rules, periodMinutes: nextOption(BASKETBALL_PERIOD_MINUTES, rules.periodMinutes, -1) })}
        onPlus={() => onRules({ ...rules, periodMinutes: nextOption(BASKETBALL_PERIOD_MINUTES, rules.periodMinutes, 1) })}
      />
      <StepRow
        label="작전타임"
        value={`${rules.timeoutSeconds}초`}
        onMinus={() => onRules({ ...rules, timeoutSeconds: nextOption(BASKETBALL_TIMEOUT_SECONDS, rules.timeoutSeconds, -1) })}
        onPlus={() => onRules({ ...rules, timeoutSeconds: nextOption(BASKETBALL_TIMEOUT_SECONDS, rules.timeoutSeconds, 1) })}
      />
      <RowToggle
        label={`파울 아웃 ${rules.personalFoulLimit}`}
        onPress={() => onRules({ ...rules, personalFoulLimit: rules.personalFoulLimit === 6 ? 5 : 6 })}
      />
      <RowToggle
        label={`보너스 ${rules.teamFoulBonusAt}번째부터`}
        onPress={() => onRules({ ...rules, teamFoulBonusAt: rules.teamFoulBonusAt === 5 ? 4 : 5 })}
      />
      <RowToggle
        label={`타임아웃 팀당 ${rules.timeoutsPerGame}회`}
        onPress={() => onRules({ ...rules, timeoutsPerGame: rules.timeoutsPerGame === 2 ? 1 : 2 })}
      />
      <RowToggle
        label={rules.overtimeEnabled ? `연장 ${rules.overtimeMinutes}분` : "연장 없음"}
        onPress={() => onRules({ ...rules, overtimeEnabled: !rules.overtimeEnabled })}
      />
    </>
  );
}

function RowToggle({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card>
        <P>{label} · 탭해서 변경</P>
      </Card>
    </Pressable>
  );
}

function StepRow({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <P>{label}</P>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable onPress={onMinus} style={stepBtn}>
          <P>-</P>
        </Pressable>
        <P style={{ minWidth: 56, textAlign: "center", fontWeight: "700" }}>{value}</P>
        <Pressable onPress={onPlus} style={stepBtn}>
          <P>+</P>
        </Pressable>
      </View>
    </Card>
  );
}

const stepBtn = {
  width: 36,
  height: 36,
  borderRadius: 8,
  backgroundColor: colors.surface2,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
