import { formatBRL } from "../lib/finance";
import { owedToMe } from "../lib/expenses";
import { shortDate } from "../lib/dates";
import type { Expense } from "../lib/types";

interface Props {
  expenses: Expense[];
  onUpdate: (id: string, patch: Partial<Expense>) => void;
}

/** Money others still owe for expenses I paid up front and split. */
export function ReceivablesCard({ expenses, onUpdate }: Props) {
  const split = expenses.filter((e) => owedToMe(e) > 0);
  const pending = split.filter((e) => !e.received);
  if (split.length === 0) return null;
  const total = pending.reduce((s, e) => s + owedToMe(e), 0);

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">A receber</p>
          <p className="text-ink-soft text-sm mt-1">O que os outros ainda te devem dos gastos divididos</p>
        </div>
        <p className={`font-display text-2xl tabular-nums ${total > 0 ? "text-sage-dark" : "text-ink-faint"}`}>{formatBRL(total)}</p>
      </div>

      <ul className="mt-5 divide-y divide-dashed divide-line">
        {split.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className={`min-w-0 ${e.received ? "opacity-50" : ""}`}>
              <p className={`truncate ${e.received ? "line-through" : ""}`}>{e.name}</p>
              <p className="text-[11px] text-ink-faint">
                {e.date ? `${shortDate(e.date)} · ` : ""}
                {formatBRL(e.splitTotal ?? 0)} dividido entre {e.splitPeople}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`tabular-nums ${e.received ? "text-ink-faint" : "text-sage-dark"}`}>{formatBRL(owedToMe(e))}</span>
              <button
                onClick={() => onUpdate(e.id, { received: !e.received })}
                className={`text-[11px] rounded-full px-2.5 py-1 border cursor-pointer transition-colors whitespace-nowrap ${
                  e.received ? "border-line text-ink-soft hover:border-rust" : "border-sage/50 bg-sage-soft text-sage-dark hover:bg-sage/20"
                }`}
              >
                {e.received ? "desfazer" : "recebi"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
