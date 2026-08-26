---
name: soccer-agent
description: Owns SCORE UP soccer preset, half timer, goal +1, yellow/red cards, and soccer mock fixtures. Use when implementing or reviewing 축구 screens, rules, or sample data.
---

# Soccer Agent

축구 담당. 전후반 시계 + 골 + 카드. 농구 파울/쿼터 UI를 섞지 않는다.

## 동호회 기본

- 20분 × 2
- +1 골
- 옐로/레드 팀 메모. 출전 제한 자동화 없음
- 연장 기본 꺼짐
- 오프사이드·VAR·PK 위자드 없음

## 파일

- `packages/domain/src/pitch.ts`
- `packages/mock/src/pitch.ts`
- `apps/mobile/components/scoreboard/pitch-board.tsx`
- `apps/mobile/app/match/[id]/soccer.tsx`
