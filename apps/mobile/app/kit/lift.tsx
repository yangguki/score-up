import { View } from "react-native";
import { BrandLogo, BrandLogoWell } from "@/components/brand/logo";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { LiftAtmosphere } from "@/components/lift/atmosphere";
import { LiftSportPicker } from "@/components/lift/sport-picker";
import {
  LiftBadge,
  LiftButton,
  LiftCard,
  LiftChip,
  LiftDivider,
  LiftSection,
  LiftText,
  LiftTitle,
} from "@/components/lift/ui";
import { CatalogNote, CatalogRow, CatalogScreen, CatalogSection, CopyChip, Swatch } from "@/components/kit/catalog";
import { useAppStore } from "@/store/app-store";
import { LIFT_KIT } from "@/theme/home-kits";
import { lift } from "@/theme/lift";
import { space } from "@/theme/tokens";

export default function LiftKitScreen() {
  const matches = useAppStore((s) => s.matches);
  const competitions = useAppStore((s) => s.competitions);
  const kit = LIFT_KIT;
  const live = matches.find((m) => m.status === "in_progress" || m.status === "paused") ?? matches[0];
  const wait = matches.find((m) => m.status === "scheduled" || m.status === "lineup");
  const competition = competitions[0];

  return (
    <CatalogScreen bg={lift.bg}>
      <CatalogNote>
        H8 Lift 시안의 재사용 키트입니다. 원형 Up 로고, 필 버튼, 소프트 카드가 기준입니다. 이 화면에 컴포넌트를 추가해 관리합니다.
      </CatalogNote>
      <CopyChip value="theme/lift.ts · components/lift · components/brand/logo.tsx" />

      <CatalogSection title="로고" hint="시안 우측 상단 원형 Up 마크">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <BrandLogo size={48} />
          <BrandLogo size={56} />
          <BrandLogoWell size={72} />
        </View>
        <LiftText muted style={{ marginTop: 8, fontSize: 13 }}>
          탭하면 설정으로 갑니다 (홈 H8).
        </LiftText>
      </CatalogSection>

      <CatalogSection title="색" hint="로고 블루 · 페일 스카이">
        <CatalogRow>
          <Swatch color={lift.bg} label="bg" />
          <Swatch color={lift.surface} label="surface" />
          <Swatch color={lift.primary} label="primary" />
          <Swatch color={lift.primarySoft} label="primarySoft" />
          <Swatch color={lift.markBg} label="markBg" />
          <Swatch color={lift.live} label="live" />
        </CatalogRow>
      </CatalogSection>

      <CatalogSection title="타이포">
        <LiftTitle>SCORE UP 제목</LiftTitle>
        <LiftText>본문 · 지금 할 일과 만들 일</LiftText>
        <LiftText muted>보조 · 오늘 배정된 경기가 없습니다.</LiftText>
      </CatalogSection>

      <CatalogSection title="버튼" hint="필 라운드. Primary = 대회 만들기">
        <View style={{ gap: 10 }}>
          <LiftButton label="대회 만들기" />
          <LiftButton label="빠른 친선경기" variant="ghost" />
          <LiftButton label="조용한 동작" variant="quiet" />
          <LiftButton label="삭제" variant="danger" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <LiftButton label="작게" size="sm" style={{ flex: 1 }} />
            <LiftButton label="작게 ghost" variant="ghost" size="sm" style={{ flex: 1 }} />
          </View>
          <LiftButton label="잠금" disabled />
        </View>
      </CatalogSection>

      <CatalogSection title="카드 · 배지 · 칩">
        <LiftCard>
          <LiftSection title="섹션 제목" hint="블루 라운드 바" live />
          <LiftText style={{ marginTop: 10 }}>Lift 카드 본문입니다.</LiftText>
        </LiftCard>
        <LiftCard dashed>
          <LiftText muted>빈 상태 점선 카드</LiftText>
        </LiftCard>
        <LiftCard live>
          <LiftText style={{ fontWeight: "800" }}>라이브 보더</LiftText>
        </LiftCard>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <LiftBadge label="진행" tone="live" />
          <LiftBadge label="농구" />
          <LiftBadge label="준비" tone="primary" />
          <LiftBadge label="확인" tone="ok" />
          <LiftChip label="H8 Lift" on />
          <LiftChip label="칩" />
        </View>
        <LiftDivider />
      </CatalogSection>

      <CatalogSection title="장식" hint="로고 제도선 분위기">
        <View style={{ height: 140, borderRadius: lift.heroRadius, overflow: "hidden", backgroundColor: lift.surface }}>
          <LiftAtmosphere />
        </View>
      </CatalogSection>

      <CatalogSection title="종목 타일">
        <LiftSportPicker selectedId="basketball" />
      </CatalogSection>

      <CatalogSection title="홈 카드" hint="같은 카드 규칙, Lift 키트 색">
        <View style={{ gap: space.sm }}>
          {live ? <MatchStackCard match={live} kit={kit} /> : null}
          {wait ? <MatchStackCard match={wait} kit={kit} /> : null}
          {competition ? <CompetitionCard competition={competition} leftover={2} kit={kit} /> : null}
        </View>
      </CatalogSection>
    </CatalogScreen>
  );
}
