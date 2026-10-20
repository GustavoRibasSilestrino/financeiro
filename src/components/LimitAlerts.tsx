import { limitAlerts } from "../lib/limits";
import { formatBRL } from "../lib/finance";
import type { CategoryLimits, Expense } from "../lib/types";

interface Props {
  expenses: Expense[];
  limits: CategoryLimits;
}

export function LimitAlerts({ expenses, limits }: Props) {
  const alerts = limitAlerts(expenses, limits);
  if (alerts.length === 0) return null;

  return (
    <section className="bg-brick-soft rounded-3xl p-5 sm:p-6" role="alert">
      <p className="text-sm font-semibold text-ink">
        {alerts.length === 1 ? "1 categoria perto do limite" : `${alerts.length} categorias perto do limite`}
      </p>
      <ul className="mt-2 space-y-1.5">
        {alerts.map((a) => (
          <li key={a.category} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {a.category} <span className={a.over ? "text-brick font-medium" : "text-ink-soft"}>· {Math.round(a.ratio * 100)}% do limite</span>
            </span>
            <span className="tabular-nums text-ink-soft shrink-0">
              {a.over ? `passou ${formatBRL(a.spent - a.limit)}` : `restam ${formatBRL(a.limit - a.spent)}`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
