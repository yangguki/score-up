import { Text, View, type ViewProps } from "react-native";

/** 코트 라인·센터서클 분위기. 장식만, 상호작용 없음. */
export function CourtAtmosphere({
  line = "rgba(11, 18, 32, 0.08)",
  glowA = "rgba(245, 166, 35, 0.22)",
  glowB = "rgba(61, 139, 255, 0.16)",
  style,
  ...rest
}: ViewProps & { line?: string; glowA?: string; glowB?: string }) {
  return (
    <View pointerEvents="none" style={[{ position: "absolute", inset: 0, overflow: "hidden" }, style]} {...rest}>
      <View
        style={{
          position: "absolute",
          top: -56,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: glowA,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 96,
          left: -90,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: glowB,
        }}
      />
      <View style={{ position: "absolute", left: 18, top: 12, bottom: 8, width: 1.5, backgroundColor: line }} />
      <View style={{ position: "absolute", right: 18, top: 12, bottom: 8, width: 1.5, backgroundColor: line }} />
      <View style={{ position: "absolute", left: 18, right: 18, top: "42%", height: 1.5, backgroundColor: line }} />
      <View
        style={{
          position: "absolute",
          top: "42%",
          marginTop: -34,
          left: "50%",
          marginLeft: -34,
          width: 68,
          height: 68,
          borderRadius: 34,
          borderWidth: 1.5,
          borderColor: line,
        }}
      />
    </View>
  );
}

/** 전광판 느낌의 미니 스트립 (장식) */
export function ScoreStrip({
  quarter = "Q1",
  clock = "08:00",
  ink = "#0B1220",
  amber = "#F5A623",
}: {
  quarter?: string;
  clock?: string;
  ink?: string;
  amber?: string;
}) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: ink,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: amber }} />
      <Text style={{ color: "#F8FAFC", fontSize: 12, fontWeight: "800", letterSpacing: 0.4 }}>{quarter}</Text>
      <View style={{ width: 1, height: 12, backgroundColor: "rgba(248,250,252,0.25)" }} />
      <Text
        style={{
          color: amber,
          fontSize: 12,
          fontWeight: "800",
          letterSpacing: 0.8,
          fontVariant: ["tabular-nums"],
        }}
      >
        {clock}
      </Text>
    </View>
  );
}
