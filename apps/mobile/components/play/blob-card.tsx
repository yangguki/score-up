import { useState } from "react";
import { Pressable, Text, View, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { PlayGearIcon } from "@/components/play/gear";
import { PlayPlayer } from "@/components/play/player";
import type { PlaySportVisual } from "@/lib/play-sports";
import { PLAY_SPORTS } from "@/lib/play-sports";

const GAP = 10;

type CardProps = {
  sport: PlaySportVisual;
  onPress?: () => void;
  width: number;
  compact: boolean;
};

export function PlayBlobCard({ sport, onPress, width, compact }: CardProps) {
  const ink = sport.ink ?? "#FFFFFF";
  const height = compact ? width * 1.02 : width * 0.82;
  const player = compact ? 36 : 58;
  const labelH = compact ? 24 : 30;
  const blobR = compact
    ? { borderTopLeftRadius: 22, borderTopRightRadius: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 16 }
    : { borderTopLeftRadius: 32, borderTopRightRadius: 56, borderBottomLeftRadius: 50, borderBottomRightRadius: 22 };

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={sport.name}
      style={({ pressed }) => ({
        width,
        height,
        opacity: pressed ? 0.92 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: sport.from,
            ...blobR,
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: compact ? 14 : 18,
            overflow: "hidden",
            shadowColor: sport.from,
            shadowOpacity: 0.22,
            shadowRadius: compact ? 8 : 12,
            shadowOffset: { width: 0, height: compact ? 4 : 6 },
            elevation: 3,
          }}
        >
          <View
            style={{
              position: "absolute",
              right: compact ? -12 : -16,
              bottom: compact ? -18 : -24,
              width: compact ? 72 : 110,
              height: compact ? 72 : 110,
              borderRadius: compact ? 36 : 55,
              backgroundColor: sport.to,
            }}
          />
          <View
            style={{
              position: "absolute",
              left: compact ? -14 : -18,
              top: compact ? -12 : -16,
              width: compact ? 48 : 72,
              height: compact ? 48 : 72,
              borderRadius: compact ? 24 : 36,
              backgroundColor: sport.to,
              opacity: 0.45,
            }}
          />
          <PlayPlayer pose={sport.pose} color={ink} size={player} />
        </View>
        <View
          style={{
            position: "absolute",
            left: compact ? 4 : 6,
            right: compact ? 6 : 8,
            bottom: compact ? 4 : 5,
            height: labelH,
            borderRadius: labelH / 2,
            backgroundColor: "#FFFFFF",
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: compact ? 8 : 10,
            paddingRight: 4,
            shadowColor: "#0F172A",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Text style={{ flex: 1, fontSize: compact ? 10 : 12, fontWeight: "800", color: "#111827" }} numberOfLines={1}>
            {sport.name}
          </Text>
          <PlayGearIcon gear={sport.gear} size={compact ? 18 : 22} />
        </View>
      </View>
    </Pressable>
  );
}

export function PlaySportGrid({ onSelect }: { onSelect?: (sport: PlaySportVisual) => void }) {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const cols = landscape ? 4 : 2;
  const [rowW, setRowW] = useState(0);
  const inner = rowW > 0 ? rowW : Math.max(240, width - 40);
  const tileW = (inner - GAP * (cols - 1)) / cols;

  function onLayout(e: LayoutChangeEvent) {
    const next = e.nativeEvent.layout.width;
    if (Math.abs(next - rowW) > 1) setRowW(next);
  }

  return (
    <View onLayout={onLayout} style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
      {PLAY_SPORTS.map((sport) => (
        <PlayBlobCard
          key={sport.id}
          sport={sport}
          width={tileW}
          compact={false}
          onPress={onSelect ? () => onSelect(sport) : undefined}
        />
      ))}
    </View>
  );
}
