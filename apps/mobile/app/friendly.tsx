import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  clubRulesFor,
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  isSportId,
  type SportId,
  type SportRules,
  type TableTennisRules,
} from "@score-up/domain";
import { PlayerDraftList, type DraftPlayer } from "@/components/player-draft-list";
import { SportRulesEditor } from "@/components/rules-editor";
import { SportPickGrid } from "@/components/sport-pick-grid";
import { TeamEditor } from "@/components/team-editor";
import { H, P } from "@/components/ui";
import { WizardShell } from "@/components/wizard-shell";
import { scoreboardHref, sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";

function toPlayers(drafts: DraftPlayer[]) {
  return drafts
    .filter((p) => p.name.trim())
    .map((p) => ({ name: p.name.trim(), number: Number(p.number) || 0 }));
}

function sportFromQuery(value?: string | string[]): SportId | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return isSportId(raw) ? raw : null;
}

type FriendlyStep = "sport" | "rules" | "home" | "away" | "players";

function stepsFor(sportLocked: boolean, sportId: SportId): FriendlyStep[] {
  const steps: FriendlyStep[] = [];
  if (!sportLocked) steps.push("sport");
  steps.push("rules", "home", "away");
  if (sportId === "basketball") steps.push("players");
  return steps;
}

export default function FriendlyScreen() {
  const params = useLocalSearchParams<{ sport?: string }>();
  const makeFriendly = useAppStore((s) => s.makeFriendly);
  const querySport = sportFromQuery(params.sport);
  const sportLocked = querySport != null;
  const initialSport = querySport ?? "basketball";
  const [index, setIndex] = useState(0);
  const [sportId, setSportId] = useState<SportId>(initialSport);
  const [home, setHome] = useState("홈");
  const [away, setAway] = useState("어웨이");
  const [homeColor, setHomeColor] = useState<string>(DEFAULT_HOME_COLOR);
  const [awayColor, setAwayColor] = useState<string>(DEFAULT_AWAY_COLOR);
  const [official, setOfficial] = useState(false);
  const [rules, setRules] = useState<SportRules>(clubRulesFor(initialSport));
  const [homePlayers, setHomePlayers] = useState<DraftPlayer[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<DraftPlayer[]>([]);
  const [error, setError] = useState("");

  const selectSport = (next: SportId) => {
    setSportId(next);
    setOfficial(false);
    setRules(clubRulesFor(next));
    setError("");
  };

  useEffect(() => {
    const next = sportFromQuery(params.sport) ?? "basketball";
    setSportId(next);
    setOfficial(false);
    setRules(clubRulesFor(next));
    setIndex(0);
  }, [params.sport]);

  const steps = useMemo(() => stepsFor(sportLocked, sportId), [sportLocked, sportId]);
  const stepIndex = Math.min(index, steps.length - 1);
  const current = steps[stepIndex] ?? "rules";
  const last = stepIndex === steps.length - 1;

  const rally = sportId === "table-tennis" || sportId === "badminton" || sportId === "squash";
  const doubles = rally && (rules as TableTennisRules).doubles;
  const homeTitle = rally ? (doubles ? "홈 페어" : "선수 A") : "홈 팀";
  const awayTitle = rally ? (doubles ? "어웨이 페어" : "선수 B") : "어웨이 팀";
  const homeOk = home.trim().length > 0;
  const awayOk = away.trim().length > 0;

  const start = () => {
    if (!homeOk || !awayOk) {
      setError("이름을 입력하세요.");
      return;
    }
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

  const next = () => {
    if (current === "home" && !homeOk) {
      setError("이름을 입력하세요.");
      return;
    }
    if (current === "away" && !awayOk) {
      setError("이름을 입력하세요.");
      return;
    }
    setError("");
    if (last) {
      start();
      return;
    }
    setIndex((value) => value + 1);
  };

  const back = () => {
    setError("");
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setIndex((value) => Math.max(0, value - 1));
  };

  const primaryDisabled = (current === "home" && !homeOk) || (current === "away" && !awayOk);

  return (
    <WizardShell
      step={stepIndex + 1}
      total={steps.length}
      error={error}
      primaryLabel={last ? "보드로 이동" : "다음"}
      primaryDisabled={primaryDisabled}
      onPrimary={next}
      onBack={back}
    >
      {current === "sport" ? (
        <>
          <H>종목</H>
          <P muted>한 종목만 고릅니다.</P>
          <SportPickGrid selected={sportId} onSelect={selectSport} />
        </>
      ) : null}

      {current === "rules" ? (
        <>
          <H>룰</H>
          {sportLocked ? <P muted>{sportLabel(sportId)}</P> : null}
          <SportRulesEditor
            sportId={sportId}
            rules={rules}
            official={official}
            onRules={setRules}
            onOfficial={setOfficial}
            compact
          />
        </>
      ) : null}

      {current === "home" ? (
        <>
          <H>{homeTitle}</H>
          <P muted>이름과 색만 정합니다.</P>
          <TeamEditor name={home} color={homeColor} onName={setHome} onColor={setHomeColor} />
        </>
      ) : null}

      {current === "away" ? (
        <>
          <H>{awayTitle}</H>
          <P muted>이름과 색만 정합니다.</P>
          <TeamEditor name={away} color={awayColor} onName={setAway} onColor={setAwayColor} />
          {doubles ? (
            <P muted>복식은 이름에 슬래시로 두 명을 적습니다. 위치·서브 순서는 강제하지 않습니다.</P>
          ) : null}
        </>
      ) : null}

      {current === "players" ? (
        <>
          <H>선수</H>
          <P muted>없어도 됩니다. 비우면 팀 득점만으로 진행합니다.</P>
          <P muted>{homeTitle}</P>
          <PlayerDraftList players={homePlayers} onChange={setHomePlayers} />
          <P muted>{awayTitle}</P>
          <PlayerDraftList players={awayPlayers} onChange={setAwayPlayers} />
        </>
      ) : null}
    </WizardShell>
  );
}
