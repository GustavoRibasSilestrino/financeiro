import { daysInMonth } from "./storage";
import type { Expense } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** All dates in `key` (YYYY-MM) that fall on `weekday` (0 = Sunday), from `fromDay` on. */
export function weekdayDates(key: string, weekday: number, fromDay = 1): string[] {
  const [y, m] = key.split("-").map(Number);
  const out: string[] = [];
  for (let day = fromDay; day <= daysInMonth(key); day++) {
    if (new Date(y, m - 1, day).getDay() === weekday) out.push(`${key}-${pad(day)}`);
  }
  return out;
}

export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** One expense per week from the chosen date until the end of its month, all in the same series. */
export function weeklySeries(base: Omit<Expense, "id">, startISO: string): Expense[] {
  const key = startISO.slice(0, 7);
  const group = crypto.randomUUID();
  return weekdayDates(key, weekdayOf(startISO), Number(startISO.split("-")[2])).map((date) => ({
    ...base,
    id: crypto.randomUUID(),
    date,
    weeklyGroup: group,
    fixed: true,
  }));
}

/** The same weekly series rebuilt for another month, from one occurrence of the old one. */
export function weeklySeriesIn(template: Expense, key: string): Expense[] {
  if (!template.date) return [];
  const { id: _id, date: _date, hasReceipt: _r, received: _rc, ...rest } = template;
  const group = crypto.randomUUID();
  return weekdayDates(key, weekdayOf(template.date)).map((date) => ({
    ...rest,
    id: crypto.randomUUID(),
    date,
    weeklyGroup: group,
  }));
}

/** My part of a bill paid by `people` (including me), rounded to cents. */
export function splitShare(total: number, people: number): number {
  return Math.round((total / people) * 100) / 100;
}

/** What the others still owe me for an expense I split and paid up front. */
export function owedToMe(e: Expense): number {
  if (!e.splitTotal || !e.splitPeople || e.splitPeople < 2) return 0;
  return Math.round((e.splitTotal - e.amount) * 100) / 100;
}
