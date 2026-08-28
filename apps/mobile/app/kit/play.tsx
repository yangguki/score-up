import { View } from "react-native";
import { PlaySportGrid } from "@/components/play/blob-card";
import { PlayDock } from "@/components/play/dock";
import { PlayLogo } from "@/components/play/logo";
import { PlayButton, PlayCard, PlayHeadline, PlayText } from "@/components/play/ui";
import { CatalogNote, CatalogRow, CatalogScreen, CatalogSection, CopyChip, Swatch } from "@/components/kit/catalog";
import { play } from "@/theme/play";

export default function PlayKitScreen() {
  return (
    <CatalogScreen bg={play.bg}>
      <CatalogNote>
        H9 Play 시안 키트입니다. 블롭 종목 카드, 민트 up 로고, 스포츠/최근 활동 독을 여기서 관리합니다. 테니스·족구·기타 게임은 제품 종목이 아니라 넣지 않습니다.
      </CatalogNote>
      <CopyChip value="theme/play.ts · components/play · lib/play-sports.ts" />

      <CatalogSection title="로고 · 헤드라인">
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <PlayHeadline />
          <PlayLogo size={54} />
        </View>
      </CatalogSection>

      <CatalogSection title="색" hint="민트 액센트 · 네이비 독">
        <CatalogRow>
          <Swatch color={play.bg} label="bg" />
          <Swatch color={play.mint} label="mint" />
          <Swatch color={play.navy} label="navy" />
          <Swatch color={play.surface2} label="surface2" />
        </CatalogRow>
      </CatalogSection>

      <CatalogSection title="버튼">
        <View style={{ gap: 10 }}>
          <PlayButton label="대회 만들기" variant="navy" />
          <PlayButton label="빠른 친선경기" variant="ghost" />
          <PlayButton label="민트" variant="mint" />
        </View>
      </CatalogSection>

      <CatalogSection title="카드">
        <PlayCard>
          <PlayText style={{ fontWeight: "800" }}>PlayCard</PlayText>
          <PlayText muted style={{ marginTop: 6 }}>
            최근 활동 목록의 껍데기
          </PlayText>
        </PlayCard>
      </CatalogSection>

      <CatalogSection title="종목 블롭" hint="세로는 작은 2열, 가로는 폭에 맞춰 4열 2줄">
        <PlaySportGrid />
      </CatalogSection>

      <CatalogSection title="독">
        <PlayDock tab="sports" onChange={() => undefined} />
        <View style={{ height: 8 }} />
        <PlayDock tab="activity" onChange={() => undefined} />
      </CatalogSection>
    </CatalogScreen>
  );
}
