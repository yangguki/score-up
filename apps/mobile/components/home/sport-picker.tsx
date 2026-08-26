import { Pressable, View } from "react-native";
import { SportIcon } from "@/components/home/sport-icons";
import { KitText } from "@/components/home/kit-ui";
import { HOME_SPORTS, type HomeSport } from "@/lib/home-sports";
import type { HomeKit } from "@/theme/home-kits";

type Props = {
  kit: HomeKit;
  selectedId?: string;
  onSelect?: (sport: HomeSport) => void;
};

const AMBER = "#F5A623";

/** H1 종목 2열 모자이크. 농구·배구·탁구 활성. */
export function SportPicker({ kit, selectedId, onSelect }: Props) {
  const accent = kit.accent ?? AMBER;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
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
              width: "48%",
              flexGrow: 1,
              flexBasis: "46%",
              maxWidth: "50%",
              borderRadius: 14,
              borderWidth: on ? 2 : 1.5,
              borderColor: on ? accent : kit.line,
              backgroundColor: on ? kit.surface2 : kit.surface,
              paddingVertical: 18,
              paddingHorizontal: 12,
              opacity: locked ? 0.4 : 1,
              alignItems: "center",
              gap: 12,
              minHeight: 128,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                backgroundColor: on ? accent : kit.surface2,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: on ? 0 : 1,
                borderColor: kit.line,
              }}
            >
              <SportIcon id={sport.id} size={40} muted={locked && !on} />
            </View>
            <View style={{ alignItems: "center", gap: 4 }}>
              <KitText kit={kit} style={{ fontSize: 16, fontWeight: "900", letterSpacing: -0.3 }}>
                {sport.name}
              </KitText>
              <KitText
                kit={kit}
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: on ? accent : kit.muted,
                }}
              >
                {locked ? "준비 중" : on ? "선택됨" : sport.line}
              </KitText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
