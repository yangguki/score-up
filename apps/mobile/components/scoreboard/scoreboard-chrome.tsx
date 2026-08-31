import { Pressable, Text } from "react-native";
import { colors } from "@/theme/tokens";

/** 보드용 작은 액션. 점수보다 작아야 한다. */
export function BoardKey({
  label,
  onPress,
  disabled,
  variant = "ghost",
  emphasize,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  emphasize?: boolean;
}) {
  const primary = variant === "primary" || emphasize;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: primary ? colors.primary : "rgba(255,255,255,0.12)",
        opacity: disabled ? 0.35 : pressed ? 0.88 : 1,
        paddingVertical: primary ? 4 : 3,
        paddingHorizontal: primary ? 8 : 6,
        borderRadius: 6,
        minHeight: primary ? 26 : 24,
        minWidth: primary ? 44 : undefined,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: primary ? 0 : 1,
        borderColor: "rgba(255,255,255,0.18)",
      })}
    >
      <Text
        style={{
          color: primary ? colors.primaryFg : "#fff",
          fontWeight: "800",
          fontSize: primary ? 12 : 11,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export { colors };
