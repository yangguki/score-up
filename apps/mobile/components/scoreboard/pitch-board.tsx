import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { eventLine } from "@/lib/labels";
import { sportLabel } from "@/lib/match-routes";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export function PitchScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const stacked = width < 820;
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
  const scoreSize = stacked ? Math.min(120, height * 0.18) : Math.min(180, width * 0.22);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 12, alignItems: "center" }}>
        <Pressable onPress={leave}>
          <P>나가기</P>
        </Pressable>
        <P muted>
          {headerTitle} · {sportLabel(match.sportId)} · {period} {formatClock(snap.clockMs)}
        </P>
        <Pressable onPress={() => setMoreOpen(true)}>
          <P>더보기</P>
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: "center", gap: 16 }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <P style={{ fontSize: 28, fontWeight: "800" }}>{formatClock(snap.clockMs)}</P>
          <P muted>
            {period} · 카드 옐로 {snap.yellowHome}-{snap.yellowAway} · 레드 {snap.redHome}-{snap.redAway}
          </P>
          {showFouls ? (
            <P muted>
              누적 파울 {snap.teamFoulsHome}-{snap.teamFoulsAway} · {match.rules.teamFoulPenaltyAt}번째 PK 힌트
            </P>
          ) : null}
          {notice ? (
            <P style={{ marginTop: 4, color: colors.primary, fontWeight: "700", textAlign: "center" }}>{notice}</P>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: stacked ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
          }}
        >
          <PitchSide
            label={match.homeLabel}
            color={homeColor}
            score={snap.homeScore}
            scoreSize={scoreSize}
            yellow={snap.yellowHome}
            red={snap.redHome}
            fouls={showFouls ? snap.teamFoulsHome : undefined}
            disabled={playLocked}
            onGoal={() => addPoint(match.id, "home", 1)}
            onYellow={() => addSanction(match.id, "home", "yellow")}
            onRed={() => addSanction(match.id, "home", "red")}
            onFoul={showFouls ? () => addTeamFoul(match.id, "home") : undefined}
          />
          <PitchSide
            label={match.awayLabel}
            color={awayColor}
            score={snap.awayScore}
            scoreSize={scoreSize}
            yellow={snap.yellowAway}
            red={snap.redAway}
            fouls={showFouls ? snap.teamFoulsAway : undefined}
            disabled={playLocked}
            onGoal={() => addPoint(match.id, "away", 1)}
            onYellow={() => addSanction(match.id, "away", "yellow")}
            onRed={() => addSanction(match.id, "away", "red")}
            onFoul={showFouls ? () => addTeamFoul(match.id, "away") : undefined}
          />
        </View>

        {!snap.started ? <Btn label="경기 시작" onPress={() => startPitch(match.id)} /> : null}
      </View>

      <View style={{ gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Pressable onPress={() => router.push(`/match/${match.id}/timeline`)}>
          <P muted style={{ fontSize: 12 }} numberOfLines={1}>
            최근: {recent.length ? recent.map((event) => eventLine(event, players, match)).join(" · ") : "없음"}
          </P>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Btn label={clockLabel} variant="ghost" style={{ flex: 1 }} disabled={!snap.started || locked} onPress={clockAction} />
          <Btn label="실행 취소" variant="ghost" style={{ flex: 1 }} onPress={() => undo(match.id)} />
        </View>
      </View>

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P style={{ fontSize: 20, fontWeight: "800" }}>{snap.needsOvertimeDecision ? "동점" : "하프 종료"}</P>
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
          </View>
        </View>
      </Modal>

      <Modal visible={match.status === "confirm_match_end"} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P style={{ fontSize: 20, fontWeight: "800" }}>경기 종료</P>
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
          </View>
        </View>
      </Modal>

      <Modal visible={leaveOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P>경기 중 · 나가기</P>
            <P muted>기록은 계속 저장됩니다. 시계는 멈춥니다.</P>
            <Btn
              label="나가기"
              onPress={() => {
                setLeaveOpen(false);
                router.back();
              }}
            />
            <Btn label="계속하기" variant="ghost" onPress={() => setLeaveOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={moreOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 10 }}>
            <P>더보기</P>
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
              label="홈 몰수승"
              variant="ghost"
              onPress={() => {
                forfeit(match.id, "home");
                setMoreOpen(false);
                router.replace(`/match/${match.id}/result`);
              }}
            />
            <Btn
              label="어웨이 몰수승"
              variant="ghost"
              onPress={() => {
                forfeit(match.id, "away");
                setMoreOpen(false);
                router.replace(`/match/${match.id}/result`);
              }}
            />
            <Btn
              label="경기 중단"
              variant="ghost"
              onPress={() => {
                abandon(match.id);
                setMoreOpen(false);
                router.back();
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
            <Btn label="닫기" onPress={() => setMoreOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={rulesOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P>{pitchRulesSummary(match.rules, match.sportId)}</P>
            <P muted>추가시간 자동 없음. 카드는 메모만. 출전 제한은 없습니다.</P>
            <Btn label="닫기" onPress={() => setRulesOpen(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function PitchSide({
  label,
  color,
  score,
  scoreSize,
  yellow,
  red,
  fouls,
  disabled,
  onGoal,
  onYellow,
  onRed,
  onFoul,
}: {
  label: string;
  color: string;
  score: number;
  scoreSize: number;
  yellow: number;
  red: number;
  fouls?: number;
  disabled: boolean;
  onGoal: () => void;
  onYellow: () => void;
  onRed: () => void;
  onFoul?: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 10, minWidth: 160 }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
      <P style={{ fontWeight: "800" }}>{label}</P>
      <P style={{ fontSize: scoreSize, fontWeight: "800", lineHeight: scoreSize + 8 }}>{score}</P>
      <P muted>
        옐로 {yellow} · 레드 {red}
        {fouls !== undefined ? ` · 파울 ${fouls}` : ""}
      </P>
      <Btn label="+1 골" disabled={disabled} onPress={onGoal} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Btn label="경고" variant="ghost" disabled={disabled} onPress={onYellow} />
        <Btn label="레드" variant="ghost" disabled={disabled} onPress={onRed} />
      </View>
      {onFoul ? <Btn label="팀 파울" variant="ghost" disabled={disabled} onPress={onFoul} /> : null}
    </View>
  );
}
