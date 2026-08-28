# SCORE UP

종목별 스코어·룰·선수·대진을 한 흐름으로 운영하는 경기 앱. 지금은 **홈 8종목 mock**(대회·친선·가로 전용 스코어보드), **이 기기 로그인**, **농구·배드민턴 모임 1차**가 동작합니다. 제품 홈은 **H1 Arena**(대회 만들기 Primary). H8 Lift · H9 Play는 비교 시안입니다. 서버 계정·API는 없습니다.

패키지 매니저는 **pnpm**입니다. 루트에서 설치·실행합니다.

## 실행

```bash
pnpm install
pnpm web
```

같은 코드가 앱(Expo)과 웹에서 돌아갑니다. `pnpm start` 후 기기/시뮬레이터도 가능합니다.

팀 공유는 최소 비용이 원칙입니다. PC가 켜져 있으면 `cloudflared tunnel`($0). PC가 꺼져 있어도 URL이 필요하면 `pnpm export:web` 후 S3에 `apps/mobile/dist`만 올립니다. `main`을 `origin-hub`(GitHub)에 push하면 Actions가 S3를 갱신합니다. Amplify·EC2·GitLab Runner는 쓰지 않습니다. 절차: `docs/SCORE-UP-팀공유-S3-미리보기.md`.

## 구조

- `apps/mobile` — Expo Router 화면
- `packages/domain` — 타입, 종목 프리셋
- `packages/mock` — 시드 데이터와 in-memory 동작
- `docs` — 기획·룰·화면·작업 계획
- `.cursor/skills` — Manager / Planner / Basketball / Volleyball / Table Tennis / Frontend UX / Rule Engine / Infra
