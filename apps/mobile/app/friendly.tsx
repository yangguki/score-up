import { useState } from "react";
import { router } from "expo-router";
import { ScrollView } from "react-native";
import {
  BASKETBALL_CLUB_PRESET,
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  type BasketballRules,
} from "@score-up/domain";
import { PlayerDraftList, type DraftPlayer } from "@/components/player-draft-list";
import { RulesEditor } from "@/components/rules-editor";
import { TeamEditor } from "@/components/team-editor";
import { Btn, Card, H, P, Screen, SectionHead } from "@/components/ui";
import { scoreboardHref } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

function toPlayers(drafts: DraftPlayer[]) {
  return drafts
    .filter((p) => p.name.trim())
    .map((p) => ({ name: p.name.trim(), number: Number(p.number) || 0 }));
}

export default function FriendlyScreen() {
  const makeFriendly = useAppStore((s) => s.makeFriendly);
  const [home, setHome] = useState("홈");
  const [away, setAway] = useState("어웨이");
  const [homeColor, setHomeColor] = useState(DEFAULT_HOME_COLOR);
  const [awayColor, setAwayColor] = useState(DEFAULT_AWAY_COLOR);
  const [official, setOfficial] = useState(false);
  const [rules, setRules] = useState<BasketballRules>(BASKETBALL_CLUB_PRESET.rules);
  const [homePlayers, setHomePlayers] = useState<DraftPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<DraftPlayer[]>([]);

  const start = () => {
    const parsedHome = toPlayers(homePlayers);
    const parsedAway = toPlayers(awayPlayers);
    const id = makeFriendly({
      homeName: home,
      awayName: away,
      homeColor,
      awayColor,
      rules,
      homePlayers: parsedHome,
      awayPlayers: parsedAway,
    });
    const hasPlayers = parsedHome.length + parsedAway.length > 0;
    router.replace(hasPlayers ? `/match/${id}/lineup` : scoreboardHref({ id, sportId: "basketball" }));
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: 48 }}>
        <SectionHead title="빠른 친선경기" hint="룰을 정하고 팀을 만든 뒤, 필요하면 선수를 넣습니다." />

        <H style={{ fontSize: 18 }}>룰</H>
        <RulesEditor rules={rules} official={official} onRules={setRules} onOfficial={setOfficial} />

        <Card>
          <TeamEditor title="홈 팀" name={home} color={homeColor} onName={setHome} onColor={setHomeColor} />
          <P muted style={{ marginTop: 12, marginBottom: 8 }}>선수</P>
          <PlayerDraftList players={homePlayers} onChange={setHomePlayers} />
        </Card>
        <Card>
          <TeamEditor title="어웨이 팀" name={away} color={awayColor} onName={setAway} onColor={setAwayColor} />
          <P muted style={{ marginTop: 12, marginBottom: 8 }}>선수</P>
          <PlayerDraftList players={awayPlayers} onChange={setAwayPlayers} />
        </Card>

        <Btn label="보드로 이동" onPress={start} disabled={!home.trim() || !away.trim()} />
        {!home.trim() || !away.trim() ? <P muted>팀 이름을 입력하세요.</P> : null}
      </ScrollView>
    </Screen>
  );
}
