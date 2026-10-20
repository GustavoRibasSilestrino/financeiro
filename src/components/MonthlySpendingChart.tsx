import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatBRL } from "../lib/finance";
import type { MonthPoint } from "./EvolutionChart";

interface Props {
  data: MonthPoint[];
}

export function MonthlySpendingChart({ data }: Props) {
  const empty = data.every((d) => d.spent === 0 && d.income === 0);
  const avg = data.filter((d) => d.spent > 0);
  const average = avg.length ? avg.reduce((s, d) => s + d.spent, 0) / avg.length : 0;

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Gastos por mês</p>
      <p className="text-ink-soft text-sm mt-1">
        Quanto saiu em cada mês, comparado com o que entrou
        {average > 0 && <> · média de {formatBRL(average)}</>}
      </p>

      {empty ? (
        <p className="text-ink-faint text-sm mt-10 mb-10">Ainda não há nada lançado nesses meses.</p>
      ) : (
        <>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(109, 93, 252, 0.08)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as MonthPoint;
                    return (
                      <div className="bg-card border border-line rounded-lg px-3 py-2 shadow-warm text-sm">
                        <p className="font-medium">{p.label}</p>
                        <p className="text-brick">Gastou {formatBRL(p.spent)}</p>
                        <p className="text-sage-dark">Entrou {formatBRL(p.income)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="spent" fill="#6d5dfc" radius={[6, 6, 6, 6]} maxBarSize={36} />
                <Line
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-5 text-xs text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rust" /> Gastos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-sage" /> Renda
            </span>
          </div>
        </>
      )}
    </section>
  );
}
