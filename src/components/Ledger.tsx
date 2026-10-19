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
    <section className="hero-card rounded-3xl shadow-warm p-6 sm:p-10 relative overflow-hidden">
      <div aria-hidden className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/10" />
      <div aria-hidden className="absolute -left-10 -bottom-16 w-40 h-40 rounded-full bg-white/5" />

      <p className="text-sm uppercase tracking-[0.14em] text-white/70 relative">Como está o mês</p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 relative">
        <span className="font-display font-extrabold text-4xl sm:text-6xl tabular-nums tracking-tight">
          {formatBRL(bal)}
        </span>
        <span className="text-white/80 text-base sm:text-lg">
          {positive ? "sobrando esse mês" : "faltando esse mês"}
        </span>
      </div>

      {delta !== null && (
        <p className="mt-2 text-sm text-white/80 relative">
          {delta >= 0 ? "↑" : "↓"} {formatBRL(Math.abs(delta))} em relação ao mês passado
        </p>
      )}

      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-6 relative">
        <div className="bg-white/15 rounded-2xl p-3 sm:p-4 min-w-0">
          <p className="text-xs uppercase tracking-wide text-white/70">Entra</p>
          <p className="font-display font-bold text-lg sm:text-2xl mt-1 text-white">{formatBRL(income)}</p>
        </div>
        <div className="bg-white/15 rounded-2xl p-3 sm:p-4 min-w-0">
          <p className="text-xs uppercase tracking-wide text-white/70">Sai</p>
          <p className="font-display font-bold text-lg sm:text-2xl mt-1 text-white">{formatBRL(out)}</p>
        </div>
      </div>
    </section>
  );
}
