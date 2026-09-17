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

export function totalDebts(month: MonthData): number {
  return month.debts
    .filter((d) => d.paidInstallments < d.totalInstallments)
    .reduce((sum, d) => sum + d.installmentAmount, 0);
}

export function totalIncome(month: MonthData): number {
  return month.income + month.extraIncome;
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
