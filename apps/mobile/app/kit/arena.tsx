import { View } from "react-native";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { SportPicker } from "@/components/home/sport-picker";
import { ScoreStrip } from "@/components/home/court-atmosphere";
import { KitBadge, KitButton, KitCard, KitText, KitTitle } from "@/components/home/kit-ui";
import { CatalogNote, CatalogRow, CatalogScreen, CatalogSection, CopyChip, Swatch } from "@/components/kit/catalog";
import { Btn, Card, H, P, Pill, SectionHead } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { HOME_KIT } from "@/theme/home-kits";
import { arena } from "@/theme/arena";
import { space } from "@/theme/tokens";

export default function ArenaKitScreen() {
  const matches = useAppStore((s) => s.matches);
  const competitions = useAppStore((s) => s.competitions);
  const kit = HOME_KIT;
  const live = matches.find((m) => m.status === "in_progress" || m.status === "paused") ?? matches[0];
  const wait = matches.find((m) => m.status === "scheduled" || m.status === "lineup");
  const competition = competitions[0];

  return (
    <CatalogScreen bg={arena.bg}>
      <CatalogNote dark>
        기존 홈 H1과 전역 화면이 쓰는 Arena T&M입니다. 새 버튼·카드·배지는 이 화면에 섹션을 추가해 관리합니다.
      </CatalogNote>
      <CopyChip value="theme/arena.ts · components/ui.tsx · components/home/kit-ui.tsx" />

      <CatalogSection title="색" hint="앰버 primary · 다크 캔버스" dark>
        <CatalogRow>
          <Swatch color={arena.bg} label="bg" dark />
          <Swatch color={arena.surface} label="surface" dark />
          <Swatch color={arena.primary} label="primary" dark />
          <Swatch color={arena.live} label="live" dark />
          <Swatch color={arena.home} label="home" dark />
          <Swatch color={arena.ok} label="ok" dark />
        </CatalogRow>
      </CatalogSection>

      <CatalogSection title="타이포" dark>
        <View style={{ gap: 8 }}>
          <H>SCORE UP 제목</H>
          <P>본문 · 지금 할 일과 만들 일</P>
          <P muted>보조 · 오늘 배정된 경기가 없습니다.</P>
        </View>
      </CatalogSection>

      <CatalogSection title="버튼" hint="Btn / KitButton. 동사 라벨." dark>
        <View style={{ gap: 10 }}>
          <Btn label="대회 만들기" />
          <Btn label="빠른 친선경기" variant="ghost" />
          <Btn label="시드 데이터로 되돌리기" variant="danger" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Btn label="홈" variant="home" size="sm" style={{ flex: 1 }} />
            <Btn label="어웨이" variant="away" size="sm" style={{ flex: 1 }} />
          </View>
          <KitButton kit={kit} label="Kit primary" />
          <KitButton kit={kit} label="Kit ghost" variant="ghost" />
          <Btn label="잠금" disabled />
        </View>
      </CatalogSection>

      <CatalogSection title="카드 · 배지" dark>
        <Card>
          <SectionHead title="섹션 제목" hint="블루 / 레드 / 앰버 바" live />
          <P style={{ marginTop: 10 }}>Arena 카드 본문입니다.</P>
        </Card>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          <Pill label="진행" tone="live" />
          <Pill label="농구" tone="muted" />
          <Pill label="준비" tone="primary" />
          <Pill label="확인" tone="ok" />
          <KitBadge kit={kit} label="라이브" live />
        </View>
        <KitCard kit={kit} style={{ marginTop: 4 }}>
          <KitTitle kit={kit} style={{ fontSize: 16 }}>KitCard</KitTitle>
          <KitText kit={kit} muted style={{ marginTop: 6 }}>
            홈 경기·대회 카드의 껍데기
          </KitText>
        </KitCard>
      </CatalogSection>

      <CatalogSection title="장식" dark>
        <ScoreStrip />
      </CatalogSection>

      <CatalogSection title="종목 타일" hint="홈 2열 모자이크" dark>
        <SportPicker kit={kit} selectedId="basketball" />
      </CatalogSection>

      <CatalogSection title="홈 카드" hint="시드 데이터. 라이브만 점수, 대기는 vs" dark>
        <View style={{ gap: space.sm }}>
          {live ? <MatchStackCard match={live} kit={kit} /> : null}
          {wait ? <MatchStackCard match={wait} kit={kit} /> : null}
          {competition ? <CompetitionCard competition={competition} leftover={2} kit={kit} /> : null}
        </View>
      </CatalogSection>
    </CatalogScreen>
  );
}
