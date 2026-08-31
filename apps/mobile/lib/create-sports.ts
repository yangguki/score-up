import type { SportId } from "@score-up/domain";

export const CREATE_SPORTS: { id: SportId; line: string }[] = [
  { id: "basketball", line: "시간+파울" },
  { id: "volleyball", line: "세트+서브" },
  { id: "table-tennis", line: "개인 세트제" },
  { id: "soccer", line: "전후반+카드" },
  { id: "baseball", line: "이닝제" },
  { id: "badminton", line: "랠리 세트제" },
  { id: "squash", line: "랠리 점수" },
  { id: "futsal", line: "전후반+누적파울" },
];
