import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from "react-native";
import { colors, space } from "@/theme/tokens";

export function Screen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function H({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[{ color: colors.text, fontSize: 22, fontWeight: "700" }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function P({ children, muted, style, ...rest }: TextProps & { muted?: boolean }) {
  return (
    <Text style={[{ color: muted ? colors.muted : colors.text, fontSize: 15, lineHeight: 22 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 14,
          padding: space.md,
          borderWidth: 1,
          borderColor: colors.line,
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
  disabled,
  style,
  ...rest
}: PressableProps & { label: string; variant?: "primary" | "ghost" | "danger" | "home" | "away" }) {
  const bg =
    variant === "ghost"
      ? colors.surface2
      : variant === "danger"
        ? "#3A201C"
        : variant === "home"
          ? colors.home
          : variant === "away"
            ? colors.away
            : "#E8EEF7";
  const fg = variant === "primary" ? colors.bg : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          alignItems: "center",
          minHeight: 48,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, tone = "muted" }: { label: string; tone?: "muted" | "live" | "home" | "away" | "ok" }) {
  const map = {
    muted: colors.muted,
    live: colors.danger,
    home: colors.home,
    away: colors.away,
    ok: colors.ok,
  };
  return (
    <View style={{ backgroundColor: colors.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
      <Text style={{ color: map[tone], fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
