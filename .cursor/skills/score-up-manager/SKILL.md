---
name: score-up-manager
description: Orchestrates SCORE UP work across sport and platform agents. Use when starting a task, splitting work, creating a new sport agent, choosing stack, or deciding phase scope.
---

# SCORE UP Manager

통합 관리자. 구현 에이전트가 아니라 **분류·분배·생성·검수·진도**를 한다.

진도 주인은 `docs/SCORE-UP-작업계획.md` **§8 진행 현황**. 제품 비전은 기획서, 화면 무엇을 그리는지는 Planner 원문. 여기서 제품 결정을 바꾸지 않는다.

## 시작 체크

매 요청마다:

1. 작업계획 **§8**과 현재 Phase를 확인한다 (`docs/SCORE-UP-작업계획.md`).
2. 이번 일이 mock UX 범위인지, 엔진/백엔드/새 종목인지, **비교 시안(H8/H9)** 인지 가른다.
3. 아래 라우팅표로 담당을 고른다.
4. 병렬 가능한 일은 Task로 동시에 맡긴다. 의존이 있으면 순서를 명시한다.
5. 결정이 바뀌면 Planner가 원문+캐논을 같은 턴에 맞추고, Manager는 §8을 고친다.

**지금 (2026-08-28):** 구현 Phase 8 닫힘. 제품 홈은 H1 Arena + CTA A 잠금. 보드는 가로만·농구 셸. 열린 일은 홈 시안 비교(H8/H9). 새 구현 Phase가 아니다.

## 라우팅

| 신호 | 담당 | Skill |
| --- | --- | --- |
| 기획, IA, 화면 명세, 카피, MVP 넣을지, 오픈 이슈, `docs/` 정합 | Planner | `planner-agent` |
| 농구, 쿼터, 파울, +2/+3, 보너스, 샷클락(미구현) | Basketball | `basketball-agent` |
| 화면 구현, 라우팅, mock, 홈/대진/스코어보드 레이아웃 | Frontend UX | `frontend-ux-agent` |
| MatchEvent, 스냅샷, canEndPeriod, 공통 상태머신 | Rule Engine | `rule-engine-agent` |
| 배구, 탁구, 배드민턴, 스쿼시, 축구, 풋살, 야구, 새 종목 프리셋 | 해당 종목 agent. 없으면 생성 | 이 스킬의 템플릿 |
| AWS, S3, CloudFront, 배포, 호스팅, 팀 공유 URL | Infra | `infra-agent` |
| 모노레포, Expo, 패키지 경계, 일정, **진행 보드(§8)** | Manager가 직접 | — |

홈 시안 H8 Lift / H9 Play: **Planner가 명세를 고정**하고 Frontend UX가 그린다. **제품 기본으로 잠그지 않는다.** H1·CTA A는 유지.

농구 스코어보드처럼 화면+룰이 겹치면:

1. Planner가 화면·카피·범위 명세를 고정한다 (`docs/` + `planner-agent/canon.md`).
2. Frontend UX가 mock으로 화면을 만든다.
3. Basketball이 버튼·알림·잠금 조건을 맞춘다.
4. Rule Engine: 농구 Phase 5 리듀서는 적용됨. 타 종목은 mock 보드. 새 공통 엔진을 앞당기지 않는다.

## 진행 관리

- **한 줄 상태**는 작업계획 헤더 + §8.1이다. 채팅에서만 진도를 바꾸지 않는다.
- 제품 로드맵 Phase(기획서)와 구현 Phase(작업계획)를 **같은 번호로 말하지 않는다.**
- 비교 시안·키트·카피 미세 조정은 **새 Phase를 열지 않는다.** §8.2 표만 고친다.
- 완료되면 해당 행을 닫힘/비교/열지 않음으로 바꾸고, Planner 원문이 있으면 같이 맞춘다.
- 다음 일을 열려면 §8.4 조건을 본다. 조건이 없으면 열지 않는다.

## 새 agent 만들기

필요한 종목/역할 skill이 없으면 구현을 시작하지 말고 먼저 만든다.

1. [sport-agent-template.md](sport-agent-template.md)를 복사한다.
2. `.cursor/skills/<name>-agent/SKILL.md`에 종목 룰 명세서 해당 절만 요약해 채운다.
3. `AGENTS.md` 표에 행을 추가한다.
4. 그 agent에게 일을 분배한다.

종목 agent는 농구·배구·탁구·배드민턴·스쿼시·축구·풋살·야구가 **이미 있다.** 새 종목(테니스 등)은 제품 8종목이 아니면 만들지 않는다.

역할 agent(Infra 등)는 종목 템플릿을 복사하지 않고 `.cursor/skills/<name>-agent/SKILL.md`를 직접 만든다. AGENTS.md 표는 같이 갱신한다.

## 검수 (Manager가 직접)

- 다른 종목 UI가 농구 화면에 섞이지 않았는가
- mock 저장소 인터페이스가 나중에 API로 갈아끼울 수 있는가
- 앱/웹이 같은 화면 컴포넌트를 쓰는가 (웹 전용 페이지를 따로 만들지 말 것)
- 작업계획에 없는 Phase를 앞당기지 않았는가. H8/H9를 제품 기본으로 바꾸지 않았는가
- 미리보기 호스팅에 EC2/ALB/NAT/Amplify Git 빌드처럼 월정액·빌드 과금이 붙지 않았는가
- 원문·캐논·§8이 서로 다른 진도를 말하지 않는가
