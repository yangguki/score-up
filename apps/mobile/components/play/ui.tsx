import { type ReactNode } from "react";
import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from "react-native";
import { play } from "@/theme/play";

export function PlayScreen({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: play.bg }, style]} {...rest}>
      {children}
    </View>
  );
}

export function PlayTitle({ children, style, ...rest }: TextProps) {
  return (
    <Text style={[{ color: play.text, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function PlayText({ muted, children, style, ...rest }: TextProps & { muted?: boolean }) {
  return (
    <Text style={[{ color: muted ? play.muted : play.text, fontSize: 15, lineHeight: 22, fontWeight: "500" }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function PlayCard({ children, style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: play.surface,
          borderRadius: play.heroRadius,
          padding: 16,
          borderWidth: 1,
          borderColor: play.line,
          shadowColor: "#0F172A",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function PlayButton({
  label,
  variant = "navy",
  disabled,
  style,
  ...rest
}: PressableProps & { label: string; variant?: "navy" | "mint" | "ghost" }) {
  const bg = variant === "navy" ? play.navy : variant === "mint" ? play.mint : play.ghost;
  const fg = variant === "ghost" ? play.ghostFg : variant === "mint" ? play.primaryFg : play.navyFg;
  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        {
          backgroundColor: bg,
          borderWidth: variant === "ghost" ? 1.5 : 0,
          borderColor: play.ghostLine,
          opacity: disabled ? 0.4 : state.pressed ? 0.88 : 1,
          borderRadius: play.pill,
          paddingVertical: 15,
          paddingHorizontal: 18,
          alignItems: "center",
          minHeight: 52,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <Text style={{ color: fg, fontWeight: "800", fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function PlayHeadline() {
  return (
    <Text style={{ fontSize: 24, lineHeight: 32, fontWeight: "800", letterSpacing: -0.6, color: play.ink, maxWidth: 240 }}>
      지금 <Text style={{ color: play.mint }}>‘업’</Text> 하고 싶은{"\n"}스코어는?
    </Text>
  );
}

export function PlaySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 13, fontWeight: "800", color: play.muted, letterSpacing: 0.4 }}>{title}</Text>
      {children}
    </View>
  );
}
