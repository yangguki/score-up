import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { Match } from "@score-up/domain";
import { KitButton, KitScreen, KitText, KitTitle } from "@/components/home/kit-ui";
import { SportIcon } from "@/components/home/sport-icons";
import {
  competitionStatusLabel,
  EMPTY_HOME_COPY,
  formatLabel,
  isLiveMatch,
  leftoverLine,
  matchClockLine,
  matchSportLine,
  type buildHomeModel,
} from "@/lib/home";
import { HOME_SPORTS, HOME_TAGLINE } from "@/lib/home-sports";
import { matchHref, statusLabel } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";
import { HOME_KITS } from "@/theme/home-kits";
import { space } from "@/theme/tokens";

type Model = ReturnType<typeof buildHomeModel>;

/**
 * H6 — Strava / Linear 벤치마크
 * H1·H5(다크 Arena)와 완전 반대: 흰 캔버스, 액센트 색 하나, 피드형 리스트, 카드 최소화.
 */
export function HomeH6({ model }: { model: Model }) {
  const kit = HOME_KITS.h6;
  const live = model.now.find(isLiveMatch);
  const queue = model.now.filter((m) => !live || m.id !== live.id);

  return (
    <KitScreen kit={kit}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 얇은 탑 바 — 브랜드가 히어로가 아님 */}
        <View
          style={{
            paddingHorizontal: space.lg,
            paddingTop: space.sm,
            paddingBottom: space.md,
            borderBottomWidth: 1,
            borderBottomColor: kit.line,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <KitText kit={kit} style={{ fontSize: 15, fontWeight: "900", letterSpacing: -0.3 }}>
            SCORE UP
          </KitText>
          <Link href="/settings" asChild>
            <Pressable>
              <KitText kit={kit} muted style={{ fontSize: 13, fontWeight: "600" }}>
                운영자
              </KitText>
            </Pressable>
          </Link>
        </View>

        {/* 라이브 = Strava 3-up 스탯 블록 (풀블리드 화이트) */}
        <Animated.View entering={FadeInDown.duration(380)} style={{ backgroundColor: kit.surface, paddingHorizontal: space.lg, paddingVertical: space.lg }}>
          {live ? (
            <LiveStatBlock match={live} />
          ) : (
            <View style={{ gap: 8 }}>
              <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>
                TODAY
              </KitText>
              <KitTitle kit={kit} style={{ fontSize: 26, fontWeight: "900", letterSpacing: -0.6 }}>
                기록할 경기가 없습니다
              </KitTitle>
              <KitText kit={kit} muted style={{ fontSize: 14, lineHeight: 20 }}>
                {model.empty ? EMPTY_HOME_COPY : "대회를 만들거나 친선으로 바로 시작하세요."}
              </KitText>
            </View>
          )}
        </Animated.View>

        {/* 액센트 한 줄 — Strava polyline 메타포 */}
        <View style={{ height: 3, backgroundColor: kit.primary }} />

        <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.lg }}>
          {/* Linear식 밀도: 액션은 텍스트 행 */}
          <Animated.View entering={FadeInDown.delay(60).duration(360)} style={{ gap: 0 }}>
            <Link href="/competition/new" asChild>
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: kit.line,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View>
                  <KitText kit={kit} style={{ fontSize: 16, fontWeight: "800" }}>
                    농구로 대회 만들기
                  </KitText>
                  <KitText kit={kit} muted style={{ fontSize: 13, marginTop: 2 }}>
                    프리셋 · 대진 · 스코어 한 흐름
                  </KitText>
                </View>
                <KitText kit={kit} style={{ fontSize: 22, fontWeight: "300", color: kit.primary }}>
                  →
                </KitText>
              </Pressable>
            </Link>
            <Link href="/friendly" asChild>
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: kit.line,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View>
                  <KitText kit={kit} style={{ fontSize: 16, fontWeight: "800" }}>
                    빠른 친선경기
                  </KitText>
                  <KitText kit={kit} muted style={{ fontSize: 13, marginTop: 2 }}>
                    이름 두 칸 → 보드
                  </KitText>
                </View>
                <KitText kit={kit} muted style={{ fontSize: 22, fontWeight: "300" }}>
                  →
                </KitText>
              </Pressable>
            </Link>
          </Animated.View>

          {/* 종목: 아이콘만, 라이트 칩 */}
          <Animated.View entering={FadeInDown.delay(100).duration(360)} style={{ gap: 10 }}>
            <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }}>
              SPORT
            </KitText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {HOME_SPORTS.map((sport) => (
                <View
                  key={sport.id}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: sport.active ? kit.primary : kit.surface2,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: sport.active ? 1 : 0.45,
                  }}
                >
                  <SportIcon id={sport.id} size={28} muted={!sport.active} />
                </View>
              ))}
            </View>
            <KitText kit={kit} muted style={{ fontSize: 12 }}>
              MVP · 농구만 활성 · {HOME_TAGLINE}
            </KitText>
          </Animated.View>

          {/* 대기 큐 — 피드 행 */}
          {queue.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(140).duration(360)} style={{ gap: 0 }}>
              <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 4 }}>
                UP NEXT
              </KitText>
              {queue.map((match) => (
                <QueueRow key={match.id} match={match} />
              ))}
            </Animated.View>
          ) : null}

          {/* 대회 — 카드 없이 룰 구분 */}
          {model.empty ? null : (
            <Animated.View entering={FadeInDown.delay(180).duration(360)} style={{ gap: 0 }}>
              <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 4 }}>
                COMPETITIONS
              </KitText>
              {model.competitions.map(({ competition, leftover }) => (
                <Link key={competition.id} href={`/competition/${competition.id}`} asChild>
                  <Pressable
                    style={({ pressed }) => ({
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: kit.line,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                      <KitTitle kit={kit} style={{ fontSize: 16, fontWeight: "800", flex: 1 }}>
                        {competition.name}
                      </KitTitle>
                      <KitText kit={kit} style={{ fontSize: 12, fontWeight: "800", color: kit.primary }}>
                        {sportLabel(competition.sportId)}
                      </KitText>
                    </View>
                    <KitText kit={kit} muted style={{ marginTop: 4, fontSize: 13 }}>
                      {formatLabel(competition.format)} · {competitionStatusLabel(competition.status)} · {leftoverLine(leftover)}
                    </KitText>
                  </Pressable>
                </Link>
              ))}
            </Animated.View>
          )}

          <Link href="/competition/new" asChild>
            <KitButton kit={kit} label="대회 만들기" />
          </Link>
        </View>
      </ScrollView>
    </KitScreen>
  );
}

function LiveStatBlock({ match }: { match: Match }) {
  const kit = HOME_KITS.h6;
  return (
    <Link href={matchHref(match)} asChild>
      <Pressable>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <KitText kit={kit} style={{ fontSize: 12, fontWeight: "900", color: kit.primary, letterSpacing: 1 }}>
            LIVE · {statusLabel(match.status).toUpperCase()}
          </KitText>
          <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
            {matchClockLine(match)}
          </KitText>
        </View>
        <KitText kit={kit} muted style={{ marginTop: 8, fontSize: 13 }}>
          {matchSportLine(match)} · {match.scheduledLabel}
        </KitText>
        <View style={{ flexDirection: "row", marginTop: 20, gap: 8 }}>
          <StatCell label={match.homeLabel} value={String(match.snapshot.homeScore)} />
          <StatCell label="VS" value="—" muted />
          <StatCell label={match.awayLabel} value={String(match.snapshot.awayScore)} />
        </View>
        <KitText kit={kit} style={{ marginTop: 18, fontSize: 14, fontWeight: "800", color: kit.primary }}>
          이어하기 →
        </KitText>
      </Pressable>
    </Link>
  );
}

function StatCell({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  const kit = HOME_KITS.h6;
  return (
    <View style={{ flex: 1, alignItems: muted ? "center" : "flex-start" }}>
      <KitText kit={kit} muted style={{ fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
        {label}
      </KitText>
      <KitTitle
        kit={kit}
        style={{
          fontSize: muted ? 28 : kit.scoreSize,
          fontWeight: "900",
          letterSpacing: -1.5,
          marginTop: 4,
          fontVariant: ["tabular-nums"],
          color: muted ? kit.muted : kit.text,
        }}
      >
        {value}
      </KitTitle>
    </View>
  );
}

function QueueRow({ match }: { match: Match }) {
  const kit = HOME_KITS.h6;
  return (
    <Link href={matchHref(match)} asChild>
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: kit.line,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <View style={{ width: 4, alignSelf: "stretch", backgroundColor: kit.primary, borderRadius: 2 }} />
        <View style={{ flex: 1 }}>
          <KitText kit={kit} style={{ fontSize: 15, fontWeight: "800" }}>
            {match.homeLabel} vs {match.awayLabel}
          </KitText>
          <KitText kit={kit} muted style={{ fontSize: 12, marginTop: 2 }}>
            {matchSportLine(match)} · {match.scheduledLabel}
          </KitText>
        </View>
        <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "700" }}>
          {statusLabel(match.status)}
        </KitText>
      </Pressable>
    </Link>
  );
}
