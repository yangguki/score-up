import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { scoreboardHref } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function LineupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const beginMatch = useAppStore((s) => s.beginMatch);
  const addPlayerTo = useAppStore((s) => s.addPlayerTo);
  const homePlayers = useMemo(
    () => players.filter((p) => p.teamId === match?.homeTeamId),
    [players, match?.homeTeamId],
  );
  const awayPlayers = useMemo(
    () => players.filter((p) => p.teamId === match?.awayTeamId),
    [players, match?.awayTeamId],
  );
  const [home, setHome] = useState<string[]>(match?.snapshot.onCourtHome ?? []);
  const [away, setAway] = useState<string[]>(match?.snapshot.onCourtAway ?? []);
  const [draftName, setDraftName] = useState("");
  const [draftNumber, setDraftNumber] = useState("");
  const [draftSide, setDraftSide] = useState<"home" | "away">("home");

  if (!match) {
    return (
      <Screen>
        <P>경기를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const skipRoster = homePlayers.length === 0 && awayPlayers.length === 0;
  const ready = match.isFriendly
    ? true
    : skipRoster || (home.length === match.rules.starters && away.length === match.rules.starters);

  const toggle = (side: "home" | "away", playerId: string) => {
    const list = side === "home" ? home : away;
    const set = side === "home" ? setHome : setAway;
    if (list.includes(playerId)) {
      set(list.filter((id) => id !== playerId));
      return;
    }
    if (list.length >= match.rules.starters) return;
    set([...list, playerId]);
  };

  const addDraft = () => {
    const teamId = draftSide === "home" ? match.homeTeamId : match.awayTeamId;
    if (!teamId || !draftName.trim()) return;
    addPlayerTo(teamId, draftName.trim(), Number(draftNumber) || 0);
    setDraftName("");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H>
          {match.homeLabel} vs {match.awayLabel}
        </H>
        {skipRoster ? (
          <P muted>선수가 없으면 팀 득점만으로 시작합니다. 아래에서 선수를 넣을 수 있습니다.</P>
        ) : (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <P>
                {match.homeLabel} 선발 ({home.length}/{match.rules.starters})
              </P>
              {homePlayers.map((p) => (
                <Pressable key={p.id} onPress={() => toggle("home", p.id)}>
                  <Card style={{ borderColor: home.includes(p.id) ? colors.home : colors.line }}>
                    <P>
                      {home.includes(p.id) ? "●" : "○"} {p.number} {p.name}
                    </P>
                  </Card>
                </Pressable>
              ))}
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <P>
                {match.awayLabel} 선발 ({away.length}/{match.rules.starters})
              </P>
              {awayPlayers.map((p) => (
                <Pressable key={p.id} onPress={() => toggle("away", p.id)}>
                  <Card style={{ borderColor: away.includes(p.id) ? colors.away : colors.line }}>
                    <P>
                      {away.includes(p.id) ? "●" : "○"} {p.number} {p.name}
                    </P>
                  </Card>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {match.homeTeamId && match.awayTeamId ? (
          <Card>
            <P muted>선수 추가</P>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <Btn
                label={match.homeLabel}
                variant={draftSide === "home" ? "home" : "ghost"}
                onPress={() => setDraftSide("home")}
                style={{ flex: 1 }}
              />
              <Btn
                label={match.awayLabel}
                variant={draftSide === "away" ? "away" : "ghost"}
                onPress={() => setDraftSide("away")}
                style={{ flex: 1 }}
              />
            </View>
            <TextInput
              value={draftNumber}
              onChangeText={setDraftNumber}
              placeholder="등번호"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              style={inputStyle}
            />
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              placeholder="이름"
              placeholderTextColor={colors.muted}
              style={inputStyle}
            />
            <Btn label="선수 추가" variant="ghost" onPress={addDraft} />
          </Card>
        ) : null}
        <Btn
          label="경기 시작"
          disabled={!ready}
          onPress={() => {
            beginMatch(match.id, home, away);
            router.replace(scoreboardHref(match));
          }}
        />
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
