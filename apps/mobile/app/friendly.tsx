import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView } from "react-native";
import {
  BASKETBALL_CLUB_PRESET,
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  TABLE_TENNIS_CLUB_PRESET,
  VOLLEYBALL_CLUB_PRESET,
  type SportId,
  type SportRules,
} from "@score-up/domain";
import { PlayerDraftList, type DraftPlayer } from "@/components/player-draft-list";
import { SportRulesEditor } from "@/components/rules-editor";
import { TeamEditor } from "@/components/team-editor";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { scoreboardHref, sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

function toPlayers(drafts: DraftPlayer[]) {
  return drafts
    .filter((p) => p.name.trim())
    .map((p) => ({ name: p.name.trim(), number: Number(p.number) || 0 }));
}

function clubRules(sportId: SportId): SportRules {
  if (sportId === "volleyball") return VOLLEYBALL_CLUB_PRESET.rules;
  if (sportId === "table-tennis") return TABLE_TENNIS_CLUB_PRESET.rules;
  return BASKETBALL_CLUB_PRESET.rules;
}

const CREATE_SPORTS: SportId[] = ["basketball", "volleyball", "table-tennis"];

export default function FriendlyScreen() {
  const makeFriendly = useAppStore((s) => s.makeFriendly);
  const [sportId, setSportId] = useState<SportId>("basketball");
  const [home, setHome] = useState("홈");
  const [away, setAway] = useState("어웨이");
  const [homeColor, setHomeColor] = useState(DEFAULT_HOME_COLOR);
  const [awayColor, setAwayColor] = useState(DEFAULT_AWAY_COLOR);
  const [official, setOfficial] = useState(false);
  const [rules, setRules] = useState<SportRules>(BASKETBALL_CLUB_PRESET.rules);
  const [homePlayers, setHomePlayers] = useState<DraftPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<DraftPlayer[]>([]);

  const selectSport = (next: SportId) => {
    setSportId(next);
    setOfficial(false);
    setRules(clubRules(next));
  };

  const start = () => {
    const parsedHome = toPlayers(homePlayers);
    const parsedAway = toPlayers(awayPlayers);
    const id = makeFriendly({
      sportId,
      homeName: home,
      awayName: away,
      homeColor,
      awayColor,
      rules,
      homePlayers: parsedHome,
      awayPlayers: parsedAway,
    });
    const hasPlayers = parsedHome.length + parsedAway.length > 0;
    const toLineup = sportId === "basketball" && hasPlayers;
    router.replace(toLineup ? `/match/${id}/lineup` : scoreboardHref({ id, sportId }));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 48 }}>
        <SectionHead title="빠른 친선경기" hint="종목과 룰을 정하고 팀을 만든 뒤, 필요하면 선수를 넣습니다." />

        <H style={{ fontSize: 18 }}>종목</H>
        {CREATE_SPORTS.map((id) => (
          <Pressable key={id} onPress={() => selectSport(id)}>
            <Card style={{ borderColor: sportId === id ? colors.primary : colors.line }}>
              <H style={{ fontSize: 18 }}>{sportLabel(id)}</H>
            </Card>
          </Pressable>
        ))}

        <H style={{ fontSize: 18 }}>룰</H>
        <SportRulesEditor
          sportId={sportId}
          rules={rules}
          official={official}
          onRules={setRules}
          onOfficial={setOfficial}
        />

        <Card>
          <TeamEditor
            title={sportId === "table-tennis" ? "선수 A" : "홈 팀"}
            name={home}
            color={homeColor}
            onName={setHome}
            onColor={setHomeColor}
          />
          {sportId === "basketball" ? (
            <>
              <P muted style={{ marginTop: 12, marginBottom: 8 }}>
                선수
              </P>
              <PlayerDraftList players={homePlayers} onChange={setHomePlayers} />
            </>
          ) : null}
        </Card>
        <Card>
          <TeamEditor
            title={sportId === "table-tennis" ? "선수 B" : "어웨이 팀"}
            name={away}
            color={awayColor}
            onName={setAway}
            onColor={setAwayColor}
          />
          {sportId === "basketball" ? (
            <>
              <P muted style={{ marginTop: 12, marginBottom: 8 }}>
                선수
              </P>
              <PlayerDraftList players={awayPlayers} onChange={setAwayPlayers} />
            </>
          ) : null}
        </Card>

        <Btn label="보드로 이동" onPress={start} disabled={!home.trim() || !away.trim()} />
        {!home.trim() || !away.trim() ? <P muted>이름을 입력하세요.</P> : null}
      </ScrollView>
    </Screen>
  );
}
