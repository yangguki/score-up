export type HomeSportId =
  | "basketball"
  | "volleyball"
  | "table-tennis"
  | "soccer"
  | "baseball"
  | "badminton"
  | "squash"
  | "futsal";

export type HomeSport = {
  id: HomeSportId;
  name: string;
  line: string;
  /** 종목 타일 액센트 (코트/장비 색 느낌) */
  tint: string;
  /** MVP: 농구만 선택·대회 생성 가능 */
  active: boolean;
};

export const HOME_SPORTS: HomeSport[] = [
  { id: "basketball", name: "농구", line: "시간 + 파울", tint: "#E87722", active: true },
  { id: "volleyball", name: "배구", line: "세트 + 서브", tint: "#2B6CB0", active: false },
  { id: "table-tennis", name: "탁구", line: "개인 세트제", tint: "#C53030", active: false },
  { id: "soccer", name: "축구", line: "전후반 + 카드", tint: "#276749", active: false },
  { id: "baseball", name: "야구", line: "이닝제", tint: "#1A365D", active: false },
  { id: "badminton", name: "배드민턴", line: "세트 + 서브", tint: "#0F766E", active: false },
  { id: "squash", name: "스쿼시", line: "랠리 점수", tint: "#9A3412", active: false },
  { id: "futsal", name: "풋살", line: "전후반", tint: "#1D4ED8", active: false },
];

export const HOME_TAGLINE = "종목 룰로 대회를 만들고, 현장에서 스코어를 이어 갑니다.";

export const HOME_VALUE_LINES = [
  "종목 프리셋으로 대회·친선 시작",
  "선수·대진·스코어가 한 흐름",
  "파울·세트 종료는 앱이 제안",
] as const;
