# SCORE UP 작업 계획

| 항목 | 내용 |
| --- | --- |
| 문서명 | 작업 계획 |
| 버전 | v0.2 |
| 작성일 | 2026-08-20 |
| 수정일 | 2026-08-26 |
| 상태 | Phase 6 3종목 + 이 기기 로그인·농구 모임 mock. 실시간 링크는 API 후 |
| 목적 | Manager + 종목 agent 운영, 앱/웹 기술 조합, 농구 1종목 mock 프론트까지의 순서를 고정한다 |

기준: 기획서 v0.3, 종목 룰 명세서 v0.2, 화면 기획 v0.3, 모임 기획 v0.3

---

## 1. 이번에 정한 것

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| 플랫폼 | 앱 + 웹, **단일 코드베이스** | 현장 기록(앱/태블릿)과 UX 검수(웹)를 같은 화면으로 본다 |
| 1차 종목 | **농구만** | 시간제+파울이라 엔진/UX 검증 밀도가 가장 높다. 기획서 권장 순서와 같다 |
| 구현 순서 | **mock 프론트 → 룰 엔진 → 다른 종목** | 운영 흐름이 손에 잡혀야 버튼·상태 전이 스펙이 검증된다 |
| 계정/백엔드 | 이번 단계 없음 | 로그인·API는 mock 화면 검수 후 |
| Agent | Manager가 분배. 기획은 Planner. 종목 agent는 농구만 생성. 배구/탁구는 이후 Manager가 생성 | 없는 agent를 미리 많이 두면 지시가 흩어진다 |
| 스코어보드 라우트 | `/match/[id]/basketball` 등 종목 경로. `/scoreboard`는 `sportId`로 보냄 | 종목 레이아웃이 다름. 보드 컴포넌트 단위로 분리하고 버튼 if문을 흩뿌리지 않음 |
| 농구 시계 | 보드 입장 시 정지. **경기 시작**을 눌러야 흐름 | 출전 확정과 쿼터 시계 시작을 나눔 |
| 작전타임 | T/O 시 전용 카운트다운. 시간(초)은 대회/친선 룰에서 설정 | 횟수만 줄이고 멈추면 남은 작전 시간이 안 보임 |
| 쿼터 설정 | 최소 2쿼터, 최대 4. 쿼터 분은 4/6/8/10/12 | 동호회 전후반(2Q)과 4Q를 같은 보드에서 받음 |
| 패키지 매니저 | **pnpm** workspace. Expo는 hoist | 모노레포 패키지를 경로 해킹이 아니라 workspace로 묶는다. Metro는 기본 pnpm 심볼릭 링크를 잘 못 따라가서 hoist |

---

## 2. 기술 조합 (권장)

### 2.1 채택

| 층 | 선택 |
| --- | --- |
| 패키지 매니저 | **pnpm** workspace (`node-linker=hoisted`) |
| 클라이언트 | **Expo (React Native) + Expo Router + TypeScript** |
| 웹 | 같은 앱을 `expo start --web`으로 실행 (React Native Web) |
| 스타일 | NativeWind (Tailwind). 총점·버튼 크기를 토큰으로 고정 |
| 화면 상태 | Zustand |
| 도메인 타입 | `packages/domain` (React 없음, 순수 TS) |
| mock | `packages/mock` — repository 인터페이스의 in-memory 구현 |
| 오프라인 (지금) | Zustand persist. 네이티브 `expo-sqlite` KV, 웹 `localStorage`. `Match.events`가 이벤트 로그. 별도 events 테이블·동기화는 계정 때 |
| 나중에 API | 도메인 이벤트를 받는 얇은 백엔드 (Hono 또는 Nest). 지금은 없음 |

앱과 웹을 처음부터 따로 만들면 스코어보드가 두 벌이 된다. SCORE UP의 핵심 화면은 태블릿 가로 기록 UI라, **Expo 한 벌이 가장 적은 중복**이다.

### 2.2 비교 후 버린 것

| 후보 | 왜 지금 아닌가 |
| --- | --- |
| Flutter | 태블릿 UI는 강하지만 웹이 보조 취급이고, 이 레포/에이전트 작업은 TS가 맞다 |
| Next.js + RN 분리 | 웹 검수는 빨라질 수 있으나 스코어보드·대진을 두 번 짠다 |
| Ionic / Capacitor | 웹 우선이라 현장 큰 버튼·제스처에서 네이티브보다 불리 |
| 지금 당장 Nest+DB | UX 확인 전에 스키마를 굳히면 화면 변경 비용이 커진다 |

### 2.3 목표 디렉터리

```text
apps/mobile/          Expo 앱 (ios / android / web)
packages/domain/      SportPreset, Match, MatchEvent, 판정 함수 타입
packages/mock/        시드 데이터 + in-memory repo
.cursor/skills/       Manager, Planner, Basketball, Frontend UX, Rule Engine, Infra
docs/                 기획·룰·화면·이 계획
```

---

## 3. Agent 운영

```text
사용자 요청
    → Manager (분류, 범위, 새 agent 생성)
         ├─ Planner         제품 정의, IA, 화면 명세, 카피, MVP 범위, docs 정합
         ├─ Frontend UX     화면 구현, 라우팅, mock 동작
         ├─ Basketball      농구 버튼·파울·타이머·카피
         ├─ Rule Engine     공통 상태/이벤트 계약 (실구현은 Phase 5)
         ├─ Infra           팀 공유 미리보기 (S3 + GitHub Actions, 최소 비용)
         └─ Volleyball / Table Tennis  종목 mock 보드
```

- 스킬 위치: `.cursor/skills/` (기획 학습: `planner-agent/canon.md`)
- 분배 규칙: `AGENTS.md`
- 새 종목 agent 템플릿: `.cursor/skills/score-up-manager/sport-agent-template.md`

Manager는 배구·탁구 작업 요청이 와도 **농구 mock UX가 끝나기 전에는 화면을 그리지 않고**, 필요 시점에 skill만 만든다.

---

## 4. 페이즈

### Phase 0 — 운영 골격

- [x] Manager / Planner / Basketball / Frontend UX / Rule Engine skill
- [x] `AGENTS.md`, always-on Manager rule
- [x] 이 작업 계획
- [x] Expo 워크스페이스 스캐폴드

### Phase 1 — 앱 껍데기 (앱+웹이 같은 엔트리)

- Expo 앱 생성, 모노레포(`apps/mobile`, `packages/*`)
- 탭: 홈 / 대회 / 설정
- 디자인 토큰: 총점 크기, 대비, 가로 보드 최소 폭
- 웹·안드로이드·iOS 중 웹으로 먼저 띄워 UX 리뷰

### Phase 2 — mock 데이터 + 내비게이션

- 농구 토너먼트 시드 1개 (8강 느낌, 팀 4~8, 선수 등번호)
- 진행 중 경기 1, 대기 경기 여러 개
- repository 인터페이스만 두고 화면은 mock 구현 호출
- 홈 → 대회 개요 → 대진 → 출전 → `/match/[id]/basketball` → 결과 이동

### Phase 3 — 농구 화면 (이번 제품의 첫 수직 슬라이스)

화면 기획 MVP 체크 중 **농구 경로만**. 상세는 5장.

완료 조건: 브라우저에서 대회를 만들고(또는 시드 대회를 열고) 득점·파울·실행취소·쿼터 종료 팝업까지 손가락으로 따라갈 수 있다. 값은 mock store만 바뀌면 된다.

### Phase 4 — UX 검수 후 수정

- 태블릿 가로 / 폰 세로 접힌 스코어
- 3초 입력: +2와 파울이 첫 화면
- 카피·잠금·확인 팝업이 명세서와 같은지 Basketball agent가 검수

### Phase 5 — 농구 룰 엔진 (프론트가 안정된 뒤)

- [x] 이벤트 로그 재생 (`replayBasketballScores`) + `canEndPeriod` / `canEndMatch` 단위 테스트
- [x] mock store를 엔진 리듀서로 교체 (스냅샷 직접 변경 → 이벤트 적용) — `applyBasketballEvent` / `syncScoreFieldsFromEvents`
- [x] 도메인 단위 테스트 (UI 없이) — `pnpm test`

### Phase 6 이후

- [x] Volleyball agent 생성 + 배구 mock 보드 (+1·서브·듀스·세트/경기 확정). 시드 `match-vb1`
- [x] 오프라인 저장 (이 기기 persist. 설정에서 시드로 되돌리기)
- [x] Table Tennis agent 생성 + 탁구 mock 보드 (+1·서브 카운트·듀스·세트/경기 확정). 시드 `match-tt1`
- [x] 결과·대진 텍스트 복사 (카톡 붙여넣기. 실시간 링크·이미지 아님)
- [x] 대회·친선 만들기에서 배구·탁구 선택 (로테이션·복식 없음)
- [x] 이 기기 로그인 (이름만. Cognito·API 없음)
- [x] 모임·회차·참석 투표 mock (농구 1차. 탭 없음. 홈 `내 모임`)
- [ ] 실시간 공유 링크 · 대진 이미지. 기획서 Phase 2. API 필요

---

## 5. Phase 3 화면 목록 (농구)

준비

- [x] 홈 (H1 Arena · 시안 바 없음. 진행 중 카드, 내 대회, 대회 만들기, 빠른 친선)
- [x] 대회 만들기 1~4단계 — 농구·배구·탁구 선택. 나머지 종목은 홈에서 준비 중
- [x] 대회 개요 — 빈 팀·다음 경기 없음 카피. 참가 관리는 개요 다음
- [x] 참가 팀/선수 — `docs/SCORE-UP-참가-상세.md`. 등번호 중복 방지, 5명 미달 경고만
- [x] 대진 생성 + 토너먼트 브래킷 — 팀 2 미만 잠금, 시드 4강 표시
- [x] 리그 일정 · 순위 — 원형 라운드, 승점 승3/패0, 라운드 경기 목록
- [x] 경기 목록 — 전체/오늘/대기/진행/종료 필터
- [x] 출전 명단 — 선발 n명, 보드 전 시계 정지 안내
- [x] 빠른 친선 (이름 두 칸 → 보드)

기록

- [x] 농구 스코어보드 (가로 우선, `/match/[id]/basketball`)
- [x] 종목 보드 슬롯 (`volleyball`·`table-tennis` mock 본문)
- [x] 경기 시작 전에는 시계 정지
- [x] 작전타임 카운트다운 + 룰에서 초 설정
- [x] 쿼터 수(최소 2)·쿼터 시간 설정
- [x] 선수 피커
- [x] 교체 시트
- [x] 쿼터/경기 종료 확인 팝업
- [x] 타임라인
- [x] 결과 (쿼터별 점수, 승자, 대진 반영 **표시**)

공통

- [x] 실행 취소, 일시정지, 나가기 확인
- [x] 몰수/중단은 더보기 (수동 쿼터 종료 포함)

대진 반영은 mock에서 승자를 다음 칸에 넣어 보여 주면 된다. 실브래킷 엔진은 Phase 5+.

---

## 6. 명시적으로 안 하는 것 (이번 수직 슬라이스)

- 배구/탁구 복식·로테이션 강제, 샷클락, 관중용 보드 (배구·탁구 mock 보드는 Phase 6)
- 실서버(API/DB/인증), 실시간 동기화. **팀 공유용 S3 정적 웹은 허용** (`docs/SCORE-UP-팀공유-S3-미리보기.md`). Amplify Git 빌드·EC2·ALB·NAT·Route 53 존은 비용 때문에 쓰지 않음. `main` 자동 배포는 GitHub Actions (`.github/workflows/deploy-s3.yml`, remote `origin-hub`)
- 샷클락, 관중용 보드, 이미지/링크 공유
- 리그 승점 세부, 조별+결선
- 웹 전용 랜딩/마케팅 페이지
- 자동 매칭, 4v4, 푸시 알림, 실서버 계정(Cognito)

---

## 7. 다음 즉시 작업

1. ~~Frontend UX: 대회 만들기를 **4단계**로 맞춤~~ (`docs/SCORE-UP-대회-만들기-상세.md`)
2. ~~Frontend UX: 참가 팀/선수~~ (`docs/SCORE-UP-참가-상세.md`)
3. ~~홈 **H1 Arena** 톤 검수~~ — H1 채택, H7 기각. 시안 바·V1~V3·H2~H7 앱에서 제거
4. ~~Phase 4: 농구 보드 UX 검수~~ — 체크리스트 A~F 코드 통과. 웹에서 시드 보드·가로/세로 접힘(820) 확인
5. ~~Phase 3 잔여 준비 화면~~ — 대진·경기 목록·출전·친선
6. ~~Phase 5: mock apply* 를 엔진 리듀서로 교체~~ — `applyBasketballEvent`. 시계·작전타임 UI 상태는 mock 유지. 그 전 배구/탁구 보드 금지

다음: 실시간 공유 링크·이미지는 API 후. 로테이션·복식·태블릿 실물 검수는 선택.
