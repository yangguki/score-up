import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import {
  ClubCardList,
  HomeOperatorLink,
  HomeSectionTitle,
  primaryClubCtaLabel,
  primaryClubHref,
} from "@/components/home/home-shared";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import type { HomeClubCard } from "@/lib/club-home";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_KIT } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

const CLUB_BLUE = "#3D8BFF";

/** B · 모임 OS · 회차 CTA 우선 */
export function HomeB({
  model,
  operatorName,
  clubs,
}: {
  model: Model;
  operatorName: string;
  clubs: HomeClubCard[];
}) {
  const kit = HOME_KIT;
  const primaryHref = primaryClubHref(clubs);
  const primaryLabel = primaryClubCtaLabel(clubs);
  const emptyClubs = clubs.length === 0;

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
                모임으로 이어 치고, 보드로 기록
              </KitText>
              <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                <View style={{ width: 28, height: 4, borderRadius: 1, backgroundColor: CLUB_BLUE }} />
                <View style={{ width: 28, height: 4, borderRadius: 1, backgroundColor: kit.live }} />
                <View style={{ width: 28, height: 4, borderRadius: 1, backgroundColor: kit.accent }} />
              </View>
            </View>
            <HomeOperatorLink kit={kit} name={operatorName} />
          </View>
          <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "700" }}>
            시안 B · 비교용
          </KitText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400).springify().damping(18)} style={{ gap: 10 }}>
          {emptyClubs ? (
            <>
              <HomeSectionTitle kit={kit} title="시작하기" hint="기존 모임을 찾거나 새로 만듭니다" />
              <Link href="/club/new" asChild>
                <KitButton kit={kit} label="새 모임 만들기" style={{ minHeight: 52, backgroundColor: CLUB_BLUE }} />
              </Link>
              <Link href="/login?next=/club/new" asChild>
                <KitButton kit={kit} label="기존 모임 찾기 · 로그인" variant="ghost" />
              </Link>
              <Link href="/competition/new" asChild>
                <KitButton kit={kit} label="대회만 열기" variant="ghost" />
              </Link>
            </>
          ) : (
            <>
              {primaryHref ? (
                <Link href={primaryHref} asChild>
                  <KitButton kit={kit} label={primaryLabel} style={{ minHeight: 54, backgroundColor: CLUB_BLUE }} />
                </Link>
              ) : null}
              <Link href={`/club/${clubs[0].club.id}` as Href} asChild>
                <KitButton kit={kit} label="내 모임 전체" variant="ghost" />
              </Link>
            </>
          )}
        </Animated.View>

        {emptyClubs ? null : (
          <Animated.View entering={FadeInDown.delay(140).duration(400).springify().damping(18)} style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <HomeSectionTitle kit={kit} title="내 모임" hint="참석 투표는 회차에서" />
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

        <Animated.View entering={FadeInDown.delay(200).duration(400).springify().damping(18)} style={{ gap: space.sm }}>
          <HomeSectionTitle kit={kit} title="예정 · 진행" live />
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
                {model.empty && emptyClubs ? EMPTY_HOME_COPY : "예정된 경기·회차가 없습니다."}
              </KitText>
            </View>
          ) : (
            model.now.map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
          )}
        </Animated.View>

        {model.empty ? null : (
          <Animated.View entering={FadeInDown.delay(260).duration(400).springify().damping(18)} style={{ gap: space.sm }}>
            <HomeSectionTitle kit={kit} title="내 대회" />
            {model.competitions.map(({ competition, leftover }) => (
              <CompetitionCard key={competition.id} competition={competition} leftover={leftover} kit={kit} />
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(400).springify().damping(18)} style={{ gap: 10 }}>
          <HomeSectionTitle kit={kit} title="더 보기" />
          <Link href="/competition/new" asChild>
            <KitButton kit={kit} label="대회 만들기" variant="ghost" />
          </Link>
          <Link href="/friendly" asChild>
            <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
          </Link>
        </Animated.View>
      </ScrollView>
    </KitScreen>
  );
}
