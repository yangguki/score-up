import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BrandLogoWell } from "@/components/brand/logo";
import { HOME_VERSIONS, useUiPrefsStore } from "@/store/ui-prefs";
import { arena } from "@/theme/arena";
import { lift } from "@/theme/lift";
import { space } from "@/theme/tokens";

function KitCard({
  href,
  title,
  note,
  dark,
}: {
  href: Href;
  title: string;
  note: string;
  dark?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <View
          style={{
            backgroundColor: dark ? arena.surface : lift.surface,
            borderRadius: 22,
            padding: 18,
            borderWidth: 1,
            borderColor: dark ? arena.line : lift.line,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: dark ? arena.text : lift.text }}>{title}</Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: dark ? arena.muted : lift.muted }}>{note}</Text>
          <Text style={{ fontSize: 13, fontWeight: "800", color: dark ? arena.primary : lift.primary, marginTop: 4 }}>
            컴포넌트 보기 →
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export default function KitIndexScreen() {
  const version = useUiPrefsStore((s) => s.homeVersion);
  const current = HOME_VERSIONS.find((row) => row.id === version);

  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 48 }} style={{ flex: 1, backgroundColor: lift.bg }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1, paddingRight: 12, gap: 6 }}>
          <Text style={{ fontSize: 24, fontWeight: "900", letterSpacing: -0.6, color: lift.text }}>디자인 키트</Text>
          <Text style={{ fontSize: 14, lineHeight: 21, color: lift.muted }}>
            홈 시안별 버튼·카드·배지를 여기서 보고 늘립니다. 제품 기본은 H1 Arena입니다.
          </Text>
        </View>
        <BrandLogoWell size={64} />
      </View>
      <Text style={{ fontSize: 13, fontWeight: "700", color: lift.primary }}>지금 홈 {current?.name}</Text>
      <KitCard href={"/kit/arena" as Href} title="H1 Arena" note="다크 · 앰버. 기존 홈·보드와 같은 T&M. 버튼, 카드, 배지, 종목 타일." dark />
      <KitCard href={"/kit/lift" as Href} title="H8 Lift" note="라이트 · 로고 블루. 원형 Up 마크, 필 버튼, 소프트 카드." />
      <KitCard href={"/kit/play" as Href} title="H9 Play" note="흰 캔버스 · 민트 ‘업’ · 블롭 종목 카드 · 스포츠/최근 활동 독. 시안과 같은 레이아웃." />
    </ScrollView>
  );
}
