import { Pressable, Text, View, type PressableProps } from "react-native";
import { play } from "@/theme/play";

type Props = PressableProps & { size?: number };

/** 시안 우측 상단 원형 민트 up 마크. */
export function PlayLogo({ size = 52, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityLabel="SCORE UP"
      style={(state) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: play.mint,
          alignItems: "center",
          justifyContent: "center",
          opacity: state.pressed ? 0.86 : 1,
          shadowColor: play.mintDeep,
          shadowOpacity: 0.45,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: size * 0.38,
          fontWeight: "800",
          fontStyle: "italic",
          letterSpacing: -0.8,
          marginLeft: 2,
        }}
      >
        up
      </Text>
    </Pressable>
  );
}
