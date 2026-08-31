import { Children, type ReactNode } from "react";
import { Pressable, View, Alert, Platform, Text } from "react-native";
import {
  BASKETBALL_CLUB_PRESET,
  BASKETBALL_OFFICIAL_PRESET,
  BASKETBALL_PERIOD_COUNT_MAX,
  BASKETBALL_PERIOD_COUNT_MIN,
  BASKETBALL_PERIOD_MINUTES,
  BASKETBALL_TIMEOUT_SECONDS,
  baseballRulesSummary,
  isPitchSport,
  pitchRulesSummary,
  rulesSummary,
  tableTennisRulesSummary,
  volleyballRulesSummary,
  type BaseballRules,
  type BasketballRules,
  type PitchRules,
  type PitchSportId,
  type SportId,
  type SportRules,
  type TableTennisRules,
  type VolleyballRules,
} from "@score-up/domain";
import { useAppKit } from "@/components/theme-provider";
import { P } from "@/components/ui";
import type { HomeKit } from "@/theme/home-kits";

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
  compact = false,
}: {
  sportId: SportId;
  rules: SportRules;
  official: boolean;
  onRules: (rules: SportRules) => void;
  onOfficial: (official: boolean) => void;
  compact?: boolean;
}) {
  if (sportId === "volleyball") {
    return <VolleyballRulesEditor rules={rules as VolleyballRules} onRules={onRules} compact={compact} />;
  }
  if (sportId === "basketball") {
    return (
      <RulesEditor
        rules={rules as BasketballRules}
        official={official}
        onRules={onRules}
        onOfficial={onOfficial}
        compact={compact}
      />
    );
  }
  if (isPitchSport(sportId)) {
    return (
      <PitchRulesEditor sportId={sportId} rules={rules as PitchRules} onRules={onRules} compact={compact} />
    );
  }
  if (sportId === "baseball") {
    return <BaseballRulesEditor rules={rules as BaseballRules} onRules={onRules} compact={compact} />;
  }
  return (
    <TableTennisRulesEditor sportId={sportId} rules={rules as TableTennisRules} onRules={onRules} compact={compact} />
  );
}

function VolleyballRulesEditor({
  rules,
  onRules,
  compact,
}: {
  rules: VolleyballRules;
  onRules: (rules: VolleyballRules) => void;
  compact: boolean;
}) {
  return (
    <EditorFrame compact={compact} summary={compact ? undefined : volleyballRulesSummary(rules)}>
      <ChoiceRow
        compact={compact}
        label="선승"
        value={rules.setsToWin}
        options={[
          { value: 2, label: "3판 2선" },
          { value: 3, label: "5판 3선" },
        ]}
        onChange={(setsToWin) => onRules({ ...rules, setsToWin })}
      />
      <ChoiceRow
        compact={compact}
        label="세트"
        value={rules.setTarget}
        options={[
          { value: 21, label: "21점" },
          { value: 25, label: "25점" },
        ]}
        onChange={(setTarget) => onRules({ ...rules, setTarget })}
      />
      <ChoiceRow
        compact={compact}
        label="최종 세트"
        value={rules.lastSetTarget}
        options={[
          { value: 15, label: "15점" },
          { value: 21, label: "21점" },
        ]}
        onChange={(lastSetTarget) => onRules({ ...rules, lastSetTarget })}
      />
      <ChoiceRow
        compact={compact}
        label="승점 차"
        value={rules.winBy}
        options={[
          { value: 1, label: "1점" },
          { value: 2, label: "2점" },
        ]}
        onChange={(winBy) => onRules({ ...rules, winBy })}
      />
      <ChoiceRow
        compact={compact}
        label="타임아웃"
        value={rules.timeoutsPerSet}
        options={[
          { value: 1, label: "1회" },
          { value: 2, label: "2회" },
        ]}
        onChange={(timeoutsPerSet) => onRules({ ...rules, timeoutsPerSet })}
      />
      <ChoiceRow
        compact={compact}
        label="로테이션"
        value={rules.rotationEnabled}
        options={[
          { value: false, label: "꺼짐" },
          { value: true, label: "켜짐" },
        ]}
        onChange={(rotationEnabled) => onRules({ ...rules, rotationEnabled })}
      />
    </EditorFrame>
  );
}

function TableTennisRulesEditor({
  sportId,
  rules,
  onRules,
  compact,
}: {
  sportId: SportId;
  rules: TableTennisRules;
  onRules: (rules: TableTennisRules) => void;
  compact: boolean;
}) {
  return (
    <EditorFrame compact={compact} summary={compact ? undefined : tableTennisRulesSummary(rules)}>
      <ChoiceRow
        compact={compact}
        label="선승"
        value={rules.setsToWin}
        options={[
          { value: 2, label: "3판 2선" },
          { value: 3, label: "5판 3선" },
        ]}
        onChange={(setsToWin) => onRules({ ...rules, setsToWin })}
      />
      <ChoiceRow
        compact={compact}
        label="세트"
        value={rules.setTarget}
        options={[
          { value: 11, label: "11점" },
          { value: 21, label: "21점" },
        ]}
        onChange={(setTarget) => onRules({ ...rules, setTarget })}
      />
      <ChoiceRow
        compact={compact}
        label="승점 차"
        value={rules.winBy}
        options={[
          { value: 1, label: "1점" },
          { value: 2, label: "2점" },
        ]}
        onChange={(winBy) => onRules({ ...rules, winBy })}
      />
      {sportId === "table-tennis" || sportId === "badminton" ? (
        <ChoiceRow
          compact={compact}
          label="복식"
          value={rules.doubles}
          options={[
            { value: false, label: "단식" },
            { value: true, label: "복식" },
          ]}
          onChange={(doubles) => onRules({ ...rules, doubles })}
        />
      ) : null}
    </EditorFrame>
  );
}

function PitchRulesEditor({
  sportId,
  rules,
  onRules,
  compact,
}: {
  sportId: PitchSportId;
  rules: PitchRules;
  onRules: (rules: PitchRules) => void;
  compact: boolean;
}) {
  return (
    <EditorFrame compact={compact} summary={compact ? undefined : pitchRulesSummary(rules, sportId)}>
      <ChoiceRow
        compact={compact}
        label="전후반"
        value={rules.periodMinutes}
        options={[
          { value: 20, label: "20분" },
          { value: 25, label: "25분" },
        ]}
        onChange={(periodMinutes) => onRules({ ...rules, periodMinutes })}
      />
      <ChoiceRow
        compact={compact}
        label="연장"
        value={rules.overtimeEnabled}
        options={[
          { value: false, label: "없음" },
          { value: true, label: `${rules.overtimeMinutes}분` },
        ]}
        onChange={(overtimeEnabled) => onRules({ ...rules, overtimeEnabled })}
      />
    </EditorFrame>
  );
}

function BaseballRulesEditor({
  rules,
  onRules,
  compact,
}: {
  rules: BaseballRules;
  onRules: (rules: BaseballRules) => void;
  compact: boolean;
}) {
  return (
    <EditorFrame compact={compact} summary={compact ? undefined : baseballRulesSummary(rules)}>
      <ChoiceRow
        compact={compact}
        label="이닝"
        value={rules.inningCount}
        options={[
          { value: 7, label: "7이닝" },
          { value: 9, label: "9이닝" },
        ]}
        onChange={(inningCount) => onRules({ ...rules, inningCount })}
      />
      <ChoiceRow
        compact={compact}
        label="연장"
        value={rules.extraInningEnabled}
        options={[
          { value: false, label: "없음" },
          { value: true, label: "가능" },
        ]}
        onChange={(extraInningEnabled) => onRules({ ...rules, extraInningEnabled })}
      />
    </EditorFrame>
  );
}

export function RulesEditor({
  rules,
  official,
  onRules,
  onOfficial,
  compact = false,
}: {
  rules: BasketballRules;
  official: boolean;
  onRules: (rules: BasketballRules) => void;
  onOfficial: (official: boolean) => void;
  compact?: boolean;
}) {
  const applyOfficial = (value: boolean) => {
    onOfficial(value);
    onRules(value ? BASKETBALL_OFFICIAL_PRESET.rules : BASKETBALL_CLUB_PRESET.rules);
  };

  const confirmPreset = (next: boolean) => {
    if (next === official) return;
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
    <EditorFrame compact={compact} summary={compact ? undefined : rulesSummary(rules)}>
      <ChoiceRow
        compact={compact}
        label="프리셋"
        value={official ? "official" : "club"}
        options={[
          { value: "club", label: "동호회" },
          { value: "official", label: "공식" },
        ]}
        onChange={(value) => confirmPreset(value === "official")}
      />
      <StepRow
        compact={compact}
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
        compact={compact}
        label="쿼터 시간"
        value={`${rules.periodMinutes}분`}
        onMinus={() => onRules({ ...rules, periodMinutes: nextOption(BASKETBALL_PERIOD_MINUTES, rules.periodMinutes, -1) })}
        onPlus={() => onRules({ ...rules, periodMinutes: nextOption(BASKETBALL_PERIOD_MINUTES, rules.periodMinutes, 1) })}
      />
      <StepRow
        compact={compact}
        label="작전타임"
        value={`${rules.timeoutSeconds}초`}
        onMinus={() => onRules({ ...rules, timeoutSeconds: nextOption(BASKETBALL_TIMEOUT_SECONDS, rules.timeoutSeconds, -1) })}
        onPlus={() => onRules({ ...rules, timeoutSeconds: nextOption(BASKETBALL_TIMEOUT_SECONDS, rules.timeoutSeconds, 1) })}
      />
      <ChoiceRow
        compact={compact}
        label="파울 아웃"
        value={rules.personalFoulLimit}
        options={[
          { value: 5, label: "5" },
          { value: 6, label: "6" },
        ]}
        onChange={(personalFoulLimit) => onRules({ ...rules, personalFoulLimit })}
      />
      <ChoiceRow
        compact={compact}
        label="보너스"
        value={rules.teamFoulBonusAt}
        options={[
          { value: 4, label: "4번째" },
          { value: 5, label: "5번째" },
        ]}
        onChange={(teamFoulBonusAt) => onRules({ ...rules, teamFoulBonusAt })}
      />
      <ChoiceRow
        compact={compact}
        label="타임아웃"
        value={rules.timeoutsPerGame}
        options={[
          { value: 1, label: "1회" },
          { value: 2, label: "2회" },
        ]}
        onChange={(timeoutsPerGame) => onRules({ ...rules, timeoutsPerGame })}
      />
      <ChoiceRow
        compact={compact}
        label="연장"
        value={rules.overtimeEnabled}
        options={[
          { value: false, label: "없음" },
          { value: true, label: `${rules.overtimeMinutes}분` },
        ]}
        onChange={(overtimeEnabled) => onRules({ ...rules, overtimeEnabled })}
      />
    </EditorFrame>
  );
}

function EditorFrame({
  compact,
  summary,
  children,
}: {
  compact: boolean;
  summary?: string;
  children: ReactNode;
}) {
  const kit = useAppKit();
  const items = Children.toArray(children).filter(Boolean);

  return (
    <View style={{ gap: compact ? 8 : 12 }}>
      <P muted style={compact ? { fontSize: 12, lineHeight: 16 } : undefined}>
        이 대회에 적용됩니다. 경기 시작 후에는 바꿀 수 없습니다.
      </P>
      {summary ? <P>{summary}</P> : null}
      <View
        style={{
          backgroundColor: kit.surface,
          borderRadius: kit.heroRadius,
          borderWidth: 1,
          borderColor: kit.line,
          overflow: "hidden",
        }}
      >
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <View style={{ height: 1, backgroundColor: kit.line, marginLeft: 14 }} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

function ChoiceRow<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange,
  compact,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  compact: boolean;
}) {
  const kit = useAppKit();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingVertical: compact ? 8 : 12,
        paddingHorizontal: 14,
      }}
    >
      <P style={{ flex: 1, fontSize: compact ? 14 : 15, fontWeight: "700" }}>{label}</P>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {options.map((option) => {
          const on = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => {
                if (!on) onChange(option.value);
              }}
              style={({ pressed }) => chipStyle(kit, on, compact, pressed)}
            >
              <Text style={{ color: on ? kit.primaryFg : kit.text, fontSize: compact ? 12 : 13, fontWeight: "800" }}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StepRow({
  label,
  value,
  onMinus,
  onPlus,
  compact,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  compact: boolean;
}) {
  const kit = useAppKit();
  const size = compact ? 30 : 34;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        paddingVertical: compact ? 8 : 12,
        paddingHorizontal: 14,
      }}
    >
      <P style={{ flex: 1, fontSize: compact ? 14 : 15, fontWeight: "700" }}>{label}</P>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable onPress={onMinus} style={({ pressed }) => stepBtnStyle(kit, size, pressed)}>
          <Text style={{ color: kit.text, fontSize: 16, fontWeight: "800" }}>−</Text>
        </Pressable>
        <Text style={{ minWidth: compact ? 44 : 52, textAlign: "center", color: kit.primary, fontSize: 15, fontWeight: "800" }}>
          {value}
        </Text>
        <Pressable onPress={onPlus} style={({ pressed }) => stepBtnStyle(kit, size, pressed)}>
          <Text style={{ color: kit.text, fontSize: 16, fontWeight: "800" }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function chipStyle(kit: HomeKit, on: boolean, compact: boolean, pressed: boolean) {
  return {
    minWidth: compact ? 48 : 56,
    paddingVertical: compact ? 6 : 7,
    paddingHorizontal: compact ? 10 : 12,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: on ? kit.primary : kit.surface2,
    borderWidth: 1,
    borderColor: on ? kit.primary : kit.line,
    opacity: pressed ? 0.82 : 1,
    transform: [{ scale: pressed ? 0.97 : 1 }],
  };
}

function stepBtnStyle(kit: HomeKit, size: number, pressed: boolean) {
  return {
    width: size,
    height: size,
    borderRadius: 8,
    backgroundColor: kit.surface2,
    borderWidth: 1,
    borderColor: kit.line,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    opacity: pressed ? 0.82 : 1,
    transform: [{ scale: pressed ? 0.96 : 1 }],
  };
}
