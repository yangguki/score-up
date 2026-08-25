# SCORE UP — Agent 운영

이 저장소의 기본 에이전트는 **Manager**다. 직접 화면/룰을 짜기 전에 요청을 분류하고, 담당 sub agent에 분배한다.

기준 문서: `docs/SCORE-UP-기획서.md`, `docs/SCORE-UP-종목-룰-명세서.md`, `docs/SCORE-UP-화면기획.md`, `docs/SCORE-UP-작업계획.md`

기획 학습 요약: `.cursor/skills/planner-agent/canon.md`

## 역할

| Agent | 담당 | 지금 상태 |
| --- | --- | --- |
| Manager | 범위 확정, 분배, 새 agent 생성, 기술/일정 결정 | 활성 |
| Planner | 제품 정의, IA, 화면 명세, 카피, MVP 범위, `docs/` 정합. 코드는 안 짬 | 활성 |
| Basketball | 농구 룰, 스코어보드, 파울, 타이머, 농구 mock | 활성 (1차 종목) |
| Frontend UX | 앱+웹 화면, 네비게이션, mock 데이터로 동작하는 UI | 활성 |
| Rule Engine | 종목 공통 상태/이벤트/종료 판정. UI에 if문 흩뿌리지 않기 | 활성 (설계만, 구현은 mock 이후) |
| Infra | 팀 공유용 정적 미리보기. 기본 S3(최소 비용). API·DB·Amplify Git 빌드 아님 | 활성 (개발·테스트 공유) |
| Volleyball / Table Tennis | 배구·탁구 | **아직 만들지 않음.** 농구 mock UX가 끝난 뒤 Manager가 생성 |

## 분배 규칙

1. 요청을 한 문장으로 재진술하고, 담당 agent를 고른다.
2. 무엇을/왜/이번 Phase에 넣을지, 화면 카피·IA·기획 문서 → **Planner**. 그린 화면이 명세와 같은지 기획 검수도 Planner.
3. 종목 작업이면 해당 종목 skill을 읽고 Task로 넘긴다. 농구가 아니면 새 종목 agent가 있는지 먼저 확인한다.
4. 화면만 필요한 이번 단계는 **Planner가 명세를 고정하고, Frontend UX가 껍데기를 만들고, Basketball이 농구 화면의 버튼·상태·카피를 검수**한다.
5. 백엔드·실룰 엔진·다른 종목은 작업계획 Phase 5 이전에는 구현하지 않는다. AWS는 **S3 정적 미리보기**만 허용한다 (API/RDS/Cognito/Amplify Git 빌드/월정액 컴퓨트 금지).
6. 필요한 agent가 없으면 Manager가 `.cursor/skills/`에 템플릿으로 만든 뒤 그 agent에게 일을 준다.

## 현재 제품 제약 (어기면 안 됨)

- 앱과 웹을 **한 코드베이스**로 만든다. 스택은 Expo (React Native) + Expo Router + TypeScript.
- 패키지 매니저는 **pnpm**이다. 루트 workspace + `node-linker=hoisted`. `npm install` / `yarn`을 쓰지 않는다.
- UX 확인이 목적이다. **mock 데이터로 프론트가 먼저 동작**해야 한다.
- **1차 종목은 농구만.** 배구/탁구 화면·프리셋을 그리지 않는다. 보드 경로는 `/match/[id]/volleyball` 등으로 자리만 둔다.
- 종목에 없는 UI는 그리지 않는다. 농구에는 쿼터·시계·파울이 있고 서브권은 없다.
- 스코어보드는 종목 경로로 분기한다. `/match/[id]/scoreboard` 는 `sportId`로 종목 보드에 보낸다.
