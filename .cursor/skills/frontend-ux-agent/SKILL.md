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
- 대회·경기·모임·이벤트는 Zustand persist로 이 기기에 남긴다. 네이티브는 expo-sqlite KV, 웹은 localStorage. 실 API·Cognito는 없다. 로그인은 이 기기 이름.
- 설정 `시드 데이터로 되돌리기`로만 초기 픽스처로 돌아간다.
- 결과·대진은 **텍스트 복사**. 실시간 조회 링크·이미지 공유는 그리지 않는다.
- 농구 1개 대회 + 진행 중 1경기 + 대기 브래킷이 홈에서 바로 보이게 시드한다.

## 1차 그릴 화면 (농구만)

준비: 홈, 대회 만들기 1~4단계(홈 8종목), 대회 개요, 참가 팀/선수, 대진 생성, 토너먼트 브래킷, 리그 순위, 출전 명단, 빠른 친선, 이 기기 로그인, 모임·회차·참석 투표(농구·배드민턴 1차).

기록: 농구 스코어보드(`/match/[id]/basketball`), 배구 mock 보드(`/match/[id]/volleyball`), 탁구 mock 보드(`/match/[id]/table-tennis`), 배드민턴(`/match/[id]/badminton`), 스쿼시(`/match/[id]/squash`), 축구(`/match/[id]/soccer`), 풋살(`/match/[id]/futsal`), 야구(`/match/[id]/baseball`), 선수 피커, 교체 시트, 종료 확인 팝업, 타임라인, 결과.

빼는 것: 관중용 큰 보드, 실 API/Cognito, 배구 세트 승점제, 3x3. 리그 MVP는 승3/패0 순위표. `/match/[id]/scoreboard` 는 `sportId`로 종목 보드에 보낸다. 홈은 **H1 · 대회 만들기 Primary(A 잠금)**. 모임 매칭은 5v5·인원 미달 시 4v4(운영자 확정). 월 정기는 매달 N번째 요일 또는 D일(1~28). 급수 시즌은 초급/중급/상급·도전·결과 넣기. 배드민턴 모임 1차는 한 판 열기(단식/복식). 농구 1v1 보드·사진 업로드·ELO 없음. 설정 A/B/C 시안 전환 없음.

종목 레이아웃이 다르므로 스코어보드는 종목 컴포넌트 단위로 갈아끼운다. 버튼마다 종목 if문을 쓰지 않는다.

## 레이아웃

- 대회 준비: 폰 세로
- 스코어보드: 태블릿 가로 우선. 웹에서는 min-width를 가로 보드에 맞춘다
- 총점이 가장 크다. 액션은 BoardKey/sm. 연한 회색 위 연한 숫자는 쓰지 않는다
- 몰수/경기종료는 더보기 안

## 카피

버튼은 동사. 알림은 짧게. “퇴장됩니다”가 아니라 “출전 불가 · 교체하세요”.
