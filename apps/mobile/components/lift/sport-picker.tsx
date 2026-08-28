import { useState } from "react";
import { Pressable, View, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { SportIcon } from "@/components/home/sport-icons";
import { LiftText } from "@/components/lift/ui";
import { HOME_SPORTS, type HomeSport } from "@/lib/home-sports";
import { lift } from "@/theme/lift";

type Props = {
  selectedId?: string;
  onSelect?: (sport: HomeSport) => void;
};

const GAP = 8;

/** H8 종목 타일. 세로는 작게 4열, 가로는 폭에 맞춰 8열. */
export function LiftSportPicker({ selectedId, onSelect }: Props) {
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const cols = landscape ? 8 : 4;
  const [rowW, setRowW] = useState(0);
  const inner = rowW > 0 ? rowW : Math.max(240, width - 48);
  const tileW = (inner - GAP * (cols - 1)) / cols;

  function onLayout(e: LayoutChangeEvent) {
    const next = e.nativeEvent.layout.width;
    if (Math.abs(next - rowW) > 1) setRowW(next);
  }

  return (
    <View onLayout={onLayout} style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
      {HOME_SPORTS.map((sport) => {
        const on = sport.id === selectedId && sport.active;
        const locked = !sport.active;
        return (
          <Pressable
            key={sport.id}
            disabled={locked}
            onPress={() => onSelect?.(sport)}
            accessibilityLabel={`${sport.name}${locked ? ", 준비 중" : on ? ", 선택됨" : ""}`}
            style={{
              width: tileW,
              borderRadius: 14,
              borderWidth: on ? 2 : 1,
              borderColor: on ? lift.primary : lift.line,
              backgroundColor: lift.surface,
              paddingVertical: landscape ? 8 : 10,
              paddingHorizontal: 6,
              opacity: locked ? 0.4 : 1,
              alignItems: "center",
              gap: 6,
              minHeight: landscape ? 68 : 78,
              justifyContent: "center",
              shadowColor: lift.primary,
              shadowOpacity: on ? 0.12 : 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <View
              style={{
                width: landscape ? 28 : 32,
                height: landscape ? 28 : 32,
                borderRadius: landscape ? 14 : 16,
                backgroundColor: on ? "rgba(47, 128, 237, 0.12)" : lift.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SportIcon id={sport.id} size={landscape ? 20 : 22} muted={locked && !on} />
            </View>
            <LiftText
              style={{ fontSize: landscape ? 11 : 12, fontWeight: "800", letterSpacing: -0.2, textAlign: "center" }}
              numberOfLines={1}
            >
              {sport.name}
            </LiftText>
          </Pressable>
        );
      })}
    </View>
  );
}
