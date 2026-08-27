import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  baseballHalfLabel,
  baseballRulesSummary,
  isBaseballMatch,
} from "@score-up/domain";
import { baseballNotice } from "@score-up/mock";
import { Btn, P } from "@/components/ui";
import {
  BoardKey,
  ScoreboardHeader,
  ScoreboardScrollBody,
  scoreboardTeamsRow,
} from "@/components/scoreboard/scoreboard-chrome";
import { eventLine } from "@/lib/labels";
import { useScoreboardLayout } from "@/lib/scoreboard-layout";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export function BaseballScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { stacked, compact, scoreSize } = useScoreboardLayout();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === match?.competitionId));
  const addPoint = useAppStore((s) => s.addPoint);
  const addOut = useAppStore((s) => s.addOut);
  const undo = useAppStore((s) => s.undo);
  const startBaseball = useAppStore((s) => s.startBaseball);
  const confirmPeriod = useAppStore((s) => s.confirmPeriod);
  const confirmMatch = useAppStore((s) => s.confirmMatch);
  const forfeit = useAppStore((s) => s.forfeit);
  const abandon = useAppStore((s) => s.abandon);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!match || !isBaseballMatch(match)) return;
    setNotice(baseballNotice(match));
  }, [match]);

  if (!match || !isBaseballMatch(match)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 }}>
        <P>야구 경기를 찾을 수 없습니다.</P>
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
  const batting = snap.half === "top" ? "away" : "home";
  const recent = [...match.events]
    .reverse()
    .filter((event) => !event.revoked && event.type !== "revoke")
    .slice(0, 3);
  const history = snap.inningScores.map((row, i) => `${i + 1}회 ${row.home}-${row.away}`).join(" · ");

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
        title={`${headerTitle} · ${baseballHalfLabel(snap)} · 아웃 ${snap.outs}`}
        onLeave={leave}
        onMore={() => setMoreOpen(true)}
      />

      <ScoreboardScrollBody compact={compact}>
        <View style={{ alignItems: "center", gap: compact ? 4 : 6 }}>
          <P muted>{baseballHalfLabel(snap)}</P>
          <P muted>아웃 {snap.outs} / 3</P>
          {history ? <P muted style={{ textAlign: "center" }}>{history}</P> : null}
          {notice ? (
            <P style={{ marginTop: 4, color: colors.primary, fontWeight: "700", textAlign: "center" }}>{notice}</P>
          ) : null}
        </View>

        <View style={scoreboardTeamsRow(stacked)}>
          <BaseSide
            label={match.homeLabel}
            color={homeColor}
            score={snap.homeScore}
            scoreSize={scoreSize}
            batting={batting === "home"}
            disabled={playLocked}
            onRun={() => addPoint(match.id, "home", 1)}
          />
          <BaseSide
            label={match.awayLabel}
            color={awayColor}
            score={snap.awayScore}
            scoreSize={scoreSize}
            batting={batting === "away"}
            disabled={playLocked}
            onRun={() => addPoint(match.id, "away", 1)}
          />
        </View>

        {!snap.started ? <Btn label="경기 시작" size="sm" onPress={() => startBaseball(match.id)} /> : null}
        {snap.started ? (
          <View style={{ alignItems: "center" }}>
            <BoardKey label="아웃" variant="primary" disabled={playLocked} onPress={() => addOut(match.id)} />
          </View>
        ) : null}
      </ScoreboardScrollBody>

      <View style={{ gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Pressable onPress={() => router.push(`/match/${match.id}/timeline`)}>
          <P muted style={{ fontSize: 12 }} numberOfLines={1}>
            최근: {recent.length ? recent.map((event) => eventLine(event, players, match)).join(" · ") : "없음"}
          </P>
        </Pressable>
        <Btn label="실행 취소" variant="ghost" size="sm" onPress={() => undo(match.id)} />
      </View>

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P style={{ fontSize: 20, fontWeight: "800" }}>이닝 종료</P>
            <P muted>
              {baseballHalfLabel(snap)} · 3아웃
            </P>
            <Btn label="확정" onPress={() => confirmPeriod(match.id)} />
            <Btn label="마지막 아웃 취소" variant="ghost" onPress={() => undo(match.id)} />
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
            <Btn label="닫기" onPress={() => setMoreOpen(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={rulesOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0008", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 20, gap: 12 }}>
            <P>{baseballRulesSummary(match.rules)}</P>
            <P muted>볼/스트라이크·주자 진루는 없습니다. 득점과 아웃만 기록합니다.</P>
            <Btn label="닫기" onPress={() => setRulesOpen(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BaseSide({
  label,
  color,
  score,
  scoreSize,
  batting,
  disabled,
  onRun,
}: {
  label: string;
  color: string;
  score: number;
  scoreSize: number;
  batting: boolean;
  disabled: boolean;
  onRun: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 10, minWidth: 0, width: "100%" }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color }} />
      <P style={{ fontWeight: "800" }}>
        {label}
        {batting ? " · 공격" : ""}
      </P>
      <P style={{ fontSize: scoreSize, fontWeight: "900", lineHeight: scoreSize * 1.02 }}>{score}</P>
      <BoardKey label="+1 득점" variant="primary" disabled={disabled} onPress={onRun} />
    </View>
  );
}
