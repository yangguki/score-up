import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { bonusFor, DEFAULT_AWAY_COLOR, DEFAULT_HOME_COLOR, formatClock, isBasketballMatch, quarterLabel } from "@score-up/domain";
import { Btn, P } from "@/components/ui";
import {
  ArenaActionRow,
  ArenaBoardShell,
  ArenaDialog,
  ArenaDockFooter,
  ArenaDockRow,
  ArenaMeta,
  arenaBottomGhost,
  arenaBottomGhostText,
  arenaDialogTitle,
  arenaOverlayBox,
  arenaStartBtn,
} from "@/components/scoreboard/arena-board";
import { BoardKey } from "@/components/scoreboard/scoreboard-chrome";
import { eventLine } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

type Pending =
  | { kind: "point"; side: "home" | "away"; points: 1 | 2 | 3 }
  | { kind: "foul"; side: "home" | "away" }
  | { kind: "sub"; side: "home" | "away" }
  | { kind: "more" };

export function BasketballScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const teams = useAppStore((s) => s.teams);
  const players = useAppStore((s) => s.players);
  const addPoint = useAppStore((s) => s.addPoint);
  const addFoul = useAppStore((s) => s.addFoul);
  const addTimeout = useAppStore((s) => s.addTimeout);
  const finishTimeout = useAppStore((s) => s.finishTimeout);
  const sub = useAppStore((s) => s.sub);
  const undo = useAppStore((s) => s.undo);
  const tick = useAppStore((s) => s.tick);
  const pause = useAppStore((s) => s.pause);
  const resume = useAppStore((s) => s.resume);
  const confirmPeriod = useAppStore((s) => s.confirmPeriod);
  const requestPeriodEnd = useAppStore((s) => s.requestPeriodEnd);
  const confirmMatch = useAppStore((s) => s.confirmMatch);
  const goOvertime = useAppStore((s) => s.goOvertime);
  const forfeit = useAppStore((s) => s.forfeit);
  const abandon = useAppStore((s) => s.abandon);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [outId, setOutId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    return () => {
      const current = useAppStore.getState().matches.find((row) => row.id === id);
      if (!current || !isBasketballMatch(current)) return;
      if (current.status === "in_progress" && current.snapshot.started && current.snapshot.clockRunning) {
        useAppStore.getState().pause(current.id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (!match || !isBasketballMatch(match)) return;
    const ticking =
      match.snapshot.timeoutRunning || (match.status === "in_progress" && match.snapshot.clockRunning);
    if (!ticking) return;
    const t = setInterval(() => tick(match.id, 200), 200);
    return () => clearInterval(t);
  }, [
    match?.id,
    match?.status,
    isBasketballMatch(match!) ? match.snapshot.clockRunning : false,
    isBasketballMatch(match!) ? match.snapshot.timeoutRunning : false,
    tick,
  ]);

  const locked =
    match?.status === "confirm_period_end" ||
    match?.status === "confirm_match_end" ||
    match?.status === "paused" ||
    match?.status === "completed";

  const homePlayers = useMemo(() => players.filter((p) => p.teamId === match?.homeTeamId), [players, match?.homeTeamId]);
  const awayPlayers = useMemo(() => players.filter((p) => p.teamId === match?.awayTeamId), [players, match?.awayTeamId]);

  if (!match || !isBasketballMatch(match)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 }}>
        <P>농구 경기를 찾을 수 없습니다.</P>
      </View>
    );
  }

  const snap = match.snapshot;
  const q = quarterLabel(snap.quarter, match.rules.periodCount);
  const homeBonus = bonusFor(snap, "home", match.rules);
  const awayBonus = bonusFor(snap, "away", match.rules);
  const recent = [...match.events].filter((e) => !e.revoked && e.type !== "revoke").slice(-3).reverse();
  const homeTo = snap.timeoutsLeft[match.homeTeamId ?? "home"] ?? 0;
  const awayTo = snap.timeoutsLeft[match.awayTeamId ?? "away"] ?? 0;
  const homeColor = teams.find((t) => t.id === match.homeTeamId)?.color ?? match.homeColor ?? DEFAULT_HOME_COLOR;
  const awayColor = teams.find((t) => t.id === match.awayTeamId)?.color ?? match.awayColor ?? DEFAULT_AWAY_COLOR;
  const playLocked = locked || !snap.started || snap.timeoutRunning;
  const timeoutTeam =
    snap.timeoutTeamId === match.awayTeamId || snap.timeoutTeamId === "away" ? match.awayLabel : match.homeLabel;

  const sidePlayers = (side: "home" | "away") => {
    const roster = side === "home" ? homePlayers : awayPlayers;
    const onCourt = side === "home" ? snap.onCourtHome : snap.onCourtAway;
    return { roster, onCourt };
  };

  const leave = () => {
    if (match.status === "in_progress" && snap.started) {
      setLeaveOpen(true);
      return;
    }
    if (match.status === "paused" && snap.started) {
      setLeaveOpen(true);
      return;
    }
    router.back();
  };

  const clockAction = () => {
    if (snap.timeoutRunning) {
      finishTimeout(match.id);
      return;
    }
    if (match.status === "period_break" || match.status === "paused" || !snap.started || !snap.clockRunning) {
      resume(match.id);
      return;
    }
    pause(match.id);
  };

  const clockLabel = snap.timeoutRunning
    ? "타임아웃 종료"
    : match.status === "period_break"
      ? "다음 쿼터 시작"
      : !snap.started
        ? "경기 시작"
        : match.status === "paused" || !snap.clockRunning
          ? "재개"
          : "일시정지";

  const teamPanel = (side: "home" | "away") => {
    const fouls = side === "home" ? snap.homeTeamFoulsInQuarter : snap.awayTeamFoulsInQuarter;
    const bonus = side === "home" ? homeBonus : awayBonus;
    return {
      label: side === "home" ? match.homeLabel : match.awayLabel,
      color: side === "home" ? homeColor : awayColor,
      score: side === "home" ? snap.homeScore : snap.awayScore,
      meta: (
        <>
          <ArenaMeta>팀파울 {fouls}</ArenaMeta>
          {bonus ? <Text style={{ color: colors.bonus, fontWeight: "800", marginTop: 4 }}>보너스</Text> : null}
        </>
      ),
    };
  };

  const actionRow = (side: "home" | "away") => {
    const bonus = side === "home" ? homeBonus : awayBonus;
    const to = side === "home" ? homeTo : awayTo;
    const pointOrder: Array<1 | 2 | 3> = side === "home" ? [2, 3, 1] : [1, 3, 2];
    const timeoutLocked =
      !snap.started ||
      snap.timeoutRunning ||
      to <= 0 ||
      match.status === "confirm_period_end" ||
      match.status === "confirm_match_end" ||
      match.status === "completed" ||
      match.status === "period_break";
    return (
      <ArenaActionRow side={side}>
        {pointOrder.map((pts) => (
          <BoardKey
            key={pts}
            label={`+${pts}`}
            variant={pts === 1 && bonus ? "primary" : "ghost"}
            emphasize={pts === 1 && bonus}
            disabled={playLocked}
            onPress={() => setPending({ kind: "point", side, points: pts })}
          />
        ))}
        <BoardKey label="파울" disabled={playLocked} onPress={() => setPending({ kind: "foul", side })} />
        <BoardKey
          label="교체"
          disabled={playLocked || (side === "home" ? homePlayers.length === 0 : awayPlayers.length === 0)}
          onPress={() => setPending({ kind: "sub", side })}
        />
        <BoardKey label={`T/O ${to}`} disabled={timeoutLocked} onPress={() => addTimeout(match.id, side)} />
      </ArenaActionRow>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ArenaBoardShell
        home={teamPanel("home")}
        away={teamPanel("away")}
        centerTitle={`${q} · ${match.roundLabel}`}
        centerMain={formatClock(snap.clockMs)}
        centerSub={`팀파울 ${snap.homeTeamFoulsInQuarter} - ${snap.awayTeamFoulsInQuarter}`}
        notice={[!snap.started && match.status === "in_progress" ? "시작 전" : null, notice].filter(Boolean).join(" · ") || undefined}
        onLeave={leave}
        onMore={() => setPending({ kind: "more" })}
        overlay={
          snap.timeoutRunning ? (
            <View pointerEvents="box-none" style={arenaOverlayBox}>
              <Text style={{ color: colors.bonus, fontSize: 18, fontWeight: "800" }}>작전타임</Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{timeoutTeam}</Text>
              <Text style={{ color: "#fff", fontSize: 80, fontWeight: "900", fontVariant: ["tabular-nums"] }}>
                {formatClock(snap.timeoutClockMs)}
              </Text>
              <Pressable onPress={() => finishTimeout(match.id)} style={arenaStartBtn}>
                <Text style={{ color: colors.primaryFg, fontSize: 16, fontWeight: "800" }}>타임아웃 종료</Text>
              </Pressable>
            </View>
          ) : !snap.started && match.status === "in_progress" ? (
            <View pointerEvents="box-none" style={arenaOverlayBox}>
              <Pressable onPress={() => resume(match.id)} style={arenaStartBtn}>
                <Text style={{ color: colors.primaryFg, fontSize: 18, fontWeight: "800" }}>경기 시작</Text>
              </Pressable>
            </View>
          ) : null
        }
        dock={
          <>
            <ArenaDockRow>
              {actionRow("home")}
              {actionRow("away")}
            </ArenaDockRow>
            <ArenaDockFooter
              recent={
                <Pressable onPress={() => router.push(`/match/${match.id}/timeline`)}>
                  <Text style={{ color: "#ffffffbb", fontSize: 11 }} numberOfLines={1}>
                    최근: {recent.length ? recent.map((e) => eventLine(e, players, match)).join(" · ") : "없음"}
                  </Text>
                </Pressable>
              }
            >
              <Pressable onPress={() => undo(match.id)} style={arenaBottomGhost}>
                <Text style={arenaBottomGhostText}>실행 취소</Text>
              </Pressable>
              <Pressable onPress={clockAction} style={arenaBottomGhost}>
                <Text style={arenaBottomGhostText}>{clockLabel}</Text>
              </Pressable>
            </ArenaDockFooter>
          </>
        }
      />

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <ArenaDialog>
          {snap.needsOvertimeDecision ? (
            <>
              <Text style={arenaDialogTitle}>연장으로 갈까요?</Text>
              <P muted>
                {match.homeLabel} {snap.homeScore} - {snap.awayScore} {match.awayLabel}
              </P>
              <Btn label="연장 시작" onPress={() => goOvertime(match.id)} />
            </>
          ) : (
            <>
              <Text style={arenaDialogTitle}>쿼터 종료</Text>
              <P muted>{q} 종료를 확정할까요?</P>
              <Btn label="마지막 점수 취소" variant="ghost" onPress={() => undo(match.id)} />
              <Btn label="확정" onPress={() => confirmPeriod(match.id)} />
            </>
          )}
        </ArenaDialog>
      </Modal>

      <Modal visible={match.status === "confirm_match_end"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>경기 종료</Text>
          <P muted>
            {match.homeLabel} {snap.homeScore} - {snap.awayScore} {match.awayLabel}
          </P>
          <Btn label="마지막 점수 취소" variant="ghost" onPress={() => undo(match.id)} />
          <Btn
            label="확정"
            onPress={() => {
              confirmMatch(match.id);
              router.replace(`/match/${match.id}/result`);
            }}
          />
        </ArenaDialog>
      </Modal>

      <Modal visible={pending != null && pending.kind !== "more"} transparent animationType="slide">
        <Pressable style={{ flex: 1, backgroundColor: "#0008", justifyContent: "flex-end" }} onPress={() => { setPending(null); setOutId(null); }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 }}>
            {pending && pending.kind !== "more" ? (
              <PickerBody
                pending={pending}
                homeLabel={match.homeLabel}
                awayLabel={match.awayLabel}
                players={sidePlayers(pending.side)}
                fouls={snap.playerFouls}
                limit={match.rules.personalFoulLimit}
                outId={outId}
                onTeamPoint={() => {
                  if (pending.kind === "point") addPoint(match.id, pending.side, pending.points);
                  setPending(null);
                }}
                onPick={(playerId) => {
                  if (pending.kind === "point") addPoint(match.id, pending.side, pending.points, playerId);
                  if (pending.kind === "foul") {
                    const foulsBefore =
                      pending.side === "home" ? snap.homeTeamFoulsInQuarter : snap.awayTeamFoulsInQuarter;
                    const result = addFoul(match.id, pending.side, playerId);
                    const jersey = players.find((p) => p.id === playerId)?.number;
                    if (result.foulOut) {
                      setNotice(`${jersey ?? ""}번 파울 아웃 · 교체하세요`);
                    } else if (result.nextOut) {
                      setNotice("다음 파울 시 아웃");
                    } else if (foulsBefore + 1 === match.rules.teamFoulBonusAt) {
                      setNotice("보너스 상황");
                    }
                  }
                  if (pending.kind === "sub") {
                    if (!outId) {
                      setOutId(playerId);
                      return;
                    }
                    sub(match.id, pending.side, outId, playerId);
                    setOutId(null);
                    setPending(null);
                    return;
                  }
                  setPending(null);
                }}
              />
            ) : null}
            <Btn label="닫기" variant="ghost" onPress={() => { setPending(null); setOutId(null); }} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={leaveOpen} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>경기 중 · 나가기</Text>
          <P muted>기록은 계속 저장됩니다. 시계는 일시정지합니다.</P>
          <Btn label="머무르기" variant="ghost" onPress={() => setLeaveOpen(false)} />
          <Btn
            label="나가기"
            onPress={() => {
              pause(match.id);
              setLeaveOpen(false);
              router.back();
            }}
          />
        </ArenaDialog>
      </Modal>
      <Modal visible={pending?.kind === "more"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>더보기</Text>
          <Btn label="타임라인" variant="ghost" onPress={() => { setPending(null); router.push(`/match/${match.id}/timeline`); }} />
          <Btn
            label="룰 보기"
            variant="ghost"
            onPress={() => {
              setNotice(
                `${match.rules.periodMinutes}분 × ${match.rules.periodCount}쿼터 · 작전타임 ${match.rules.timeoutSeconds}초`,
              );
              setPending(null);
            }}
          />
          {(match.status === "in_progress" || match.status === "paused") && !snap.timeoutRunning ? (
            <Btn
              label="쿼터 종료"
              variant="ghost"
              onPress={() => {
                requestPeriodEnd(match.id);
                setPending(null);
              }}
            />
          ) : null}
          <Btn label={`${match.homeLabel} 몰수승`} variant="danger" onPress={() => { forfeit(match.id, "home"); setPending(null); router.replace(`/match/${match.id}/result`); }} />
          <Btn label={`${match.awayLabel} 몰수승`} variant="danger" onPress={() => { forfeit(match.id, "away"); setPending(null); router.replace(`/match/${match.id}/result`); }} />
          <Btn label="경기 중단" variant="danger" onPress={() => { abandon(match.id); setPending(null); router.back(); }} />
          <Btn label="닫기" variant="ghost" onPress={() => setPending(null)} />
        </ArenaDialog>
      </Modal>
    </View>
  );
}

function PickerBody({
  pending,
  homeLabel,
  awayLabel,
  players,
  fouls,
  limit,
  outId,
  onTeamPoint,
  onPick,
}: {
  pending: Exclude<Pending, { kind: "more" }>;
  homeLabel: string;
  awayLabel: string;
  players: { roster: { id: string; name: string; number: number }[]; onCourt: string[] };
  fouls: Record<string, number>;
  limit: number;
  outId: string | null;
  onTeamPoint: () => void;
  onPick: (playerId: string) => void;
}) {
  const title =
    pending.kind === "point"
      ? `${pending.side === "home" ? homeLabel : awayLabel} 득점 +${pending.points}`
      : pending.kind === "foul"
        ? `${pending.side === "home" ? homeLabel : awayLabel} 파울`
        : `${pending.side === "home" ? homeLabel : awayLabel} 교체 ${outId ? "IN" : "OUT"}`;
  const list =
    pending.kind === "sub" && outId
      ? players.roster.filter((p) => !players.onCourt.includes(p.id) && (fouls[p.id] ?? 0) < limit)
      : players.roster.filter((p) => players.onCourt.includes(p.id) && (pending.kind !== "foul" || (fouls[p.id] ?? 0) < limit) && (pending.kind !== "point" || (fouls[p.id] ?? 0) < limit));

  return (
    <View style={{ gap: 8, maxHeight: 420 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}>{title}</Text>
      <ScrollView>
        {list.map((p) => {
          const pf = fouls[p.id] ?? 0;
          const nextOut = pf === limit - 1;
          return (
            <Pressable key={p.id} onPress={() => onPick(p.id)} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.text, fontSize: 16 }}>
                {p.number} {p.name}  파울 {pf}
                {nextOut ? " · 다음 아웃" : ""}
              </Text>
            </Pressable>
          );
        })}
        {list.length === 0 ? <P muted>출전 선수가 없습니다. 팀 득점으로 기록하세요.</P> : null}
      </ScrollView>
      {pending.kind === "point" ? <Btn label="팀 득점으로 기록" variant="ghost" onPress={onTeamPoint} /> : null}
    </View>
  );
}
