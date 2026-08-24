/** SCORE UP Arena T&M — H1 확정. 전역 UI·네비·스코어보드가 이 팔레트를 쓴다. */
export const arena = {
  bg: "#121721",
  surface: "#1A222F",
  surface2: "#242D3C",
  text: "#F8FAFC",
  muted: "#A8B4C4",
  line: "rgba(248,250,252,0.14)",
  primary: "#F5A623",
  primaryFg: "#0B1220",
  ghost: "transparent",
  ghostFg: "#F8FAFC",
  ghostLine: "rgba(248,250,252,0.28)",
  live: "#E11D48",
  liveFg: "#FFFFFF",
  home: "#3D8BFF",
  away: "#FF5A4A",
  bonus: "#F5A623",
  danger: "#E11D48",
  ok: "#3DDC97",
  locked: "#3A4250",
  glow: "rgba(245, 166, 35, 0.28)",
  radius: 12,
  heroRadius: 14,
} as const;

export const navScreenOptions = {
  headerStyle: { backgroundColor: arena.bg },
  headerTintColor: arena.text,
  headerTitleStyle: { fontWeight: "800" as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: arena.bg },
};
