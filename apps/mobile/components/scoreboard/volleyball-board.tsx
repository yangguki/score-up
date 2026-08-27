import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  isVolleyballMatch,
  volleyballFrontLine,
  volleyballRulesSummary,
  volleyballSetLabel,
  type Side,
} from "@score-up/domain";
import { volleyballNotice } from "@score-up/mock";
import { Btn, P } from "@/components/ui";
import {
  BoardKey,
  ScoreboardHeader,
  ScoreboardScrollBody,
  scoreboardSideGap,
  scoreboardTeamsRow,
} from "@/components/scoreboard/scoreboard-chrome";
import { eventLine } from "@/lib/labels";
import { useScoreboardLayout } from "@/lib/scoreboard-layout";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export function VolleyballScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stacked, compact, scoreSize } = useScoreboardLayout();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === match?.competitionId));
  const addPoint = useAppStore((s) => s.addPoint);
  const addTimeout = useAppStore((s) => s.addTimeout);
  const addSanction = useAppStore((s) => s.addSanction);
  const undo = useAppStore((s) => s.undo);
  const changeServe = useAppStore((s) => s.changeServe);
  const startVolleyball = useAppStore((s) => s.startVolleyball);
  const confirmPeriod = useAppStore((s) => s.confirmPeriod);
  const confirmMatch = useAppStore((s) => s.confirmMatch);
  const forfeit = useAppStore((s) => s.forfeit);
  const abandon = useAppStore((s) => s.abandon);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!match || !isVolleyballMatch(match)) return;
    setNotice(volleyballNotice(match));
  }, [match]);

  if (!match || !isVolleyballMatch(match)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 }}>
        <P>배구 경기를 찾을 수 없습니다.</P>
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
  const timeoutMax = match.rules.timeoutsPerSet;
  const headerTitle = competition?.name ?? match.roundLabel;
  const rotationOn = match.rules.rotationEnabled;
  const sanctions = snap.sanctions ?? [];
  const lastSanction = sanctions[sanctions.length - 1];
  const sanctionLine = lastSanction
    ? `${lastSanction.side === "home" ? match.homeLabel : match.awayLabel} ${lastSanction.level === "red" ? "레드" : "경고"} · 출전 제한 없음`
    : "";
  const historyLine = [
    ...snap.setHistory.map((row) => `${row.home}-${row.away}`),
    match.status === "completed" || match.status === "forfeited" ? null : "진행 중",
  ]
    .filter(Boolean)
    .join(" / ");
  const recent = [...match.events]
    .reverse()
    .filter((event) => !event.revoked && event.type !== "revoke")
    .slice(0, 3);

  const timeoutLeft = (side: Side) => {
    const key = side === "home" ? match.homeTeamId ?? "home" : match.awayTeamId ?? "away";
    return snap.timeoutsLeft[key] ?? 0;
  };

  const leave = () => {
    if (match.status === "in_progress" && snap.started) {
      setLeaveOpen(true);
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScoreboardHeader
        title={`${headerTitle} · ${volleyballSetLabel(snap)}`}
        onLeave={leave}
        onMore={() => setMoreOpen(true)}
      />

      <ScoreboardScrollBody compact={compact}>
        <View style={{ alignItems: "center", gap: compact ? 4 : 6 }}>
          <P muted>
            세트 {snap.setsWonHome} - {snap.setsWonAway}
          </P>
          <P muted style={{ fontSize: 13 }}>
            {historyLine}
          </P>
          {notice ? (
            <P style={{ marginTop: 4, color: colors.primary, fontWeight: "700", textAlign: "center" }}>{notice}</P>
          ) : null}
          {sanctionLine ? <P muted>{sanctionLine}</P> : null}
        </View>

        <View style={scoreboardTeamsRow(stacked)}>
          <SideBlock
            label={match.homeLabel}
            color={homeColor}
            score={snap.homeSetPoints}
            scoreSize={scoreSize}
            serving={snap.serveSide === "home"}
            rotation={rotationOn ? volleyballFrontLine(snap.rotationHome) : undefined}
            compact={compact}
            disabled={playLocked}
            timeoutLeft={timeoutLeft("home")}
            timeoutMax={timeoutMax}
            onPoint={() => addPoint(match.id, "home", 1)}
            onTimeout={() => addTimeout(match.id, "home")}
            onYellow={() => addSanction(match.id, "home", "yellow")}
            onRed={() => addSanction(match.id, "home", "red")}
          />
          <SideBlock
            label={match.awayLabel}
            color={awayColor}
            score={snap.awaySetPoints}
            scoreSize={scoreSize}
            serving={snap.serveSide === "away"}
            rotation={rotationOn ? volleyballFrontLine(snap.rotationAway) : undefined}
            compact={compact}
            disabled={playLocked}
            timeoutLeft={timeoutLeft("away")}
            timeoutMax={timeoutMax}
            onPoint={() => addPoint(match.id, "away", 1)}
            onTimeout={() => addTimeout(match.id, "away")}
            onYellow={() => addSanction(match.id, "away", "yellow")}
            onRed={() => addSanction(match.id, "away", "red")}
          />
        </View>

        {!snap.started ? (
          <View style={{ gap: 10 }}>
            <P muted style={{ textAlign: "center" }}>
              선서브 · 고르지 않으면 홈
            </P>
            <Btn label="홈 선서브로 시작" size="sm" onPress={() => startVolleyball(match.id, "home")} />
            <Btn label="어웨이 선서브로 시작" size="sm" variant="ghost" onPress={() => startVolleyball(match.id, "away")} />
          </View>
        ) : null}
      </ScoreboardScrollBody>

      <View
        style={{
          gap: 10,
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        <Pressable onPress={() => router.push(`/match/${match.id}/timeline`)}>
          <P muted style={{ fontSize: 12 }} numberOfLines={1}>
            최근: {recent.length ? recent.map((event) => eventLine(event, players, match)).join(" · ") : "없음"}
          </P>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Btn
            label="서브 변경"
            variant="ghost"
            size="sm"
            style={{ flex: 1 }}
            disabled={!snap.started || locked}
            onPress={() => changeServe(match.id)}
          />
          <Btn label="실행 취소" variant="ghost" size="sm" style={{ flex: 1 }} onPress={() => undo(match.id)} />
        </View>
      </View>

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P style={{ fontSize: 20, fontWeight: "800" }}>세트 종료</P>
            <P muted>
              {match.homeLabel} {snap.homeSetPoints} - {snap.awaySetPoints} {match.awayLabel}
            </P>
            <P muted>
              이 세트를 {snap.homeSetPoints > snap.awaySetPoints ? match.homeLabel : match.awayLabel} 승으로 확정할까요?
            </P>
            <Btn label="마지막 점수 취소" variant="ghost" onPress={() => undo(match.id)} />
            <Btn label="확정" onPress={() => confirmPeriod(match.id)} />
          </View>
        </View>
      </Modal>

      <Modal visible={match.status === "confirm_match_end"} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P style={{ fontSize: 20, fontWeight: "800" }}>경기 종료</P>
            <P muted>
              {match.homeLabel} {snap.setsWonHome} - {snap.setsWonAway} {match.awayLabel}
            </P>
            <P muted>이 경기를 {snap.setsWonHome > snap.setsWonAway ? match.homeLabel : match.awayLabel} 승으로 확정할까요?</P>
            <Btn label="마지막 점수 취소" variant="ghost" onPress={() => undo(match.id)} />
            <Btn
              label="확정"
              onPress={() => {
                confirmMatch(match.id);
                router.replace(`/match/${match.id}/result`);
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={leaveOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P>경기 중 · 나가기</P>
            <P muted>기록은 계속 저장됩니다.</P>
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
            <Btn
              label="타임라인"
              variant="ghost"
              onPress={() => {
                setMoreOpen(false);
                router.push(`/match/${match.id}/timeline`);
              }}
            />
            <Btn label="닫기" onPress={() => setMoreOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={rulesOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P style={{ fontWeight: "800" }}>룰</P>
            <P muted>{volleyballRulesSummary(match.rules)}</P>
            <Btn label="닫기" onPress={() => setRulesOpen(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SideBlock({
  label,
  color,
  score,
  scoreSize,
  serving,
  rotation,
  compact,
  disabled,
  timeoutLeft,
  timeoutMax,
  onPoint,
  onTimeout,
  onYellow,
  onRed,
}: {
  label: string;
  color: string;
  score: number;
  scoreSize: number;
  serving: boolean;
  rotation?: string;
  compact: boolean;
  disabled: boolean;
  timeoutLeft: number;
  timeoutMax: number;
  onPoint: () => void;
  onTimeout: () => void;
  onYellow: () => void;
  onRed: () => void;
}) {
  const gap = scoreboardSideGap(compact);
  return (
    <View style={{ flex: 1, alignItems: "center", gap, minWidth: compact ? 0 : 140, width: "100%" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
        <P style={{ fontWeight: "800" }}>{label}</P>
        {serving ? <P style={{ color: colors.primary, fontWeight: "800" }}>●서브</P> : null}
      </View>
      {rotation ? <P muted>전열 {rotation}</P> : null}
      <P style={{ fontSize: scoreSize, fontWeight: "900", lineHeight: scoreSize * 1.02 }}>{score}</P>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        <BoardKey label="+1" variant="primary" disabled={disabled} onPress={onPoint} />
        <BoardKey label={`T/O ${timeoutLeft}/${timeoutMax}`} disabled={disabled || timeoutLeft <= 0} onPress={onTimeout} />
        <BoardKey label="경고" disabled={disabled} onPress={onYellow} />
        <BoardKey label="레드" disabled={disabled} onPress={onRed} />
      </View>
    </View>
  );
}
