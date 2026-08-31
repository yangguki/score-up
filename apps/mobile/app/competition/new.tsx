import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  clubRulesFor,
  isPitchSport,
  isSportId,
  type BasketballRules,
  type PitchRules,
  type SportId,
  type SportRules,
} from "@score-up/domain";
import {
  ChoiceChips,
  FormCard,
  FormSection,
  FormLabel,
  FormStepper,
  KitTextInput,
  SelectCard,
} from "@/components/form-fields";
import { SportRulesEditor } from "@/components/rules-editor";
import { SportPickGrid } from "@/components/sport-pick-grid";
import { H, P } from "@/components/ui";
import { WizardShell } from "@/components/wizard-shell";
import { CREATE_SPORTS } from "@/lib/create-sports";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { useAppKit } from "@/components/theme-provider";

const STEPS = 4;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function defaultName(sportId: SportId) {
  return `새 ${sportLabel(sportId)} 대회`;
}

function parseSport(value?: string | string[]): SportId {
  const raw = Array.isArray(value) ? value[0] : value;
  if (isSportId(raw)) return raw;
  return "basketball";
}

function periodError(start: string, end: string): string | null {
  const a = start.trim();
  const b = end.trim();
  if (!a || !b) return "기간의 시작과 끝을 입력하세요.";
  if (ISO.test(a) && ISO.test(b) && a > b) return "끝나는 날이 시작보다 빠릅니다.";
  return null;
}

export default function NewCompetitionScreen() {
  const kit = useAppKit();
  const params = useLocalSearchParams<{ sport?: string }>();
  const createComp = useAppStore((s) => s.createComp);
  const initialSport = parseSport(params.sport);
  const [step, setStep] = useState(1);
  const [sportId, setSportId] = useState<SportId>(initialSport);
  const [official, setOfficial] = useState(false);
  const [rules, setRules] = useState<SportRules>(clubRulesFor(initialSport));
  const [format, setFormat] = useState<"tournament" | "league">("tournament");
  const [name, setName] = useState(defaultName(initialSport));
  const [dateMode, setDateMode] = useState<"day" | "range">("day");
  const [dateStart, setDateStart] = useState("2026-08-26");
  const [dateEnd, setDateEnd] = useState("2026-08-27");
  const [courtCount, setCourtCount] = useState(0);
  const [error, setError] = useState("");

  const basketballRules = sportId === "basketball" ? (rules as BasketballRules) : null;
  const pitchRules = isPitchSport(sportId) ? (rules as PitchRules) : null;
  const tournamentBlocked = Boolean(
    (basketballRules && format === "tournament" && !basketballRules.overtimeEnabled) ||
      (pitchRules && format === "tournament" && !pitchRules.overtimeEnabled),
  );
  const nameOk = name.trim().length > 0;
  const rangeErr = dateMode === "range" ? periodError(dateStart, dateEnd) : null;
  const canSubmit = nameOk && !rangeErr;

  const dateLabel =
    dateMode === "range" ? `${dateStart.trim()} ~ ${dateEnd.trim()}` : dateStart.trim();

  const names = useMemo(() => CREATE_SPORTS.map((row) => defaultName(row.id)), []);

  useEffect(() => {
    const next = parseSport(params.sport);
    setSportId(next);
    setOfficial(false);
    setRules(clubRulesFor(next));
    setName((current) => (names.includes(current) ? defaultName(next) : current));
  }, [params.sport, names]);

  const selectSport = (next: SportId) => {
    setSportId(next);
    setOfficial(false);
    setRules(clubRulesFor(next));
    setName((current) => (names.includes(current) ? defaultName(next) : current));
    setError("");
  };

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
      sportId,
      rules,
      officialPreset: official,
      courtCount: courtCount > 0 ? courtCount : undefined,
    });
    router.replace(`/competition/${id}`);
  };

  return (
    <WizardShell
      step={step}
      total={STEPS}
      error={error}
      primaryLabel={step < STEPS ? "다음" : "대회 만들기"}
      primaryDisabled={(step === 3 && tournamentBlocked) || (step === 4 && !canSubmit)}
      onPrimary={step < STEPS ? next : submit}
      onBack={back}
    >
      {step === 1 ? (
        <>
          <H>종목</H>
          <SportPickGrid selected={sportId} onSelect={selectSport} />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <H>룰</H>
          <SportRulesEditor
            sportId={sportId}
            rules={rules}
            official={official}
            onRules={setRules}
            onOfficial={setOfficial}
            compact
          />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <H>형식</H>
          <SelectCard
            selected={format === "tournament"}
            title="토너먼트"
            hint="싱글 엘리미네이션"
            onPress={() => {
              setFormat("tournament");
              setError("");
            }}
          />
          <SelectCard
            selected={format === "league"}
            title="리그"
            hint="전원 대 전원 · 승 3 / 패 0"
            onPress={() => {
              setFormat("league");
              setError("");
            }}
          />
          {tournamentBlocked ? (
            <P style={{ color: kit.danger }}>토너먼트는 승부를 가려야 합니다. 이전에서 연장을 켜 주세요.</P>
          ) : null}
        </>
      ) : null}

      {step === 4 ? (
        <>
          <H>기본 정보</H>
          <FormCard>
            <FormSection>
              <FormLabel>대회 이름</FormLabel>
              <KitTextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  setError("");
                }}
                placeholder="대회 이름"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </FormSection>
            <FormSection>
              <FormLabel>날짜</FormLabel>
              <ChoiceChips
                value={dateMode}
                options={[
                  { value: "day", label: "하루" },
                  { value: "range", label: "기간" },
                ]}
                onChange={setDateMode}
              />
              <KitTextInput
                value={dateStart}
                onChangeText={setDateStart}
                placeholder={dateMode === "range" ? "시작 날짜" : "날짜"}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {dateMode === "range" ? (
                <KitTextInput
                  value={dateEnd}
                  onChangeText={setDateEnd}
                  placeholder="끝 날짜"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              ) : null}
            </FormSection>
            <FormSection last>
              <FormStepper
                label="코트 수 (선택)"
                value={courtCount === 0 ? "없음" : `${courtCount}`}
                onMinus={() => setCourtCount((n) => Math.max(0, n - 1))}
                onPlus={() => setCourtCount((n) => Math.min(8, n + 1))}
              />
            </FormSection>
          </FormCard>
        </>
      ) : null}
    </WizardShell>
  );
}
