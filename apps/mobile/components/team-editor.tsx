import { Pressable, Text, TextInput, View } from "react-native";
import { TEAM_COLOR_PRESETS } from "@score-up/domain";
import { colors } from "@/theme/tokens";

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
      {title ? <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>{title}</Text> : null}
      <TextInput
        value={name}
        onChangeText={onName}
        placeholder="팀 이름"
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderRadius: 12,
          padding: 14,
          borderWidth: 1,
          borderColor: colors.line,
          fontSize: 16,
        }}
      />
      <ColorSwatches value={color} onChange={onColor} />
    </View>
  );
}

export function ColorSwatches({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
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
              borderColor: selected ? colors.text : "#ffffff55",
            }}
            accessibilityLabel={preset.label}
          />
        );
      })}
    </View>
  );
}
