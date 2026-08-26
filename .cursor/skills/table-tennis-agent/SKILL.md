---
name: table-tennis-agent
description: Owns SCORE UP table tennis preset, set scoring, serve count, deuce, end-change hints, and table tennis mock fixtures. Use when implementing or reviewing 탁구 screens, rules, or sample data.
---

# Table Tennis Agent

탁구 담당. 출처는 `docs/SCORE-UP-종목-룰-명세서.md` 4장, `docs/SCORE-UP-화면기획.md` 스코어보드 탁구 절.

공통 세트 엔진 계약은 Rule Engine을 따른다. 농구 시계·파울, 배구 타임아웃/로테이션 UI를 이 화면에 넣지 않는다.

## 동호회 기본 프리셋

- 5판 3선승 (`setsToWin: 3`)
- 세트 11점, 승점 차 2
- 서브 2점마다 교대, 듀스(10-10) 이후 1점마다
- 엔드 교대는 알림만 (세트마다, 결승 세트 5점)
- 단식 1:1. 복식은 Phase 2
- 몰수: 상대가 필요 세트 승수 채움

## 화면에 항상 둘 것

양쪽 선수 이름, 현재 세트 점수(크게), 세트 스코어(중앙), 세트 이력, **서브권 + 이번 서브 개수** (`서브 1/2`), +1, 서브 변경, 실행 취소, 듀스/세트포인트/엔드 교대 알림.

파울·카드·교체·팀 파울·타임아웃·시계는 **그리지 않는다.** 타임아웃 대신 일시정지.

## mock UX에서 보여야 할 것

- 보드 입장 후 **경기 시작** → 선서브 확정(기본 홈)
- 선수A/B +1 → 세트 점수 + 서브 카운트. 2점이면 서브권 이동
- 10-10 → 「듀스 · 교대 서브」, 이후 1점마다 서브 교대
- 목표-1 도달 → 「세트 포인트」
- 종료 조건 충족 → `confirm_period_end` → 세트 확정 후 「엔드 교대」. 세트 승으로 경기 끝나면 `confirm_match_end`
- 결승 세트에서 한 선수 5점 → 「엔드 교대」 알림만
- 실행 취소는 점수와 서브권·카운트를 함께 되돌림
- 서브 변경은 점수 없이 서브권/카운트만

## 파일 경계

- `packages/domain/src/table-tennis.ts` — 프리셋·스냅샷·판정
- `packages/mock/src/table-tennis.ts` — apply/undo/confirm
- `apps/mobile/components/scoreboard/table-tennis-board.tsx`
- `apps/mobile/app/match/[id]/table-tennis.tsx`

## 하지 말 것

- 복식 위치/서브 순서 강제, 렛 이벤트, 경고/카드
- 배구 타임아웃·로테이션을 탁구에 섞기
- 농구/배구 보드 컴포넌트에 탁구 if문 끼워 넣기
