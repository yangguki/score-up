import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { CourtAtmosphere, ScoreStrip } from "@/components/home/court-atmosphere";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportPicker } from "@/components/home/sport-picker";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_TAGLINE, HOME_VALUE_LINES } from "@/lib/home-sports";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

function SectionTitle({
  kit,
  title,
  hint,
  live,
}: {
  kit: (typeof HOME_KITS)["h7"];
  title: string;
  hint?: string;
  live?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {live ? <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: kit.live }} /> : null}
        <KitTitle kit={kit} style={{ fontSize: 18, fontWeight: "900", letterSpacing: -0.4 }}>
          {title}
        </KitTitle>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: "#3B82F6" }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.live }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.accent ?? kit.primary }} />
      </View>
      {hint ? (
        <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "600", marginTop: 2 }}>
          {hint}
        </KitText>
      ) : null}
    </View>
  );
}

/** H1 동일 UX, 상쾌한 브리즈 톤 */
export function HomeH7({ model }: { model: Model }) {
  const kit = HOME_KITS.h7;
  const accent = kit.accent ?? kit.primary;

  return (
    <KitScreen kit={kit}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: 56, gap: space.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ overflow: "hidden", marginHorizontal: -space.lg, paddingHorizontal: space.lg, paddingBottom: 4 }}>
          <CourtAtmosphere line="rgba(7,59,76,0.14)" glowA="rgba(16,185,129,0.18)" glowB="rgba(14,165,233,0.16)" />

          <Animated.View entering={FadeInDown.duration(440).springify().damping(17)} style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, paddingRight: 12, gap: 14 }}>
                <ScoreStrip quarter="BREEZE" clock="ON" ink="#0F766E" amber={accent} />
                <View>
                  <KitTitle
                    kit={kit}
                    style={{
                      fontSize: 44,
                      lineHeight: 44,
                      fontWeight: "900",
                      letterSpacing: -1.6,
                    }}
                  >
                    SCORE UP
                  </KitTitle>
                  <View style={{ flexDirection: "row", gap: 5, marginTop: 12 }}>
                    <View style={{ width: 36, height: 5, borderRadius: 1, backgroundColor: "#3B82F6" }} />
                    <View style={{ width: 36, height: 5, borderRadius: 1, backgroundColor: kit.live }} />
                    <View style={{ width: 36, height: 5, borderRadius: 1, backgroundColor: accent }} />
                  </View>
                </View>
                <KitText kit={kit} muted style={{ fontSize: 15, lineHeight: 22, maxWidth: 320, fontWeight: "600" }}>
                  {HOME_TAGLINE}
                </KitText>
              </View>
              <Link href="/settings" asChild>
                <Pressable
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.75 : 1,
                    paddingHorizontal: 4,
                    paddingVertical: 4,
                  })}
                >
                  <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700" }}>
                    운영자
                  </KitText>
                </Pressable>
              </Link>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInRight.delay(80).duration(420).springify().damping(18)}
            style={{
              marginTop: space.lg,
              borderWidth: 1.5,
              borderColor: kit.line,
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: 14,
              padding: 14,
              gap: 12,
            }}
          >
            {HOME_VALUE_LINES.map((line, i) => (
              <View key={line} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: accent,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 6,
                  }}
                >
                  <KitText kit={kit} style={{ fontSize: 13, fontWeight: "900", color: "#FFFFFF" }}>
                    {String(i + 1).padStart(2, "0")}
                  </KitText>
                </View>
                <KitText kit={kit} style={{ flex: 1, fontSize: 14, lineHeight: 20, fontWeight: "700" }}>
                  {line}
                </KitText>
              </View>
            ))}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(120).duration(420).springify().damping(18)} style={{ gap: space.md }}>
          <SectionTitle kit={kit} title="종목 고르기" hint="아이콘으로 구분 · MVP는 농구만 활성" />
          <SportPicker kit={kit} layout="mosaic" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420).springify().damping(18)} style={{ gap: 10 }}>
          <Link href="/competition/new" asChild>
            <KitButton kit={kit} label="농구로 대회 만들기" style={{ minHeight: 54 }} />
          </Link>
          <Link href="/friendly" asChild>
            <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
          </Link>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420).springify().damping(18)} style={{ gap: space.sm }}>
          <SectionTitle kit={kit} title="지금 할 일" live />
          {model.now.length === 0 ? (
            <View
              style={{
                backgroundColor: kit.surface,
                borderRadius: kit.heroRadius,
                borderWidth: 1.5,
                borderColor: kit.line,
                borderStyle: "dashed",
                padding: 20,
              }}
            >
              <KitText kit={kit} muted style={{ fontSize: 14, lineHeight: 21 }}>
                {model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}
              </KitText>
            </View>
          ) : (
            model.now.map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
          )}
        </Animated.View>

        {model.empty ? null : (
          <Animated.View entering={FadeInDown.delay(300).duration(420).springify().damping(18)} style={{ gap: space.sm }}>
            <SectionTitle kit={kit} title="내 대회" />
            {model.competitions.map(({ competition, leftover }) => (
              <CompetitionCard key={competition.id} competition={competition} leftover={leftover} kit={kit} />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </KitScreen>
  );
}
