import type { HomeVersion } from "@/store/ui-prefs";
import { arena } from "@/theme/arena";
import { lift } from "@/theme/lift";
import { play } from "@/theme/play";

/** 홈 키트. H1 Arena가 제품 기본. H8 Lift · H9 Play는 비교용. */
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
  ok: string;
  danger: string;
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
  ok: arena.ok,
  danger: arena.danger,
  accent: arena.primary,
  glow: arena.glow,
  radius: arena.radius,
  heroRadius: arena.heroRadius,
  scoreSize: 22,
  statusBar: "light",
};

export const LIFT_KIT: HomeKit = {
  name: "로고 리프트",
  note: "H8 비교 · theme/lift.ts 와 동기",
  bg: lift.bg,
  surface: lift.surface,
  surface2: lift.surface2,
  text: lift.text,
  muted: lift.muted,
  line: lift.line,
  primary: lift.primary,
  primaryFg: lift.primaryFg,
  ghost: lift.ghost,
  ghostFg: lift.ghostFg,
  ghostLine: lift.ghostLine,
  live: lift.live,
  liveFg: lift.liveFg,
  ok: lift.ok,
  danger: lift.danger,
  accent: lift.primary,
  glow: lift.glow,
  radius: lift.radius,
  heroRadius: lift.heroRadius,
  scoreSize: 22,
  statusBar: "dark",
};

export const PLAY_KIT: HomeKit = {
  name: "플레이 시안",
  note: "H9 비교 · theme/play.ts 와 동기",
  bg: play.bg,
  surface: play.surface,
  surface2: play.surface2,
  text: play.text,
  muted: play.muted,
  line: play.line,
  primary: play.navy,
  primaryFg: play.navyFg,
  ghost: play.ghost,
  ghostFg: play.ghostFg,
  ghostLine: play.ghostLine,
  live: play.live,
  liveFg: play.liveFg,
  ok: play.mintDeep,
  danger: play.live,
  accent: play.mint,
  radius: play.radius,
  heroRadius: play.heroRadius,
  scoreSize: 22,
  statusBar: "dark",
};

export function kitForVersion(version: HomeVersion) {
  if (version === "h8") return LIFT_KIT;
  if (version === "h9") return PLAY_KIT;
  return HOME_KIT;
}

export function navOptionsForKit(kit: HomeKit) {
  return {
    headerStyle: { backgroundColor: kit.bg },
    headerTintColor: kit.text,
    headerTitleStyle: { fontWeight: "800" as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: kit.bg },
  };
}
