import { formatBRL, totalIncome } from "../lib/finance";
import type { MonthData } from "../lib/types";

interface Props {
  month: MonthData;
}

/** Expenses in the "Assinaturas" category, seen as recurring monthly services. */
export function SubscriptionsCard({ month }: Props) {
  const subs = month.expenses.filter((e) => e.category === "Assinaturas").sort((a, b) => b.amount - a.amount);
  const monthly = subs.reduce((s, e) => s + e.amount, 0);
  const income = totalIncome(month);
  const share = income > 0 ? (monthly / income) * 100 : null;

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Assinaturas</p>
          <p className="text-ink-soft text-sm mt-1">
            Serviços que cobram todo mês. Lance-os na categoria “Assinaturas” e eles aparecem aqui.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-display text-2xl text-brick tabular-nums">{formatBRL(monthly)}</p>
          <p className="text-[11px] text-ink-faint">por mês</p>
        </div>
      </div>

      {subs.length === 0 ? (
        <p className="text-ink-faint text-sm mt-6">Nenhuma assinatura lançada neste mês.</p>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-dashed divide-line">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0 truncate">{s.name}</span>
                <span className="text-right shrink-0">
                  <span className="tabular-nums text-ink-soft">{formatBRL(s.amount)}</span>
                  <span className="block text-[11px] text-ink-faint tabular-nums">{formatBRL(s.amount * 12)} no ano</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 bg-paper-soft rounded-2xl px-4 py-3 text-sm">
            <p>
              Total no ano: <span className="font-medium tabular-nums">{formatBRL(monthly * 12)}</span>
            </p>
            {share !== null && (
              <p className="text-ink-soft text-xs mt-0.5">
                Isso é {share.toFixed(1).replace(".", ",")}% da sua renda do mês.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
