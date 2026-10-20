import { debtInfo } from "./debts";
import { shiftMonthKey } from "./storage";
import type { MonthData } from "./types";

export interface ProjectionPoint {
  key: string;
  fixed: number;
  bills: number;
  installments: number;
  committed: number;
  income: number;
  free: number;
}

export interface DebtEnding {
  name: string;
  endKey: string;
  amount: number;
}

/**
 * What is already spoken for in the coming months, using this month as the template:
 * fixed expenses and recurring bills repeat, installments follow their own schedule.
 */
export function projectMonths(month: MonthData, fromKey: string, count: number): ProjectionPoint[] {
  const fixed = month.expenses.filter((e) => e.fixed).reduce((s, e) => s + e.amount, 0);
  const bills = month.bills.filter((b) => b.recurring !== false).reduce((s, b) => s + b.amount, 0);
  const income =
    month.income +
    month.extraIncome +
    (month.incomes ?? []).filter((i) => i.recurring !== false).reduce((sum, i) => sum + i.amount, 0);

  return Array.from({ length: count }, (_, i) => {
    const key = shiftMonthKey(fromKey, i);
    const installments = month.debts
      .filter((d) => debtInfo(d, key).status === "andamento")
      .reduce((s, d) => s + d.installmentAmount, 0);
    const committed = fixed + bills + installments;
    return { key, fixed, bills, installments, committed, income, free: income - committed };
  });
}

/** Installment plans still running, soonest to finish first. */
export function debtEndings(month: MonthData, fromKey: string): DebtEnding[] {
  return month.debts
    .map((d) => ({ d, info: debtInfo(d, fromKey) }))
    .filter(({ info }) => info.status !== "finalizada")
    .map(({ d, info }) => ({ name: d.name, endKey: info.end, amount: d.installmentAmount }))
    .sort((a, b) => a.endKey.localeCompare(b.endKey));
}
