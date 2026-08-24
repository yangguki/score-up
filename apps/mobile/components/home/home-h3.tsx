import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { CompetitionCard, MatchRowCard } from "@/components/home/cards";
import { KitButton, KitCard, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportPicker } from "@/components/home/sport-picker";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_TAGLINE } from "@/lib/home-sports";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/**
 * 진화 B — 종목 모자이크
 * 제품 = 멀티스포츠 프리셋. 종목 카드가 히어로. 써포츠/대회 플랫폼식 “종목으로 시작”.
 */
export function HomeH3({ model }: { model: Model }) {
  const kit = HOME_KITS.h3;
  return (
    <KitScreen kit={kit}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
          <KitTitle kit={kit} style={{ fontSize: 32, letterSpacing: -0.8, textAlign: "center" }}>
            SCORE UP
          </KitTitle>
          <KitText kit={kit} muted style={{ marginTop: 8, textAlign: "center", maxWidth: 280 }}>
            {HOME_TAGLINE}
          </KitText>
        </View>

        <KitTitle kit={kit} style={{ fontSize: 16, textAlign: "center" }}>
          어떤 종목으로 운영할까요?
        </KitTitle>
        <SportPicker kit={kit} layout="mosaic" />

        <KitCard kit={kit} style={{ borderColor: kit.primary, borderWidth: 2 }}>
          <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
            선택됨 · 농구
          </KitText>
          <KitTitle kit={kit} style={{ fontSize: 18, marginTop: 6 }}>
            시간제 쿼터 · 파울 · 작전타임
          </KitTitle>
          <KitText kit={kit} muted style={{ marginTop: 6, fontSize: 13 }}>
            동호회 기본 프리셋으로 바로 시작할 수 있습니다. 다른 종목은 준비 중입니다.
          </KitText>
          <View style={{ marginTop: 14, gap: 8 }}>
            <Link href="/competition/new" asChild>
              <KitButton kit={kit} label="이 종목으로 대회 만들기" />
            </Link>
            <Link href="/friendly" asChild>
              <KitButton kit={kit} label="친선만 빠르게" variant="ghost" />
            </Link>
          </View>
        </KitCard>

        {!model.empty && model.now.length > 0 ? (
          <>
            <KitTitle kit={kit} style={{ fontSize: 15 }}>
              진행 · 오늘
            </KitTitle>
            {model.now.slice(0, 2).map((match) => (
              <MatchRowCard key={match.id} match={match} kit={kit} />
            ))}
          </>
        ) : (
          <KitText kit={kit} muted style={{ textAlign: "center" }}>
            {model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}
          </KitText>
        )}

        {model.empty ? null : (
          <>
            <KitTitle kit={kit} style={{ fontSize: 15 }}>
              내 대회
            </KitTitle>
            {model.competitions.map(({ competition, leftover }) => (
              <CompetitionCard key={competition.id} competition={competition} leftover={leftover} compact kit={kit} />
            ))}
          </>
        )}

        <Link href="/settings" asChild>
          <Pressable>
            <KitText kit={kit} muted style={{ textAlign: "center", fontSize: 13 }}>
              운영자 · 설정
            </KitText>
          </Pressable>
        </Link>
      </ScrollView>
    </KitScreen>
  );
}
