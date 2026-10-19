import { formatBRL, totalIncome, totalOut } from "../lib/finance";
import type { MonthData } from "../lib/types";

interface Props {
  month: MonthData;
}

export function SpendingBar({ month }: Props) {
  const income = totalIncome(month);
  const out = totalOut(month);
  const ratio = income > 0 ? out / income : out > 0 ? 1 : 0;
  const pct = Math.round(ratio * 100);
  const width = Math.min(ratio, 1) * 100;

  const tone = ratio > 1 ? "brick" : ratio >= 0.8 ? "mustard" : "sage";
  const barColor = { brick: "bg-brick", mustard: "bg-mustard", sage: "bg-sage" }[tone];
  const textColor = { brick: "text-brick", mustard: "text-mustard", sage: "text-sage-dark" }[tone];

  const left = income - out;
  let status: string;
  if (income <= 0) status = "Informe sua renda para ver quanto já foi gasto.";
  else if (left >= 0) status = `Ainda dá pra gastar ${formatBRL(left)}`;
  else status = `Passou ${formatBRL(Math.abs(left))} da renda`;

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Quanto já gastei</p>
        <span className={`font-display font-bold text-xl tabular-nums ${textColor}`}>{income > 0 ? `${pct}%` : "—"}</span>
      </div>

      <div
        className="mt-4 h-3.5 rounded-full bg-paper-soft overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(pct, 100)}
        aria-label="Porcentagem da renda já gasta"
      >
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${width}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
        <span className="text-ink-soft">
          Gasto <span className="text-ink font-medium">{formatBRL(out)}</span> de{" "}
          <span className="text-ink font-medium">{formatBRL(income)}</span>
        </span>
        <span className={`font-medium ${textColor}`}>{status}</span>
      </div>
    </section>
  );
}
