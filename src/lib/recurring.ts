import { shiftMonthKey } from "./storage";
import { emptyMonth, type MonthData, type Store } from "./types";

/** Most recent month before `key` that has any data, looking back up to 24 months. */
export function previousMonthWithData(store: Store, key: string): MonthData | null {
  for (let i = 1; i <= 24; i++) {
    const m = store[shiftMonthKey(key, -i)];
    if (m) return m;
  }
  return null;
}

/**
 * Items that repeat on their own: fixed expenses, recurring bills and every debt (its dates decide if it counts).
 * With `all`, also brings variable expenses and one-off bills.
 */
export function carryOver(prev: MonthData, all = false): Pick<MonthData, "expenses" | "bills" | "debts"> {
  return {
    expenses: prev.expenses.filter((e) => all || e.fixed).map((e) => ({ ...e, id: crypto.randomUUID() })),
    bills: prev.bills
      .filter((b) => all || b.recurring !== false)
      .map((b) => ({ ...b, id: crypto.randomUUID(), paid: false, purchases: undefined })),
    debts: prev.debts.map((d) => ({ ...d, id: crypto.randomUUID() })),
  };
}

/** A month the user has never opened, later than everything saved, starts with the carried-over items. */
export function materializeMonth(store: Store, key: string): Store {
  if (store[key]) return store;
  const keys = Object.keys(store);
  if (keys.length === 0 || keys.some((k) => k > key)) return store;
  const prev = previousMonthWithData(store, key);
  if (!prev) return store;
  const carried = carryOver(prev);
  const hasSomething =
    prev.income > 0 || prev.extraIncome > 0 || carried.expenses.length + carried.bills.length + carried.debts.length > 0;
  if (!hasSomething) return store;
  return {
    ...store,
    [key]: { ...emptyMonth(), income: prev.income, extraIncome: prev.extraIncome, goal: prev.goal, ...carried },
  };
}

/** Adds items from the previous month that aren't already here (matched by name). */
export function mergeFromPrevious(current: MonthData, prev: MonthData): MonthData {
  const carried = carryOver(prev, true);
  const missing = <T extends { name: string }>(have: T[], add: T[]) =>
    add.filter((a) => !have.some((h) => h.name.toLowerCase() === a.name.toLowerCase()));
  return {
    ...current,
    income: current.income || prev.income,
    extraIncome: current.extraIncome || prev.extraIncome,
    expenses: [...current.expenses, ...missing(current.expenses, carried.expenses)],
    bills: [...current.bills, ...missing(current.bills, carried.bills)],
    debts: [...current.debts, ...missing(current.debts, carried.debts)],
  };
}
