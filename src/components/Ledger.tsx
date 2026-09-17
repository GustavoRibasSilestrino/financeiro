import { balance, formatBRL, totalIncome, totalOut } from "../lib/finance";
import type { MonthData } from "../lib/types";

interface Props {
  month: MonthData;
  previousBalance: number | null;
}

export function Ledger({ month, previousBalance }: Props) {
  const income = totalIncome(month);
  const out = totalOut(month);
  const bal = balance(month);
  const positive = bal >= 0;

  const delta = previousBalance !== null ? bal - previousBalance : null;

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-8 sm:p-10 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-40"
        style={{ background: positive ? "var(--color-sage-soft)" : "var(--color-brick-soft)" }}
      />

      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint relative">Como está o mês</p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 relative">
        <span className="font-display text-5xl sm:text-6xl tabular-nums" style={{ color: positive ? "var(--color-sage-dark)" : "var(--color-brick)" }}>
          {formatBRL(bal)}
        </span>
        <span className="text-ink-soft text-lg">
          {positive ? "sobrando esse mês" : "faltando esse mês"}
        </span>
      </div>

      {delta !== null && (
        <p className="mt-2 text-sm text-ink-soft relative">
          {delta >= 0 ? "↑" : "↓"} {formatBRL(Math.abs(delta))} em relação ao mês passado
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 gap-6 relative">
        <div className="border-t border-dashed border-line pt-3">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Entra</p>
          <p className="font-display text-2xl mt-1 text-sage-dark">{formatBRL(income)}</p>
        </div>
        <div className="border-t border-dashed border-line pt-3">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Sai (gastos + faturas + dívidas)</p>
          <p className="font-display text-2xl mt-1 text-brick">{formatBRL(out)}</p>
        </div>
      </div>
    </section>
  );
}
