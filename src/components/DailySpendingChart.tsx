import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatBRL } from "../lib/finance";
import { daysInMonth } from "../lib/storage";
import type { Expense } from "../lib/types";

interface Props {
  expenses: Expense[];
  currentKey: string;
}

export function DailySpendingChart({ expenses, currentKey }: Props) {
  const days = daysInMonth(currentKey);
  const perDay = Array.from({ length: days }, (_, i) => ({ day: i + 1, total: 0 }));
  let dated = 0;
  for (const e of expenses) {
    if (!e.date?.startsWith(currentKey)) continue;
    const d = Number(e.date.split("-")[2]);
    if (d >= 1 && d <= days) {
      perDay[d - 1].total += e.amount;
      dated++;
    }
  }
  const peak = perDay.reduce((best, p) => (p.total > best.total ? p : best), perDay[0]);
  const undated = expenses.length - dated;

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Gastos por dia</p>
      <p className="text-ink-soft text-sm mt-1">
        Quanto saiu em cada dia do mês
        {peak.total > 0 && <> · maior gasto no dia {peak.day} ({formatBRL(peak.total)})</>}
      </p>

      {dated === 0 ? (
        <p className="text-ink-faint text-sm mt-8 mb-4">Nenhum gasto com data neste mês ainda.</p>
      ) : (
        <div className="mt-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perDay} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="4 4" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} interval={2} tick={{ fill: "var(--color-ink-soft)", fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: "rgba(123, 108, 255, 0.1)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0].payload as { day: number; total: number };
                  return (
                    <div className="bg-card border border-line rounded-lg px-3 py-2 shadow-warm text-sm">
                      <p className="font-medium">Dia {p.day}</p>
                      <p className="text-ink-soft">{formatBRL(p.total)}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="total" fill="#7b6cff" radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {undated > 0 && dated > 0 && (
        <p className="text-xs text-ink-faint mt-2">
          {undated} {undated === 1 ? "gasto sem data não aparece" : "gastos sem data não aparecem"} aqui.
        </p>
      )}
    </section>
  );
}
