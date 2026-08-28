import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, Text, View } from "react-native";
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

export function BaseballScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const teamPanel = (side: "home" | "away") => ({
    label: side === "home" ? match.homeLabel : match.awayLabel,
    color: side === "home" ? homeColor : awayColor,
    score: side === "home" ? snap.homeScore : snap.awayScore,
    meta: batting === side ? <ArenaMeta>공격</ArenaMeta> : null,
  });

  const actionRow = (side: "home" | "away") => (
    <ArenaActionRow side={side}>
      <BoardKey label="+1 득점" variant="primary" disabled={playLocked} onPress={() => addPoint(match.id, side, 1)} />
    </ArenaActionRow>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ArenaBoardShell
        home={teamPanel("home")}
        away={teamPanel("away")}
        centerTitle={headerTitle}
        centerMain={baseballHalfLabel(snap)}
        centerSub={`아웃 ${snap.outs} / 3${history ? ` · ${history}` : ""}`}
        notice={[!snap.started ? "시작 전" : null, notice].filter(Boolean).join(" · ") || undefined}
        onLeave={leave}
        onMore={() => setMoreOpen(true)}
        overlay={
          !snap.started ? (
            <View pointerEvents="box-none" style={arenaOverlayBox}>
              <Pressable onPress={() => startBaseball(match.id)} style={arenaStartBtn}>
                <Text style={{ color: colors.primaryFg, fontSize: 22, fontWeight: "900" }}>경기 시작</Text>
              </Pressable>
            </View>
          ) : null
        }
        dock={
          <>
            <ArenaDockRow>
              {actionRow("home")}
              <BoardKey label="아웃" variant="primary" disabled={playLocked} onPress={() => addOut(match.id)} />
              {actionRow("away")}
            </ArenaDockRow>
            <ArenaRecent
              text={recent.length ? recent.map((event) => eventLine(event, players, match)).join(" · ") : ""}
              onPress={() => router.push(`/match/${match.id}/timeline`)}
            />
            <ArenaDockRow>
              <Pressable onPress={() => undo(match.id)} style={arenaBottomGhost}>
                <Text style={arenaBottomGhostText}>실행 취소</Text>
              </Pressable>
            </ArenaDockRow>
          </>
        }
      />

      <Modal visible={match.status === "confirm_period_end"} transparent animationType="fade">
        <ArenaDialog>
          <Text style={arenaDialogTitle}>이닝 종료</Text>
          <P muted>
            {baseballHalfLabel(snap)} · 3아웃
          </P>
          <Btn label="확정" onPress={() => confirmPeriod(match.id)} />
          <Btn label="마지막 아웃 취소" variant="ghost" onPress={() => undo(match.id)} />
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
          <P>{baseballRulesSummary(match.rules)}</P>
          <P muted>볼/스트라이크·주자 진루는 없습니다. 득점과 아웃만 기록합니다.</P>
          <Btn label="닫기" onPress={() => setRulesOpen(false)} />
        </ArenaDialog>
      </Modal>
    </View>
  );
}
