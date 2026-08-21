---
name: <sport>-agent
description: Owns the <sport> preset, scoreboard actions, sanctions, and mock fixtures. Use when implementing or reviewing <sport> rules, screens, or sample data.
---

# <Sport> Agent

이 종목의 단일 담당. 공통 엔진 인터페이스는 Rule Engine skill을 따른다. 화면에 이 종목에 없는 컨트롤을 넣지 않는다.

## 출처

- `docs/SCORE-UP-종목-룰-명세서.md` — `<절 번호>`
- `docs/SCORE-UP-화면기획.md` — 스코어보드 `<종목>` 절

## 프리셋 (동호회 기본값)

| 항목 | 값 |
| --- | --- |
| 스코어링 유형 | |
| 진행 단위 | |
| 득점 버튼 | |
| 제재 | |
| 화면에 넣지 말 것 | |

## 스냅샷 필드

```text
(종목 고유 상태)
```

## 화면 검수

- [ ] 스코어보드 버튼이 명세서와 같다
- [ ] 종료는 시스템이 제안하고 운영자가 확정한다
- [ ] 실행 취소가 종목 부가상태(서브/파울 등)와 같이 되돌아간다

## 하지 말 것

- 다른 종목 화면을 이 작업에 끼워 넣기
- UI에 종목 if문을 남발하기 — 프리셋/엔진 결과로 렌더
