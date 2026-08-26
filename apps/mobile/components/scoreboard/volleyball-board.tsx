import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  isVolleyballMatch,
  volleyballRulesSummary,
  volleyballSetLabel,
  type Side,
} from "@score-up/domain";
import { volleyballNotice } from "@score-up/mock";
import { Btn, P } from "@/components/ui";
import { eventLine } from "@/lib/labels";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export function VolleyballScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const stacked = width < 820;
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === match?.competitionId));
  const addPoint = useAppStore((s) => s.addPoint);
  const addTimeout = useAppStore((s) => s.addTimeout);
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
  const scoreSize = stacked ? Math.min(120, height * 0.18) : Math.min(180, width * 0.22);
  const homeColor = match.homeColor ?? DEFAULT_HOME_COLOR;
  const awayColor = match.awayColor ?? DEFAULT_AWAY_COLOR;
  const timeoutMax = match.rules.timeoutsPerSet;
  const headerTitle = competition?.name ?? match.roundLabel;
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 12, alignItems: "center" }}>
        <Pressable onPress={leave}>
          <P>나가기</P>
        </Pressable>
        <P muted>
          {headerTitle} · {volleyballSetLabel(snap)}
        </P>
        <Pressable onPress={() => setMoreOpen(true)}>
          <P>더보기</P>
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: "center", gap: 16 }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <P muted>
            세트 {snap.setsWonHome} - {snap.setsWonAway}
          </P>
          <P muted style={{ fontSize: 13 }}>
            {historyLine}
          </P>
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
          <SideBlock
            label={match.homeLabel}
            color={homeColor}
            score={snap.homeSetPoints}
            scoreSize={scoreSize}
            serving={snap.serveSide === "home"}
            disabled={playLocked}
            timeoutLeft={timeoutLeft("home")}
            timeoutMax={timeoutMax}
            onPoint={() => addPoint(match.id, "home", 1)}
            onTimeout={() => addTimeout(match.id, "home")}
          />
          <SideBlock
            label={match.awayLabel}
            color={awayColor}
            score={snap.awaySetPoints}
            scoreSize={scoreSize}
            serving={snap.serveSide === "away"}
            disabled={playLocked}
            timeoutLeft={timeoutLeft("away")}
            timeoutMax={timeoutMax}
            onPoint={() => addPoint(match.id, "away", 1)}
            onTimeout={() => addTimeout(match.id, "away")}
          />
        </View>

        {!snap.started ? (
          <View style={{ gap: 10 }}>
            <P muted style={{ textAlign: "center" }}>
              선서브 · 고르지 않으면 홈
            </P>
            <Btn label="홈 선서브로 시작" onPress={() => startVolleyball(match.id, "home")} />
            <Btn label="어웨이 선서브로 시작" variant="ghost" onPress={() => startVolleyball(match.id, "away")} />
          </View>
        ) : null}
      </View>

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
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Btn
            label="서브 변경"
            variant="ghost"
            style={{ flex: 1 }}
            disabled={!snap.started || locked}
            onPress={() => changeServe(match.id)}
          />
          <Btn label="실행 취소" variant="ghost" style={{ flex: 1 }} onPress={() => undo(match.id)} />
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
  disabled,
  timeoutLeft,
  timeoutMax,
  onPoint,
  onTimeout,
}: {
  label: string;
  color: string;
  score: number;
  scoreSize: number;
  serving: boolean;
  disabled: boolean;
  timeoutLeft: number;
  timeoutMax: number;
  onPoint: () => void;
  onTimeout: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 10, minWidth: 140 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
        <P style={{ fontWeight: "800" }}>{label}</P>
        {serving ? <P style={{ color: colors.primary, fontWeight: "800" }}>●서브</P> : null}
      </View>
      <P style={{ fontSize: scoreSize, fontWeight: "900", lineHeight: scoreSize * 1.05 }}>{score}</P>
      <Btn label="+1" disabled={disabled} onPress={onPoint} style={{ minWidth: 120 }} />
      <Btn
        label={`타임아웃 ${timeoutLeft}/${timeoutMax}`}
        variant="ghost"
        disabled={disabled || timeoutLeft <= 0}
        onPress={onTimeout}
        style={{ minWidth: 120 }}
      />
    </View>
  );
}
