import { Pressable, View } from "react-native";
import type { SportId } from "@score-up/domain";
import { useAppKit } from "@/components/theme-provider";
import { H, P } from "@/components/ui";
import { CREATE_SPORTS } from "@/lib/create-sports";
import { sportLabel } from "@/lib/match-routes";

export function SportPickGrid({
  selected,
  onSelect,
}: {
  selected: SportId;
  onSelect: (id: SportId) => void;
}) {
  const kit = useAppKit();

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
      {CREATE_SPORTS.map((sport) => {
        const on = selected === sport.id;
        return (
          <Pressable key={sport.id} onPress={() => onSelect(sport.id)} style={{ width: "50%", padding: 4 }}>
            <View
              style={{
                backgroundColor: kit.surface,
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1.5,
                borderColor: on ? kit.primary : kit.line,
                minHeight: 62,
                justifyContent: "center",
                gap: 2,
              }}
            >
              <H style={{ fontSize: 16 }}>{sportLabel(sport.id)}</H>
              <P muted style={{ fontSize: 12, lineHeight: 16 }}>
                {sport.line}
              </P>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
