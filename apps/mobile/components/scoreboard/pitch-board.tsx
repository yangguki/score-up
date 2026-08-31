import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  formatClock,
  isPitchMatch,
  pitchPeriodLabel,
  pitchRulesSummary,
} from "@score-up/domain";
import { pitchNotice } from "@score-up/mock";
import { Btn, P } from "@/components/ui";
import {
  ArenaActionRow,
  ArenaBoardShell,
  ArenaDialog,
  ArenaDockFooter,
  ArenaDockRow,
  ArenaMeta,
  ArenaRecent,
  arenaBottomGhost,
  arenaBottomGhostText,
  arenaDialogTitle,
  arenaOverlayBox,
  arenaStartBtn,
} from "@/components/scoreboard/arena-board";
import { BoardKey } from "@/components/scoreboard/scoreboard-chrome";
import { eventLine } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export function PitchScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === match?.competitionId));
  const addPoint = useAppStore((s) => s.addPoint);
  const addSanction = useAppStore((s) => s.addSanction);
  const addTeamFoul = useAppStore((s) => s.addTeamFoul);
  const undo = useAppStore((s) => s.undo);
  const tick = useAppStore((s) => s.tick);
  const pause = useAppStore((s) => s.pause);
  const resume = useAppStore((s) => s.resume);
  const startPitch = useAppStore((s) => s.startPitch);
  const confirmPeriod = useAppStore((s) => s.confirmPeriod);
  const requestPeriodEnd = useAppStore((s) => s.requestPeriodEnd);
  const confirmMatch = useAppStore((s) => s.confirmMatch);
  const forfeit = useAppStore((s) => s.forfeit);
  const abandon = useAppStore((s) => s.abandon);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!match || !isPitchMatch(match)) return;
    setNotice(pitchNotice(match));
  }, [match]);

  useEffect(() => {
    return () => {
      const current = useAppStore.getState().matches.find((row) => row.id === id);
      if (!current || !isPitchMatch(current)) return;
      if (current.status === "in_progress" && current.snapshot.started && current.snapshot.clockRunning) {
        useAppStore.getState().pause(current.id);
      }
    };
  }, [id]);

  useEffect(() => {
    if (!match || !isPitchMatch(match)) return;
    if (!(match.status === "in_progress" && match.snapshot.clockRunning)) return;
    const t = setInterval(() => tick(match.id, 200), 200);
    return () => clearInterval(t);
  }, [match?.id, match?.status, isPitchMatch(match!) ? match.snapshot.clockRunning : false, tick]);

  if (!match || !isPitchMatch(match)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 }}>
        <P>전후반 경기를 찾을 수 없습니다.</P>
      </View>
    );
  }

  const snap = match.snapshot;
  const locked =
    match.status === "confirm_period_end" ||
    match.status === "confirm_match_end" ||
    match.status === "completed" ||
    match.status === "forfeited";
  const playLocked = locked || !snap.started;
  const homeColor = match.homeColor ?? DEFAULT_HOME_COLOR;
  const awayColor = match.awayColor ?? DEFAULT_AWAY_COLOR;
  const headerTitle = competition?.name ?? match.roundLabel;
  const period = pitchPeriodLabel(snap, match.rules);
  const showFouls = match.rules.teamFoulPenaltyAt > 0;
  const recent = [...match.events]
    .reverse()
    .filter((event) => !event.revoked && event.type !== "revoke")
    .slice(0, 3);

  const leave = () => {
    if ((match.status === "in_progress" || match.status === "paused") && snap.started) {
      setLeaveOpen(true);
      return;
    }
    router.back();
  };

  const clockAction = () => {
    if (match.status === "period_break" || match.status === "paused" || !snap.started || !snap.clockRunning) {
      resume(match.id);
      return;
    }
    pause(match.id);
  };

  const clockLabel = match.status === "period_break" ? "다음 하프 시작" : snap.clockRunning ? "일시정지" : "시계 시작";

  const teamPanel = (side: "home" | "away") => {
    const yellow = side === "home" ? snap.yellowHome : snap.yellowAway;
    const red = side === "home" ? snap.redHome : snap.redAway;
    const fouls = side === "home" ? snap.teamFoulsHome : snap.teamFoulsAway;
    return {
      label: side === "home" ? match.homeLabel : match.awayLabel,
      color: side === "home" ? homeColor : awayColor,
      score: side === "home" ? snap.homeScore : snap.awayScore,
      meta: (
        <ArenaMeta>
          옐로 {yellow} · 레드 {red}
          {showFouls ? ` · 파울 ${fouls}` : ""}
        </ArenaMeta>
      ),
    };
  };

  const actionRow = (side: "home" | "away") => (
    <ArenaActionRow side={side}>
      <BoardKey label="+1 골" variant="primary" disabled={playLocked} onPress={() => addPoint(match.id, side, 1)} />
      <BoardKey label="경고" disabled={playLocked} onPress={() => addSanction(match.id, side, "yellow")} />
      <BoardKey label="레드" disabled={playLocked} onPress={() => addSanction(match.id, side, "red")} />
      {showFouls ? (
        <BoardKey label="팀 파울" disabled={playLocked} onPress={() => addTeamFoul(match.id, side)} />
      ) : null}
    </ArenaActionRow>
  );

  const centerSub = [
    `카드 옐로 ${snap.yellowHome}-${snap.yellowAway} · 레드 ${snap.redHome}-${snap.redAway}`,
    showFouls ? `누적 파울 ${snap.teamFoulsHome}-${snap.teamFoulsAway}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ArenaBoardShell
        home={teamPanel("home")}
        away={teamPanel("away")}
        centerTitle={`${headerTitle} · ${sportLabel(match.sportId)} · ${period}`}
        centerMain={formatClock(snap.clockMs)}
        centerSub={centerSub}
        notice={[!snap.started ? "시작 전" : null, notice].filter(Boolean).join(" · ") || undefined}
        onLeave={leave}
        onMore={() => setMoreOpen(true)}
        overlay={
          !snap.started ? (
            <View pointerEvents="box-none" style={arenaOverlayBox}>
              <Pressable onPress={() => startPitch(match.id)} style={arenaStartBtn}>
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
                <ArenaRecent
                  text={recent.length ? recent.map((event) => eventLine(event, players, match)).join(" · ") : ""}
                  onPress={() => router.push(`/match/${match.id}/timeline`)}
                />
              }
            >
              <Pressable onPress={() => undo(match.id)} style={arenaBottomGhost}>
                <Text style={arenaBottomGhostText}>실행 취소</Text>
              </Pressable>
              <Pressable
                onPress={clockAction}
                disabled={!snap.started || locked}
                style={[arenaBottomGhost, !snap.started || locked ? { opacity: 0.35 } : null]}
              >
                <Text style={arenaBottomGhostText}>{clockLabel}</Text>
              </Pressable>
            </ArenaDockFooter>
          </>
        }
      />

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>{snap.needsOvertimeDecision ? "동점" : "하프 종료"}</Text>
          <P muted>
            {match.homeLabel} {snap.homeScore} - {snap.awayScore} {match.awayLabel}
          </P>
          {snap.needsOvertimeDecision ? (
            <>
              <Btn label="연장 시작" onPress={() => confirmPeriod(match.id)} />
              <Btn
                label="무승부 확정"
                variant="ghost"
                onPress={() => {
                  confirmMatch(match.id);
                  router.replace(`/match/${match.id}/result`);
                }}
              />
            </>
          ) : (
            <Btn label="확정" onPress={() => confirmPeriod(match.id)} />
          )}
          <Btn label="마지막 입력 취소" variant="ghost" onPress={() => undo(match.id)} />
        </ArenaDialog>
      </Modal>

      <Modal visible={match.status === "confirm_match_end"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>경기 종료</Text>
          <P muted>
            {match.homeLabel} {snap.homeScore} - {snap.awayScore} {match.awayLabel}
          </P>
          <Btn
            label="확정"
            onPress={() => {
              confirmMatch(match.id);
              router.replace(`/match/${match.id}/result`);
            }}
          />
          <Btn label="마지막 입력 취소" variant="ghost" onPress={() => undo(match.id)} />
        </ArenaDialog>
      </Modal>

      <Modal visible={leaveOpen} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>경기 중 · 나가기</Text>
          <P muted>기록은 계속 저장됩니다. 시계는 멈춥니다.</P>
          <Btn label="머무르기" variant="ghost" onPress={() => setLeaveOpen(false)} />
          <Btn
            label="나가기"
            onPress={() => {
              setLeaveOpen(false);
              router.back();
            }}
          />
        </ArenaDialog>
      </Modal>

      <Modal visible={moreOpen} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>더보기</Text>
          <Btn
            label="하프 종료"
            variant="ghost"
            disabled={!snap.started || locked}
            onPress={() => {
              requestPeriodEnd(match.id);
              setMoreOpen(false);
            }}
          />
          <Btn
            label="타임라인"
            variant="ghost"
            onPress={() => {
              setMoreOpen(false);
              router.push(`/match/${match.id}/timeline`);
            }}
          />
          <Btn
            label="룰 보기"
            variant="ghost"
            onPress={() => {
              setMoreOpen(false);
              setRulesOpen(true);
            }}
          />
          <Btn
            label={`${match.homeLabel} 몰수승`}
            variant="danger"
            onPress={() => {
              forfeit(match.id, "home");
              setMoreOpen(false);
              router.replace(`/match/${match.id}/result`);
            }}
          />
          <Btn
            label={`${match.awayLabel} 몰수승`}
            variant="danger"
            onPress={() => {
              forfeit(match.id, "away");
              setMoreOpen(false);
              router.replace(`/match/${match.id}/result`);
            }}
          />
          <Btn
            label="경기 중단"
            variant="danger"
            onPress={() => {
              abandon(match.id);
              setMoreOpen(false);
              router.back();
            }}
          />
          <Btn label="닫기" variant="ghost" onPress={() => setMoreOpen(false)} />
        </ArenaDialog>
      </Modal>

      <Modal visible={rulesOpen} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>룰</Text>
          <P>{pitchRulesSummary(match.rules, match.sportId)}</P>
          <P muted>추가시간 자동 없음. 카드는 메모만. 출전 제한은 없습니다.</P>
          <Btn label="닫기" onPress={() => setRulesOpen(false)} />
        </ArenaDialog>
      </Modal>
    </View>
  );
}
