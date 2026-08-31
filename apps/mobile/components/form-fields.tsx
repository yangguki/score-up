import { useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { useAppKit } from "@/components/theme-provider";
import { P } from "@/components/ui";
import type { HomeKit } from "@/theme/home-kits";

export function FormCard({ children }: { children: ReactNode }) {
  const kit = useAppKit();
  return (
    <View
      style={{
        backgroundColor: kit.surface,
        borderRadius: kit.heroRadius,
        borderWidth: 1,
        borderColor: kit.line,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

export function FormSection({ last, children }: { last?: boolean; children: ReactNode }) {
  const kit = useAppKit();
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: kit.line,
        gap: 8,
      }}
    >
      {children}
    </View>
  );
}

export function FormLabel({ children }: { children: ReactNode }) {
  return (
    <P muted style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.2 }}>
      {children}
    </P>
  );
}

export function KitTextInput({
  style,
  ...rest
}: TextInputProps) {
  const kit = useAppKit();
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...rest}
      placeholderTextColor={kit.muted}
      onFocus={(event) => {
        setFocused(true);
        rest.onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        rest.onBlur?.(event);
      }}
      style={[
        {
          backgroundColor: kit.surface2,
          color: kit.text,
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderWidth: 1.5,
          borderColor: focused ? kit.primary : kit.line,
          fontSize: 16,
          fontWeight: "600",
        },
        style,
      ]}
    />
  );
}

export function ChoiceChips<T extends string | number | boolean>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const kit = useAppKit();
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {options.map((option) => {
        const on = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              if (!on) onChange(option.value);
            }}
            style={({ pressed }) => [chipStyle(kit, on, pressed), { flex: 1 }]}
          >
            <Text style={{ color: on ? kit.primaryFg : kit.text, fontSize: 14, fontWeight: "800", textAlign: "center" }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function FormStepper({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  const kit = useAppKit();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <FormLabel>{label}</FormLabel>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable onPress={onMinus} style={({ pressed }) => stepBtnStyle(kit, pressed)}>
          <Text style={{ color: kit.text, fontSize: 16, fontWeight: "800" }}>−</Text>
        </Pressable>
        <Text style={{ minWidth: 56, textAlign: "center", color: kit.primary, fontSize: 15, fontWeight: "800" }}>{value}</Text>
        <Pressable onPress={onPlus} style={({ pressed }) => stepBtnStyle(kit, pressed)}>
          <Text style={{ color: kit.text, fontSize: 16, fontWeight: "800" }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SelectCard({
  selected,
  title,
  hint,
  onPress,
}: {
  selected: boolean;
  title: string;
  hint: string;
  onPress: () => void;
}) {
  const kit = useAppKit();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: kit.surface,
        borderRadius: kit.heroRadius,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? kit.primary : kit.line,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <P style={{ fontSize: 17, fontWeight: "800" }}>{title}</P>
      <P muted style={{ fontSize: 13 }}>
        {hint}
      </P>
    </Pressable>
  );
}

function chipStyle(kit: HomeKit, on: boolean, pressed: boolean) {
  return {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: on ? kit.primary : kit.surface2,
    borderWidth: 1,
    borderColor: on ? kit.primary : kit.line,
    opacity: pressed ? 0.85 : 1,
    transform: [{ scale: pressed ? 0.98 : 1 }],
  };
}

function stepBtnStyle(kit: HomeKit, pressed: boolean) {
  return {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: kit.surface2,
    borderWidth: 1,
    borderColor: kit.line,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    opacity: pressed ? 0.82 : 1,
    transform: [{ scale: pressed ? 0.96 : 1 }],
  };
}
