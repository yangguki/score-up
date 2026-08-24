import { Pressable, View } from "react-native";
import { SportIcon } from "@/components/home/sport-icons";
import { KitText } from "@/components/home/kit-ui";
import { HOME_SPORTS, type HomeSport } from "@/lib/home-sports";
import type { HomeKit } from "@/theme/home-kits";

type Props = {
  kit: HomeKit;
  selectedId?: string;
  onSelect?: (sport: HomeSport) => void;
  /** grid = 4열, rail = 칩, mosaic = H3식 2열 */
  layout?: "grid" | "rail" | "mosaic";
};

const AMBER = "#F5A623";

export function SportPicker({ kit, selectedId = "basketball", onSelect, layout = "grid" }: Props) {
  if (layout === "rail") {
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {HOME_SPORTS.map((sport) => {
          const on = sport.id === selectedId && sport.active;
          const locked = !sport.active;
          return (
            <Pressable
              key={sport.id}
              disabled={locked}
              onPress={() => onSelect?.(sport)}
              accessibilityLabel={sport.name}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: on ? 2 : 1,
                borderColor: on ? sport.tint : kit.line,
                backgroundColor: on ? kit.surface : kit.surface2,
                opacity: locked ? 0.4 : 1,
              }}
            >
              <SportIcon id={sport.id} size={22} muted={locked} />
              <KitText kit={kit} style={{ fontSize: 13, fontWeight: "800" }}>
                {sport.name}
              </KitText>
            </Pressable>
          );
        })}
      </View>
    );
  }

  /** H3 / H1 — 한 줄에 2종목, 세로로 나열 */
  if (layout === "mosaic") {
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
                <KitText
                  kit={kit}
                  style={{
                    fontSize: 16,
                    fontWeight: "900",
                    letterSpacing: -0.3,
                  }}
                >
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

  const iconSize = 40;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
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
              width: "22%",
              flexGrow: 1,
              flexBasis: "21%",
              maxWidth: "24%",
              borderRadius: 14,
              borderWidth: on ? 2.5 : 1.5,
              borderColor: on ? sport.tint : kit.line,
              backgroundColor: on ? "#0B1220" : kit.surface,
              paddingVertical: 12,
              paddingHorizontal: 6,
              opacity: locked ? 0.38 : 1,
              alignItems: "center",
              gap: 8,
              minHeight: 98,
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: iconSize + 10,
                height: iconSize + 10,
                borderRadius: 14,
                backgroundColor: on ? "rgba(245,166,35,0.2)" : kit.surface2,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SportIcon id={sport.id} size={iconSize} muted={locked} />
            </View>
            <KitText
              kit={kit}
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: on ? "#F8FAFC" : kit.text,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {sport.name}
            </KitText>
          </Pressable>
        );
      })}
    </View>
  );
}
