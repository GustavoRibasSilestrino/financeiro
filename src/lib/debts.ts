import { shiftMonthKey } from "./storage";
import type { Debt, MonthData } from "./types";

export type DebtStatus = "agendada" | "andamento" | "finalizada";

export interface DebtInfo {
  start: string;
  end: string;
  /** Which installment falls in the viewed month (can be <1 or >total when outside the schedule). */
  index: number;
  status: DebtStatus;
  /** Installments already settled before the viewed month. */
  paidBefore: number;
  /** Installments left counting the viewed month. */
  remaining: number;
  remainingAmount: number;
  totalAmount: number;
  isLast: boolean;
}

function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

/** Old debts only had a paid-installments counter, so their start is inferred from it. */
export function debtStart(d: Debt, key: string): string {
  return d.startMonth ?? shiftMonthKey(key, -(d.paidInstallments ?? 0));
}

export function debtInfo(d: Debt, key: string): DebtInfo {
  const start = debtStart(d, key);
  const end = shiftMonthKey(start, d.totalInstallments - 1);
  const index = monthsBetween(start, key) + 1;
  const status: DebtStatus = index < 1 ? "agendada" : index > d.totalInstallments ? "finalizada" : "andamento";
  const paidBefore = Math.min(Math.max(index - 1, 0), d.totalInstallments);
  const remaining = d.totalInstallments - paidBefore;
  return {
    start,
    end,
    index,
    status,
    paidBefore,
    remaining,
    remainingAmount: remaining * d.installmentAmount,
    totalAmount: d.totalInstallments * d.installmentAmount,
    isLast: index === d.totalInstallments,
  };
}

/** The month as far as money goes: only installments that fall due in `key` are counted. */
export function countableMonth(month: MonthData, key: string): MonthData {
  return { ...month, debts: month.debts.filter((d) => debtInfo(d, key).status === "andamento") };
}

export function monthYearLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}/${y}`;
}
