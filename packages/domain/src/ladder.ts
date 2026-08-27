import type { ClubChallenge, ClubChallengeStatus, MemberGrade } from "./types";

export const MEMBER_GRADES: MemberGrade[] = ["beginner", "intermediate", "advanced"];
export const GRADE_RANK_ORDER: MemberGrade[] = ["advanced", "intermediate", "beginner"];

const GRADE_INDEX: Record<MemberGrade, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

export function memberGrade(grade?: MemberGrade | null): MemberGrade {
  return grade === "beginner" || grade === "advanced" ? grade : "intermediate";
}

export function gradeLabel(grade?: MemberGrade | null): string {
  const value = memberGrade(grade);
  if (value === "beginner") return "초급";
  if (value === "advanced") return "상급";
  return "중급";
}

export function canChallengeGrade(a?: MemberGrade | null, b?: MemberGrade | null) {
  return Math.abs(GRADE_INDEX[memberGrade(a)] - GRADE_INDEX[memberGrade(b)]) <= 1;
}

export function challengeGradeLockCopy() {
  return "초급과 상급은 바로 도전할 수 없습니다.";
}

export function challengeStatusLabel(status: ClubChallengeStatus): string {
  switch (status) {
    case "pending":
      return "대기";
    case "accepted":
      return "수락";
    case "declined":
      return "거절";
    case "cancelled":
      return "취소";
    case "completed":
      return "완료";
  }
}

export function hasOpenChallenge(
  challenges: ClubChallenge[],
  clubId: string,
  a: string,
  b: string,
) {
  return challenges.some(
    (row) =>
      row.clubId === clubId &&
      (row.status === "pending" || row.status === "accepted") &&
      ((row.fromAccountId === a && row.toAccountId === b) ||
        (row.fromAccountId === b && row.toAccountId === a)),
  );
}

export function canSendChallenge(input: {
  fromAccountId: string;
  toAccountId: string;
  fromGrade?: MemberGrade | null;
  toGrade?: MemberGrade | null;
  fromActive: boolean;
  toActive: boolean;
  openBetween: boolean;
}): { ok: true } | { ok: false; reason: string } {
  if (input.fromAccountId === input.toAccountId) {
    return { ok: false, reason: "본인에게는 도전할 수 없습니다." };
  }
  if (!input.fromActive || !input.toActive) {
    return { ok: false, reason: "활성 멤버에게만 도전할 수 있습니다." };
  }
  if (input.openBetween) {
    return { ok: false, reason: "이미 대기 중이거나 수락된 도전이 있습니다." };
  }
  if (!canChallengeGrade(input.fromGrade, input.toGrade)) {
    return { ok: false, reason: challengeGradeLockCopy() };
  }
  return { ok: true };
}
