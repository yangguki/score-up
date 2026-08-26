import { useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, TextInput, View } from "react-native";
import { TeamEditor } from "@/components/team-editor";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

const BASKETBALL_ROSTER_HINT = 5;

export default function RosterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === id));
  const allTeams = useAppStore((s) => s.teams);
  const players = useAppStore((s) => s.players);
  const teams = allTeams.filter((t) => t.competitionId === id);
  const addTeamTo = useAppStore((s) => s.addTeamTo);
  const addPlayerTo = useAppStore((s) => s.addPlayerTo);

  const [addingTeam, setAddingTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState("#1D4ED8");
  const [teamError, setTeamError] = useState("");

  const [addingPlayerFor, setAddingPlayerFor] = useState<string | undefined>();
  const [playerName, setPlayerName] = useState("");
  const [number, setNumber] = useState("");
  const [playerError, setPlayerError] = useState("");

  if (!competition) {
    return (
      <Screen>
        <P>대회를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const isTournament = competition.format === "tournament";
  const canMakeBracket = teams.length >= 2;
  const emptyHint = isTournament
    ? "팀을 추가하세요. 토너먼트는 팀이 2개 이상이어야 대진을 만들 수 있습니다."
    : "팀을 추가하세요. 리그는 팀이 2개 이상이어야 일정을 만들 수 있습니다.";
  const footerHint = canMakeBracket
    ? "대진을 만들려면 대진 보기로 이동하세요."
    : isTournament
      ? "토너먼트 대진은 팀이 2개 이상일 때 만들 수 있습니다."
      : "리그 일정은 팀이 2개 이상일 때 만들 수 있습니다.";

  const resetPlayerDraft = (teamId?: string) => {
    setAddingPlayerFor(teamId);
    setPlayerName("");
    setNumber("");
    setPlayerError("");
  };

  const submitTeam = () => {
    if (!teamName.trim()) {
      setTeamError("팀 이름을 입력하세요.");
      return;
    }
    addTeamTo(id!, teamName.trim(), teamColor);
    setTeamName("");
    setTeamError("");
    setAddingTeam(false);
  };

  const submitPlayer = (teamId: string) => {
    if (!playerName.trim()) {
      setPlayerError("선수 이름을 입력하세요.");
      return;
    }
    const jersey = parseJersey(number);
    if (jersey === null) {
      setPlayerError("등번호를 입력하세요.");
      return;
    }
    const taken = players.some((p) => p.teamId === teamId && p.number === jersey);
    if (taken) {
      setPlayerError("이 팀에 같은 등번호가 있습니다. 다른 번호를 쓰세요.");
      return;
    }
    addPlayerTo(teamId, playerName.trim(), jersey);
    setPlayerName("");
    setNumber("");
    setPlayerError("");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>참가 팀</H>
        {teams.length === 0 ? <P muted>{emptyHint}</P> : null}

        {teams.map((team) => {
          const roster = players.filter((p) => p.teamId === team.id);
          const shortRoster = roster.length < BASKETBALL_ROSTER_HINT;
          return (
            <Card key={team.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: team.color,
                    borderWidth: 1,
                    borderColor: colors.line,
                  }}
                />
                <H style={{ fontSize: 18 }}>{team.name}</H>
              </View>
              <P muted style={{ marginTop: 8 }}>
                선수 {roster.length}명
              </P>
              {roster.length === 0 ? (
                <P muted style={{ marginTop: 6 }}>
                  선수를 추가하세요.
                </P>
              ) : (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {roster.map((p) => (
                    <P key={p.id}>
                      #{p.number}  {p.name}
                    </P>
                  ))}
                </View>
              )}
              {shortRoster ? (
                <P muted style={{ marginTop: 8 }}>
                  농구는 팀당 선수 5명이 권장됩니다. 대진은 만들 수 있습니다.
                </P>
              ) : null}

              {addingPlayerFor === team.id ? (
                <View style={{ marginTop: 10 }}>
                  <TextInput
                    value={playerName}
                    onChangeText={(value) => {
                      setPlayerName(value);
                      setPlayerError("");
                    }}
                    placeholder="이름"
                    placeholderTextColor={colors.muted}
                    style={inputStyle}
                  />
                  <TextInput
                    value={number}
                    onChangeText={(value) => {
                      setNumber(value);
                      setPlayerError("");
                    }}
                    placeholder="등번호"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    style={inputStyle}
                  />
                  {playerError ? (
                    <P style={{ marginTop: 8, color: colors.danger }}>{playerError}</P>
                  ) : null}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Btn label="추가" onPress={() => submitPlayer(team.id)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Btn label="취소" variant="ghost" onPress={() => resetPlayerDraft()} />
                    </View>
                  </View>
                </View>
              ) : (
                <Btn
                  label="선수 추가"
                  variant="ghost"
                  onPress={() => resetPlayerDraft(team.id)}
                  style={{ marginTop: 10 }}
                />
              )}
            </Card>
          );
        })}

        {addingTeam ? (
          <Card>
            <H style={{ fontSize: 16 }}>팀 추가</H>
            <View style={{ marginTop: 8 }}>
              <TeamEditor
                name={teamName}
                color={teamColor}
                onName={(value) => {
                  setTeamName(value);
                  setTeamError("");
                }}
                onColor={setTeamColor}
              />
            </View>
            {teamError ? (
              <P style={{ marginTop: 8, color: colors.danger }}>{teamError}</P>
            ) : null}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Btn label="추가" onPress={submitTeam} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn
                  label="취소"
                  variant="ghost"
                  onPress={() => {
                    setAddingTeam(false);
                    setTeamName("");
                    setTeamError("");
                  }}
                />
              </View>
            </View>
          </Card>
        ) : (
          <Btn label="팀 추가" variant="ghost" onPress={() => setAddingTeam(true)} />
        )}

        <P muted>{footerHint}</P>
        {canMakeBracket ? (
          <Link href={`/competition/${id}/bracket`} asChild>
            <Btn label="대진 만들기" />
          </Link>
        ) : (
          <Btn label="대진 만들기" disabled />
        )}
      </ScrollView>
    </Screen>
  );
}

function parseJersey(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

const inputStyle = {
  backgroundColor: colors.bg,
  color: colors.text,
  borderRadius: 12,
  padding: 14,
  borderWidth: 1,
  borderColor: colors.line,
  fontSize: 16,
  marginTop: 8,
};
