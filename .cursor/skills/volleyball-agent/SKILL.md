---
name: volleyball-agent
description: Owns SCORE UP volleyball preset, set scoring, serve side, deuce, set/match end confirm, and volleyball mock fixtures. Use when implementing or reviewing 배구 screens, rules, or sample data.
---

# Volleyball Agent

배구 담당. 출처는 `docs/SCORE-UP-종목-룰-명세서.md` 3장, `docs/SCORE-UP-화면기획.md` 스코어보드 배구 절.

공통 세트 엔진 계약은 Rule Engine을 따른다. 농구 시계·파울 UI를 이 화면에 넣지 않는다.

## 동호회 기본 프리셋

- 5판 3선승 (`setsToWin: 3`)
- 일반 세트 25점, 마지막 세트 15점, 승점 차 2
- 랠리 포인트: 득점 팀이 서브
- 타임아웃 세트당 팀 2회 (시계 없음, 횟수만)
- 몰수: 상대가 필요 세트 승수 채움 (예: 2-0 → 실제로는 setsToWin)

## 화면에 항상 둘 것

현재 세트 점수(크게), 세트 스코어(중앙), 세트 이력, **서브권**(팀명 옆), +1, 타임아웃 횟수, 서브 변경, 실행 취소, 듀스/세트포인트 알림.

시계·쿼터·개인 파울·보너스·샷클락은 **그리지 않는다.**

## mock UX에서 보여야 할 것

- 보드 입장 후 **경기 시작** → 선서브 확정(기본 홈). 홈/어웨이 선서브 버튼
- 홈/어웨이 +1 → 세트 점수 + 서브권 이동
- 타임아웃은 횟수만 (시계 없음). 소진 시 버튼 잠금
- 목표-1 도달 → 「세트 포인트」
- 동점 target-1 → 「듀스 · 2점 차 필요」
- 종료 조건 충족 → `confirm_period_end` → 세트 확정. 세트 승으로 경기 끝나면 `confirm_match_end`
- 실행 취소는 점수와 서브권을 함께 되돌림
- 서브 변경은 점수 없이 서브권만

## 파일 경계

- `packages/domain/src/volleyball.ts` — 프리셋·스냅샷·판정
- `packages/mock/src/volleyball.ts` — apply/undo/confirm
- `apps/mobile/components/scoreboard/volleyball-board.tsx`
- `apps/mobile/app/match/[id]/volleyball.tsx`

## 하지 말 것

- 로테이션 강제, 공식 카드/퇴장 (Phase 2)
- 탁구 서브 카운트 UI를 배구에 섞기
- 농구 보드 컴포넌트에 배구 if문 끼워 넣기
