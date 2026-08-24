import { Pressable, ScrollView, View } from "react-native";
import { BASKETBALL_CLUB_PRESET, rulesSummary } from "@score-up/domain";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { HOME_VERSIONS, type HomeVersion } from "@/lib/home";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function SettingsScreen() {
  const reset = useAppStore((s) => s.reset);
  const homeVersion = useAppStore((s) => s.homeVersion);
  const setHomeVersion = useAppStore((s) => s.setHomeVersion);

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
          <H style={{ fontSize: 18 }}>홈 시안</H>
          <P muted style={{ marginTop: 8 }}>
            H1이 기본(확정). V1~V3·H2~H4는 비교용입니다.
          </P>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {HOME_VERSIONS.map((item) => (
              <VersionChip
                key={item.id}
                item={item}
                selected={homeVersion === item.id}
                onPress={() => setHomeVersion(item.id)}
              />
            ))}
          </View>
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

function VersionChip({
  item,
  selected,
  onPress,
}: {
  item: (typeof HOME_VERSIONS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: selected ? colors.surface2 : colors.surface,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.line,
      }}
    >
      <P style={{ fontSize: 13, fontWeight: "800", color: selected ? colors.primary : colors.text }}>
        {item.label}
      </P>
    </Pressable>
  );
}
