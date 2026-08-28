import { Image, Pressable, View, type PressableProps } from "react-native";
import { lift } from "@/theme/lift";

const MARK = require("../../assets/images/icon.png");

type Props = PressableProps & {
  size?: number;
};

/** 원형 브랜드 마크. 시안 우측 상단 Up 아이콘. */
export function BrandLogo({ size = 48, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityLabel="SCORE UP"
      style={(state) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          backgroundColor: lift.markBg,
          borderWidth: 1,
          borderColor: lift.lineStrong,
          opacity: state.pressed ? 0.82 : 1,
          shadowColor: lift.primary,
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <Image source={MARK} style={{ width: size, height: size }} resizeMode="cover" />
    </Pressable>
  );
}

export function BrandLogoWell({ size = 72 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        backgroundColor: lift.markBg,
        borderWidth: 1,
        borderColor: lift.line,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image source={MARK} style={{ width: size, height: size }} resizeMode="cover" />
    </View>
  );
}
