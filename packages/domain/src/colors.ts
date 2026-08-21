export const TEAM_COLOR_PRESETS = [
  { id: "red", hex: "#B91C1C", label: "빨강" },
  { id: "blue", hex: "#1D4ED8", label: "파랑" },
  { id: "navy", hex: "#1E3A5F", label: "네이비" },
  { id: "green", hex: "#15803D", label: "초록" },
  { id: "orange", hex: "#C2410C", label: "주황" },
  { id: "purple", hex: "#6D28D9", label: "보라" },
  { id: "teal", hex: "#0F766E", label: "청록" },
  { id: "black", hex: "#111827", label: "검정" },
] as const;

export const DEFAULT_HOME_COLOR = TEAM_COLOR_PRESETS[1].hex;
export const DEFAULT_AWAY_COLOR = TEAM_COLOR_PRESETS[0].hex;

export function nextTeamColor(used: string[]): string {
  const found = TEAM_COLOR_PRESETS.find((c) => !used.includes(c.hex));
  return found?.hex ?? TEAM_COLOR_PRESETS[used.length % TEAM_COLOR_PRESETS.length].hex;
}
