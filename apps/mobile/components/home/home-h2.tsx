import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { CompetitionCard, LivePinCard, MatchRowCard } from "@/components/home/cards";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportPicker } from "@/components/home/sport-picker";
import { EMPTY_HOME_COPY, isLiveMatch, type buildHomeModel } from "@/lib/home";
import { HOME_TAGLINE } from "@/lib/home-sports";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/**
 * 진화 A — 라이브 우선 허브
 * GameChanger식 “지금” 강조 + Scoreholio식 대회/친선. 브랜드는 컴팩트, 라이브 핀이 바로 아래.
 */
export function HomeH2({ model }: { model: Model }) {
  const kit = HOME_KITS.h2;
  const pinned = model.now.find(isLiveMatch) ?? model.now[0];
  const rest = model.now.filter((m) => m.id !== pinned?.id);

  return (
    <KitScreen kit={kit}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700", letterSpacing: 1 }}>
              SCORE UP
            </KitText>
            <KitTitle kit={kit} style={{ fontSize: 22, marginTop: 4 }}>
              오늘 코트
            </KitTitle>
            <KitText kit={kit} muted style={{ marginTop: 4, fontSize: 13 }}>
              {HOME_TAGLINE}
            </KitText>
          </View>
          <Link href="/competition/new" asChild>
            <KitButton kit={kit} label="대회" style={{ minHeight: 40, paddingVertical: 8, paddingHorizontal: 14 }} />
          </Link>
        </View>

        {pinned ? (
          <LivePinCard match={pinned} kit={kit} />
        ) : (
          <KitText kit={kit} muted>
            {model.empty ? EMPTY_HOME_COPY : "진행 중이거나 오늘 배정된 경기가 없습니다."}
          </KitText>
        )}

        {rest.length > 0 ? (
          <View style={{ gap: 8 }}>
            <KitTitle kit={kit} style={{ fontSize: 15 }}>
              이어서
            </KitTitle>
            {rest.map((match) => (
              <MatchRowCard key={match.id} match={match} kit={kit} />
            ))}
          </View>
        ) : null}

        <KitTitle kit={kit} style={{ fontSize: 15 }}>
          종목
        </KitTitle>
        <SportPicker kit={kit} layout="rail" />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Link href="/competition/new" asChild>
              <KitButton kit={kit} label="대회 만들기" />
            </Link>
          </View>
          <View style={{ flex: 1 }}>
            <Link href="/friendly" asChild>
              <KitButton kit={kit} label="빠른 친선" variant="ghost" />
            </Link>
          </View>
        </View>

        {model.empty ? null : (
          <>
            <KitTitle kit={kit} style={{ fontSize: 15, marginTop: 4 }}>
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
