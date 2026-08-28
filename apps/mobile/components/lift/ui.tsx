import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from "react-native";
import { lift } from "@/theme/lift";

export function LiftScreen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: lift.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function LiftTitle({ children, style, ...rest }: TextProps) {
  return (
    <Text
      style={[{ color: lift.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function LiftText({
  muted,
  children,
  style,
  ...rest
}: TextProps & { muted?: boolean }) {
  return (
    <Text style={[{ color: muted ? lift.muted : lift.text, fontSize: 15, lineHeight: 22, fontWeight: "500" }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function LiftCard({ children, live, dashed, style, ...rest }: ViewProps & { live?: boolean; dashed?: boolean }) {
  return (
    <View
      style={[
        {
          backgroundColor: lift.surface,
          borderRadius: lift.heroRadius,
          padding: 16,
          borderWidth: live ? 1.5 : 1,
          borderColor: live ? lift.live : lift.line,
          borderStyle: dashed ? "dashed" : "solid",
          shadowColor: lift.primary,
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function LiftButton({
  label,
  variant = "primary",
  size = "md",
  disabled,
  style,
  ...rest
}: PressableProps & {
  label: string;
  variant?: "primary" | "ghost" | "quiet" | "danger";
  size?: "md" | "sm";
}) {
  const compact = size === "sm";
  const bg =
    variant === "primary"
      ? lift.primary
      : variant === "danger"
        ? "rgba(225, 29, 72, 0.1)"
        : variant === "quiet"
          ? lift.surface2
          : lift.ghost;
  const fg =
    variant === "primary" ? lift.primaryFg : variant === "danger" ? lift.danger : lift.ghostFg;
  const borderWidth = variant === "ghost" ? 1.5 : 0;
  const borderColor = variant === "ghost" ? lift.ghostLine : "transparent";

  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        {
          backgroundColor: bg,
          borderWidth,
          borderColor,
          opacity: disabled ? 0.4 : state.pressed ? 0.88 : 1,
          borderRadius: lift.pill,
          paddingVertical: compact ? 8 : 15,
          paddingHorizontal: compact ? 14 : 18,
          alignItems: "center",
          minHeight: compact ? 36 : 52,
          transform: [{ scale: state.pressed ? 0.985 : 1 }],
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <Text style={{ color: fg, fontWeight: "800", fontSize: compact ? 13 : 16, letterSpacing: -0.2 }}>{label}</Text>
    </Pressable>
  );
}

export function LiftBadge({
  label,
  tone = "muted",
}: {
  label: string;
  tone?: "muted" | "live" | "primary" | "ok";
}) {
  const bg =
    tone === "live" ? lift.live : tone === "primary" ? lift.primary : tone === "ok" ? lift.ok : lift.surface2;
  const fg = tone === "muted" ? lift.muted : "#FFFFFF";
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: lift.pill }}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}

export function LiftSection({ title, hint, live }: { title: string; hint?: string; live?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {live ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: lift.live }} /> : null}
        <LiftTitle style={{ fontSize: 18 }}>{title}</LiftTitle>
      </View>
      <View style={{ width: 36, height: 3, borderRadius: 99, backgroundColor: lift.primary }} />
      {hint ? (
        <LiftText muted style={{ fontSize: 12, fontWeight: "600" }}>
          {hint}
        </LiftText>
      ) : null}
    </View>
  );
}

export function LiftChip({
  label,
  on,
  onPress,
}: {
  label: string;
  on?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: lift.pill,
        backgroundColor: on ? lift.primary : lift.surface,
        borderWidth: 1,
        borderColor: on ? lift.primary : lift.line,
      }}
    >
      <Text style={{ color: on ? lift.primaryFg : lift.text, fontSize: 13, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

export function LiftDivider() {
  return <View style={{ height: 1, backgroundColor: lift.line, marginVertical: 4 }} />;
}
