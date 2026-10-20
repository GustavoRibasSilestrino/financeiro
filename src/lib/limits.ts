import { CATEGORIES, type Category, type CategoryLimits, type Expense } from "./types";

export const LIMIT_WARNING = 0.8;

export interface LimitAlert {
  category: Category;
  spent: number;
  limit: number;
  ratio: number;
  over: boolean;
}

/** Categories that used at least 80% of their limit, the most used first. */
export function limitAlerts(expenses: Expense[], limits: CategoryLimits): LimitAlert[] {
  return CATEGORIES.flatMap((category) => {
    const limit = limits[category] ?? 0;
    if (limit <= 0) return [];
    const spent = expenses.filter((e) => e.category === category).reduce((s, e) => s + e.amount, 0);
    const ratio = spent / limit;
    return ratio >= LIMIT_WARNING ? [{ category, spent, limit, ratio, over: ratio > 1 }] : [];
  }).sort((a, b) => b.ratio - a.ratio);
}
