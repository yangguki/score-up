import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from "react-native";
import { useAppKit } from "@/components/theme-provider";
import { colors, space } from "@/theme/tokens";

export function Screen({ children, style, ...rest }: ViewProps) {
  const kit = useAppKit();
  return (
    <View style={[{ flex: 1, backgroundColor: kit.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function H({ children, style, ...rest }: TextProps) {
  const kit = useAppKit();
  return (
    <Text style={[{ color: kit.text, fontSize: 22, fontWeight: "900", letterSpacing: -0.4 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function P({ children, muted, style, ...rest }: TextProps & { muted?: boolean }) {
  const kit = useAppKit();
  return (
    <Text style={[{ color: muted ? kit.muted : kit.text, fontSize: 15, lineHeight: 22, fontWeight: "500" }, style]} {...rest}>
      {children}
    </Text>
  );
}

/** 섹션 제목 + 키트 악센트 바 */
export function SectionHead({ title, hint, live }: { title: string; hint?: string; live?: boolean }) {
  const kit = useAppKit();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {live ? <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: kit.live }} /> : null}
        <H style={{ fontSize: 18 }}>{title}</H>
      </View>
      <View style={{ flexDirection: "row", gap: 4 }}>
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.primary }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.live }} />
        <View style={{ width: 20, height: 3, borderRadius: 1, backgroundColor: kit.accent ?? kit.primary }} />
      </View>
      {hint ? (
        <P muted style={{ fontSize: 12, fontWeight: "600" }}>
          {hint}
        </P>
      ) : null}
    </View>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  const kit = useAppKit();
  const dark = kit.statusBar === "light";
  return (
    <View
      style={[
        {
          backgroundColor: kit.surface,
          borderRadius: kit.heroRadius,
          padding: space.md,
          borderWidth: 1,
          borderColor: kit.line,
          shadowColor: "#000000",
          shadowOpacity: dark ? 0.25 : 0.06,
          shadowRadius: dark ? 12 : 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: dark ? 3 : 2,
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
  const kit = useAppKit();
  const bg =
    variant === "ghost"
      ? kit.ghost
      : variant === "danger"
        ? kit.danger
        : variant === "home"
          ? colors.home
          : variant === "away"
            ? colors.away
            : kit.primary;
  const fg =
    variant === "primary"
      ? kit.primaryFg
      : variant === "danger"
        ? kit.liveFg
        : variant === "home" || variant === "away"
          ? colors.text
          : kit.ghostFg;
  const borderWidth = variant === "ghost" ? 1.5 : 0;
  const borderColor = variant === "ghost" ? kit.ghostLine : "transparent";
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
          borderRadius: kit.radius,
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

export function Pill({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "muted" | "live" | "home" | "away" | "ok" | "primary";
}) {
  const kit = useAppKit();
  const bgMap = {
    muted: kit.surface2,
    live: kit.live,
    home: colors.home,
    away: colors.away,
    ok: kit.ok,
    primary: kit.primary,
  };
  const fgMap = {
    muted: kit.muted,
    live: kit.liveFg,
    home: colors.text,
    away: colors.text,
    ok: kit.primaryFg,
    primary: kit.primaryFg,
  };
  return (
    <View style={{ backgroundColor: bgMap[tone], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
      <Text style={{ color: fgMap[tone], fontSize: 11, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}
