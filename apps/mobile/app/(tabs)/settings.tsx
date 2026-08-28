import { Link, type Href } from "expo-router";
import { ScrollView, View } from "react-native";
import {
  ALL_SPORT_IDS,
  clubRulesFor,
  sportRulesSummary,
  accountName,
} from "@score-up/domain";
import { HomeVersionSwitch } from "@/components/home/home-version-switch";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { HOME_VERSIONS, homeVersionLabel, useUiPrefsStore } from "@/store/ui-prefs";
import { space } from "@/theme/tokens";

export default function SettingsScreen() {
  const reset = useAppStore((s) => s.reset);
  const accountId = useAppStore((s) => s.accountId);
  const accounts = useAppStore((s) => s.accounts);
  const signOutAccount = useAppStore((s) => s.signOutAccount);
  const name = accountName(accounts, accountId);
  const homeVersion = useUiPrefsStore((s) => s.homeVersion);
  const current = HOME_VERSIONS.find((row) => row.id === homeVersion);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <SectionHead title="설정" hint="Arena T&M · 이 기기 저장" />
        <Card>
          <H style={{ fontSize: 18 }}>홈 시안</H>
          <P muted style={{ marginTop: 8 }}>
            제품 기본은 H1 Arena입니다. H8 Lift · H9 Play는 비교용입니다. 홈 상단에서도 바꿀 수 있습니다.
          </P>
          <View style={{ marginTop: 12 }}>
            <HomeVersionSwitch tone="dark" />
          </View>
          <P style={{ marginTop: 10, fontWeight: "700" }}>
            지금 {homeVersionLabel(homeVersion)}
            {current ? ` · ${current.note}` : ""}
          </P>
        </Card>
        <Card>
          <H style={{ fontSize: 18 }}>디자인 키트</H>
          <P muted style={{ marginTop: 8 }}>
            시안별 버튼·카드·로고를 여기서 관리합니다.
          </P>
          <Link href={"/kit" as Href} asChild>
            <Btn label="키트 목록" style={{ marginTop: 12 }} />
          </Link>
          <Link href={"/kit/arena" as Href} asChild>
            <Btn label="H1 Arena 컴포넌트" variant="ghost" style={{ marginTop: 8 }} />
          </Link>
          <Link href={"/kit/lift" as Href} asChild>
            <Btn label="H8 Lift 컴포넌트" variant="ghost" style={{ marginTop: 8 }} />
          </Link>
          <Link href={"/kit/play" as Href} asChild>
            <Btn label="H9 Play 컴포넌트" variant="ghost" style={{ marginTop: 8 }} />
          </Link>
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
          {ALL_SPORT_IDS.map((sportId) => (
            <View key={sportId} style={{ marginTop: sportId === "basketball" ? 8 : 12 }}>
              <P>
                {sportLabel(sportId)} · 동호회
              </P>
              <P muted>{sportRulesSummary(sportId, clubRulesFor(sportId))}</P>
            </View>
          ))}
        </Card>
        <Btn label="시드 데이터로 되돌리기" variant="ghost" onPress={reset} />
      </ScrollView>
    </Screen>
  );
}
