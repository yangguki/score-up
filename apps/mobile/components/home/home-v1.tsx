import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

const kit = HOME_KITS.v1;

export function HomeV1({ model }: { model: Model }) {
  return (
    <KitScreen kit={kit}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <KitTitle kit={kit}>SCORE UP</KitTitle>
            <KitText kit={kit} muted style={{ marginTop: 4 }}>
              지금 할 일과 만들 일
            </KitText>
          </View>
          <Link href="/settings" asChild>
            <Pressable
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: kit.line,
                backgroundColor: kit.surface,
              }}
            >
              <KitText kit={kit} muted style={{ fontSize: 13, fontWeight: "600" }}>
                운영자
              </KitText>
            </Pressable>
          </Link>
        </View>

        <KitTitle kit={kit} style={{ fontSize: 16, marginTop: 8 }}>
          진행 중
        </KitTitle>
        {model.now.length === 0 ? (
          <KitText kit={kit} muted>
            {model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}
          </KitText>
        ) : (
          model.now.map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
        )}
        {model.nowOverflow ? (
          <Link href="/competitions" asChild>
            <Pressable>
              <KitText kit={kit} style={{ fontWeight: "700" }}>
                오늘 경기 더보기
              </KitText>
            </Pressable>
          </Link>
        ) : null}

        {model.empty ? null : (
          <>
            <KitTitle kit={kit} style={{ fontSize: 16, marginTop: 8 }}>
              내 대회
            </KitTitle>
            {model.competitions.length === 0 ? (
              <KitText kit={kit} muted>
                진행 중인 대회가 없습니다.
              </KitText>
            ) : (
              model.competitions.map(({ competition, leftover }) => (
                <CompetitionCard key={competition.id} competition={competition} leftover={leftover} kit={kit} />
              ))
            )}
          </>
        )}
      </ScrollView>
      <View
        style={{
          padding: space.md,
          gap: 8,
          borderTopWidth: 1,
          borderTopColor: kit.line,
          backgroundColor: kit.bg,
        }}
      >
        <Link href="/competition/new" asChild>
          <KitButton kit={kit} label="대회 만들기" />
        </Link>
        <Link href="/friendly" asChild>
          <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
        </Link>
      </View>
    </KitScreen>
  );
}
