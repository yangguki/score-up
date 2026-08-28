import { View } from "react-native";
import type { PlayPose } from "@/lib/play-sports";

/** 시안 흰 라인아트 선수. View로 포즈만 구분. */
export function PlayPlayer({ pose, color = "#FFFFFF", size = 88 }: { pose: PlayPose; color?: string; size?: number }) {
  const s = size / 88;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 14 * s, height: 14 * s, borderRadius: 7 * s, backgroundColor: color, marginBottom: 4 * s }} />
      {pose === "dribble" ? <Dribble color={color} s={s} /> : null}
      {pose === "kick" || pose === "kick-high" ? <Kick color={color} s={s} high={pose === "kick-high"} /> : null}
      {pose === "spike" ? <Spike color={color} s={s} /> : null}
      {pose === "bat" ? <Bat color={color} s={s} /> : null}
      {pose === "racket-high" || pose === "paddle" || pose === "squash" ? (
        <Racket color={color} s={s} kind={pose} />
      ) : null}
    </View>
  );
}

function Torso({ color, s }: { color: string; s: number }) {
  return <View style={{ width: 18 * s, height: 28 * s, borderRadius: 9 * s, backgroundColor: color }} />;
}

function Dribble({ color, s }: { color: string; s: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Torso color={color} s={s} />
      <View style={{ flexDirection: "row", marginTop: -4 * s, gap: 8 * s }}>
        <View style={{ width: 8 * s, height: 22 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "18deg" }] }} />
        <View style={{ width: 8 * s, height: 18 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "-12deg" }] }} />
      </View>
      <View style={{ position: "absolute", right: -6 * s, bottom: 2 * s, width: 12 * s, height: 12 * s, borderRadius: 6 * s, backgroundColor: color }} />
    </View>
  );
}

function Kick({ color, s, high }: { color: string; s: number; high: boolean }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Torso color={color} s={s} />
      <View style={{ flexDirection: "row", marginTop: -2 * s, gap: 10 * s, alignItems: "flex-end" }}>
        <View style={{ width: 8 * s, height: 20 * s, borderRadius: 4 * s, backgroundColor: color }} />
        <View
          style={{
            width: 8 * s,
            height: high ? 26 * s : 18 * s,
            borderRadius: 4 * s,
            backgroundColor: color,
            transform: [{ rotate: high ? "-40deg" : "28deg" }],
          }}
        />
      </View>
    </View>
  );
}

function Spike({ color, s }: { color: string; s: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ flexDirection: "row", gap: 16 * s, marginBottom: -8 * s }}>
        <View style={{ width: 8 * s, height: 22 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "-50deg" }] }} />
        <View style={{ width: 8 * s, height: 22 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "50deg" }] }} />
      </View>
      <Torso color={color} s={s} />
      <View style={{ flexDirection: "row", gap: 8 * s, marginTop: -2 * s }}>
        <View style={{ width: 8 * s, height: 18 * s, borderRadius: 4 * s, backgroundColor: color }} />
        <View style={{ width: 8 * s, height: 18 * s, borderRadius: 4 * s, backgroundColor: color }} />
      </View>
    </View>
  );
}

function Bat({ color, s }: { color: string; s: number }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ position: "absolute", right: 8 * s, top: 8 * s, width: 8 * s, height: 36 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "28deg" }] }} />
      <Torso color={color} s={s} />
      <View style={{ flexDirection: "row", gap: 8 * s, marginTop: -2 * s }}>
        <View style={{ width: 8 * s, height: 20 * s, borderRadius: 4 * s, backgroundColor: color }} />
        <View style={{ width: 8 * s, height: 16 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "16deg" }] }} />
      </View>
    </View>
  );
}

function Racket({ color, s, kind }: { color: string; s: number; kind: PlayPose }) {
  const up = kind === "racket-high";
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          position: "absolute",
          right: up ? 0 : 4 * s,
          top: up ? -4 * s : 10 * s,
          width: 16 * s,
          height: 22 * s,
          borderRadius: 8 * s,
          borderWidth: 3 * s,
          borderColor: color,
          transform: [{ rotate: up ? "-18deg" : "24deg" }],
        }}
      />
      <Torso color={color} s={s} />
      <View style={{ flexDirection: "row", gap: 8 * s, marginTop: -2 * s }}>
        <View style={{ width: 8 * s, height: 20 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "-8deg" }] }} />
        <View style={{ width: 8 * s, height: 18 * s, borderRadius: 4 * s, backgroundColor: color, transform: [{ rotate: "12deg" }] }} />
      </View>
    </View>
  );
}
