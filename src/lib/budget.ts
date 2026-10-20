import { totalBills, totalDebts, totalIncome } from "./finance";
import { daysInMonth } from "./storage";
import type { MonthData } from "./types";

export interface DailyBudgetInfo {
  /** Income left after bills, installments and fixed expenses: what the day-to-day can use. */
  free: number;
  variableSpent: number;
  remaining: number;
  daysLeft: number;
  perDay: number;
  todaySpent: number;
  /** Share of the month that has passed, 0-1. */
  monthProgress: number;
  /** Share of `free` already used by variable spending, 0-1+ (null when there is nothing free). */
  usedShare: number | null;
}

/** Expects a month already narrowed with countableMonth(). `today` is YYYY-MM-DD inside the month. */
export function dailyBudget(month: MonthData, key: string, today: string): DailyBudgetInfo {
  const fixed = month.expenses.filter((e) => e.fixed).reduce((s, e) => s + e.amount, 0);
  const free = totalIncome(month) - totalBills(month) - totalDebts(month) - fixed;
  const variable = month.expenses.filter((e) => !e.fixed);
  const variableSpent = variable.reduce((s, e) => s + e.amount, 0);
  const remaining = free - variableSpent;

  const days = daysInMonth(key);
  const day = Number(today.split("-")[2]);
  const daysLeft = Math.max(days - day + 1, 1);

  return {
    free,
    variableSpent,
    remaining,
    daysLeft,
    perDay: remaining > 0 ? remaining / daysLeft : 0,
    todaySpent: variable.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0),
    monthProgress: day / days,
    usedShare: free > 0 ? variableSpent / free : null,
  };
}
