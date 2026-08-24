import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from "react-native";
import type { HomeKit } from "@/theme/home-kits";

export function KitScreen({ kit, children, style, ...rest }: ViewProps & { kit: HomeKit }) {
  return (
    <View style={[{ flex: 1, backgroundColor: kit.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function KitTitle({ kit, children, style, ...rest }: TextProps & { kit: HomeKit }) {
  return (
    <Text style={[{ color: kit.text, fontSize: 22, fontWeight: "700" }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function KitText({
  kit,
  muted,
  children,
  style,
  ...rest
}: TextProps & { kit: HomeKit; muted?: boolean }) {
  return (
    <Text style={[{ color: muted ? kit.muted : kit.text, fontSize: 15, lineHeight: 22 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function KitCard({ kit, children, style, ...rest }: ViewProps & { kit: HomeKit }) {
  const dark = kit.statusBar === "light";
  return (
    <View
      style={[
        {
          backgroundColor: kit.surface,
          borderRadius: kit.heroRadius ?? kit.radius,
          padding: 16,
          borderWidth: 1,
          borderColor: kit.line,
          shadowColor: "#000000",
          shadowOpacity: dark ? 0.35 : 0.06,
          shadowRadius: dark ? 16 : 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: dark ? 4 : 2,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function KitButton({
  kit,
  label,
  variant = "primary",
  style,
  disabled,
  ...rest
}: PressableProps & { kit: HomeKit; label: string; variant?: "primary" | "ghost" }) {
  const primary = variant === "primary";
  return (
    <Pressable
      disabled={disabled}
      style={(state) => {
        const base = {
          backgroundColor: primary ? kit.primary : kit.ghost,
          borderWidth: primary ? 0 : 1,
          borderColor: kit.ghostLine,
          opacity: disabled ? 0.4 : state.pressed ? 0.88 : 1,
          borderRadius: kit.radius,
          paddingVertical: 15,
          paddingHorizontal: 16,
          alignItems: "center" as const,
          minHeight: 52,
          transform: [{ scale: state.pressed ? 0.985 : 1 }],
        };
        const extra = typeof style === "function" ? style(state) : style;
        return [base, extra];
      }}
      {...rest}
    >
      <Text style={{ color: primary ? kit.primaryFg : kit.ghostFg, fontWeight: "800", fontSize: 16, letterSpacing: -0.2 }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function KitBadge({
  kit,
  label,
  live,
}: {
  kit: HomeKit;
  label: string;
  live?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: live ? kit.live : kit.surface2,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: live ? kit.liveFg : kit.muted, fontSize: 11, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}
