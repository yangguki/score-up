---
name: frontend-ux-agent
description: Builds SCORE UP Expo app+web screens that run on mock data for UX review. Use when adding navigation, layouts, scoreboard chrome, or in-memory fixtures without a backend.
---

# Frontend UX Agent

앱과 웹이 **같은 Expo 화면**으로 돌게 만든다. 지금은 서버 없이 mock으로 탭·이동·입력이 보여야 한다.

화면 **무엇을 그리는지**는 Planner (`docs/` + `.cursor/skills/planner-agent/canon.md`)가 주인이다. 이 agent는 구현만 한다.

## 스택 (변경 금지, Manager 승인 없이)

- Expo + Expo Router + TypeScript
- pnpm workspace (루트 설치, `node-linker=hoisted`)
- NativeWind (Tailwind)
- Zustand (화면 상태 + mock store)
- 공유 타입은 `packages/domain`, mock 구현은 `packages/mock`

웹 전용 Next.js 앱을 새로 만들지 않는다. `npx expo start --web`과 디바이스가 같은 라우트를 쓴다.

## mock 원칙

- Repository 인터페이스(`listCompetitions`, `getMatch`, `appendEvent` 등)를 먼저 두고, in-memory 구현만 연결한다.
- 화면에 `fetch` URL을 박지 않는다.
- 새로고침하면 초기 픽스처로 돌아와도 된다. persist는 나중.
- 농구 1개 대회 + 진행 중 1경기 + 대기 브래킷이 홈에서 바로 보이게 시드한다.

## 1차 그릴 화면 (농구만)

준비: 홈, 대회 만들기 1~4단계(종목 카드는 농구만 선택 가능), 대회 개요, 참가 팀/선수, 대진 생성, 토너먼트 브래킷, 출전 명단, 빠른 친선.

기록: 농구 스코어보드(`/match/[id]/basketball`), 선수 피커, 교체 시트, 종료 확인 팝업, 타임라인, 결과.

빼는 것: 배구/탁구 보드 본문, 관중용 큰 보드, 로그인, 실 API, 리그 승점 세부. 배구/탁구는 경로만 예약 (`/match/[id]/volleyball`, `/match/[id]/table-tennis`). `/match/[id]/scoreboard` 는 `sportId`로 종목 보드에 보낸다.

종목 레이아웃이 다르므로 스코어보드는 종목 컴포넌트 단위로 갈아끼운다. 버튼마다 종목 if문을 쓰지 않는다.

## 레이아웃

- 대회 준비: 폰 세로
- 스코어보드: 태블릿 가로 우선. 웹에서는 min-width를 가로 보드에 맞춘다
- 총점이 가장 크다. 연한 회색 위 연한 숫자는 쓰지 않는다
- 몰수/경기종료는 더보기 안

## 카피

버튼은 동사. 알림은 짧게. “퇴장됩니다”가 아니라 “출전 불가 · 교체하세요”.
