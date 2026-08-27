import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from "react-native";
import { arena, colors, space } from "@/theme/tokens";

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function H({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[{ color: colors.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.4 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function P({ children, muted, style, ...rest }: TextProps & { muted?: boolean }) {
  return (
    <Text style={[{ color: muted ? colors.muted : colors.text, fontSize: 15, lineHeight: 22, fontWeight: "500" }, style]} {...rest}>
      {children}
    </Text>
  );
}

/** 섹션 제목 + 블루/레드/앰버 악센트 바 */
export function SectionHead({ title, hint, live }: { title: string; hint?: string; live?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {live ? <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colors.live }} /> : null}
        <H style={{ fontSize: 18 }}>{title}</H>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: colors.home }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: colors.live }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: colors.primary }} />
      </View>
      {hint ? <P muted style={{ fontSize: 12, fontWeight: "600" }}>{hint}</P> : null}
    </View>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: arena.heroRadius,
          padding: space.md,
          borderWidth: 1,
          borderColor: colors.line,
          shadowColor: "#000000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function Btn({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  style,
  ...rest
}: PressableProps & {
  label: string;
  variant?: "primary" | "ghost" | "danger" | "home" | "away";
  size?: "md" | "sm";
}) {
  const bg =
    variant === "ghost"
      ? colors.ghost
      : variant === "danger"
        ? "#3A1518"
        : variant === "home"
          ? colors.home
          : variant === "away"
            ? colors.away
            : colors.primary;
  const fg =
    variant === "primary" || variant === "home" || variant === "away"
      ? variant === "primary"
        ? colors.primaryFg
        : colors.text
      : colors.ghostFg;
  const borderWidth = variant === "ghost" ? 1.5 : 0;
  const borderColor = variant === "ghost" ? colors.ghostLine : "transparent";
  const compact = size === "sm";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
          borderRadius: arena.radius,
          paddingVertical: compact ? 8 : 15,
          paddingHorizontal: compact ? 12 : 16,
          alignItems: "center",
          minHeight: compact ? 38 : 52,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
      {...rest}
    >
      <Text style={{ color: fg, fontWeight: "800", fontSize: compact ? 13 : 16, letterSpacing: -0.2 }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "muted" | "live" | "home" | "away" | "ok" | "primary" }) {
  const bgMap = {
    muted: colors.surface2,
    live: colors.live,
    home: colors.home,
    away: colors.away,
    ok: colors.ok,
    primary: colors.primary,
  };
  const fgMap = {
    muted: colors.muted,
    live: colors.liveFg,
    home: colors.text,
    away: colors.text,
    ok: colors.primaryFg,
    primary: colors.primaryFg,
  };
  return (
    <View style={{ backgroundColor: bgMap[tone], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
      <Text style={{ color: fgMap[tone], fontSize: 11, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}
