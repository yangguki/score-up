import { View, type ViewProps } from "react-native";
import { lift } from "@/theme/lift";

/** 로고 제도선 — 동심원·축. 장식만. */
export function LiftAtmosphere({ style, ...rest }: ViewProps) {
  return (
    <View pointerEvents="none" style={[{ position: "absolute", inset: 0, overflow: "hidden" }, style]} {...rest}>
      <View
        style={{
          position: "absolute",
          top: -80,
          right: -48,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: "rgba(107, 176, 255, 0.28)",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 120,
          left: -90,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: "rgba(47, 128, 237, 0.1)",
        }}
      />
      {[118, 86, 54].map((size, i) => (
        <View
          key={size}
          style={{
            position: "absolute",
            top: 8 + i * 4,
            right: 8 + i * 4,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: lift.line,
          }}
        />
      ))}
      <View
        style={{
          position: "absolute",
          top: 64,
          right: 66,
          width: 1,
          height: 72,
          backgroundColor: lift.lineStrong,
        }}
      />
    </View>
  );
}
