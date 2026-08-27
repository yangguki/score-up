import assert from "node:assert/strict";
import test from "node:test";
import {
  monthlyDayDates,
  monthlyNthDates,
  recurrenceLabel,
  weeklyDates,
  weekdayOf,
} from "./recurrence";

test("weeklyDates steps by 7 days from the start", () => {
  const dates = weeklyDates("2026-08-29", 3);
  assert.deepEqual(dates, ["2026-08-29", "2026-09-05", "2026-09-12"]);
});

test("monthlyNthDates uses first Saturday on or after start", () => {
  assert.equal(weekdayOf("2026-08-01"), 6);
  const dates = monthlyNthDates("2026-08-01", 6, 1, 3);
  assert.deepEqual(dates, ["2026-08-01", "2026-09-05", "2026-10-03"]);
});

test("monthlyNthDates last Saturday skips dates before start", () => {
  const dates = monthlyNthDates("2026-08-29", 6, 5, 2);
  assert.deepEqual(dates, ["2026-08-29", "2026-09-26"]);
});

test("monthlyDayDates clamps to 1-28 and skips past days this month", () => {
  const dates = monthlyDayDates("2026-08-29", 15, 3);
  assert.deepEqual(dates, ["2026-09-15", "2026-10-15", "2026-11-15"]);
});

test("recurrenceLabel covers weekly and monthly kinds", () => {
  assert.equal(recurrenceLabel({ recurrenceKind: "weekly", weekday: 6, weeklyTime: "14:00" }), "매주 토 14:00");
  assert.equal(
    recurrenceLabel({ recurrenceKind: "monthlyNth", weekday: 6, nthWeek: 1, weeklyTime: "10:00" }),
    "매달 첫째 토 10:00",
  );
  assert.equal(recurrenceLabel({ recurrenceKind: "monthlyDate", monthDay: 15, weeklyTime: "19:00" }), "매달 15일 19:00");
});
