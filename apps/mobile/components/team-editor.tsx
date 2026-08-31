import { Pressable, View } from "react-native";
import { TEAM_COLOR_PRESETS } from "@score-up/domain";
import { useAppKit } from "@/components/theme-provider";
import { KitTextInput } from "@/components/form-fields";
import { P } from "@/components/ui";

export function TeamEditor({
  title,
  name,
  color,
  onName,
  onColor,
}: {
  title?: string;
  name: string;
  color: string;
  onName: (value: string) => void;
  onColor: (value: string) => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      {title ? (
        <P style={{ fontSize: 16, fontWeight: "700" }}>{title}</P>
      ) : null}
      <KitTextInput value={name} onChangeText={onName} placeholder="팀 이름" autoCapitalize="none" autoCorrect={false} />
      <ColorSwatches value={color} onChange={onColor} />
    </View>
  );
}

export function ColorSwatches({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const kit = useAppKit();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {TEAM_COLOR_PRESETS.map((preset) => {
        const selected = value === preset.hex;
        return (
          <Pressable
            key={preset.id}
            onPress={() => onChange(preset.hex)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: preset.hex,
              borderWidth: selected ? 3 : 1,
              borderColor: selected ? kit.text : "#ffffff55",
            }}
            accessibilityLabel={preset.label}
          />
        );
      })}
    </View>
  );
}
