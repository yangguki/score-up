import { useState } from "react";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { ScrollView, TextInput, View } from "react-native";
import {
  accountName,
  canEnterFourOnFourSplit,
  canEnterFiveOnFiveSplit,
  canEnterRallyBout,
  canOperateClub,
  clubCourtSize,
  clubFourOnFourLockCopy,
  clubFiveOnFiveLockCopy,
  memberOf,
  rallyBoutLockCopy,
  rallySideSize,
  sessionRallyFormat,
  sessionSideLabel,
  sessionSplitFormat,
  sessionStatusLabel,
  voteLabel,
  type ClubSplitFormat,
  type RallyClubFormat,
  type VoteValue,
} from "@score-up/domain";
import { Btn, Card, H, P, Screen } from "@/components/ui";
import { confirmAction } from "@/lib/confirm";
import { myVoteValue, sessionLine } from "@/lib/club-home";
import { matchHref } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { colors, space } from "@/theme/tokens";

export default function SessionDetailScreen() {
  const { id, sid } = useLocalSearchParams<{ id: string; sid: string }>();
  const data = useAppStore();
  const session = data.sessions.find((row) => row.id === sid);
  const club = data.clubs.find((row) => row.id === id);
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");

  if (!club || !session) {
    return (
      <Screen>
        <P>회차를 찾을 수 없습니다.</P>
      </Screen>
    );
  }
  if (!data.accountId) return <Redirect href={`/login?next=/club/${id}/sessions/${sid}`} />;

  const mine = memberOf(data.clubMembers, club.id, data.accountId);
  const operate = canOperateClub(mine?.role);
  const members = data.clubMembers.filter((row) => row.clubId === club.id && row.status === "active");
  const voteOf = (accountId: string) => myVoteValue(session.id, accountId, data.sessionVotes);
  const grouped = (value: VoteValue) => members.filter((row) => voteOf(row.accountId) === value);
  const myVote = voteOf(data.accountId);
  const goingCount = grouped("going").length;
  const maybeCount = grouped("maybe").length;
  const noCount = grouped("not_going").length;
  const noneCount = grouped("none").length;
  const guests = data.sessionGuests.filter((row) => row.sessionId === session.id);
  const candidates = goingCount + guests.length;
  const match = session.matchId ? data.matches.find((row) => row.id === session.matchId) : undefined;

  const vote = (value: VoteValue) => {
    try {
      data.setVoteAt(session.id, value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "투표하지 못했습니다.");
    }
  };

  const enterSplit = (format: ClubSplitFormat) => {
    data.setSessionFormatAt(session.id, format);
    router.push(`/club/${club.id}/sessions/${session.id}/split`);
  };

  const enterBout = () => {
    router.push(`/club/${club.id}/sessions/${session.id}/bout`);
  };

  const setRallyFormat = (format: RallyClubFormat) => {
    data.setSessionFormatAt(session.id, format);
  };

  const isBadminton = club.sportId === "badminton";
  const splitFormat = sessionSplitFormat(session);
  const rallyFormat = sessionRallyFormat(session);
  const court = isBadminton ? rallySideSize(rallyFormat) : clubCourtSize(splitFormat);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <H style={{ fontSize: 20 }}>{sessionLine(session)}</H>
        <P muted>
          {session.venue || "장소 없음"} · 마감 {session.voteDeadlineLabel}
        </P>
        <P>상태 {sessionStatusLabel(session.status)}</P>
        {error ? <P style={{ color: colors.danger }}>{error}</P> : null}

        {session.status === "cancelled" ? <P>이 회차는 취소되었습니다.</P> : null}

        {session.status === "voting" ? (
          <>
            <H style={{ fontSize: 18 }}>내 응답</H>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["going", "not_going", "maybe"] as const).map((value) => (
                <View key={value} style={{ flex: 1 }}>
                  <Btn
                    label={voteLabel(value)}
                    variant={myVote === value ? "primary" : "ghost"}
                    onPress={() => vote(value)}
                  />
                </View>
              ))}
            </View>
            <P muted>
              참석 {goingCount} · 불참 {noCount} · 미정 {maybeCount} · 없음 {noneCount}
            </P>
            <P muted>
              {isBadminton
                ? "마감 후 단식 2명 또는 복식 4명이면 한 판을 열 수 있습니다."
                : "마감 후 참석 10명이면 5대5, 8~9명이면 4대4로 나눌 수 있습니다."}
            </P>
            <H style={{ fontSize: 16 }}>참석</H>
            {grouped("going").map((row) => (
              <P key={row.id}>{accountName(data.accounts, row.accountId)}</P>
            ))}
            <H style={{ fontSize: 16 }}>미정</H>
            {grouped("maybe").map((row) => (
              <P key={row.id}>{accountName(data.accounts, row.accountId)}</P>
            ))}
            {operate ? (
              <Btn
                label="투표 마감"
                onPress={() =>
                  confirmAction("투표 마감", "이제부터 멤버는 투표를 바꿀 수 없습니다. 마감할까요?", () =>
                    data.closeVotingAt(session.id),
                  )
                }
              />
            ) : null}
          </>
        ) : null}

        {session.status === "confirming" ? (
          <>
            <P>
              참석 {goingCount} (매칭 후보) · 미정 {maybeCount} (후보 아님)
            </P>
            <H style={{ fontSize: 16 }}>매칭 후보 {candidates}</H>
            {grouped("going").map((row) => (
              <Card key={row.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <P>{accountName(data.accounts, row.accountId)}</P>
                  {operate ? (
                    <Btn label="빼기" variant="ghost" onPress={() => data.dropCandidateAt(session.id, row.accountId)} />
                  ) : null}
                </View>
              </Card>
            ))}
            {guests.map((guest) => (
              <Card key={guest.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <P>게스트 {guest.name}</P>
                  {operate ? (
                    <Btn label="빼기" variant="ghost" onPress={() => data.dropCandidateAt(session.id, undefined, guest.id)} />
                  ) : null}
                </View>
              </Card>
            ))}
            <H style={{ fontSize: 16 }}>미정 · 없음</H>
            {[...grouped("maybe"), ...grouped("none"), ...grouped("not_going")].map((row) => (
              <Card key={row.id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <P>
                    {accountName(data.accounts, row.accountId)} · {voteLabel(voteOf(row.accountId))}
                  </P>
                  {operate ? (
                    <Btn label="참석으로" variant="ghost" onPress={() => data.setMemberGoingAt(session.id, row.accountId)} />
                  ) : null}
                </View>
              </Card>
            ))}
            {operate ? (
              <>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="게스트 이름"
                  placeholderTextColor={colors.muted}
                  style={inputStyle}
                />
                <Btn
                  label="게스트 이름 추가"
                  variant="ghost"
                  onPress={() => {
                    try {
                      data.addGuestAt(session.id, guestName);
                      setGuestName("");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "게스트를 넣지 못했습니다.");
                    }
                  }}
                />
                {isBadminton ? (
                  <>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Btn
                          label="단식"
                          variant={rallyFormat === "singles" ? "primary" : "ghost"}
                          onPress={() => setRallyFormat("singles")}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Btn
                          label="복식"
                          variant={rallyFormat === "doubles" ? "primary" : "ghost"}
                          onPress={() => setRallyFormat("doubles")}
                        />
                      </View>
                    </View>
                    {canEnterRallyBout(candidates, rallyFormat) ? (
                      <Btn label="한 판 열기" onPress={enterBout} />
                    ) : (
                      <>
                        <Btn label="한 판 열기" disabled />
                        <P muted>{rallyBoutLockCopy(rallyFormat)}</P>
                      </>
                    )}
                  </>
                ) : canEnterFiveOnFiveSplit(candidates) ? (
                  <Btn label="팀 나누기" onPress={() => enterSplit("5v5")} />
                ) : canEnterFourOnFourSplit(candidates) ? (
                  <>
                    <Btn label="팀 나누기" disabled />
                    <P muted>{clubFiveOnFiveLockCopy(candidates)}</P>
                    <Btn label="4대4로 나누기" onPress={() => enterSplit("4v4")} />
                  </>
                ) : (
                  <>
                    <Btn label="팀 나누기" disabled />
                    <Btn label="4대4로 나누기" disabled />
                    <P muted>{clubFourOnFourLockCopy()}</P>
                  </>
                )}
              </>
            ) : null}
          </>
        ) : null}

        {session.status === "matched" || session.status === "in_play" ? (
          <>
            {isBadminton ? (
              <P muted>{rallyFormat === "singles" ? "단식" : "복식"}</P>
            ) : splitFormat === "4v4" ? (
              <P muted>4대4 · 출전 팀당 {court}명</P>
            ) : null}
            {(["home", "away", "bench"] as const).map((side) => {
              const rows = data.sessionAssignments.filter((row) => row.sessionId === session.id && row.side === side);
              if (rows.length === 0 && side === "bench") return null;
              return (
                <View key={side} style={{ gap: 4 }}>
                  <H style={{ fontSize: 16 }}>{sessionSideLabel(side)}</H>
                  {rows.length === 0 ? <P muted>없음</P> : null}
                  {rows.map((row) => (
                    <P key={row.id}>
                      {row.accountId
                        ? accountName(data.accounts, row.accountId)
                        : `게스트 ${data.sessionGuests.find((guest) => guest.id === row.guestId)?.name ?? ""}`}
                    </P>
                  ))}
                </View>
              );
            })}
            {data.accountId ? (
              <P>
                내 팀{" "}
                {sessionSideLabel(
                  data.sessionAssignments.find((row) => row.sessionId === session.id && row.accountId === data.accountId)
                    ?.side ?? "bench",
                )}
              </P>
            ) : null}
            {match ? (
              operate ? (
                <>
                  <Link href={matchHref(match)} asChild>
                    <Btn
                      label={
                        session.status === "in_play" ? "이어하기" : isBadminton ? "보드로" : "출전 확인"
                      }
                    />
                  </Link>
                  {session.status === "matched" ? (
                    <Btn
                      label="다시 나누기"
                      variant="ghost"
                      onPress={() =>
                        confirmAction("다시 나누기", "만든 경기를 지우고 팀을 다시 나눌까요?", () => {
                          try {
                            data.reopenSessionMatchAt(session.id);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "다시 나누지 못했습니다.");
                          }
                        })
                      }
                    />
                  ) : null}
                </>
              ) : (
                <P muted>멤버는 보드에 들어가지 않습니다.</P>
              )
            ) : null}
          </>
        ) : null}

        {session.status === "completed" && match ? (
          <>
            <P>
              {match.homeLabel} {match.snapshot && "homeScore" in match.snapshot ? match.snapshot.homeScore : ""} -{" "}
              {"awayScore" in (match.snapshot ?? {}) ? (match.snapshot as { awayScore: number }).awayScore : ""} {match.awayLabel}
            </P>
            <P muted>랭킹에 반영됨</P>
            <P muted>게스트는 랭킹에 쌓이지 않습니다.</P>
            <Link href={`/match/${match.id}/result`} asChild>
              <Btn label="결과" variant="ghost" />
            </Link>
          </>
        ) : null}

        {operate && session.status !== "completed" && session.status !== "in_play" && session.status !== "cancelled" ? (
          <Btn
            label="회차 취소"
            variant="ghost"
            onPress={() =>
              confirmAction(
                "회차 취소",
                session.recurring ? "이 회차만 취소됩니다. 정기 규칙은 남습니다." : "이 회차를 취소할까요?",
                () => data.cancelSessionAt(session.id),
              )
            }
          />
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
};
