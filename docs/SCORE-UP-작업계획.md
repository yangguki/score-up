# SCORE UP 작업 계획

| 항목 | 내용 |
| --- | --- |
| 문서명 | 작업 계획 |
| 버전 | v0.2 |
| 작성일 | 2026-08-20 |
| 수정일 | 2026-08-25 |
| 상태 | Phase 3 진행 (농구 mock 스코어보드 수직 슬라이스) |
| 목적 | Manager + 종목 agent 운영, 앱/웹 기술 조합, 농구 1종목 mock 프론트까지의 순서를 고정한다 |

기준: 기획서 v0.2, 종목 룰 명세서 v0.2, 화면 기획 v0.2

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
| 나중에 오프라인 | expo-sqlite + 이벤트 로그 (Phase 6+) |
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
         ├─ Infra           팀 공유 미리보기 (S3 정적, 최소 비용)
         └─ (이후) Volleyball / Table Tennis agent 생성 후 분배
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

- 이벤트 로그 재생, `canEndPeriod` / `canEndMatch`
- mock store를 엔진 리듀서로 교체
- 도메인 단위 테스트 (UI 없이)

### Phase 6 이후 (계획만, 이번 범위 밖)

- 오프라인 저장, 계정
- Manager가 Volleyball agent 생성 → 세트+서브 mock 화면
- Table Tennis agent 생성
- 리그 순위, 공유 링크 등 기획서 Phase 2

---

## 5. Phase 3 화면 목록 (농구)

준비

- [ ] 홈 (진행 중 카드, 내 대회, 대회 만들기, 빠른 친선)
- [ ] 대회 만들기 1~4단계 — 종목은 농구만 활성. 배구/탁구 카드는 비활성 또는 숨김
- [ ] 대회 개요
- [ ] 참가 팀/선수
- [ ] 대진 생성 + 토너먼트 브래킷
- [ ] 경기 목록
- [ ] 출전 명단
- [ ] 빠른 친선 (이름 두 칸 → 보드)

기록

- [x] 농구 스코어보드 (가로 우선, `/match/[id]/basketball`)
- [x] 종목 보드 슬롯 (`volleyball` / `table-tennis` 경로만, 화면은 안 그림)
- [x] 경기 시작 전에는 시계 정지
- [x] 작전타임 카운트다운 + 룰에서 초 설정
- [x] 쿼터 수(최소 2)·쿼터 시간 설정
- [x] 선수 피커
- [x] 교체 시트
- [x] 쿼터/경기 종료 확인 팝업
- [x] 타임라인
- [x] 결과 (쿼터별 점수, 승자, 대진 반영 **표시**)

공통

- [ ] 실행 취소, 일시정지, 나가기 확인
- [ ] 몰수/중단은 더보기

대진 반영은 mock에서 승자를 다음 칸에 넣어 보여 주면 된다. 실브래킷 엔진은 Phase 5+.

---

## 6. 명시적으로 안 하는 것 (이번 수직 슬라이스)

- 배구·탁구 스코어보드 **본문**과 프리셋 (경로는 예약만)
- 실서버(API/DB/인증), 실시간 동기화. **팀 공유용 S3 정적 웹은 허용** (`docs/SCORE-UP-팀공유-S3-미리보기.md`). Amplify Git 빌드·EC2·ALB·NAT·Route 53 존은 비용 때문에 쓰지 않음. `main` 자동 배포는 GitHub Actions (`.github/workflows/deploy-s3.yml`, remote `origin-hub`)
- 샷클락, 관중용 보드, 이미지/링크 공유
- 리그 승점 세부, 조별+결선
- 웹 전용 랜딩/마케팅 페이지

---

## 7. 다음 즉시 작업

1. 홈 **H1 Arena** 톤 검수 (`docs/SCORE-UP-홈-상세.md`). H7(상쾌 톤)과 비교 후 기본 확정. 확정 후 V1~V3·H2~H6 시안·시안 바 정리
2. Phase 4: 태블릿 가로 / 폰 세로에서 농구 보드 UX 검수 — `docs/SCORE-UP-스코어보드-레퍼런스-체크리스트.md`
3. Basketball agent가 카피·잠금·쿼터/작전타임이 명세서 v0.2와 같은지 검수
4. 검수 끝나면 Phase 5 룰 엔진. 그 전 배구/탁구 보드 금지

홈·전역 T&M: `theme/arena.ts`, 시안 비교 `docs/home-hub-versions.html` · `docs/SCORE-UP-홈-벤치마크.md`

이 문서의 Phase 4 검수가 닫히기 전에는 다른 종목 구현을 시작하지 않는다.
