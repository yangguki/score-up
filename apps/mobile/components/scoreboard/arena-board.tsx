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
        <TeamHalf side={home} scoreSize={scoreSize} />
        <TeamHalf side={away} scoreSize={scoreSize} />
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
            paddingHorizontal: 20,
            paddingVertical: compact ? 6 : 8,
            borderRadius: 16,
            marginTop: 4,
            maxWidth: "58%",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }} numberOfLines={1}>
            {centerTitle}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: compact ? 40 : 56,
              fontWeight: "900",
              lineHeight: compact ? 44 : 60,
              fontVariant: ["tabular-nums"],
            }}
          >
            {centerMain}
          </Text>
          {centerSub ? (
            <Text style={{ color: "#ffffffcc", fontSize: 13, fontWeight: "700", marginTop: 2 }} numberOfLines={1}>
              {centerSub}
            </Text>
          ) : null}
          {notice ? (
            <Text style={{ color: colors.bonus, fontWeight: "700", marginTop: 4, textAlign: "center" }}>{notice}</Text>
          ) : null}
        </View>
        <Pressable onPress={onMore} style={chromeBtn}>
          <Text style={chromeText}>더보기</Text>
        </Pressable>
      </SafeAreaView>

      {overlay}

      <View style={{ backgroundColor: colors.bg, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10, gap: 8 }}>
        {dock}
      </View>
    </View>
  );
}

function TeamHalf({ side, scoreSize }: { side: ArenaSide; scoreSize: number }) {
  return (
    <View style={{ flex: 1, backgroundColor: side.color, justifyContent: "center", alignItems: "center", paddingHorizontal: 12 }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 0.4 }} numberOfLines={2}>
        {side.label}
      </Text>
      <Text
        style={{
          color: "#fff",
          fontSize: scoreSize,
          fontWeight: "900",
          lineHeight: scoreSize * 1.05,
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
  return <View style={{ flexDirection: "row", gap: 8 }}>{children}</View>;
}

export function ArenaActionRow({ side, children }: { side: "home" | "away"; children: ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
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
  flex: 1,
  backgroundColor: colors.surface2,
  borderRadius: 8,
  paddingVertical: 8,
  alignItems: "center" as const,
};
export const arenaBottomGhostText = { color: colors.text, fontWeight: "700" as const, fontSize: 13 };
export const arenaOverlayBox = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 88,
  justifyContent: "center" as const,
  alignItems: "center" as const,
  backgroundColor: "#0007",
  gap: 10,
};
export function ArenaRecent({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
        최근: {text || "없음"}
      </Text>
    </Pressable>
  );
}

export const arenaStartBtn = {
  backgroundColor: colors.primary,
  paddingHorizontal: 28,
  paddingVertical: 16,
  borderRadius: 16,
};

const chromeBtn = { backgroundColor: "#0006", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 6 };
const chromeText = { color: "#fff", fontWeight: "700" as const, fontSize: 13 };
