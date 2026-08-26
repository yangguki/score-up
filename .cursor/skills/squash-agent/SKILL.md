---
name: squash-agent
description: Owns SCORE UP squash preset, rally set scoring, scorer serve, and squash mock fixtures. Use when implementing or reviewing 스쿼시 screens, rules, or sample data.
---

# Squash Agent

스쿼시 담당. 출처는 `docs/SCORE-UP-종목-룰-명세서.md` 스쿼시 절. 랠리 세트 스냅샷은 탁구와 공유한다.

시계·파울·배구 타임아웃/로테이션 UI를 이 화면에 넣지 않는다.

## 동호회 기본 프리셋

- 5판 3선승 (`setsToWin: 3`)
- 세트 11점, 승점 차 2
- 랠리 포인트: **득점자가 서브** (`serveMode: "scorer"`)
- 엔드 교대 알림 없음
- 단식. 몰수: 상대가 필요 세트 승수 채움

## 화면에 항상 둘 것

양쪽 이름, 현재 세트 점수, 세트 스코어, 세트 이력, **서브권**, +1, 서브 변경, 실행 취소, 듀스/세트포인트.

서브 개수 `1/2`는 그리지 않는다. 파울·카드·시계·타임아웃은 그리지 않는다. 렛은 없다.

## 파일 경계

- `packages/domain/src/squash.ts` — 프리셋
- `packages/domain/src/table-tennis.ts` — 공유 스냅샷·판정
- `packages/mock/src/table-tennis.ts` — apply/undo (`isRallySetMatch`)
- `apps/mobile/components/scoreboard/table-tennis-board.tsx`
- `apps/mobile/app/match/[id]/squash.tsx`

## 하지 말 것

- 렛·스트로크 판정 위자드
- 농구 시계·파울, 배구 로테이션을 섞기
- 탁구 2점 서브 카운트를 스쿼시에 그리기
