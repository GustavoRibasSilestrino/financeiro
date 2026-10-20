import { emptyMonth, type CategoryLimits, type MonthData, type Store } from "./types";

const STORAGE_KEY = "ninho.store.v1";

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return migrateDebts(JSON.parse(raw) as Store);
  } catch {
    return {};
  }
}

export function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

export function labelForMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shortLabelForMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "short" });
  return label.replace(".", "").charAt(0).toUpperCase() + label.replace(".", "").slice(1);
}

export function getMonth(store: Store, key: string): MonthData {
  return store[key] ?? emptyMonth();
}

export function daysInMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function firstWeekdayOfMonth(key: string): number {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}

/** Limits set for this month, or inherited from the most recent earlier month that has any. */
export function effectiveCategoryLimits(store: Store, key: string): CategoryLimits {
  for (let i = 0; i <= 24; i++) {
    const limits = store[shiftMonthKey(key, -i)]?.categoryLimits;
    if (limits && Object.keys(limits).length > 0) return limits;
  }
  return {};
}

/** Debts saved before start dates existed get one, inferred from how many installments were paid. */
function migrateDebts(store: Store): Store {
  for (const [key, month] of Object.entries(store)) {
    for (const d of month.debts ?? []) {
      if (!d.startMonth) d.startMonth = shiftMonthKey(key, -(d.paidInstallments ?? 0));
    }
  }
  return store;
}

/** Latest emergency-fund figures at or before this month. */
export function effectiveReserve(store: Store, key: string): { saved: number; months: number } {
  let saved: number | undefined;
  let months: number | undefined;
  for (let i = 0; i <= 24 && (saved === undefined || months === undefined); i++) {
    const m = store[shiftMonthKey(key, -i)];
    if (saved === undefined && m?.reserveSaved !== undefined) saved = m.reserveSaved;
    if (months === undefined && m?.reserveMonths !== undefined) months = m.reserveMonths;
  }
  return { saved: saved ?? 0, months: months ?? 6 };
}
