import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import {
  BASKETBALL_CLUB_PRESET,
  TABLE_TENNIS_CLUB_PRESET,
  VOLLEYBALL_CLUB_PRESET,
  accountName,
  rulesSummary,
  tableTennisRulesSummary,
  volleyballRulesSummary,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { homeDirectionLabel, useUiPrefsStore, type HomeDirection } from "@/store/ui-prefs";
import { colors, space } from "@/theme/tokens";

const DIRECTIONS: HomeDirection[] = ["a", "b", "c"];

export default function SettingsScreen() {
  const reset = useAppStore((s) => s.reset);
  const accountId = useAppStore((s) => s.accountId);
  const accounts = useAppStore((s) => s.accounts);
  const signOutAccount = useAppStore((s) => s.signOutAccount);
  const homeDirection = useUiPrefsStore((s) => s.homeDirection);
  const setHomeDirection = useUiPrefsStore((s) => s.setHomeDirection);
  const name = accountName(accounts, accountId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <SectionHead title="설정" hint="Arena T&M · 이 기기 저장" />
        <Card>
          <H style={{ fontSize: 18 }}>홈 시안 비교</H>
          <P muted style={{ marginTop: 8 }}>
            A는 현행. B·C는 모임 OS 후보. 결정은 docs/SCORE-UP-제품방향-비교.md.
          </P>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {DIRECTIONS.map((id) => {
              const on = homeDirection === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setHomeDirection(id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: on ? colors.primary : colors.line,
                    backgroundColor: on ? colors.primary : colors.surface2,
                  }}
                >
                  <P style={{ fontSize: 13, fontWeight: "800", color: on ? colors.primaryFg : colors.text }}>
                    {homeDirectionLabel(id)}
                  </P>
                </Pressable>
              );
            })}
          </View>
        </Card>
        <Card>
          <H style={{ fontSize: 18 }}>계정</H>
          {accountId ? (
            <>
              <P style={{ marginTop: 8 }}>{name}</P>
              <P muted style={{ marginTop: 6 }}>
                이 기기 이름입니다. 서버 계정은 없습니다.
              </P>
              <Btn label="나가기" variant="ghost" style={{ marginTop: 12 }} onPress={signOutAccount} />
            </>
          ) : (
            <>
              <P muted style={{ marginTop: 8 }}>
                모임 투표에는 이 기기 이름이 필요합니다.
              </P>
              <Link href="/login" asChild>
                <Btn label="시작" style={{ marginTop: 12 }} />
              </Link>
            </>
          )}
        </Card>
        {accountId ? (
          <Link href="/club/new" asChild>
            <Btn label="모임 만들기" />
          </Link>
        ) : null}
        <Card>
          <H style={{ fontSize: 18 }}>이 기기 저장</H>
          <P muted style={{ marginTop: 8 }}>
            대회·경기·모임·이벤트를 이 기기에 남깁니다. 새로고침해도 유지됩니다. 다른 브라우저·기기와는 공유되지
            않습니다.
          </P>
        </Card>
        <Card>
          <H style={{ fontSize: 18 }}>종목 프리셋</H>
          <P style={{ marginTop: 8 }}>{BASKETBALL_CLUB_PRESET.label} · 동호회</P>
          <P muted>{rulesSummary(BASKETBALL_CLUB_PRESET.rules)}</P>
          <P style={{ marginTop: 12 }}>{VOLLEYBALL_CLUB_PRESET.label} · 동호회</P>
          <P muted>{volleyballRulesSummary(VOLLEYBALL_CLUB_PRESET.rules)}</P>
          <P style={{ marginTop: 12 }}>{TABLE_TENNIS_CLUB_PRESET.label} · 동호회</P>
          <P muted>{tableTennisRulesSummary(TABLE_TENNIS_CLUB_PRESET.rules)}</P>
        </Card>
        <Btn label="시드 데이터로 되돌리기" variant="ghost" onPress={reset} />
      </ScrollView>
    </Screen>
  );
}
