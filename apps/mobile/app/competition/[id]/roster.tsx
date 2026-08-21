import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, TextInput, View } from "react-native";
import { TeamEditor } from "@/components/team-editor";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function RosterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const allTeams = useAppStore((s) => s.teams);
  const players = useAppStore((s) => s.players);
  const teams = allTeams.filter((t) => t.competitionId === id);
  const addTeamTo = useAppStore((s) => s.addTeamTo);
  const updateTeamAt = useAppStore((s) => s.updateTeamAt);
  const addPlayerTo = useAppStore((s) => s.addPlayerTo);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState("#1D4ED8");
  const [playerName, setPlayerName] = useState("");
  const [number, setNumber] = useState("0");
  const [teamId, setTeamId] = useState<string | undefined>();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>참가 팀</H>
        {teams.map((team) => {
          const roster = players.filter((p) => p.teamId === team.id);
          return (
            <Card key={team.id}>
              <TeamEditor
                title={team.name}
                name={team.name}
                color={team.color}
                onName={(value) => updateTeamAt(team.id, { name: value })}
                onColor={(value) => updateTeamAt(team.id, { color: value })}
              />
              <P muted style={{ marginTop: 10 }}>
                {roster.length === 0
                  ? "선수 0명 · 로스터를 채워 주세요"
                  : roster.map((p) => `${p.number} ${p.name}`).join(" · ")}
              </P>
              <Btn label="이 팀에 선수 추가" variant="ghost" onPress={() => setTeamId(team.id)} style={{ marginTop: 10 }} />
            </Card>
          );
        })}
        <Card>
          <H style={{ fontSize: 16 }}>팀 추가</H>
          <View style={{ marginTop: 8 }}>
            <TeamEditor name={teamName} color={teamColor} onName={setTeamName} onColor={setTeamColor} />
          </View>
          <Btn
            label="팀 추가"
            style={{ marginTop: 12 }}
            onPress={() => {
              if (!teamName.trim()) return;
              addTeamTo(id!, teamName.trim(), teamColor);
              setTeamName("");
            }}
          />
        </Card>
        {teamId ? (
          <Card>
            <P muted>선수 추가</P>
            <TextInput value={playerName} onChangeText={setPlayerName} placeholder="이름" placeholderTextColor={colors.muted} style={inputStyle} />
            <TextInput value={number} onChangeText={setNumber} placeholder="등번호" placeholderTextColor={colors.muted} keyboardType="number-pad" style={inputStyle} />
            <Btn
              label="선수 추가"
              onPress={() => {
                addPlayerTo(teamId, playerName || "선수", Number(number) || 0);
                setPlayerName("");
              }}
            />
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const inputStyle = {
  backgroundColor: colors.surface,
  color: colors.text,
  borderRadius: 12,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.line,
  fontSize: 16,
  marginTop: 8,
};
