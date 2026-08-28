import type { HomeSportId } from "@/lib/home-sports";

export type PlaySportVisual = {
  id: HomeSportId;
  name: string;
  from: string;
  to: string;
  pose: PlayPose;
  gear: PlayGear;
  /** 시안 8번째 카드처럼 연한 블롭 + 민트 실루엣 */
  ink?: string;
};

export type PlayPose = "racket-high" | "paddle" | "spike" | "dribble" | "kick" | "kick-high" | "squash" | "bat";
export type PlayGear = "shuttle" | "pingpong" | "volleyball" | "basketball" | "futsal" | "soccer" | "squash" | "baseball";

/** 시안 2열 순서. 테니스·족구·기타는 제품 8종목(배구·축구·야구)으로 대응. */
export const PLAY_SPORTS: PlaySportVisual[] = [
  { id: "badminton", name: "배드민턴", from: "#4C7FE8", to: "#9BB7F5", pose: "racket-high", gear: "shuttle" },
  { id: "table-tennis", name: "탁구", from: "#7C5CF0", to: "#B9A6F8", pose: "paddle", gear: "pingpong" },
  { id: "volleyball", name: "배구", from: "#EA580C", to: "#FBBF24", pose: "spike", gear: "volleyball" },
  { id: "basketball", name: "농구", from: "#FB923C", to: "#FDE68A", pose: "dribble", gear: "basketball" },
  { id: "futsal", name: "풋살", from: "#0F766E", to: "#5EEAD4", pose: "kick", gear: "futsal" },
  { id: "soccer", name: "축구", from: "#65A30D", to: "#BEF264", pose: "kick-high", gear: "soccer" },
  { id: "squash", name: "스쿼시", from: "#64748B", to: "#94A3B8", pose: "squash", gear: "squash" },
  { id: "baseball", name: "야구", from: "#E2E8F0", to: "#F8FAFC", pose: "bat", gear: "baseball", ink: "#2DD4BF" },
];

export const PLAY_HEADLINE_BEFORE = "지금 ";
export const PLAY_HEADLINE_UP = "‘업’";
export const PLAY_HEADLINE_AFTER = " 하고 싶은 스코어는?";
