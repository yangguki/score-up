import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { ClubCardList, HomeOperatorLink, HomeSectionTitle } from "@/components/home/home-shared";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import type { HomeClubCard } from "@/lib/club-home";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_KIT } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

const CLUB_BLUE = "#3D8BFF";
const COURT_AMBER = "#F5A623";

/** C · 모임 OS · 듀얼 CTA (대회 | 모임) */
export function HomeC({
  model,
  operatorName,
  clubs,
}: {
  model: Model;
  operatorName: string;
  clubs: HomeClubCard[];
}) {
  const kit = HOME_KIT;
  const emptyClubs = clubs.length === 0;
  const clubHref = emptyClubs ? "/club/new" : `/club/${clubs[0].club.id}`;
  const clubLabel = emptyClubs ? "모임 만들기" : "내 모임 / 회차";

  return (
    <KitScreen kit={kit}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: 56, gap: space.lg }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).springify().damping(17)} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, paddingRight: 12, gap: 8 }}>
              <KitTitle kit={kit} style={{ color: "#FFFFFF", fontSize: 36, lineHeight: 38, fontWeight: "900", letterSpacing: -1.2 }}>
                SCORE UP
              </KitTitle>
              <KitText kit={kit} style={{ color: "#A8B4C4", fontSize: 15, lineHeight: 22, fontWeight: "600" }}>
                모임 OS · CTA 동등 비교용
              </KitText>
            </View>
            <HomeOperatorLink kit={kit} name={operatorName} />
          </View>
          <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "700" }}>
            시안 C · 비교용
          </KitText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400).springify().damping(18)} style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Link href="/competition/new" asChild>
                <Pressable>
                  <View
                    style={{
                      backgroundColor: COURT_AMBER,
                      borderRadius: kit.radius,
                      minHeight: 54,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 8,
                    }}
                  >
                    <KitText kit={kit} style={{ fontSize: 14, fontWeight: "900", color: "#0B1220", textAlign: "center" }}>
                      대회 만들기
                    </KitText>
                  </View>
                </Pressable>
              </Link>
            </View>
            <View style={{ flex: 1 }}>
              <Link href={clubHref} asChild>
                <Pressable>
                  <View
                    style={{
                      backgroundColor: CLUB_BLUE,
                      borderRadius: kit.radius,
                      minHeight: 54,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 8,
                    }}
                  >
                    <KitText kit={kit} style={{ fontSize: 14, fontWeight: "900", color: "#FFFFFF", textAlign: "center" }}>
                      {clubLabel}
                    </KitText>
                  </View>
                </Pressable>
              </Link>
            </View>
          </View>
          <Link href="/friendly" asChild>
            <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
          </Link>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(400).springify().damping(18)} style={{ gap: space.sm }}>
          <HomeSectionTitle kit={kit} title="지금 할 일" live />
          {model.now.length === 0 && emptyClubs ? (
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
                {EMPTY_HOME_COPY}
              </KitText>
            </View>
          ) : model.now.length === 0 ? (
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
                오늘 배정된 경기가 없습니다.
              </KitText>
            </View>
          ) : (
            model.now.map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
          )}
        </Animated.View>

        {emptyClubs ? null : (
          <Animated.View entering={FadeInDown.delay(200).duration(400).springify().damping(18)} style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <HomeSectionTitle kit={kit} title="내 모임" />
              </View>
              <Link href="/club/new" asChild>
                <Pressable style={{ padding: 8 }}>
                  <KitText kit={kit} style={{ fontSize: 22, fontWeight: "800", color: CLUB_BLUE }}>
                    +
                  </KitText>
                </Pressable>
              </Link>
            </View>
            <ClubCardList kit={kit} clubs={clubs} />
          </Animated.View>
        )}

        {model.empty ? null : (
          <Animated.View entering={FadeInDown.delay(260).duration(400).springify().damping(18)} style={{ gap: space.sm }}>
            <HomeSectionTitle kit={kit} title="내 대회" />
            {model.competitions.map(({ competition, leftover }) => (
              <CompetitionCard key={competition.id} competition={competition} leftover={leftover} kit={kit} />
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </KitScreen>
  );
}
