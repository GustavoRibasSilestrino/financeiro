import type { MonthData } from "./types";

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });
}

export function totalExpenses(month: MonthData): number {
  return month.expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function totalBills(month: MonthData): number {
  return month.bills.reduce((sum, b) => sum + b.amount, 0);
}

/** Expects a month already narrowed with countableMonth(), so only installments due this month are summed. */
export function totalDebts(month: MonthData): number {
  return month.debts.reduce((sum, d) => sum + d.installmentAmount, 0);
}

export function totalIncome(month: MonthData): number {
  return month.income + month.extraIncome + (month.incomes ?? []).reduce((sum, i) => sum + i.amount, 0);
}

export function totalOut(month: MonthData): number {
  return totalExpenses(month) + totalBills(month) + totalDebts(month);
}

export function balance(month: MonthData): number {
  return totalIncome(month) - totalOut(month);
}

export function goalProgress(month: MonthData): number {
  if (month.goal <= 0) return 0;
  return Math.max(0, Math.min(1, balance(month) / month.goal));
}

export interface CategorySlice {
  category: string;
  amount: number;
}

export function expensesByCategory(month: MonthData): CategorySlice[] {
  const map = new Map<string, number>();
  for (const e of month.expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
  }
  if (totalBills(month) > 0) map.set("Faturas", totalBills(month));
  if (totalDebts(month) > 0) map.set("Dívidas", totalDebts(month));
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface CategoryItem {
  id: string;
  name: string;
  amount: number;
  date?: string;
}

/** The individual entries behind each slice of expensesByCategory(). */
export function itemsByCategory(month: MonthData): Record<string, CategoryItem[]> {
  const out: Record<string, CategoryItem[]> = {};
  for (const e of month.expenses) {
    (out[e.category] ??= []).push({ id: e.id, name: e.name, amount: e.amount, date: e.date });
  }
  if (month.bills.length) out["Faturas"] = month.bills.map((b) => ({ id: b.id, name: b.name, amount: b.amount }));
  if (month.debts.length) out["Dívidas"] = month.debts.map((d) => ({ id: d.id, name: d.name, amount: d.installmentAmount }));
  for (const list of Object.values(out)) list.sort((a, b) => b.amount - a.amount);
  return out;
}
