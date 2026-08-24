import { arena } from "./arena";

/** @deprecated 직접 arena를 써도 되지만, 기존 화면은 colors.* 로 유지 */
export const colors = {
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
  home: arena.home,
  away: arena.away,
  bonus: arena.bonus,
  danger: arena.danger,
  ok: arena.ok,
  locked: arena.locked,
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export { arena, navScreenOptions } from "./arena";
