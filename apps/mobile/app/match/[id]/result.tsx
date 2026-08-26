import { useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Btn, H, P, Screen } from "@/components/ui";
import { copyText } from "@/lib/copy-text";
import { matchDisplayScore } from "@/lib/home";
import { matchPeriodLine, matchResultShareText } from "@/lib/share-text";
import { useAppStore } from "@/store/app-store";
import { space } from "@/theme/tokens";

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const competition = useAppStore((s) =>
    s.competitions.find((c) => c.id === match?.competitionId),
  );
  const next = useAppStore((s) =>
    s.matches.find(
      (m) => m.competitionId === match?.competitionId && (m.status === "scheduled" || m.status === "lineup"),
    ),
  );
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2200);
    return () => clearTimeout(t);
  }, [notice]);

  if (!match) {
    return (
      <Screen>
        <P>경기를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const score = matchDisplayScore(match);
  const periods = matchPeriodLine(match);
  const bracketLabel = competition?.format === "league" ? "순위표로" : "대진표로";

  return (
    <Screen style={{ padding: space.lg, gap: space.md }}>
      <P muted>{match.roundLabel}</P>
      <H>
        {match.homeLabel}  {score.home}  -  {score.away}  {match.awayLabel}
      </H>
      {periods ? <P muted>{periods}</P> : null}
      <P>승: {match.winnerLabel ?? "미정"}</P>
      {notice ? <P muted>{notice}</P> : null}
      <Btn
        label="결과 복사"
        variant="ghost"
        onPress={async () => {
          const ok = await copyText(matchResultShareText(match, competition?.name));
          setNotice(ok ? "복사됨" : "복사하지 못했습니다");
        }}
      />
      <P muted style={{ fontSize: 12 }}>
        카톡·문자로 붙여넣기. 실시간 링크는 없습니다.
      </P>
      {match.competitionId ? (
        <View style={{ gap: 10 }}>
          <Link href={`/competition/${match.competitionId}/bracket`} asChild>
            <Btn label={bracketLabel} />
          </Link>
          {next ? (
            <Link href={`/match/${next.id}/lineup`} asChild>
              <Btn label="다음 경기" variant="ghost" />
            </Link>
          ) : null}
        </View>
      ) : (
        <Link href="/" asChild>
          <Btn label="홈으로" />
        </Link>
      )}
    </Screen>
  );
}
