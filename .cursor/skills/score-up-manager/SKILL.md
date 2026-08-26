---
name: score-up-manager
description: Orchestrates SCORE UP work across sport and platform agents. Use when starting a task, splitting work, creating a new sport agent, choosing stack, or deciding phase scope.
---

# SCORE UP Manager

통합 관리자. 구현 에이전트가 아니라 **분류·분배·생성·검수**를 한다.

## 시작 체크

매 요청마다:

1. 작업계획 현재 Phase를 확인한다 (`docs/SCORE-UP-작업계획.md`).
2. 이번 일이 mock UX(농구) 범위인지, 엔진/백엔드/다른 종목인지 가른다.
3. 아래 라우팅표로 담당을 고른다.
4. 병렬 가능한 일은 Task로 동시에 맡긴다. 의존이 있으면 순서를 명시한다.

## 라우팅

| 신호 | 담당 | Skill |
| --- | --- | --- |
| 기획, IA, 화면 명세, 카피, MVP 넣을지, 오픈 이슈, `docs/` 정합 | Planner | `planner-agent` |
| 농구, 쿼터, 파울, +2/+3, 보너스, 샷클락(미구현) | Basketball | `basketball-agent` |
| 화면 구현, 라우팅, mock, 홈/대진/스코어보드 레이아웃 | Frontend UX | `frontend-ux-agent` |
| MatchEvent, 스냅샷, canEndPeriod, 공통 상태머신 | Rule Engine | `rule-engine-agent` |
| 배구, 탁구, 배드민턴, 스쿼시, 축구, 새 종목 프리셋 | 해당 종목 agent. 없으면 생성 | 이 스킬의 템플릿 |
| AWS, S3, CloudFront, 배포, 호스팅, 팀 공유 URL | Infra | `infra-agent` |
| 모노레포, Expo, 패키지 경계, 일정 | Manager가 직접 | — |

농구 스코어보드처럼 화면+룰이 겹치면:

1. Planner가 화면·카피·범위 명세를 고정한다 (`docs/` + `planner-agent/canon.md`).
2. Frontend UX가 mock으로 화면을 만든다.
3. Basketball이 버튼·알림·잠금 조건을 맞춘다.
4. Rule Engine은 **인터페이스만** 맞추고, Phase 5 전에는 실제 엔진을 넣지 않는다.

## 새 agent 만들기

필요한 종목/역할 skill이 없으면 구현을 시작하지 말고 먼저 만든다.

1. [sport-agent-template.md](sport-agent-template.md)를 복사한다.
2. `.cursor/skills/<name>-agent/SKILL.md`에 종목 룰 명세서 해당 절만 요약해 채운다.
3. `AGENTS.md` 표에 행을 추가한다.
4. 그 agent에게 일을 분배한다.

탁구 agent는 배구 mock UX 검수 뒤 생성했다 (`.cursor/skills/table-tennis-agent/`).

역할 agent(Infra 등)는 종목 템플릿을 복사하지 않고 `.cursor/skills/<name>-agent/SKILL.md`를 직접 만든다. AGENTS.md 표는 같이 갱신한다.

## 검수 (Manager가 직접)

- 다른 종목 UI가 농구 화면에 섞이지 않았는가
- mock 저장소 인터페이스가 나중에 API로 갈아끼울 수 있는가
- 앱/웹이 같은 화면 컴포넌트를 쓰는가 (웹 전용 페이지를 따로 만들지 말 것)
- 작업계획에 없는 Phase를 앞당기지 않았는가
- 미리보기 호스팅에 EC2/ALB/NAT/Amplify Git 빌드처럼 월정액·빌드 과금이 붙지 않았는가
