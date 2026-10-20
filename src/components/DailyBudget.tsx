import { dailyBudget } from "../lib/budget";
import { todayISO } from "../lib/dates";
import { formatBRL } from "../lib/finance";
import { monthKey } from "../lib/storage";
import type { MonthData } from "../lib/types";

interface Props {
  /** Month already narrowed to the installments that fall due in it. */
  month: MonthData;
  currentKey: string;
}

export function DailyBudget({ month, currentKey }: Props) {
  if (currentKey !== monthKey(new Date())) return null;
  const b = dailyBudget(month, currentKey, todayISO());
  const hasIncome = b.free + b.variableSpent > 0 || month.income + month.extraIncome > 0 || (month.incomes?.length ?? 0) > 0;

  let pace: { text: string; tone: string } | null = null;
  if (b.usedShare !== null) {
    const used = Math.round(b.usedShare * 100);
    const elapsed = Math.round(b.monthProgress * 100);
    const over = b.usedShare > b.monthProgress + 0.1;
    pace = {
      text: `O mês está em ${elapsed}% e você usou ${used}% do que sobra para o dia a dia — ${over ? "acima do ritmo" : "dentro do ritmo"}.`,
      tone: over ? "text-brick" : "text-sage-dark",
    };
  }

  const overBudget = b.remaining <= 0 && hasIncome;

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Posso gastar hoje?</p>

      {!hasIncome ? (
        <p className="text-ink-soft text-sm mt-3">Informe sua renda para calcular quanto dá para gastar por dia.</p>
      ) : overBudget ? (
        <>
          <p className="font-display font-bold text-2xl sm:text-3xl text-brick mt-3">Orçamento do mês estourado</p>
          <p className="text-sm text-ink-soft mt-1">
            Depois de contas, parcelas e gastos fixos, os gastos variáveis passaram {formatBRL(Math.abs(b.remaining))} do que sobrava.
          </p>
        </>
      ) : (
        <>
          <p className="font-display font-extrabold text-4xl tabular-nums mt-3">
            {formatBRL(b.perDay)}
            <span className="text-base font-normal text-ink-soft"> por dia</span>
          </p>
          <p className="text-sm text-ink-soft mt-1">
            Restam {formatBRL(b.remaining)} para {b.daysLeft} {b.daysLeft === 1 ? "dia" : "dias"} (contando hoje).
          </p>
          <p className="text-sm mt-3">
            Hoje você já gastou <span className="font-medium">{formatBRL(b.todaySpent)}</span>
            {b.todaySpent > b.perDay && b.perDay > 0 ? (
              <span className="text-brick"> — acima da média diária</span>
            ) : (
              b.perDay > 0 && <span className="text-sage-dark"> — ainda cabe {formatBRL(Math.max(b.perDay - b.todaySpent, 0))}</span>
            )}
          </p>
        </>
      )}

      {pace && !overBudget && <p className={`text-xs mt-3 ${pace.tone}`}>{pace.text}</p>}
      <p className="text-[11px] text-ink-faint mt-3">
        Conta: renda − faturas − parcelas − gastos fixos − gastos variáveis já lançados.
      </p>
    </section>
  );
}
