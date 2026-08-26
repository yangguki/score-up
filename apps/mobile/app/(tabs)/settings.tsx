import { ScrollView } from "react-native";
import { BASKETBALL_CLUB_PRESET, rulesSummary } from "@score-up/domain";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function SettingsScreen() {
  const reset = useAppStore((s) => s.reset);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <SectionHead title="설정" hint="Arena T&M · mock 로컬 상태" />
        <Card>
          <H style={{ fontSize: 18 }}>계정</H>
          <P muted style={{ marginTop: 8 }}>
            로그인 없음 · mock 로컬 상태입니다. 새로고침하면 시드 대회로 돌아갑니다.
          </P>
        </Card>
        <Card>
          <H style={{ fontSize: 18 }}>종목 프리셋</H>
          <P style={{ marginTop: 8 }}>{BASKETBALL_CLUB_PRESET.label} · 동호회</P>
          <P muted>{rulesSummary(BASKETBALL_CLUB_PRESET.rules)}</P>
          <P muted style={{ marginTop: 8 }}>
            배구·탁구는 농구 화면 검수 후 추가합니다.
          </P>
        </Card>
        <Btn label="시드 데이터로 되돌리기" variant="ghost" onPress={reset} />
      </ScrollView>
    </Screen>
  );
}
