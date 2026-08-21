import { TextInput, View } from "react-native";
import { Btn, P } from "@/components/ui";
import { colors } from "@/theme/tokens";

export type DraftPlayer = { name: string; number: string };

export function PlayerDraftList({
  players,
  onChange,
}: {
  players: DraftPlayer[];
  onChange: (players: DraftPlayer[]) => void;
}) {
  const setAt = (index: number, patch: Partial<DraftPlayer>) => {
    onChange(players.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  return (
    <View style={{ gap: 8 }}>
      {players.map((player, index) => (
        <View key={index} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={player.number}
            onChangeText={(value) => setAt(index, { number: value.replace(/[^0-9]/g, "") })}
            placeholder="번호"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            style={[inputStyle, { width: 72 }]}
          />
          <TextInput
            value={player.name}
            onChangeText={(value) => setAt(index, { name: value })}
            placeholder="선수 이름"
            placeholderTextColor={colors.muted}
            style={[inputStyle, { flex: 1 }]}
          />
          <Btn label="삭제" variant="ghost" onPress={() => onChange(players.filter((_, i) => i !== index))} />
        </View>
      ))}
      {players.length === 0 ? <P muted>선수가 없으면 팀 득점만으로 진행합니다.</P> : null}
      <Btn
        label="선수 추가"
        variant="ghost"
        onPress={() => onChange([...players, { name: "", number: String(players.length + 1) }])}
      />
    </View>
  );
}

const inputStyle = {
  backgroundColor: colors.surface,
  color: colors.text,
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: colors.line,
  fontSize: 16,
};
