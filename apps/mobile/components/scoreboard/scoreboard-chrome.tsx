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
        backgroundColor: primary ? colors.primary : colors.surface2,
        opacity: disabled ? 0.35 : pressed ? 0.88 : 1,
        paddingVertical: primary ? 9 : 7,
        paddingHorizontal: primary ? 14 : 10,
        borderRadius: 8,
        minHeight: primary ? 38 : 34,
        minWidth: primary ? 64 : undefined,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: primary ? 0 : 1,
        borderColor: colors.line,
      })}
    >
      <Text
        style={{
          color: primary ? colors.primaryFg : colors.text,
          fontWeight: "800",
          fontSize: primary ? 14 : 12,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export { colors };
