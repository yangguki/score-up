import type { ReactNode } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import type { BracketSlot, Match } from "@score-up/domain";
import { useAppKit } from "@/components/theme-provider";
import { P } from "@/components/ui";
import { matchDisplayScore } from "@/lib/home";
import { matchHref, statusLabel } from "@/lib/labels";
import type { HomeKit } from "@/theme/home-kits";

export type BracketDirection = "horizontal" | "vertical";

const CARD_W = 148;
const CARD_H = 96;
const SEMI_GAP = 28;

type NameOf = (teamId?: string) => string;

export function TournamentTree({
  slots,
  matches,
  nameOf,
  direction,
}: {
  slots: BracketSlot[];
  matches: Match[];
  nameOf: NameOf;
  direction: BracketDirection;
}) {
  const kit = useAppKit();
  const { width } = useWindowDimensions();
  const semis = slots.filter((s) => s.round === "sf");
  const finals = slots.filter((s) => s.round === "final");
  const champs = slots.filter((s) => s.round === "champion");

  if (direction === "vertical") {
    const cardW = Math.min(CARD_W, Math.max(128, (width - 48) / 2 - 10));
    return (
      <View style={{ gap: 4 }}>
        {champs.map((slot) => (
          <View key={slot.id} style={{ alignItems: "center", gap: 8 }}>
            <ChampionNode slot={slot} finals={finals} matches={matches} nameOf={nameOf} width={cardW} />
          </View>
        ))}

        {champs.length > 0 && finals.length > 0 ? <DownLine kit={kit} /> : null}

        {finals.map((slot) => (
          <View key={slot.id} style={{ alignItems: "center", gap: 8 }}>
            <P muted style={{ fontSize: 12, fontWeight: "800" }}>
              결승
            </P>
            <MatchNode slot={slot} matches={matches} nameOf={nameOf} width={cardW} />
          </View>
        ))}

        {semis.length > 0 && finals.length > 0 ? <UpBranch kit={kit} /> : null}

        {semis.length > 0 ? (
          <>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
              {semis.map((slot) => (
                <MatchNode key={slot.id} slot={slot} matches={matches} nameOf={nameOf} width={cardW} />
              ))}
            </View>
            <P muted style={{ fontSize: 12, fontWeight: "800", textAlign: "center" }}>
              4강
            </P>
          </>
        ) : null}
      </View>
    );
  }

  const colH = semis.length >= 2 ? CARD_H * 2 + SEMI_GAP : CARD_H;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {semis.length > 0 ? (
          <>
            <RoundCol title="4강" height={colH}>
              <View style={{ height: colH, justifyContent: "space-between" }}>
                {semis.map((slot) => (
                  <MatchNode key={slot.id} slot={slot} matches={matches} nameOf={nameOf} />
                ))}
              </View>
            </RoundCol>
            {finals.length > 0 ? <SideBranch kit={kit} height={colH} /> : null}
          </>
        ) : null}

        {finals.map((slot) => (
          <RoundCol key={slot.id} title="결승" height={colH}>
            <View style={{ height: colH, justifyContent: "center" }}>
              <MatchNode slot={slot} matches={matches} nameOf={nameOf} />
            </View>
          </RoundCol>
        ))}

        {champs.length > 0 && finals.length > 0 ? <HConnector kit={kit} height={colH} /> : null}

        {champs.map((slot) => (
          <RoundCol key={slot.id} title="우승" height={colH}>
            <View style={{ height: colH, justifyContent: "center" }}>
              <ChampionNode slot={slot} finals={finals} matches={matches} nameOf={nameOf} />
            </View>
          </RoundCol>
        ))}
      </View>
    </ScrollView>
  );
}

function RoundCol({ title, height, children }: { title: string; height: number; children: ReactNode }) {
  return (
    <View style={{ width: CARD_W, gap: 8 }}>
      <P muted style={{ fontSize: 12, fontWeight: "800", textAlign: "center" }}>
        {title}
      </P>
      <View style={{ height }}>{children}</View>
    </View>
  );
}

function SideBranch({ kit, height }: { kit: HomeKit; height: number }) {
  const mid = height / 2;
  const arm = CARD_H / 2;
  return (
    <View style={{ width: 22, height, marginTop: 28 }}>
      <View style={{ position: "absolute", left: 0, top: arm - 1, width: 12, height: 2, backgroundColor: kit.line }} />
      <View style={{ position: "absolute", left: 0, bottom: arm - 1, width: 12, height: 2, backgroundColor: kit.line }} />
      <View
        style={{
          position: "absolute",
          left: 11,
          top: arm - 1,
          width: 2,
          height: height - CARD_H + 2,
          backgroundColor: kit.line,
        }}
      />
      <View style={{ position: "absolute", left: 11, top: mid - 1, width: 11, height: 2, backgroundColor: kit.line }} />
    </View>
  );
}

function HConnector({ kit, height }: { kit: HomeKit; height: number }) {
  return (
    <View style={{ width: 18, height, marginTop: 28, justifyContent: "center" }}>
      <View style={{ height: 2, backgroundColor: kit.line }} />
    </View>
  );
}

function UpBranch({ kit }: { kit: HomeKit }) {
  return (
    <View style={{ height: 28, marginHorizontal: 24 }}>
      <View style={{ position: "absolute", left: "50%", marginLeft: -1, top: 0, width: 2, height: 14, backgroundColor: kit.line }} />
      <View style={{ position: "absolute", left: "25%", top: 14, right: "25%", height: 2, backgroundColor: kit.line }} />
      <View style={{ position: "absolute", left: "25%", top: 14, width: 2, height: 14, backgroundColor: kit.line }} />
      <View style={{ position: "absolute", right: "25%", top: 14, width: 2, height: 14, backgroundColor: kit.line }} />
    </View>
  );
}

function DownLine({ kit }: { kit: HomeKit }) {
  return (
    <View style={{ height: 18, alignItems: "center" }}>
      <View style={{ width: 2, flex: 1, backgroundColor: kit.line }} />
    </View>
  );
}

function MatchNode({
  slot,
  matches,
  nameOf,
  width = CARD_W,
}: {
  slot: BracketSlot;
  matches: Match[];
  nameOf: NameOf;
  width?: number;
}) {
  const match = matches.find((m) => m.id === slot.matchId);
  const home = nameOf(slot.homeTeamId) || match?.homeLabel || "대기";
  const away = slot.bye ? "BYE" : nameOf(slot.awayTeamId) || match?.awayLabel || "대기";
  const score = match ? postedScore(match) : null;
  const winnerId = match?.winnerTeamId;
  const inner = (
    <BracketCard
      width={width}
      top={{ name: home, score: score?.home, won: Boolean(winnerId && winnerId === slot.homeTeamId) }}
      bottom={{
        name: away,
        score: slot.bye ? undefined : score?.away,
        won: Boolean(winnerId && winnerId === slot.awayTeamId),
        muted: Boolean(slot.bye),
      }}
      footer={slot.bye ? "자동승" : match ? statusLabel(match.status, match.sportId) : "대기"}
      live={match?.status === "in_progress"}
    />
  );

  if (!match) return inner;
  return (
    <Link href={matchHref(match)} asChild>
      <Pressable>{inner}</Pressable>
    </Link>
  );
}

function ChampionNode({
  slot,
  finals,
  matches,
  nameOf,
  width = CARD_W,
}: {
  slot: BracketSlot;
  finals: BracketSlot[];
  matches: Match[];
  nameOf: NameOf;
  width?: number;
}) {
  const kit = useAppKit();
  const final = finals[0];
  const finalMatch = matches.find((m) => m.id === final?.matchId);
  const winner =
    finalMatch?.winnerLabel ||
    (finalMatch?.winnerTeamId ? nameOf(finalMatch.winnerTeamId) : "") ||
    (slot.homeTeamId ? nameOf(slot.homeTeamId) : "");
  const done = Boolean(winner);
  const inner = (
    <View
      style={{
        width,
        height: CARD_H,
        borderRadius: kit.heroRadius,
        borderWidth: done ? 2 : 1,
        borderColor: done ? kit.primary : kit.line,
        backgroundColor: kit.surface,
        padding: 12,
        justifyContent: "center",
        gap: 6,
      }}
    >
      <P muted style={{ fontSize: 11, fontWeight: "800" }}>
        우승
      </P>
      <Text numberOfLines={2} style={{ color: done ? kit.primary : kit.muted, fontSize: 18, fontWeight: "900" }}>
        {winner || "대기"}
      </Text>
    </View>
  );

  if (!finalMatch) return inner;
  return (
    <Link href={matchHref(finalMatch)} asChild>
      <Pressable>{inner}</Pressable>
    </Link>
  );
}

function BracketCard({
  width = CARD_W,
  top,
  bottom,
  footer,
  live,
}: {
  width?: number;
  top: { name: string; score?: number; won?: boolean };
  bottom: { name: string; score?: number; won?: boolean; muted?: boolean };
  footer: string;
  live?: boolean;
}) {
  const kit = useAppKit();
  return (
    <View
      style={{
        width,
        height: CARD_H,
        borderRadius: kit.heroRadius,
        borderWidth: live ? 2 : 1,
        borderColor: live ? kit.live : kit.line,
        backgroundColor: kit.surface,
        overflow: "hidden",
      }}
    >
      <TeamRow row={top} />
      <View style={{ height: 1, backgroundColor: kit.line }} />
      <TeamRow row={bottom} />
      <View
        style={{
          marginTop: "auto",
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: kit.surface2,
          borderTopWidth: 1,
          borderTopColor: kit.line,
        }}
      >
        <Text style={{ color: live ? kit.live : kit.muted, fontSize: 10, fontWeight: "800" }}>{footer}</Text>
      </View>
    </View>
  );
}

function TeamRow({
  row,
}: {
  row: { name: string; score?: number; won?: boolean; muted?: boolean };
}) {
  const kit = useAppKit();
  const color = row.muted ? kit.muted : row.won ? kit.primary : kit.text;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 7, gap: 6 }}>
      <Text numberOfLines={1} style={{ flex: 1, color, fontSize: 13, fontWeight: row.won ? "800" : "600" }}>
        {row.name}
      </Text>
      {row.score != null ? (
        <Text style={{ color, fontSize: 14, fontWeight: "800", minWidth: 20, textAlign: "right" }}>{row.score}</Text>
      ) : null}
    </View>
  );
}

function postedScore(match: Match): { home: number; away: number } | null {
  if (
    match.status === "in_progress" ||
    match.status === "paused" ||
    match.status === "period_break" ||
    match.status === "confirm_period_end" ||
    match.status === "confirm_match_end" ||
    match.status === "completed" ||
    match.status === "forfeited"
  ) {
    return matchDisplayScore(match);
  }
  return null;
}
