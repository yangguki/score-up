import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { CompetitionCard, LivePinCard, MatchRowCard } from "@/components/home/cards";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { EMPTY_HOME_COPY, isLiveMatch, type buildHomeModel } from "@/lib/home";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

const kit = HOME_KITS.v3;

export function HomeV3({ model }: { model: Model }) {
  const pinned = model.now.find(isLiveMatch) ?? model.now[0];
  const rest = model.now.filter((match) => match.id !== pinned?.id);

  return (
    <KitScreen kit={kit}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <KitTitle kit={kit}>SCORE UP</KitTitle>
            <KitText kit={kit} muted style={{ marginTop: 4 }}>
              운영자
            </KitText>
          </View>
          <Link href="/competition/new" asChild>
            <KitButton
              kit={kit}
              label="대회 만들기"
              style={{ paddingVertical: 10, paddingHorizontal: 12, minHeight: 40 }}
            />
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
          <View style={{ gap: space.sm }}>
            <KitTitle kit={kit} style={{ fontSize: 16 }}>
              다음
            </KitTitle>
            {rest.map((match) => (
              <MatchRowCard key={match.id} match={match} kit={kit} />
            ))}
          </View>
        ) : null}

        <KitTitle kit={kit} style={{ fontSize: 16, marginTop: 8 }}>
          내 대회
        </KitTitle>
        {model.competitions.length === 0 ? (
          <KitText kit={kit} muted>
            진행 중인 대회가 없습니다.
          </KitText>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
            {model.competitions.map(({ competition, leftover }) => (
              <View key={competition.id} style={{ width: 260 }}>
                <CompetitionCard competition={competition} leftover={leftover} compact kit={kit} />
              </View>
            ))}
          </ScrollView>
        )}

        <Link href="/friendly" asChild>
          <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
        </Link>
      </ScrollView>
    </KitScreen>
  );
}
