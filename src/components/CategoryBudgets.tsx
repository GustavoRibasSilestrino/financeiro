import { useState } from "react";
import { formatBRL } from "../lib/finance";
import { CATEGORIES, type Category, type CategoryLimits, type Expense } from "../lib/types";

interface Props {
  expenses: Expense[];
  limits: CategoryLimits;
  onSetLimit: (category: Category, value: number) => void;
}

export function CategoryBudgets({ expenses, limits, onSetLimit }: Props) {
  const spent = (c: Category) => expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0);
  const rows = CATEGORIES.filter((c) => limits[c] || spent(c) > 0);
  const unset = CATEGORIES.filter((c) => !rows.includes(c));
  const [adding, setAdding] = useState<Category | "">("");

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Metas de gasto</p>
      <p className="text-ink-soft text-sm mt-1">Defina um limite por categoria. Ele vale também para os próximos meses.</p>

      <ul className="mt-5 space-y-5">
        {rows.map((c) => (
          <Row key={c} category={c} spent={spent(c)} limit={limits[c] ?? 0} onSetLimit={onSetLimit} />
        ))}
      </ul>

      {unset.length > 0 && (
        <div className="mt-5 flex items-center gap-2">
          <select
            value={adding}
            onChange={(e) => {
              const c = e.target.value as Category;
              setAdding("");
              if (c) onSetLimit(c, 100);
            }}
            className="bg-paper-soft rounded-full px-4 py-2 text-sm text-ink-soft outline-none cursor-pointer"
            aria-label="Adicionar meta para categoria"
          >
            <option value="">+ Adicionar meta de categoria</option>
            {unset.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}

function Row({
  category,
  spent,
  limit,
  onSetLimit,
}: {
  category: Category;
  spent: number;
  limit: number;
  onSetLimit: (category: Category, value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const ratio = limit > 0 ? spent / limit : 0;
  const tone = ratio > 1 ? "brick" : ratio >= 0.8 ? "mustard" : "sage";
  const bar = { brick: "bg-brick", mustard: "bg-mustard", sage: "bg-sage" }[tone];
  const text = { brick: "text-brick", mustard: "text-mustard", sage: "text-sage-dark" }[tone];

  function commit() {
    if (draft === null) return;
    const n = Number(draft.replace(",", "."));
    onSetLimit(category, Number.isFinite(n) && n > 0 ? n : 0);
    setDraft(null);
  }

  return (
    <li>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{category}</span>
        <label className="flex items-baseline gap-1 border-b border-line focus-within:border-rust text-sm">
          <span className="text-ink-faint">limite R$</span>
          <input
            className="bg-transparent outline-none w-20 text-right tabular-nums py-0.5"
            inputMode="decimal"
            placeholder="sem limite"
            value={draft ?? (limit > 0 ? String(limit) : "")}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          />
        </label>
      </div>

      {limit > 0 ? (
        <>
          <div
            className="mt-2 h-2.5 rounded-full bg-paper-soft overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(Math.round(ratio * 100), 100)}
            aria-label={`Gasto em ${category}`}
          >
            <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${Math.min(ratio, 1) * 100}%` }} />
          </div>
          <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs">
            <span className="text-ink-soft">
              {formatBRL(spent)} de {formatBRL(limit)} · {Math.round(ratio * 100)}%
            </span>
            <span className={`font-medium ${text}`}>
              {spent <= limit ? `restam ${formatBRL(limit - spent)}` : `passou ${formatBRL(spent - limit)}`}
            </span>
          </div>
        </>
      ) : (
        <p className="mt-1 text-xs text-ink-soft">{formatBRL(spent)} gastos · sem limite definido</p>
      )}
    </li>
  );
}
