import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CompetitionCard, LivePinCard, MatchRowCard } from "@/components/home/cards";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportIcon } from "@/components/home/sport-icons";
import { EMPTY_HOME_COPY, isLiveMatch, type buildHomeModel } from "@/lib/home";
import { HOME_SPORTS, HOME_TAGLINE } from "@/lib/home-sports";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/**
 * H5 — 2026 트렌드 비교 시안
 * H1과 같은 Arena 색. 벤토 모듈 · 보더 최소화 · 하단 sticky CTA · 종목 아이콘 레일.
 */
export function HomeH5({ model }: { model: Model }) {
  const kit = HOME_KITS.h5;
  const live = model.now.find(isLiveMatch) ?? model.now[0];
  const rest = live ? model.now.filter((m) => m.id !== live.id) : [];

  return (
    <KitScreen kit={kit}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: 120, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(360)}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }}>
                SCORE UP
              </KitText>
              <KitTitle kit={kit} style={{ fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 }}>
                오늘 코트
              </KitTitle>
              <KitText kit={kit} muted style={{ fontSize: 13, marginTop: 4, lineHeight: 18, maxWidth: 260 }}>
                {HOME_TAGLINE}
              </KitText>
            </View>
            <Link href="/settings" asChild>
              <Pressable style={{ paddingVertical: 6, paddingHorizontal: 4 }}>
                <KitText kit={kit} muted style={{ fontSize: 13, fontWeight: "700" }}>
                  운영자
                </KitText>
              </Pressable>
            </Link>
          </Animated.View>

          {/* 벤토: 라이브 히어로 (큰 셀) */}
          <Animated.View entering={FadeInDown.delay(40).duration(360)}>
            {live ? (
              <LivePinCard match={live} kit={kit} />
            ) : (
              <View
                style={{
                  backgroundColor: kit.surface,
                  borderRadius: kit.heroRadius,
                  padding: 22,
                  minHeight: 140,
                  justifyContent: "center",
                }}
              >
                <KitText kit={kit} muted style={{ fontSize: 14, lineHeight: 21 }}>
                  {model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}
                </KitText>
              </View>
            )}
          </Animated.View>

          {/* 벤토: 대회 / 친선 (2열 작은 셀) */}
          <Animated.View entering={FadeInDown.delay(80).duration(360)} style={{ flexDirection: "row", gap: 10 }}>
            <Link href="/competition/new" asChild>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1.2,
                  backgroundColor: kit.primary,
                  borderRadius: kit.radius,
                  padding: 16,
                  minHeight: 108,
                  opacity: pressed ? 0.9 : 1,
                  justifyContent: "space-between",
                })}
              >
                <KitText kit={kit} style={{ fontSize: 11, fontWeight: "900", color: kit.primaryFg, letterSpacing: 0.8 }}>
                  PRIMARY
                </KitText>
                <View>
                  <KitTitle kit={kit} style={{ fontSize: 17, fontWeight: "900", color: kit.primaryFg }}>
                    대회 만들기
                  </KitTitle>
                  <KitText kit={kit} style={{ fontSize: 12, marginTop: 4, color: kit.primaryFg, opacity: 0.8 }}>
                    농구 프리셋
                  </KitText>
                </View>
              </Pressable>
            </Link>
            <Link href="/friendly" asChild>
              <Pressable
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: kit.surface2,
                  borderRadius: kit.radius,
                  padding: 16,
                  minHeight: 108,
                  opacity: pressed ? 0.9 : 1,
                  justifyContent: "space-between",
                })}
              >
                <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "800" }}>
                  FREEPLAY
                </KitText>
                <View>
                  <KitTitle kit={kit} style={{ fontSize: 17, fontWeight: "900" }}>
                    빠른 친선
                  </KitTitle>
                  <KitText kit={kit} muted style={{ fontSize: 12, marginTop: 4 }}>
                    이름만 넣고 보드
                  </KitText>
                </View>
              </Pressable>
            </Link>
          </Animated.View>

          {/* 종목: 아이콘 레일 (스크롤 없이도 구분) */}
          <Animated.View entering={FadeInDown.delay(120).duration(360)} style={{ gap: 10 }}>
            <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "800", letterSpacing: 0.6 }}>
              종목
            </KitText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {HOME_SPORTS.map((sport) => {
                const on = sport.active;
                return (
                  <View
                    key={sport.id}
                    style={{
                      width: 72,
                      alignItems: "center",
                      gap: 8,
                      opacity: sport.active ? 1 : 0.38,
                      paddingVertical: 10,
                      paddingHorizontal: 6,
                      borderRadius: 16,
                      backgroundColor: on ? kit.surface2 : kit.surface,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: on ? kit.primary : kit.surface2,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SportIcon id={sport.id} size={28} muted={!sport.active} />
                    </View>
                    <KitText kit={kit} style={{ fontSize: 11, fontWeight: "800" }} numberOfLines={1}>
                      {sport.name}
                    </KitText>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>

          {rest.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(160).duration(360)} style={{ gap: 8 }}>
              <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "800" }}>
                이어서
              </KitText>
              {rest.map((match) => (
                <MatchRowCard key={match.id} match={match} kit={kit} />
              ))}
            </Animated.View>
          ) : null}

          {model.empty ? null : (
            <Animated.View entering={FadeInDown.delay(200).duration(360)} style={{ gap: 8 }}>
              <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "800" }}>
                내 대회
              </KitText>
              {model.competitions.map(({ competition, leftover }) => (
                <CompetitionCard key={competition.id} competition={competition} leftover={leftover} compact kit={kit} />
              ))}
            </Animated.View>
          )}
        </ScrollView>

        {/* 썸존 sticky CTA */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: space.lg,
            paddingTop: 12,
            paddingBottom: 16,
            backgroundColor: "rgba(18, 23, 33, 0.92)",
            borderTopWidth: 1,
            borderTopColor: "rgba(248,250,252,0.08)",
            gap: 8,
          }}
        >
          <Link href="/competition/new" asChild>
            <KitButton kit={kit} label="농구로 대회 만들기" />
          </Link>
          <Link href="/friendly" asChild>
            <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
          </Link>
        </View>
      </View>
    </KitScreen>
  );
}
