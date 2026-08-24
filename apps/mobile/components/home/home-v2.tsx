import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { CompetitionCard, MatchRowCard } from "@/components/home/cards";
import { KitButton, KitCard, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

const kit = HOME_KITS.v2;

export function HomeV2({ model }: { model: Model }) {
  return (
    <KitScreen kit={kit}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 48 }}>
        <View>
          <KitText kit={kit} muted>
            오늘
          </KitText>
          <KitTitle kit={kit} style={{ marginTop: 4, fontSize: 28 }}>
            지금 할 일
          </KitTitle>
        </View>

        <KitCard
          kit={kit}
          style={{
            borderRadius: kit.heroRadius,
            backgroundColor: kit.surface,
            borderColor: kit.primary,
            borderWidth: 2,
            padding: 20,
          }}
        >
          <KitText kit={kit} muted style={{ fontWeight: "700", letterSpacing: 0.4 }}>
            다음 행동
          </KitText>
          <KitTitle kit={kit} style={{ fontSize: 24, marginTop: 8 }}>
            {model.action.title}
          </KitTitle>
          <KitText kit={kit} muted style={{ marginTop: 6 }}>
            {model.empty ? EMPTY_HOME_COPY : model.action.subtitle}
          </KitText>
          <View style={{ marginTop: 16 }}>
            <Link href={model.action.href} asChild>
              <KitButton kit={kit} label={model.action.cta} />
            </Link>
          </View>
        </KitCard>

        <KitTitle kit={kit} style={{ fontSize: 16, marginTop: 8 }}>
          오늘 일정
        </KitTitle>
        {model.now.length === 0 ? (
          <KitText kit={kit} muted>
            오늘 배정된 경기가 없습니다.
          </KitText>
        ) : (
          model.now.map((match) => <MatchRowCard key={match.id} match={match} kit={kit} />)
        )}

        <KitTitle kit={kit} style={{ fontSize: 16, marginTop: 8 }}>
          내 대회
        </KitTitle>
        {model.competitions.length === 0 ? (
          <KitText kit={kit} muted>
            진행 중인 대회가 없습니다.
          </KitText>
        ) : (
          model.competitions.map(({ competition, leftover }) => (
            <CompetitionCard key={competition.id} competition={competition} leftover={leftover} compact kit={kit} />
          ))
        )}

        <Link href="/competition/new" asChild>
          <KitButton kit={kit} label="대회 만들기" />
        </Link>
        <Link href="/friendly" asChild>
          <KitButton kit={kit} label="빠른 친선경기" variant="ghost" />
        </Link>
      </ScrollView>
    </KitScreen>
  );
}
