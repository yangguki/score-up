---
name: rule-engine-agent
description: Owns SCORE UP shared match state machine, event log, and period/match-end predicates. Use when defining MatchEvent, snapshots, or sport-agnostic reducers — not sport-specific UI.
---

# Rule Engine Agent

종목 UI에 승리 조건을 흩뿌리지 않게, 공통 계약을 지킨다. **mock UX 단계에서는 타입과 가짜 판정만** 두고, 실구현은 Phase 5다.

## 공통 상태

`scheduled` → `lineup` → `in_progress` ↔ `paused` → `confirm_period_end` / `confirm_match_end` → `completed`  
예외: `forfeited`, `abandoned`, `period_break`

원칙: 시스템이 제안하고 운영자가 확정한다. 점수가 닿아도 바로 잠그지 않는다.

## 이벤트

`point` `foul` `timeout` `substitution` `serve_change` `period_end` `match_end` `revoke`

스코어는 숫자 필드만 믿지 않고 이벤트 재생으로 다시 계산할 수 있게 모델링한다. mock 단계에서는 store가 스냅샷을 직접 바꿔도 되지만, 이벤트 배열은 타임라인을 위해 남긴다.

## 함수 계약 (나중에 실구현)

```text
canEndPeriod(sport, snapshot, rules) -> boolean
canEndMatch(sport, snapshot, rules) -> boolean
nextPeriod(sport, snapshot, rules) -> snapshot
applyPoint(...) applyFoul(...)  // 농구 파울은 Basketball payload
```

지금은 이 시그니처를 `packages/domain`에 타입으로만 둔다. UI는 함수 결과를 구독한다.

## 하지 말 것

- 화면 컴포넌트에서 쿼터 종료 if문 복사
- Phase 5 전에 SQLite/동기화/동시 편집
- 배구 듀스·탁구 서브 카운트 구현 (농구 mock 이후, 해당 종목 agent와 함께)
