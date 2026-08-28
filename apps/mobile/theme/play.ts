/** H9 Play — 시안 비교. 흰 캔버스 · 민트 ‘업’ · 블롭 종목 카드. 제품 기본(H1)을 대체하지 않는다. */
export const play = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  surface2: "#F4F6F8",
  text: "#111827",
  muted: "#94A3B8",
  line: "rgba(15, 23, 42, 0.08)",
  mint: "#2DD4BF",
  mintDeep: "#14B8A6",
  navy: "#1E2A44",
  navyFg: "#FFFFFF",
  primary: "#2DD4BF",
  primaryFg: "#0B1220",
  ghost: "transparent",
  ghostFg: "#1E2A44",
  ghostLine: "rgba(30, 42, 68, 0.18)",
  live: "#E11D48",
  liveFg: "#FFFFFF",
  ink: "#111827",
  radius: 20,
  heroRadius: 28,
  pill: 999,
} as const;

export const playNavScreenOptions = {
  headerStyle: { backgroundColor: play.bg },
  headerTintColor: play.text,
  headerTitleStyle: { fontWeight: "800" as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: play.bg },
};
