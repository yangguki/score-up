import { arena } from "@/theme/arena";

/** 홈 키트 = 전역 Arena. 비교 시안(V1~V3, H2~H7)은 검수 후 제거됨. */
export type HomeKit = {
  name: string;
  note: string;
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  line: string;
  primary: string;
  primaryFg: string;
  ghost: string;
  ghostFg: string;
  ghostLine: string;
  live: string;
  liveFg: string;
  accent?: string;
  glow?: string;
  radius: number;
  heroRadius: number;
  scoreSize: number;
  statusBar: "dark" | "light";
};

export const HOME_KIT: HomeKit = {
  name: "브랜드 허브",
  note: "Arena T&M · 전역 theme/arena.ts 와 동기",
  bg: arena.bg,
  surface: arena.surface,
  surface2: arena.surface2,
  text: arena.text,
  muted: arena.muted,
  line: arena.line,
  primary: arena.primary,
  primaryFg: arena.primaryFg,
  ghost: arena.ghost,
  ghostFg: arena.ghostFg,
  ghostLine: arena.ghostLine,
  live: arena.live,
  liveFg: arena.liveFg,
  accent: arena.primary,
  glow: arena.glow,
  radius: arena.radius,
  heroRadius: arena.heroRadius,
  scoreSize: 36,
  statusBar: "light",
};
