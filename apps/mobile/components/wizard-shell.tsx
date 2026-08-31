import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppKit } from "@/components/theme-provider";
import { Btn, P, Screen } from "@/components/ui";
import { space } from "@/theme/tokens";

export function WizardShell({
  step,
  total,
  error,
  primaryLabel,
  primaryDisabled,
  onPrimary,
  onBack,
  children,
}: {
  step: number;
  total: number;
  error?: string;
  primaryLabel: string;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  onBack: () => void;
  children: ReactNode;
}) {
  const kit = useAppKit();
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, gap: 8 }}>
          <P muted>
            {step} / {total}
          </P>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {Array.from({ length: total }, (_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i < step ? kit.primary : kit.line,
                }}
              />
            ))}
          </View>
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        <View
          style={{
            paddingHorizontal: space.lg,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 12),
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: kit.line,
            backgroundColor: kit.bg,
          }}
        >
          {error ? <P style={{ color: kit.danger }}>{error}</P> : null}
          <View style={{ flexDirection: "row", gap: 8, alignItems: "stretch" }}>
            <Btn label="이전" variant="ghost" onPress={onBack} style={{ minWidth: 88 }} />
            <Btn label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
