import { useState } from "react";
import { Link, router, type Href } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { CompetitionCard, MatchStackCard } from "@/components/home/cards";
import { HomeVersionSwitch } from "@/components/home/home-version-switch";
import { PlaySportGrid } from "@/components/play/blob-card";
import { PlayDock, type PlayDockTab } from "@/components/play/dock";
import { PlayLogo } from "@/components/play/logo";
import { PlayButton, PlayCard, PlayHeadline, PlayScreen, PlaySection, PlayText } from "@/components/play/ui";
import type { HomeClubCard } from "@/lib/club-home";
import { EMPTY_HOME_COPY, type buildHomeModel } from "@/lib/home";
import { sportLabel } from "@/lib/match-routes";
import { PLAY_KIT } from "@/theme/home-kits";
import { play } from "@/theme/play";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/** 시안 동일 비교 — H9 Play. 종목은 제품 8종목. 테니스/족구/기타 없음. */
export function HomeH9({
  model,
  clubs,
}: {
  model: Model;
  operatorName: string;
  clubs: HomeClubCard[];
}) {
  const [tab, setTab] = useState<PlayDockTab>("sports");
  const kit = PLAY_KIT;

  return (
    <PlayScreen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeVersionSwitch tone="play" />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <PlayHeadline />
          <Link href="/settings" asChild>
            <PlayLogo size={54} />
          </Link>
        </View>

        {tab === "sports" ? (
          <PlaySportGrid
            onSelect={(sport) => router.push(`/friendly?sport=${sport.id}` as Href)}
          />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 10 }}>
              <Link href="/competition/new" asChild>
                <PlayButton label="대회 만들기" variant="navy" />
              </Link>
              <Link href="/friendly" asChild>
                <PlayButton label="빠른 친선경기" variant="ghost" />
              </Link>
            </View>
            <PlaySection title="지금 할 일">
              {model.now.length === 0 ? (
                <PlayCard>
                  <PlayText muted>{model.empty ? EMPTY_HOME_COPY : "오늘 배정된 경기가 없습니다."}</PlayText>
                </PlayCard>
              ) : (
                model.now.map((match) => <MatchStackCard key={match.id} match={match} kit={kit} />)
              )}
            </PlaySection>
            {model.empty ? null : (
              <PlaySection title="내 대회">
                {model.competitions.map(({ competition, leftover }) => (
                  <CompetitionCard key={competition.id} competition={competition} leftover={leftover} kit={kit} />
                ))}
              </PlaySection>
            )}
            {clubs.length === 0 ? null : (
              <PlaySection title="내 모임">
                {clubs.map(({ club, nextLine, voteLine }) => (
                  <Link key={club.id} href={`/club/${club.id}`} asChild>
                    <Pressable>
                      <PlayCard>
                        <PlayText style={{ fontSize: 16, fontWeight: "800" }}>{club.name}</PlayText>
                        <PlayText muted style={{ fontSize: 13, marginTop: 4 }}>
                          {sportLabel(club.sportId)} · 다음 회차 {nextLine}
                        </PlayText>
                        {voteLine ? (
                          <PlayText style={{ fontSize: 13, fontWeight: "700", color: play.mintDeep, marginTop: 4 }}>
                            내 투표 {voteLine}
                          </PlayText>
                        ) : null}
                      </PlayCard>
                    </Pressable>
                  </Link>
                ))}
              </PlaySection>
            )}
          </View>
        )}
      </ScrollView>
      <PlayDock tab={tab} onChange={setTab} />
      <View style={{ height: space.xs }} />
    </PlayScreen>
  );
}
