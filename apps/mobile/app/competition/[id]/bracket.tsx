import { useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { computeLeagueStandings } from "@score-up/domain";
import { Btn, Card, H, P, Pill, Screen } from "@/components/ui";
import { copyText } from "@/lib/copy-text";
import { matchDisplayScore } from "@/lib/home";
import { matchHref, statusLabel } from "@/lib/labels";
import { leagueShareText, tournamentShareText } from "@/lib/share-text";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function BracketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2200);
    return () => clearTimeout(t);
  }, [notice]);
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === id));
  const allTeams = useAppStore((s) => s.teams);
  const allSlots = useAppStore((s) => s.brackets);
  const matches = useAppStore((s) => s.matches);
  const teams = allTeams.filter((t) => t.competitionId === id);
  const slots = allSlots.filter((b) => b.competitionId === id);
  const makeBracket = useAppStore((s) => s.makeBracket);
  const leagueMatches = matches.filter((m) => m.competitionId === id && !m.isFriendly);
  const isLeague = competition?.format === "league";
  const hasSchedule = isLeague ? leagueMatches.length > 0 : slots.length > 0;

  const nameOf = (teamId?: string) => teams.find((t) => t.id === teamId)?.name ?? (teamId ? "" : "—");

  if (!competition) {
    return (
      <Screen>
        <P>대회를 찾을 수 없습니다.</P>
      </Screen>
    );
  }

  const standings = isLeague
    ? computeLeagueStandings(
        teams.map((t) => ({ id: t.id, name: t.name })),
        leagueMatches.map((m) => {
          const score = matchDisplayScore(m);
          return {
            status: m.status,
            homeTeamId: m.homeTeamId,
            awayTeamId: m.awayTeamId,
            winnerTeamId: m.winnerTeamId,
            homeScore: score.home,
            awayScore: score.away,
          };
        }),
      )
    : [];

  const rounds = [...new Set(leagueMatches.map((m) => m.roundLabel))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H style={{ fontSize: 18 }}>{isLeague ? "일정 · 순위" : "대진표"}</H>
        {hasSchedule ? (
          <>
            <Btn
              label={isLeague ? "순위 복사" : "대진 복사"}
              variant="ghost"
              onPress={async () => {
                const text = isLeague
                  ? leagueShareText(competition, standings, leagueMatches)
                  : tournamentShareText(competition, slots, matches, nameOf);
                const ok = await copyText(text);
                setNotice(ok ? "복사됨" : "복사하지 못했습니다");
              }}
            />
            <P muted style={{ fontSize: 12 }}>
              카톡·문자로 붙여넣기. 실시간 링크는 없습니다.
            </P>
            {notice ? <P muted>{notice}</P> : null}
          </>
        ) : null}
        {!hasSchedule ? (
          <>
            <P muted>
              참가 {teams.length}팀.
              {teams.length < 2
                ? isLeague
                  ? " 리그 일정은 팀이 2개 이상일 때 만들 수 있습니다."
                  : " 토너먼트 대진은 팀이 2개 이상일 때 만들 수 있습니다."
                : isLeague
                  ? " 일정을 만들면 순위표와 라운드 경기가 나타납니다."
                  : " 2팀 이상이면 대진을 만들 수 있습니다."}
            </P>
            <Btn
              label={isLeague ? "일정 생성" : "대진 생성"}
              disabled={teams.length < 2}
              onPress={() => makeBracket(id!)}
            />
          </>
        ) : null}

        {isLeague && hasSchedule ? (
          <>
            <P muted>승점 승 3 · 패 0</P>
            <Card>
              <View style={{ flexDirection: "row", marginBottom: 8, gap: 4 }}>
                <P muted style={{ width: 28 }}>
                  #
                </P>
                <P muted style={{ flex: 1 }}>
                  팀
                </P>
                <P muted style={{ width: 28, textAlign: "right" }}>
                  승
                </P>
                <P muted style={{ width: 28, textAlign: "right" }}>
                  패
                </P>
                <P muted style={{ width: 40, textAlign: "right" }}>
                  득실
                </P>
                <P muted style={{ width: 28, textAlign: "right" }}>
                  점
                </P>
              </View>
              {standings.map((row) => (
                <View
                  key={row.teamId}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 6,
                    borderTopWidth: 1,
                    borderTopColor: colors.line,
                    gap: 4,
                  }}
                >
                  <P style={{ width: 28 }}>{row.rank}</P>
                  <P style={{ flex: 1 }}>{row.teamName}</P>
                  <P style={{ width: 28, textAlign: "right" }}>{row.wins}</P>
                  <P style={{ width: 28, textAlign: "right" }}>{row.losses}</P>
                  <P style={{ width: 40, textAlign: "right" }}>
                    {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                  </P>
                  <H style={{ width: 28, fontSize: 16, textAlign: "right" }}>{row.points}</H>
                </View>
              ))}
            </Card>
            <Link href={`/competition/${id}/matches`} asChild>
              <Btn label="경기 목록" variant="ghost" />
            </Link>
            {rounds.map((roundLabel) => {
              const rows = leagueMatches.filter((m) => m.roundLabel === roundLabel);
              return (
                <View key={roundLabel} style={{ gap: 8 }}>
                  <H style={{ fontSize: 16 }}>{roundLabel}</H>
                  {rows.map((match) => (
                    <Link key={match.id} href={matchHref(match)} asChild>
                      <Pressable>
                        <Card>
                          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <P>
                              {match.homeLabel} vs {match.awayLabel}
                            </P>
                            <Pill
                              label={statusLabel(match.status, match.sportId)}
                              tone={match.status === "in_progress" ? "live" : "muted"}
                            />
                          </View>
                          {match.status === "in_progress" ||
                          match.status === "completed" ||
                          match.status === "forfeited" ? (
                            <H style={{ fontSize: 20, marginTop: 8 }}>
                              {matchDisplayScore(match).home} - {matchDisplayScore(match).away}
                            </H>
                          ) : null}
                          {match.winnerLabel ? <P muted>승 {match.winnerLabel}</P> : null}
                        </Card>
                      </Pressable>
                    </Link>
                  ))}
                </View>
              );
            })}
          </>
        ) : null}

        {!isLeague
          ? ["sf", "final", "champion"].map((round) => {
              const rows = slots.filter((s) => s.round === round);
              if (rows.length === 0) return null;
              return (
                <View key={round} style={{ gap: 8 }}>
                  <H style={{ fontSize: 16 }}>
                    {round === "sf" ? "4강" : round === "final" ? "결승" : "우승"}
                  </H>
                  {rows.map((slot) => {
                    const match = matches.find((m) => m.id === slot.matchId);
                    return (
                      <Link key={slot.id} href={match ? matchHref(match) : `/competition/${id}`} asChild>
                        <Pressable>
                          <Card>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                              <P>
                                {slot.bye
                                  ? `${nameOf(slot.homeTeamId)} · BYE`
                                  : `${nameOf(slot.homeTeamId) || match?.homeLabel || "대기"} vs ${nameOf(slot.awayTeamId) || match?.awayLabel || "대기"}`}
                              </P>
                              {match ? (
                                <Pill
                                  label={statusLabel(match.status, match.sportId)}
                                  tone={match.status === "in_progress" ? "live" : "muted"}
                                />
                              ) : null}
                            </View>
                            {match && (match.status === "in_progress" || match.status === "completed") ? (
                              <H style={{ fontSize: 20, marginTop: 8 }}>
                                {matchDisplayScore(match).home} - {matchDisplayScore(match).away}
                              </H>
                            ) : null}
                            {match?.winnerLabel ? <P muted>승 {match.winnerLabel}</P> : null}
                          </Card>
                        </Pressable>
                      </Link>
                    );
                  })}
                </View>
              );
            })
          : null}
      </ScrollView>
    </Screen>
  );
}
