import { useEffect, useState, useCallback } from "react";
import { Modal, Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { useAppKit } from "@/components/theme-provider";
import { space } from "@/theme/tokens";
import { usePwaInstall, isMobileViewport } from "@/hooks/use-pwa-install";
import { useUiPrefsStore } from "@/store/ui-prefs";
import { IosInstallModal } from "./ios-install-modal";

export function InstallPromptBanner() {
  const kit = useAppKit();
  const { state, triggerPrompt, isStandalone } = usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [iosModalVisible, setIosModalVisible] = useState(false);

  const pwaPromptDismissedAt = useUiPrefsStore((s) => s.pwaPromptDismissedAt);
  const dismissPwaPrompt = useUiPrefsStore((s) => s.dismissPwaPrompt);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (isStandalone) return;
    if (state === "unsupported") return;
    if (pwaPromptDismissedAt !== null) return;
    if (!isMobileViewport()) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [state, isStandalone, pwaPromptDismissedAt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    dismissPwaPrompt();
  }, [dismissPwaPrompt]);

  const handleInstall = useCallback(async () => {
    if (state === "can-prompt") {
      const success = await triggerPrompt();
      if (success) {
        setVisible(false);
      }
    } else if (state === "ios-safari") {
      setIosModalVisible(true);
    }
    dismissPwaPrompt();
    setVisible(false);
  }, [state, triggerPrompt, dismissPwaPrompt]);

  if (Platform.OS !== "web") return null;
  if (!visible) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleDismiss}
      >
        <Pressable style={styles.overlay} onPress={handleDismiss}>
          <View
            style={[
              styles.banner,
              {
                backgroundColor: kit.surface,
                borderColor: kit.line,
              },
            ]}
          >
            <View style={styles.content}>
              <Text style={[styles.title, { color: kit.text }]}>
                홈 화면에 추가하고 앱처럼 쓰세요
              </Text>
              <Text style={[styles.description, { color: kit.muted }]}>
                브라우저 메뉴에서 홈 화면에 추가하면{"\n"}
                SCORE UP을 앱처럼 바로 실행할 수 있어요.
              </Text>

              <View style={styles.buttons}>
                <Pressable
                  onPress={handleInstall}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: kit.primary,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.primaryButtonText, { color: kit.primaryFg }]}>
                    {state === "can-prompt" ? "홈 화면에 추가" : "추가 방법 보기"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDismiss}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      borderColor: kit.ghostLine,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.secondaryButtonText, { color: kit.muted }]}>
                    나중에
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      <IosInstallModal
        visible={iosModalVisible}
        onClose={() => setIosModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  banner: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: space.lg,
    paddingHorizontal: space.lg,
    paddingBottom: 40,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: space.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: space.lg,
  },
  buttons: {
    width: "100%",
    gap: space.sm,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
