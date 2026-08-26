---
name: baseball-agent
description: Owns SCORE UP baseball preset, inning halves, outs, run +1, and baseball mock fixtures. Use when implementing or reviewing 야구 screens, rules, or sample data.
---

# Baseball Agent

야구 담당. 이닝·초말·아웃·득점. 볼/스트라이크·주자 진루는 그리지 않는다.

## 동호회 기본

- 7이닝, 연장 가능
- +1 득점
- 아웃 3이면 이닝 종료 확인
- 시계 없음

## 파일

- `packages/domain/src/baseball.ts`
- `packages/mock/src/baseball.ts`
- `apps/mobile/components/scoreboard/baseball-board.tsx`
- `apps/mobile/app/match/[id]/baseball.tsx`
