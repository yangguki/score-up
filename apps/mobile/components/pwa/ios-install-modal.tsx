import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { useAppKit } from "@/components/theme-provider";
import { space } from "@/theme/tokens";

interface IosInstallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function IosInstallModal({ visible, onClose }: IosInstallModalProps) {
  const kit = useAppKit();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: kit.surface,
              borderColor: kit.line,
            },
          ]}
        >
          <Text style={[styles.title, { color: kit.text }]}>
            홈 화면에 추가하기
          </Text>

          <Text style={[styles.description, { color: kit.muted }]}>
            Safari에서 아래 단계를 따라 SCORE UP을 홈 화면에 추가하세요.
          </Text>

          <View style={styles.steps}>
            <StepItem kit={kit} number={1} icon="□↑" text="공유 버튼을 탭하세요" />
            <StepItem kit={kit} number={2} icon="+" text="「홈 화면에 추가」를 선택하세요" />
            <StepItem kit={kit} number={3} icon="✓" text="「추가」를 탭하세요" />
          </View>

          <Text style={[styles.hint, { color: kit.muted }]}>
            홈 화면에 추가하면 앱처럼 전체 화면으로 사용할 수 있습니다.
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: kit.primary,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: kit.primaryFg }]}>
              확인
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function StepItem({
  kit,
  number,
  icon,
  text,
}: {
  kit: ReturnType<typeof useAppKit>;
  number: number;
  icon: string;
  text: string;
}) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepNumber, { backgroundColor: kit.primary }]}>
        <Text style={[styles.stepNumberText, { color: kit.primaryFg }]}>
          {number}
        </Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: kit.surface2 }]}>
        <Text style={[styles.icon, { color: kit.text }]}>{icon}</Text>
      </View>
      <Text style={[styles.stepText, { color: kit.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: space.lg,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: space.lg,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: space.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: space.lg,
  },
  steps: {
    gap: space.md,
    marginBottom: space.lg,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "800",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: space.md,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
  },
});
