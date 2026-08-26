import { Link } from "expo-router";
import { Pressable, View } from "react-native";
import type { Competition, Match } from "@score-up/domain";
import { KitBadge, KitCard, KitText, KitTitle } from "@/components/home/kit-ui";
import {
  competitionStatusLabel,
  formatLabel,
  leftoverLine,
  matchClockLine,
  matchDisplayScore,
  matchSportLine,
} from "@/lib/home";
import { matchHref, statusLabel } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";
import type { HomeKit } from "@/theme/home-kits";

function isLiveLike(match: Match) {
  return match.status !== "scheduled" && match.status !== "lineup";
}

export function MatchStackCard({ match, kit }: { match: Match; kit: HomeKit }) {
  const live = isLiveLike(match);
  const accent = kit.accent ?? kit.primary;
  return (
    <Link href={matchHref(match)} asChild>
      <Pressable>
        <KitCard
          kit={kit}
          style={
            live
              ? {
                  borderColor: kit.live,
                  borderWidth: 1.5,
                  paddingTop: 14,
                }
              : undefined
          }
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <KitText kit={kit} muted style={{ flex: 1, fontSize: 13, fontWeight: "600" }}>
              {matchSportLine(match)} · {match.scheduledLabel}
            </KitText>
            <KitBadge kit={kit} label={statusLabel(match.status)} live={live} />
          </View>
          {live ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, alignItems: "flex-end" }}>
              <View style={{ flex: 1 }}>
                <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "600" }}>
                  홈
                </KitText>
                <KitTitle kit={kit} style={{ fontSize: 18, fontWeight: "800" }}>
                  {match.homeLabel}
                </KitTitle>
                <View style={{ height: 3, width: 28, borderRadius: 2, backgroundColor: match.homeColor, marginTop: 6 }} />
              </View>
              <KitTitle kit={kit} style={{ fontSize: kit.scoreSize, marginHorizontal: 6, fontWeight: "900", letterSpacing: -1 }}>
                {matchDisplayScore(match).home}
              </KitTitle>
              <KitText kit={kit} muted style={{ marginHorizontal: 2, fontWeight: "700" }}>
                -
              </KitText>
              <KitTitle kit={kit} style={{ fontSize: kit.scoreSize, marginHorizontal: 6, fontWeight: "900", letterSpacing: -1 }}>
                {matchDisplayScore(match).away}
              </KitTitle>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <KitText kit={kit} muted style={{ fontSize: 12, fontWeight: "600" }}>
                  어웨이
                </KitText>
                <KitTitle kit={kit} style={{ fontSize: 18, fontWeight: "800" }}>
                  {match.awayLabel}
                </KitTitle>
                <View style={{ height: 3, width: 28, borderRadius: 2, backgroundColor: match.awayColor, marginTop: 6 }} />
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, alignItems: "center" }}>
              <KitTitle kit={kit} style={{ fontSize: 18, flex: 1, fontWeight: "800" }}>
                {match.homeLabel}
              </KitTitle>
              <View
                style={{
                  marginHorizontal: 10,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: kit.surface2,
                }}
              >
                <KitText kit={kit} muted style={{ fontWeight: "800", fontSize: 12 }}>
                  vs
                </KitText>
              </View>
              <KitTitle kit={kit} style={{ fontSize: 18, flex: 1, textAlign: "right", fontWeight: "800" }}>
                {match.awayLabel}
              </KitTitle>
            </View>
          )}
          <View
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: kit.line,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <KitText kit={kit} muted style={{ fontSize: 13 }}>
              {live ? matchClockLine(match) : match.scheduledLabel}
            </KitText>
            <KitText kit={kit} style={{ fontSize: 13, fontWeight: "800", color: live ? kit.live : accent }}>
              {live ? "이어하기 →" : match.status === "lineup" ? "출전 확인 →" : "경기 열기 →"}
            </KitText>
          </View>
        </KitCard>
      </Pressable>
    </Link>
  );
}

export function CompetitionCard({
  competition,
  leftover,
  compact,
  kit,
}: {
  competition: Competition;
  leftover: number;
  compact?: boolean;
  kit: HomeKit;
}) {
  const accent = kit.accent ?? kit.primary;
  return (
    <Link href={`/competition/${competition.id}`} asChild>
      <Pressable>
        <KitCard kit={kit}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
            <KitTitle kit={kit} style={{ fontSize: compact ? 16 : 18, flex: 1, fontWeight: "800", letterSpacing: -0.3 }}>
              {competition.name}
            </KitTitle>
            <KitBadge kit={kit} label={sportLabel(competition.sportId)} />
          </View>
          <KitText kit={kit} muted style={{ marginTop: 8, fontSize: 13 }}>
            {formatLabel(competition.format)} · {competitionStatusLabel(competition.status)} · {competition.dateLabel}
          </KitText>
          <KitText kit={kit} style={{ marginTop: 8, fontSize: 14, fontWeight: "700", color: leftover > 0 ? accent : kit.muted }}>
            {leftoverLine(leftover)}
          </KitText>
        </KitCard>
      </Pressable>
    </Link>
  );
}
