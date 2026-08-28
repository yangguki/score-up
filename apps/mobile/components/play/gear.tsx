import { View } from "react-native";
import type { PlayGear } from "@/lib/play-sports";

export function PlayGearIcon({ gear, size = 28 }: { gear: PlayGear; size?: number }) {
  const r = size / 2;
  if (gear === "shuttle") {
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 8, height: 14, borderRadius: 4, backgroundColor: "#E8EEF7", borderWidth: 1, borderColor: "#CBD5E1" }} />
        <View style={{ width: 16, height: 10, borderRadius: 8, backgroundColor: "#F8FAFC", marginTop: -2, borderWidth: 1, borderColor: "#E2E8F0" }} />
      </View>
    );
  }
  if (gear === "pingpong") {
    return <View style={{ width: size * 0.72, height: size * 0.72, borderRadius: r, backgroundColor: "#FB923C", borderWidth: 1, borderColor: "#EA580C" }} />;
  }
  if (gear === "volleyball") {
    return (
      <View style={{ width: size, height: size, borderRadius: r, backgroundColor: "#F8FAFC", borderWidth: 1.5, borderColor: "#F59E0B", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: size * 0.7, height: 1.5, backgroundColor: "#F59E0B" }} />
        <View style={{ width: 1.5, height: size * 0.7, backgroundColor: "#F59E0B", position: "absolute" }} />
      </View>
    );
  }
  if (gear === "basketball") {
    return (
      <View style={{ width: size, height: size, borderRadius: r, backgroundColor: "#EA580C", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: size, height: 1.5, backgroundColor: "rgba(11,18,32,0.35)" }} />
        <View style={{ width: 1.5, height: size, backgroundColor: "rgba(11,18,32,0.35)", position: "absolute" }} />
      </View>
    );
  }
  if (gear === "futsal" || gear === "soccer") {
    return (
      <View style={{ width: size, height: size, borderRadius: r, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 8, height: 8, backgroundColor: "#0F172A", transform: [{ rotate: "45deg" }] }} />
      </View>
    );
  }
  if (gear === "squash") {
    return <View style={{ width: size * 0.55, height: size * 0.55, borderRadius: r, backgroundColor: "#0F172A" }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#F87171", alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size * 0.55, height: 1.5, backgroundColor: "#F87171", transform: [{ rotate: "28deg" }] }} />
    </View>
  );
}
