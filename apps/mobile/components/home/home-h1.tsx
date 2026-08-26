import { Link, router, type Href } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { CourtAtmosphere, ScoreStrip } from "@/components/home/court-atmosphere";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportPicker } from "@/components/home/sport-picker";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_TAGLINE, HOME_VALUE_LINES, type HomeSport } from "@/lib/home-sports";
import type { HomeClubCard } from "@/lib/club-home";
import { HOME_KIT, type HomeKit } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

const HOME_BLUE = "#3D8BFF";
const COURT_AMBER = "#F5A623";

function SectionTitle({
  kit,
  title,
  hint,
  live,
}: {
  kit: HomeKit;
  title: string;
  hint?: string;
  live?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {live ? <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: kit.live }} /> : null}
        <KitTitle kit={kit} style={{ fontSize: 18, fontWeight: "900", letterSpacing: -0.4, color: "#F8FAFC" }}>
          {title}
        </KitTitle>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: HOME_BLUE }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.live }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.accent ?? COURT_AMBER }} />
      </View>
      {hint ? (
        <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "600", marginTop: 2 }}>
          {hint}
        </KitText>
      ) : null}
    </View>
  );
}

/** 검수 확정 — 스크린샷 Arena T&M 전면 + H3식 2열 종목 */
export function HomeH1({
  model,
  operatorName,
  clubs,
}: {
  model: Model;
  operatorName: string;
  clubs: HomeClubCard[];
}) {
  const kit = HOME_KIT;
  const accent = kit.accent ?? COURT_AMBER;

  return (
    <KitScreen kit={kit}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: 56, gap: space.lg }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ overflow: "hidden", marginHorizontal: -space.lg, paddingHorizontal: space.lg, paddingBottom: 4 }}>
          <CourtAtmosphere
            line="rgba(248,250,252,0.12)"
            glowA="rgba(245, 166, 35, 0.28)"
            glowB="rgba(61, 139, 255, 0.2)"
          />

          <Animated.View entering={FadeInDown.duration(440).springify().damping(17)} style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, paddingRight: 12, gap: 14 }}>
                <ScoreStrip quarter="ARENA" clock="GO" ink="#151C2A" amber={accent} />
                <View>
                  <KitTitle
                    kit={kit}
                    style={{
                      color: "#FFFFFF",
                      fontSize: 44,
                      lineHeight: 44,
                      fontWeight: "900",
                      letterSpacing: -1.6,
                    }}
                  >
                    SCORE UP
                  </KitTitle>
                  <View style={{ flexDirection: "row", gap: 5, marginTop: 12 }}>
                    <View style={{ width: 36, height: 5, borderRadius: 1, backgroundColor: HOME_BLUE }} />
                    <View style={{ width: 36, height: 5, borderRadius: 1, backgroundColor: kit.live }} />
                    <View style={{ width: 36, height: 5, borderRadius: 1, backgroundColor: accent }} />
                  </View>
                </View>
                <KitText kit={kit} style={{ color: "#A8B4C4", fontSize: 15, lineHeight: 22, maxWidth: 320, fontWeight: "600" }}>
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
                  <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700", color: "#F8FAFC" }}>
                    {operatorName || "운영자"}
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
              borderColor: "rgba(248,250,252,0.14)",
              backgroundColor: "rgba(26, 34, 47, 0.92)",
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
                  <KitText kit={kit} style={{ fontSize: 13, fontWeight: "900", color: "#0B1220" }}>
                    {String(i + 1).padStart(2, "0")}
                  </KitText>
                </View>
                <KitText kit={kit} style={{ flex: 1, fontSize: 14, lineHeight: 20, fontWeight: "700", color: "#FFFFFF" }}>
                  {line}
                </KitText>
              </View>
            ))}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(120).duration(420).springify().damping(18)} style={{ gap: space.md }}>
          <SectionTitle kit={kit} title="종목 고르기" hint="농구·배구·탁구로 대회를 만듭니다" />
          <SportPicker
            kit={kit}
            onSelect={(sport: HomeSport) => {
              if (sport.id === "basketball" || sport.id === "volleyball" || sport.id === "table-tennis") {
                router.push(`/competition/new?sport=${sport.id}` as Href);
              }
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420).springify().damping(18)} style={{ gap: 10 }}>
          <Link href="/competition/new" asChild>
            <KitButton kit={kit} label="대회 만들기" style={{ minHeight: 54 }} />
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

        {clubs.length === 0 ? null : (
          <Animated.View entering={FadeInDown.delay(340).duration(420).springify().damping(18)} style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <SectionTitle kit={kit} title="내 모임" hint="참석 투표는 회차에서" />
              </View>
              <Link href="/club/new" asChild>
                <Pressable style={{ padding: 8 }}>
                  <KitText kit={kit} style={{ fontSize: 22, fontWeight: "800", color: accent }}>
                    +
                  </KitText>
                </Pressable>
              </Link>
            </View>
            {clubs.map(({ club, nextLine, voteLine }) => (
              <Link key={club.id} href={`/club/${club.id}`} asChild>
                <Pressable>
                  <View
                    style={{
                      backgroundColor: kit.surface,
                      borderRadius: kit.heroRadius,
                      borderWidth: 1.5,
                      borderColor: kit.line,
                      padding: 16,
                      gap: 6,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <KitText kit={kit} style={{ fontSize: 16, fontWeight: "800", color: "#F8FAFC" }}>
                        {club.name}
                      </KitText>
                      <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
                        농구
                      </KitText>
                    </View>
                    <KitText kit={kit} muted style={{ fontSize: 13 }}>
                      다음 회차 {nextLine}
                    </KitText>
                    {voteLine ? (
                      <KitText kit={kit} style={{ fontSize: 13, fontWeight: "700", color: accent }}>
                        내 투표 {voteLine}
                      </KitText>
                    ) : null}
                  </View>
                </Pressable>
              </Link>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </KitScreen>
  );
}
