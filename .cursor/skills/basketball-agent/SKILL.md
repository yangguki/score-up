---
name: basketball-agent
description: Owns SCORE UP basketball preset, quarter timer, 1/2/3 scoring, personal/team fouls, bonuses, substitutions, and basketball mock fixtures. Use when implementing or reviewing 농구 screens, rules, or sample data.
---

# Basketball Agent

1차 종목 담당. 출처는 `docs/SCORE-UP-종목-룰-명세서.md` 2장, `docs/SCORE-UP-화면기획.md` 농구 스코어보드.

## 동호회 기본 프리셋

- 4쿼터 × 8분, 연장 3분. 쿼터 수는 최소 2·최대 4, 쿼터 분은 4/6/8/10/12
- 득점 +2 / +3 / +1 (자유투)
- 개인 파울 아웃 6, 팀 파울 보너스 쿼터 5번째부터
- 타임아웃 팀당 경기 2회, 작전타임 기본 60초 (30/45/60/90)
- 출전 5명 (대회·친선 프리셋). 모임 4v4 회차만 `Match.rules.starters=4`. 3x3 없음
- 샷클락 없음
- 몰수 기본 20-0
- 토너먼트는 무승부 불가 → 연장 없음 설정이면 대회 생성에서 막기

## 화면에 항상 둘 것

홈/어웨이 총점, 쿼터, 남은 시간, 이번 쿼터 팀 파울, 보너스 힌트, 최근 이벤트 1~3개, 실행 취소, 일시정지.

보드 첫 입장에는 **경기 시작**. 시계는 이 버튼을 누르기 전에는 돌지 않는다. T/O 중에는 작전타임 카운트다운.

서브권, 세트 스코어, 듀스는 **그리지 않는다.**

## mock UX 단계에서의 동작

실엔진 대신 화면이 아래를 **가짜로라도** 보여 줘야 한다.

- 보드 입장 시 시계 정지 → **경기 시작** → 시계 시작
- +2/+3/+1 탭 → 선수 피커 → 총점 반영
- 파울 → 개인/팀 파울 숫자 증가, 5개면 “다음 아웃”, 6개면 출전 불가
- 팀 파울 5 이상이면 상대 +1 강조
- T/O → 경기 시계 정지, 화면에 작전타임 초가 흐름. 끝나면 재개
- 시계 0 → “쿼터 종료 확정” 팝업. 확정 전 득점 잠금
- 4쿼터 종료 + 동점 → 연장 제안
- 실행 취소는 하단 고정

## 파일 경계 (생길 위치)

- `packages/domain` 농구 타입·프리셋 (`timeoutSeconds`, `periodCount` 최소 2)
- `packages/mock` 농구 경기 픽스처
- `apps/mobile/app/match/[id]/basketball.tsx` 농구 보드 라우트
- `apps/mobile/components/scoreboard/basketball-board.tsx` 농구 보드 UI
- `/match/[id]/scoreboard` 는 `sportId`로 종목 보드에 보내는 호환 경로

Rule Engine이 공통 `MatchEvent`를 정의하면 농구 payload만 이 agent가 채운다.

## 하지 말 것

- 샷클락, 리바운드/어시스트, 3x3, 자유투 위자드
- 배구/탁구 레이아웃을 이 화면에 재사용하려고 억지 공통 컴포넌트 만들기
- Phase 5 전에 복잡한 리듀서를 화면 컴포넌트 안에 넣기 — mock store로 충분
