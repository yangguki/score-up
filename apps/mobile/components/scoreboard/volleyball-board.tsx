import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
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
  ArenaActionRow,
  ArenaBoardShell,
  ArenaDialog,
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
import { useAppStore } from "@/store/app-store";
import { colors } from "@/theme/tokens";

export function VolleyballScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const teamPanel = (side: Side) => {
    const serving = snap.serveSide === side;
    const rotation = rotationOn
      ? volleyballFrontLine(side === "home" ? snap.rotationHome : snap.rotationAway)
      : undefined;
    return {
      label: side === "home" ? match.homeLabel : match.awayLabel,
      color: side === "home" ? homeColor : awayColor,
      score: side === "home" ? snap.homeSetPoints : snap.awaySetPoints,
      meta: (
        <>
          {serving ? <ArenaMeta>●서브</ArenaMeta> : null}
          {rotation ? <ArenaMeta>전열 {rotation}</ArenaMeta> : null}
        </>
      ),
    };
  };

  const actionRow = (side: Side) => {
    const left = timeoutLeft(side);
    return (
      <ArenaActionRow side={side}>
        <BoardKey label="+1" variant="primary" disabled={playLocked} onPress={() => addPoint(match.id, side, 1)} />
        <BoardKey
          label={`T/O ${left}/${timeoutMax}`}
          disabled={playLocked || left <= 0}
          onPress={() => addTimeout(match.id, side)}
        />
        <BoardKey label="경고" disabled={playLocked} onPress={() => addSanction(match.id, side, "yellow")} />
        <BoardKey label="레드" disabled={playLocked} onPress={() => addSanction(match.id, side, "red")} />
      </ArenaActionRow>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ArenaBoardShell
        home={teamPanel("home")}
        away={teamPanel("away")}
        centerTitle={`${headerTitle} · ${volleyballSetLabel(snap)}`}
        centerMain={`${snap.setsWonHome} - ${snap.setsWonAway}`}
        centerSub={historyLine}
        notice={[notice, sanctionLine].filter(Boolean).join(" · ") || undefined}
        onLeave={leave}
        onMore={() => setMoreOpen(true)}
        overlay={
          !snap.started ? (
            <View pointerEvents="box-none" style={arenaOverlayBox}>
              <Text style={{ color: "#ffffffcc", fontSize: 14, fontWeight: "700" }}>선서브 · 고르지 않으면 홈</Text>
              <Pressable onPress={() => startVolleyball(match.id, "home")} style={arenaStartBtn}>
                <Text style={{ color: colors.primaryFg, fontSize: 18, fontWeight: "900" }}>홈 선서브로 시작</Text>
              </Pressable>
              <Pressable
                onPress={() => startVolleyball(match.id, "away")}
                style={[arenaStartBtn, { backgroundColor: colors.surface2 }]}
              >
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "800" }}>어웨이 선서브로 시작</Text>
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
            <ArenaRecent
              text={recent.length ? recent.map((event) => eventLine(event, players, match)).join(" · ") : ""}
              onPress={() => router.push(`/match/${match.id}/timeline`)}
            />
            <ArenaDockRow>
              <Pressable
                onPress={() => changeServe(match.id)}
                disabled={!snap.started || locked}
                style={[arenaBottomGhost, !snap.started || locked ? { opacity: 0.35 } : null]}
              >
                <Text style={arenaBottomGhostText}>서브 변경</Text>
              </Pressable>
              <Pressable onPress={() => undo(match.id)} style={arenaBottomGhost}>
                <Text style={arenaBottomGhostText}>실행 취소</Text>
              </Pressable>
            </ArenaDockRow>
          </>
        }
      />

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>세트 종료</Text>
          <P muted>
            {match.homeLabel} {snap.homeSetPoints} - {snap.awaySetPoints} {match.awayLabel}
          </P>
          <P muted>
            이 세트를 {snap.homeSetPoints > snap.awaySetPoints ? match.homeLabel : match.awayLabel} 승으로 확정할까요?
          </P>
          <Btn label="마지막 점수 취소" variant="ghost" onPress={() => undo(match.id)} />
          <Btn label="확정" onPress={() => confirmPeriod(match.id)} />
        </ArenaDialog>
      </Modal>

      <Modal visible={match.status === "confirm_match_end"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>경기 종료</Text>
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
        </ArenaDialog>
      </Modal>

      <Modal visible={leaveOpen} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>경기 중 · 나가기</Text>
          <P muted>기록은 계속 저장됩니다.</P>
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
          <P muted>{volleyballRulesSummary(match.rules)}</P>
          <Btn label="닫기" onPress={() => setRulesOpen(false)} />
        </ArenaDialog>
      </Modal>
    </View>
  );
}
