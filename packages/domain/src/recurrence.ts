import type { Club, NthWeek, RecurrenceKind } from "./types";

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const NTH_WEEK_LABELS: Record<NthWeek, string> = {
  1: "첫째",
  2: "둘째",
  3: "셋째",
  4: "넷째",
  5: "마지막",
};
export const RECURRENCE_COUNT = 8;
export const MONTH_DAY_MIN = 1;
export const MONTH_DAY_MAX = 28;

export function parseDateLabel(label: string): Date | null {
  const date = new Date(`${label.trim()}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function weekdayOf(label: string): number | null {
  const date = parseDateLabel(label);
  return date ? date.getDay() : null;
}

export function clampMonthDay(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MONTH_DAY_MAX, Math.max(MONTH_DAY_MIN, Math.round(value)));
}

export function weeklyDates(fromDate: string, count = RECURRENCE_COUNT): string[] {
  const start = parseDateLabel(fromDate);
  if (!start) return [];
  return Array.from({ length: count }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index * 7);
    return formatDateLabel(next);
  });
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: NthWeek): Date | null {
  if (nth === 5) {
    const last = new Date(year, month + 1, 0);
    last.setDate(last.getDate() - ((last.getDay() - weekday + 7) % 7));
    return last.getMonth() === month ? last : null;
  }
  const first = new Date(year, month, 1);
  const day = 1 + ((weekday - first.getDay() + 7) % 7) + (nth - 1) * 7;
  const result = new Date(year, month, day);
  return result.getMonth() === month ? result : null;
}

export function monthlyNthDates(fromDate: string, weekday: number, nth: NthWeek, count = RECURRENCE_COUNT): string[] {
  const start = parseDateLabel(fromDate);
  if (!start || weekday < 0 || weekday > 6) return [];
  const week = ([1, 2, 3, 4, 5].includes(nth) ? nth : 1) as NthWeek;
  const from = formatDateLabel(start);
  const out: string[] = [];
  let year = start.getFullYear();
  let month = start.getMonth();
  for (let i = 0; i < 36 && out.length < count; i += 1) {
    const date = nthWeekdayOfMonth(year, month, weekday, week);
    if (date) {
      const label = formatDateLabel(date);
      if (label >= from) out.push(label);
    }
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return out;
}

export function monthlyDayDates(fromDate: string, monthDay: number, count = RECURRENCE_COUNT): string[] {
  const start = parseDateLabel(fromDate);
  if (!start) return [];
  const day = clampMonthDay(monthDay);
  const from = formatDateLabel(start);
  const out: string[] = [];
  let year = start.getFullYear();
  let month = start.getMonth();
  for (let i = 0; i < 36 && out.length < count; i += 1) {
    const date = new Date(year, month, day);
    if (date.getMonth() === month) {
      const label = formatDateLabel(date);
      if (label >= from) out.push(label);
    }
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return out;
}

export function clubRecurrenceKind(club: Pick<Club, "recurrenceKind" | "weekday">): RecurrenceKind | undefined {
  if (club.recurrenceKind) return club.recurrenceKind;
  if (club.weekday != null) return "weekly";
  return undefined;
}

export function recurrenceLabel(
  club: Pick<Club, "recurrenceKind" | "weekday" | "weeklyTime" | "nthWeek" | "monthDay">,
): string {
  const time = club.weeklyTime || "14:00";
  const kind = clubRecurrenceKind(club);
  if (kind === "weekly" && club.weekday != null) {
    return `매주 ${WEEKDAY_LABELS[club.weekday] ?? ""} ${time}`.trim();
  }
  if (kind === "monthlyNth" && club.weekday != null) {
    const nthKey = club.nthWeek && club.nthWeek >= 1 && club.nthWeek <= 5 ? club.nthWeek : 1;
    return `매달 ${NTH_WEEK_LABELS[nthKey]} ${WEEKDAY_LABELS[club.weekday] ?? ""} ${time}`.trim();
  }
  if (kind === "monthlyDate") {
    return `매달 ${clampMonthDay(club.monthDay ?? 1)}일 ${time}`;
  }
  return "정기 없음";
}
