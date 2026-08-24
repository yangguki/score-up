import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { KitCard, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportPicker } from "@/components/home/sport-picker";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_TAGLINE } from "@/lib/home-sports";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/**
 * 진화 C — 이중 진입 레일
 * NX League / Scoreholio: “대회 운영” vs “Freeplay”를 첫 선택으로.
 * 브랜드는 상단 고정, 두 큰 문이 핵심 CTA.
 */
export function HomeH4({ model }: { model: Model }) {
  const kit = HOME_KITS.h4;
  return (
    <KitScreen kit={kit}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <View>
          <KitTitle kit={kit} style={{ fontSize: 26, letterSpacing: -0.4 }}>
            SCORE UP
          </KitTitle>
          <KitText kit={kit} muted style={{ marginTop: 6 }}>
            {HOME_TAGLINE}
          </KitText>
        </View>

        <KitText kit={kit} style={{ fontWeight: "700", fontSize: 13 }}>
          종목
        </KitText>
        <SportPicker kit={kit} layout="rail" />

        <View style={{ gap: 10 }}>
          <Link href="/competition/new" asChild>
            <Pressable>
              <KitCard
                kit={kit}
                style={{
                  borderRadius: kit.heroRadius,
                  borderWidth: 2,
                  borderColor: kit.primary,
                  paddingVertical: 20,
                  backgroundColor: kit.surface,
                }}
              >
                <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
                  PRIMARY
                </KitText>
                <KitTitle kit={kit} style={{ fontSize: 22, marginTop: 6 }}>
                  대회 운영
                </KitTitle>
                <KitText kit={kit} muted style={{ marginTop: 6 }}>
                  팀·대진·결과까지 한 대회로 이어갑니다. 농구 프리셋으로 시작합니다.
                </KitText>
                <View
                  style={{
                    marginTop: 14,
                    backgroundColor: kit.primary,
                    borderRadius: kit.radius,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <KitText kit={kit} style={{ color: kit.primaryFg, fontWeight: "700" }}>
                    대회 만들기
                  </KitText>
                </View>
              </KitCard>
            </Pressable>
          </Link>

          <Link href="/friendly" asChild>
            <Pressable>
              <KitCard kit={kit} style={{ borderRadius: kit.heroRadius, paddingVertical: 18 }}>
                <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
                  SECONDARY
                </KitText>
                <KitTitle kit={kit} style={{ fontSize: 20, marginTop: 6 }}>
                  빠른 친선
                </KitTitle>
                <KitText kit={kit} muted style={{ marginTop: 6 }}>
                  대진 없이 이름만 넣고 보드로. Scoreholio Freeplay와 같은 자리입니다.
                </KitText>
                <View
                  style={{
                    marginTop: 14,
                    borderWidth: 1,
                    borderColor: kit.ghostLine,
                    backgroundColor: kit.ghost,
                    borderRadius: kit.radius,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <KitText kit={kit} style={{ color: kit.ghostFg, fontWeight: "700" }}>
                    친선 시작
                  </KitText>
                </View>
              </KitCard>
            </Pressable>
          </Link>
        </View>

        <KitTitle kit={kit} style={{ fontSize: 15 }}>
          이어하기
        </KitTitle>
        {model.now.length === 0 ? (
          <KitText kit={kit} muted>
            {model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}
          </KitText>
        ) : (
          model.now.slice(0, 2).map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
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
