import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { P } from "@/components/ui";
import { useScoreboardLayout } from "@/lib/scoreboard-layout";
import { colors } from "@/theme/tokens";

export type ArenaSide = {
  label: string;
  color: string;
  score: number;
  meta?: ReactNode;
};

export function ArenaBoardShell({
  home,
  away,
  centerTitle,
  centerMain,
  centerSub,
  notice,
  overlay,
  dock,
  onLeave,
  onMore,
}: {
  home: ArenaSide;
  away: ArenaSide;
  centerTitle: string;
  centerMain: string;
  centerSub?: string;
  notice?: string;
  overlay?: ReactNode;
  dock: ReactNode;
  onLeave: () => void;
  onMore: () => void;
}) {
  const { landscape, compact, scoreSize } = useScoreboardLayout();

  if (!landscape) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B1220", justifyContent: "center", alignItems: "center", padding: 32, gap: 12 }}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>가로로 돌려 주세요</Text>
        <P muted style={{ textAlign: "center" }}>
          스코어보드는 가로 화면만 지원합니다.
        </P>
        <Pressable onPress={onLeave} style={chromeBtn}>
          <Text style={chromeText}>나가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <TeamHalf side={home} scoreSize={scoreSize} compact={compact} />
        <TeamHalf side={away} scoreSize={scoreSize} compact={compact} />
      </View>

      <SafeAreaView
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingHorizontal: 12,
        }}
      >
        <Pressable onPress={onLeave} style={chromeBtn}>
          <Text style={chromeText}>나가기</Text>
        </Pressable>
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#0009",
            paddingHorizontal: 14,
            paddingVertical: compact ? 3 : 4,
            borderRadius: 12,
            marginTop: 4,
            maxWidth: "52%",
          }}
        >
          <Text style={{ color: "#ffffff99", fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
            {centerTitle}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: compact ? 32 : 44,
              fontWeight: "900",
              lineHeight: compact ? 34 : 46,
              letterSpacing: -0.5,
              fontVariant: ["tabular-nums"],
            }}
          >
            {centerMain}
          </Text>
          {centerSub ? (
            <Text style={{ color: "#ffffff88", fontSize: 10, fontWeight: "600" }} numberOfLines={1}>
              {centerSub}
            </Text>
          ) : null}
          {notice ? (
            <Text style={{ color: colors.bonus, fontWeight: "700", fontSize: 11, marginTop: 1, textAlign: "center" }}>
              {notice}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onMore} style={chromeBtn}>
          <Text style={chromeText}>더보기</Text>
        </Pressable>
      </SafeAreaView>

      {overlay}

      <SafeAreaView
        edges={["bottom"]}
        pointerEvents="box-none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
      >
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            backgroundColor: "rgba(0,0,0,0.42)",
            paddingHorizontal: 8,
            paddingVertical: compact ? 4 : 5,
            borderRadius: 12,
            gap: compact ? 3 : 4,
          }}
        >
          {dock}
        </View>
      </SafeAreaView>
    </View>
  );
}

function TeamHalf({
  side,
  scoreSize,
  compact,
}: {
  side: ArenaSide;
  scoreSize: number;
  compact: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: side.color,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: compact ? 44 : 56,
        paddingBottom: compact ? 56 : 68,
        paddingHorizontal: 8,
      }}
    >
      <Text style={{ color: "#fff", fontSize: compact ? 18 : 22, fontWeight: "800", letterSpacing: 0.4 }} numberOfLines={2}>
        {side.label}
      </Text>
      <Text
        style={{
          color: "#fff",
          fontSize: scoreSize,
          fontWeight: "900",
          lineHeight: scoreSize * 1.02,
          fontVariant: ["tabular-nums"],
        }}
      >
        {side.score}
      </Text>
      {side.meta ? <View style={{ alignItems: "center", marginTop: 4 }}>{side.meta}</View> : null}
    </View>
  );
}

export function ArenaDockRow({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 4 }}>{children}</View>;
}

export function ArenaDockFooter({ recent, children }: { recent: ReactNode; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ flex: 1, minWidth: 0 }}>{recent}</View>
      <View style={{ flexDirection: "row", gap: 4, flexShrink: 0 }}>{children}</View>
    </View>
  );
}

export function ArenaActionRow({ side, children }: { side: "home" | "away"; children: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        justifyContent: side === "home" ? "flex-start" : "flex-end",
      }}
    >
      {children}
    </View>
  );
}

export function ArenaDialog({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0009", justifyContent: "center", padding: 24 }}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 12 }}>{children}</View>
    </View>
  );
}

export function ArenaMeta({ children }: { children: ReactNode }) {
  return <Text style={{ color: "#ffffffcc", fontSize: 14, fontWeight: "700", textAlign: "center" }}>{children}</Text>;
}

export const arenaDialogTitle = { color: colors.text, fontSize: 20, fontWeight: "800" as const };
export const arenaBottomGhost = {
  backgroundColor: "rgba(255,255,255,0.12)",
  borderRadius: 6,
  paddingVertical: 3,
  paddingHorizontal: 8,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  minHeight: 24,
};
export const arenaBottomGhostText = { color: "#fff", fontWeight: "700" as const, fontSize: 11 };
export const arenaOverlayBox = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  backgroundColor: "#0007",
  gap: 10,
};
export function ArenaRecent({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={{ color: "#ffffffbb", fontSize: 11 }} numberOfLines={1}>
        최근: {text || "없음"}
      </Text>
    </Pressable>
  );
}

export const arenaStartBtn = {
  backgroundColor: colors.primary,
  paddingHorizontal: 20,
  paddingVertical: 11,
  borderRadius: 12,
};

const chromeBtn = { backgroundColor: "#0006", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, marginTop: 4 };
const chromeText = { color: "#fff", fontWeight: "700" as const, fontSize: 12 };
