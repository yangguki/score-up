import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import {
  BADMINTON_SET_TARGET_MAX,
  BADMINTON_SET_TARGET_MIN,
  BADMINTON_SET_TARGET_PRESETS,
  BADMINTON_SETS_TO_WIN_MAX,
  BADMINTON_SETS_TO_WIN_MIN,
  BADMINTON_SETS_TO_WIN_PRESETS,
  badmintonSetsLabel,
  DEFAULT_AWAY_COLOR,
  DEFAULT_HOME_COLOR,
  isRallySetMatch,
  tableTennisRulesSummary,
  tableTennisServeLimit,
  tableTennisSetLabel,
  type TableTennisRules,
} from "@score-up/domain";
import { tableTennisNotice } from "@score-up/mock";
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

export function TableTennisScoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const match = useAppStore((s) => s.matches.find((m) => m.id === id));
  const players = useAppStore((s) => s.players);
  const competition = useAppStore((s) => s.competitions.find((c) => c.id === match?.competitionId));
  const addPoint = useAppStore((s) => s.addPoint);
  const undo = useAppStore((s) => s.undo);
  const changeServe = useAppStore((s) => s.changeServe);
  const startTableTennis = useAppStore((s) => s.startTableTennis);
  const updateRallyRules = useAppStore((s) => s.updateRallyRules);
  const pause = useAppStore((s) => s.pause);
  const resume = useAppStore((s) => s.resume);
  const confirmPeriod = useAppStore((s) => s.confirmPeriod);
  const confirmMatch = useAppStore((s) => s.confirmMatch);
  const forfeit = useAppStore((s) => s.forfeit);
  const abandon = useAppStore((s) => s.abandon);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rulesEditOpen, setRulesEditOpen] = useState(false);
  const [editRules, setEditRules] = useState<TableTennisRules | null>(null);
  const [rulesError, setRulesError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!match || !isRallySetMatch(match)) return;
    setNotice(tableTennisNotice(match));
  }, [match]);

  if (!match || !isRallySetMatch(match)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", padding: 24 }}>
        <P>세트 경기를 찾을 수 없습니다.</P>
      </View>
    );
  }

  const snap = match.snapshot;
  const locked =
    match.status === "confirm_period_end" ||
    match.status === "confirm_match_end" ||
    match.status === "completed" ||
    match.status === "forfeited";
  const playLocked = locked || !snap.started || match.status === "paused";
  const homeColor = match.homeColor ?? DEFAULT_HOME_COLOR;
  const awayColor = match.awayColor ?? DEFAULT_AWAY_COLOR;
  const headerTitle = competition?.name ?? match.roundLabel;
  const serveLimit = tableTennisServeLimit(snap, match.rules);
  const showServeCount = match.rules.serveMode !== "scorer";
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

  const leave = () => {
    if ((match.status === "in_progress" || match.status === "paused") && snap.started) {
      setLeaveOpen(true);
      return;
    }
    router.back();
  };

  const serveMeta = (side: "home" | "away") => {
    if (snap.serveSide !== side) return null;
    const count = showServeCount ? ` ${snap.serveCount}/${serveLimit}` : "";
    return <ArenaMeta>●서브{count}</ArenaMeta>;
  };

  const isBadminton = match.sportId === "badminton";
  const tapEnabled = isBadminton && snap.started && !playLocked;

  const teamPanel = (side: "home" | "away") => ({
    label: side === "home" ? match.homeLabel : match.awayLabel,
    color: side === "home" ? homeColor : awayColor,
    score: side === "home" ? snap.homeSetPoints : snap.awaySetPoints,
    meta: serveMeta(side),
    onTap: isBadminton ? () => addPoint(match.id, side, 1) : undefined,
    tapDisabled: !tapEnabled,
  });

  const actionRow = (side: "home" | "away") => (
    <ArenaActionRow side={side}>
      <BoardKey label="+1" variant="primary" disabled={playLocked} onPress={() => addPoint(match.id, side, 1)} />
    </ArenaActionRow>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ArenaBoardShell
        home={teamPanel("home")}
        away={teamPanel("away")}
        centerTitle={`${headerTitle} · ${sportLabel(match.sportId)} · ${tableTennisSetLabel(snap)}${match.rules.doubles ? " · 복식" : ""}`}
        centerMain={`${snap.setsWonHome} - ${snap.setsWonAway}`}
        centerSub={historyLine}
        notice={notice || undefined}
        onLeave={leave}
        onMore={() => setMoreOpen(true)}
        overlay={
          !snap.started ? (
            <View pointerEvents="box-none" style={arenaOverlayBox}>
              {isBadminton && (
                <View style={{ backgroundColor: "#ffffff11", borderRadius: 10, padding: 12, marginBottom: 8, maxWidth: 280 }}>
                  <Text style={{ color: "#ffffffcc", fontSize: 12, fontWeight: "600", textAlign: "center" }}>
                    {tableTennisRulesSummary(match.rules)}
                  </Text>
                  <Pressable
                    onPress={() => {
                      setEditRules(match.rules);
                      setRulesError("");
                      setRulesEditOpen(true);
                    }}
                    style={{ marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#ffffff22", borderRadius: 6, alignSelf: "center" }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>룰 변경</Text>
                  </Pressable>
                </View>
              )}
              <Text style={{ color: "#ffffffcc", fontSize: 14, fontWeight: "700" }}>선서브 · 고르지 않으면 홈</Text>
              <Pressable onPress={() => startTableTennis(match.id, "home")} style={arenaStartBtn}>
                <Text style={{ color: colors.primaryFg, fontSize: 16, fontWeight: "800" }}>홈 선서브로 시작</Text>
              </Pressable>
              <Pressable
                onPress={() => startTableTennis(match.id, "away")}
                style={[arenaStartBtn, { backgroundColor: colors.surface2 }]}
              >
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "800" }}>어웨이 선서브로 시작</Text>
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
              <Pressable
                onPress={() => (match.status === "paused" ? resume(match.id) : pause(match.id))}
                disabled={!snap.started || locked}
                style={[arenaBottomGhost, !snap.started || locked ? { opacity: 0.35 } : null]}
              >
                <Text style={arenaBottomGhostText}>{match.status === "paused" ? "재개" : "일시정지"}</Text>
              </Pressable>
              {isBadminton && match.status === "paused" && (
                <Pressable
                  onPress={() => {
                    setEditRules(match.rules);
                    setRulesError("");
                    setRulesEditOpen(true);
                  }}
                  style={arenaBottomGhost}
                >
                  <Text style={arenaBottomGhostText}>룰 변경</Text>
                </Pressable>
              )}
            </ArenaDockFooter>
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
          <P muted>{tableTennisRulesSummary(match.rules)}</P>
          <Btn label="닫기" onPress={() => setRulesOpen(false)} />
        </ArenaDialog>
      </Modal>

      <Modal visible={rulesEditOpen && editRules != null} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "#0009", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 12, maxHeight: "80%" }}>
            <Text style={arenaDialogTitle}>룰 변경</Text>
            <ScrollView style={{ flexGrow: 0 }}>
              {editRules && (
                <View style={{ gap: 12 }}>
                  <View>
                    <P style={{ fontWeight: "700", marginBottom: 8 }}>판수</P>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {BADMINTON_SETS_TO_WIN_PRESETS.map((v) => (
                        <Pressable
                          key={v}
                          onPress={() => setEditRules({ ...editRules, setsToWin: v })}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 8,
                            backgroundColor: editRules.setsToWin === v ? colors.primary : colors.surface2,
                          }}
                        >
                          <Text
                            style={{
                              color: editRules.setsToWin === v ? colors.primaryFg : colors.text,
                              fontWeight: "700",
                              fontSize: 14,
                            }}
                          >
                            {badmintonSetsLabel(v)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <P muted style={{ fontSize: 11, marginTop: 4 }}>
                      직접 입력: {BADMINTON_SETS_TO_WIN_MIN}~{BADMINTON_SETS_TO_WIN_MAX}판 선승
                    </P>
                  </View>
                  <View>
                    <P style={{ fontWeight: "700", marginBottom: 8 }}>목표 점수</P>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {BADMINTON_SET_TARGET_PRESETS.map((v) => (
                        <Pressable
                          key={v}
                          onPress={() => setEditRules({ ...editRules, setTarget: v })}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 8,
                            backgroundColor: editRules.setTarget === v ? colors.primary : colors.surface2,
                          }}
                        >
                          <Text
                            style={{
                              color: editRules.setTarget === v ? colors.primaryFg : colors.text,
                              fontWeight: "700",
                              fontSize: 14,
                            }}
                          >
                            {v}점
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <P muted style={{ fontSize: 11, marginTop: 4 }}>
                      직접 입력: {BADMINTON_SET_TARGET_MIN}~{BADMINTON_SET_TARGET_MAX}점
                    </P>
                  </View>
                  <View>
                    <P style={{ fontWeight: "700", marginBottom: 8 }}>승점 차</P>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {[1, 2].map((v) => (
                        <Pressable
                          key={v}
                          onPress={() => setEditRules({ ...editRules, winBy: v })}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 14,
                            borderRadius: 8,
                            backgroundColor: editRules.winBy === v ? colors.primary : colors.surface2,
                          }}
                        >
                          <Text
                            style={{
                              color: editRules.winBy === v ? colors.primaryFg : colors.text,
                              fontWeight: "700",
                              fontSize: 14,
                            }}
                          >
                            {v}점
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            {rulesError ? <P style={{ color: colors.danger, fontSize: 12 }}>{rulesError}</P> : null}
            <P muted style={{ fontSize: 12 }}>{editRules ? tableTennisRulesSummary(editRules) : ""}</P>
            <Btn
              label="취소"
              variant="ghost"
              onPress={() => {
                setRulesEditOpen(false);
                setEditRules(null);
              }}
            />
            <Btn
              label="적용"
              onPress={() => {
                if (!editRules) return;
                const result = updateRallyRules(match.id, editRules);
                if (result.ok) {
                  setRulesEditOpen(false);
                  setEditRules(null);
                  setRulesError("");
                } else {
                  setRulesError(result.reason ?? "룰을 변경할 수 없습니다.");
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
