import { useEffect, useState } from "react";
import { formatBRL } from "../lib/finance";
import type { MonthData } from "../lib/types";

interface Props {
  month: MonthData;
  onChange: (income: number, extraIncome: number) => void;
}

export function IncomeCard({ month, onChange }: Props) {
  const [income, setIncome] = useState(String(month.income || ""));
  const [extra, setExtra] = useState(String(month.extraIncome || ""));

  useEffect(() => {
    setIncome(String(month.income || ""));
    setExtra(String(month.extraIncome || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month.income, month.extraIncome]);

  function commit(nextIncome: string, nextExtra: string) {
    const i = Number(nextIncome.replace(",", "."));
    const e = Number(nextExtra.replace(",", "."));
    onChange(Number.isFinite(i) && i >= 0 ? i : 0, Number.isFinite(e) && e >= 0 ? e : 0);
  }

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-6 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Quanto entra</p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="min-w-0">
          <label className="text-sm text-ink-soft">Salário / renda fixa</label>
          <div className="flex items-baseline gap-1.5 mt-1 border-b border-line focus-within:border-rust">
            <span className="text-ink-faint text-sm">R$</span>
            <input
              className="font-display text-2xl bg-transparent outline-none w-full min-w-0 py-1"
              value={income}
              inputMode="decimal"
              placeholder="0"
              onChange={(e) => setIncome(e.target.value)}
              onBlur={() => commit(income, extra)}
            />
          </div>
        </div>
        <div className="min-w-0">
          <label className="text-sm text-ink-soft">Extras (bicos, bônus...)</label>
          <div className="flex items-baseline gap-1.5 mt-1 border-b border-line focus-within:border-rust">
            <span className="text-ink-faint text-sm">R$</span>
            <input
              className="font-display text-2xl bg-transparent outline-none w-full min-w-0 py-1"
              value={extra}
              inputMode="decimal"
              placeholder="0"
              onChange={(e) => setExtra(e.target.value)}
              onBlur={() => commit(income, extra)}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-ink-soft mt-5">
        Total no bolso:{" "}
        <span className="text-ink font-medium">
          {formatBRL((Number(income.replace(",", ".")) || 0) + (Number(extra.replace(",", ".")) || 0))}
        </span>
      </p>
    </section>
  );
}
