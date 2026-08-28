# SCORE UP 작업 계획

| 항목 | 내용 |
| --- | --- |
| 문서명 | 작업 계획 |
| 버전 | v0.3 |
| 작성일 | 2026-08-20 |
| 수정일 | 2026-08-28 |
| 상태 | Phase 8 mock 닫힘. 홈 **H1 + CTA A 잠금**. 보드는 **가로만·농구 셸**. 열린 일=H8/H9 **비교**. 진도는 **§8** |
| 목적 | Manager + 종목 agent 운영, 앱/웹 기술 조합, 구현 진도를 한곳에서 관리한다 |

기준: 기획서 v0.3, 종목 룰 명세서 v0.2, 화면 기획 v0.4.9, 모임 기획 v0.8.1, 홈 상세 v0.3.2

---

## 1. 이번에 정한 것

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| 플랫폼 | 앱 + 웹, **단일 코드베이스** | 현장 기록(앱/태블릿)과 UX 검수(웹)를 같은 화면으로 본다 |
| 1차 종목 | **농구만** | 시간제+파울이라 엔진/UX 검증 밀도가 가장 높다. 기획서 권장 순서와 같다 |
| 구현 순서 | **mock 프론트 → 룰 엔진 → 다른 종목** | 운영 흐름이 손에 잡혀야 버튼·상태 전이 스펙이 검증된다 |
| 계정/백엔드 | 이번 단계 없음 | 로그인·API는 mock 화면 검수 후 |
| Agent | Manager가 분배. 기획은 Planner. 종목 agent는 8종목 모두 있음. 새 종목은 제품 8에 없으면 만들지 않음 | 없는 agent를 미리 많이 두면 지시가 흩어진다 |
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
    → Manager (분류, 범위, 진도 §8, 새 agent 생성)
         ├─ Planner         제품 정의, IA, 화면 명세, 카피, MVP 범위, docs 정합
         ├─ Frontend UX     화면 구현, 라우팅, mock 동작, H8/H9 비교
         ├─ Basketball      농구 버튼·파울·타이머·카피
         ├─ Rule Engine     공통 상태/이벤트. 농구 Phase 5 리듀서 적용됨
         ├─ Infra           팀 공유 미리보기 (S3 + GitHub Actions, 최소 비용)
         └─ 종목 agent      배구·탁구·배드민턴·스쿼시·축구·풋살·야구 mock
```

- 스킬 위치: `.cursor/skills/` (기획 학습: `planner-agent/canon.md`)
- 분배 규칙: `AGENTS.md`
- 새 종목 agent 템플릿: `.cursor/skills/score-up-manager/sport-agent-template.md`
- 진도 보드: 이 문서 **§8**. 채팅에서만 상태를 바꾸지 않는다.

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

- 태블릿 가로 스코어 (세로 레이아웃 없음)
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
- [x] 대회·친선 만들기에서 배구·탁구 선택 (로테이션 표시·복식 이름 선택)
- [x] 이 기기 로그인 (이름만. Cognito·API 없음)
- [x] 모임·회차·참석 투표 mock (농구 1차. 탭 없음. 홈 `내 모임`)
- [x] 축구·풋살 전후반 mock 보드 + 야구 이닝 mock 보드. 홈 8종목 대회·친선 활성
- 실시간 공유 링크 · 대진 이미지 — **API 후** (mock은 텍스트 복사만. 가짜 URL 없음)

### Phase 7 — 모임 강화 (제품 Phase 3-B 슬라이스)

홈 A/B/C는 **A 잠금**. 제품 방향 전환은 없음. **시각만** H1 / H8 Lift / H9 Play 비교.

- [x] 농구 회차 **자동 매칭 제안** (무작위 / 승률 스네이크). 운영자 수정 후 확정 — `proposeClubSplit`
- [x] 4v4 회차 (인원 미달 시) — 운영자 **4대4로 나누기**. `format=4v4`, `starters=4`. 3x3 없음
- [x] 월 정기 패턴 — 매달 N번째 요일 / 매달 D일(1~28). 회차 취소는 규칙과 분리
- [x] 기간형 급수 시즌 · 결과 넣기 · 도전장 — 초급/중급/상급, 보드 없이 점수. 사진·ELO·1v1 보드 없음 (`docs/SCORE-UP-급수-기획.md`)

### Phase 8 — 배드민턴 모임 1차

제품 잠금은 `docs/SCORE-UP-모임-기획.md` §21. 기존 Club/Session/급수 재사용. `sportId=badminton`.

- [x] 모임 만들기 종목 **배드민턴** (배구/탁구 잠금 유지)
- [x] 회차 투표 마감 후 **한 판 열기** (단식 1+1 / 복식 2+2). 기존 `/match/[id]/badminton`. 5v5/4v4 카피 없음
- [x] 출전은 운영자 수동. 자동 짝·멀티코트·남복 자동 없음
- [x] 시드 `수요일 배드민턴` + 투표 중 복식 회차(참석 4)
- [x] 급수·도전·두 멤버 결과 넣기는 농구 모임과 같은 경로. 복식 4명 손결과는 2차

---

## 5. Phase 3 화면 목록 (농구)

준비

- [x] 홈 (H1 Arena 기본. H8 Lift · H9 Play 비교. 진행 중 카드, 내 대회, 대회 만들기, 빠른 친선. 키트 `/kit/arena` `/kit/lift` `/kit/play`)
- [x] 대회 만들기 1~4단계 — 홈 8종목 선택. 모임은 농구·배드민턴 1차
- [x] 대회 개요 — 빈 팀·다음 경기 없음 카피. 참가 관리는 개요 다음
- [x] 참가 팀/선수 — `docs/SCORE-UP-참가-상세.md`. 등번호 중복 방지, 5명 미달 경고만
- [x] 대진 생성 + 토너먼트 브래킷 — 팀 2 미만 잠금, 시드 4강 표시
- [x] 리그 일정 · 순위 — 원형 라운드, 승점 승3/패0, 라운드 경기 목록
- [x] 경기 목록 — 전체/오늘/대기/진행/종료 필터
- [x] 출전 명단 — 선발 n명, 보드 전 시계 정지 안내
- [x] 빠른 친선 — CTA는 종목 선택. 홈 종목 타일은 `/friendly?sport=` (피커 숨김)

기록

- [x] 농구 스코어보드 (**가로만**, `/match/[id]/basketball`)
- [x] 종목 보드 슬롯 — 8종목 모두 농구 Arena 셸 (좌우 색면·거대 점수). 버튼만 종목별
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

- 배구/탁구 복식·로테이션 **강제**, 샷클락, 관중용 보드 (표시·이름만은 Phase 6)
- 실서버(API/DB/인증), 실시간 동기화. **팀 공유용 S3 정적 웹은 허용** (`docs/SCORE-UP-팀공유-S3-미리보기.md`). Amplify Git 빌드·EC2·ALB·NAT·Route 53 존은 비용 때문에 쓰지 않음. `main` 자동 배포는 GitHub Actions (`.github/workflows/deploy-s3.yml`, remote `origin-hub`)
- 샷클락, 관중용 보드, 이미지/링크 공유
- 리그 승점 세부, 조별+결선
- 웹 전용 랜딩/마케팅 페이지
- 3x3, 푸시 알림, 실서버 계정(Cognito)
- 배드민턴 모임 **2차** — 회비, 멀티코트, 남복 자동, A~D조, 복식 4명 급수 결과, 한 회차 여러 판

---

## 7. 닫힌 즉시 작업 (아카이브)

1. ~~Frontend UX: 대회 만들기를 **4단계**로 맞춤~~ (`docs/SCORE-UP-대회-만들기-상세.md`)
2. ~~Frontend UX: 참가 팀/선수~~ (`docs/SCORE-UP-참가-상세.md`)
3. ~~홈 **H1 Arena** 톤 검수~~ — H1 채택, H7 기각. 시안 바·V1~V3·H2~H7 앱에서 제거
4. ~~Phase 4: 농구 보드 UX 검수~~ — 체크리스트 A~F 코드 통과. 보드는 가로만(짧은 높이 compact). 8종목 셸=농구
5. ~~Phase 3 잔여 준비 화면~~ — 대진·경기 목록·출전·친선
6. ~~Phase 5: mock apply* 를 엔진 리듀서로 교체~~ — `applyBasketballEvent`. 시계·작전타임 UI 상태는 mock 유지. 그 전 배구/탁구 보드 금지
7. ~~기획-구현 정합~~ — 홈 헤더 카피, 대회 종목 라벨, matched 다시 나누기, 강퇴·역할, 대회 룰 편집(prep)
8. ~~홈 시안 H8 Lift · H9 Play + `/kit`~~ — 비교만. 제품 기본은 H1
9. ~~종목 타일 → 빠른 친선~~ — `?sport=`면 종목 피커 숨김. CTA만 피커
10. ~~스코어보드 가로만 + 8종목 농구 셸~~ — 세로는 「가로로 돌려 주세요」. `ArenaBoardShell`

지금 할 일·열지 않을 일은 **§8**.

---

## 8. 진행 현황 (Manager 보드 · 2026-08-28)

진도 주인은 이 절이다. 제품 비전은 기획서, 화면 무엇을 그리는지는 화면기획·홈 상세. 여기서 제품 결정을 바꾸지 않는다.

### 8.1 한 줄

구현 **Phase 8 닫힘**. 제품 홈은 **H1 Arena + CTA A 잠금**. 보드는 **가로만·농구 셸**. 종목 타일은 친선(피커 숨김). 지금 열린 일은 **홈 시안 비교**(H8 Lift · H9 Play). 새 구현 Phase가 아니다.

### 8.2 상태

| 영역 | 상태 | 담당 |
| --- | --- | --- |
| 구현 Phase 0~8 | 닫힘 | — |
| 제품 홈 CTA | **A 잠금** (대회 만들기 Primary, 친선 secondary) | Planner |
| 제품 홈 톤 | **H1 Arena** | Planner |
| H8 Lift | 비교. 세로 종목 **4열** compact / 가로 **8열** 폭 맞춤. 키트 `/kit/lift` | Frontend UX |
| H9 Play | 비교. 세로 블롭 **작은 2열** / 가로 **4열×2줄** 폭 맞춤. 키트 `/kit/play` | Frontend UX |
| 시안 전환 | 홈 상단·설정. `homeVersion` = `h1` \| `h8` \| `h9`. 기본 `h1` | Frontend UX |
| 종목 타일 탭 | H1·H8·H9 모두 `/friendly?sport=` (종목 피커 숨김). CTA만 `/friendly`에서 선택 | Planner |
| 스코어보드 | **가로만**. 세로=안내. 8종목 `ArenaBoardShell`(농구 좌우 색면) | Frontend UX |
| 대회 룰 편집 | prep만 `/competition/[id]/rules` | Frontend UX |
| 모임 운영 | matched 명단·다시 나누기, 강퇴·역할 | Frontend UX |
| 농구 룰 엔진 | Phase 5 적용 (`applyBasketballEvent`) | Rule Engine |
| 8종목 보드 | mock. 셸 통일, 버튼·카피는 종목별 | 각 종목 agent |
| 모임 | 농구 5v5·4v4 + 배드민턴 1차(한 판) | Frontend UX |
| 팀 미리보기 | S3 정적 + GitHub Actions(`origin-hub`) | Infra |
| 실시간 공유 링크·이미지 | **안 함** (API 후. mock은 텍스트 복사) | — |
| 배드민턴 모임 2차 | **열지 않음** (회비·멀티코트·복식 4명 결과) | — |
| 실서버·Cognito | **안 함** | — |
| `이 모임의 대회로` | **없음** | Planner |

### 8.3 지금 하는 일

비교 시안 밀도·카피 검수. H8/H9를 제품 기본으로 잠그지 않는다. 결정이 나면 홈 상세·화면기획·캐논·이 절을 같은 턴에 고친다.

### 8.4 다음 (조건이 있을 때만)

| 다음 | 언제 연다 |
| --- | --- |
| 실시간 조회 링크·대진 이미지 | API 이후 |
| 태블릿·폰 가로 실물 검수 | 선택 |
| 배드민턴 모임 2차 | 열지 않음 |
| 홈 시안을 제품 기본으로 | Planner가 H1 외를 **채택**할 때만. 지금은 H1 |
| 새 종목(테니스 등) | 제품 8종목이 아니면 만들지 않음 |
