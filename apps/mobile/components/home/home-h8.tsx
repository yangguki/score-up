import { Link, router, type Href } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { BrandLogo } from "@/components/brand/logo";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { HomeVersionSwitch } from "@/components/home/home-version-switch";
import { LiftAtmosphere } from "@/components/lift/atmosphere";
import { LiftSportPicker } from "@/components/lift/sport-picker";
import { LiftButton, LiftCard, LiftScreen, LiftSection, LiftText, LiftTitle } from "@/components/lift/ui";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_TAGLINE, HOME_VALUE_LINES, type HomeSport } from "@/lib/home-sports";
import type { HomeClubCard } from "@/lib/club-home";
import { sportLabel } from "@/lib/match-routes";
import { LIFT_KIT } from "@/theme/home-kits";
import { lift } from "@/theme/lift";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/** 로고 라이트 허브 — H8 비교 시안. IA(카드 규칙·CTA)는 H1과 같다. */
export function HomeH8({
  model,
  operatorName,
  clubs,
}: {
  model: Model;
  operatorName: string;
  clubs: HomeClubCard[];
}) {
  const kit = LIFT_KIT;

  return (
    <LiftScreen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: 56, gap: space.lg }}
        showsVerticalScrollIndicator={false}
      >
        <HomeVersionSwitch tone="light" />

        <View style={{ overflow: "hidden", marginHorizontal: -space.lg, paddingHorizontal: space.lg, paddingBottom: 8, minHeight: 168 }}>
          <LiftAtmosphere />

          <Animated.View entering={FadeInDown.duration(440).springify().damping(17)} style={{ gap: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, paddingRight: 12, gap: 8 }}>
                <LiftTitle
                  style={{
                    color: lift.ink,
                    fontSize: 40,
                    lineHeight: 42,
                    fontWeight: "900",
                    letterSpacing: -1.4,
                  }}
                >
                  SCORE UP
                </LiftTitle>
                <LiftText style={{ color: lift.muted, fontSize: 15, lineHeight: 22, fontWeight: "600" }}>{HOME_TAGLINE}</LiftText>
                <LiftText style={{ fontSize: 13, fontWeight: "700", color: lift.primary }}>{operatorName || "운영자"}</LiftText>
              </View>
              <Link href="/settings" asChild>
                <BrandLogo size={56} />
              </Link>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInRight.delay(80).duration(420).springify().damping(18)}
            style={{ marginTop: space.md, flexDirection: "row", flexWrap: "wrap", gap: 8 }}
          >
            {HOME_VALUE_LINES.map((line, i) => (
              <View
                key={line}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(255,255,255,0.78)",
                  borderWidth: 1,
                  borderColor: lift.line,
                  borderRadius: 999,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                <View
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: lift.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 6,
                  }}
                >
                  <LiftText style={{ fontSize: 11, fontWeight: "900", color: "#fff" }}>{String(i + 1).padStart(2, "0")}</LiftText>
                </View>
                <LiftText style={{ fontSize: 12, fontWeight: "700", color: lift.ink }}>{line}</LiftText>
              </View>
            ))}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(120).duration(420).springify().damping(18)} style={{ gap: space.md }}>
          <LiftSection title="종목 고르기" hint="종목을 고르면 빠른 친선이 열립니다" />
          <LiftSportPicker
            onSelect={(sport: HomeSport) => {
              if (sport.active) {
                router.push(`/friendly?sport=${sport.id}` as Href);
              }
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(420).springify().damping(18)} style={{ gap: 10 }}>
          <Link href="/competition/new" asChild>
            <LiftButton label="대회 만들기" />
          </Link>
          <Link href="/friendly" asChild>
            <LiftButton label="빠른 친선경기" variant="ghost" />
          </Link>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(420).springify().damping(18)} style={{ gap: space.sm }}>
          <LiftSection title="지금 할 일" live />
          {model.now.length === 0 ? (
            <LiftCard dashed>
              <LiftText muted style={{ fontSize: 14, lineHeight: 21 }}>
                {model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}
              </LiftText>
            </LiftCard>
          ) : (
            model.now.map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
          )}
          {model.nowOverflow ? (
            <Link href="/competitions" asChild>
              <Pressable style={{ paddingVertical: 8 }}>
                <LiftText style={{ fontSize: 14, fontWeight: "700", color: lift.primary }}>오늘 경기 더보기</LiftText>
              </Pressable>
            </Link>
          ) : null}
        </Animated.View>

        {model.empty ? null : (
          <Animated.View entering={FadeInDown.delay(300).duration(420).springify().damping(18)} style={{ gap: space.sm }}>
            <LiftSection title="내 대회" />
            {model.competitions.map(({ competition, leftover }) => (
              <CompetitionCard key={competition.id} competition={competition} leftover={leftover} kit={kit} />
            ))}
            {model.competitionOverflow ? (
              <Link href="/competitions" asChild>
                <Pressable style={{ paddingVertical: 8 }}>
                  <LiftText style={{ fontSize: 14, fontWeight: "700", color: lift.primary }}>대회 모두 보기</LiftText>
                </Pressable>
              </Link>
            ) : null}
          </Animated.View>
        )}

        {clubs.length === 0 ? null : (
          <Animated.View entering={FadeInDown.delay(340).duration(420).springify().damping(18)} style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <LiftSection title="내 모임" hint="참석 투표는 회차에서" />
              </View>
              <Link href="/club/new" asChild>
                <Pressable style={{ padding: 8 }}>
                  <LiftText style={{ fontSize: 22, fontWeight: "800", color: lift.primary }}>+</LiftText>
                </Pressable>
              </Link>
            </View>
            {clubs.map(({ club, nextLine, voteLine }) => (
              <Link key={club.id} href={`/club/${club.id}`} asChild>
                <Pressable>
                  <LiftCard>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <LiftText style={{ fontSize: 16, fontWeight: "800" }}>{club.name}</LiftText>
                      <LiftText muted style={{ fontSize: 12, fontWeight: "700" }}>
                        {sportLabel(club.sportId)}
                      </LiftText>
                    </View>
                    <LiftText muted style={{ fontSize: 13, marginTop: 6 }}>
                      다음 회차 {nextLine}
                    </LiftText>
                    {voteLine ? (
                      <LiftText style={{ fontSize: 13, fontWeight: "700", color: lift.primary, marginTop: 4 }}>
                        내 투표 {voteLine}
                      </LiftText>
                    ) : null}
                  </LiftCard>
                </Pressable>
              </Link>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </LiftScreen>
  );
}
