import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatBRL, type CategorySlice } from "../lib/finance";

const PALETTE = [
  "#c1622d",
  "#55725a",
  "#c8912f",
  "#a33f34",
  "#8a7a9c",
  "#4f7d8c",
  "#b98d5e",
  "#7c8a5e",
];

interface Props {
  data: CategorySlice[];
}

export function CategoryChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-6 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Pra onde foi o dinheiro</p>
      <p className="text-ink-soft text-sm mt-1">Gastos, faturas e dívidas deste mês</p>

      {total === 0 ? (
        <p className="text-ink-faint text-sm mt-10 mb-10">Ainda não há nada lançado este mês.</p>
      ) : (
        <div className="mt-4 flex items-center gap-6 flex-wrap">
          <div className="w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="#f7f2e7"
                  strokeWidth={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as CategorySlice;
                    return (
                      <div className="bg-card border border-line rounded-lg px-3 py-2 shadow-warm text-sm">
                        <p className="font-medium">{p.category}</p>
                        <p className="text-ink-soft">{formatBRL(p.amount)}</p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex-1 min-w-[160px] space-y-2">
            {data.map((d, i) => (
              <li key={d.category} className="flex items-center justify-between text-sm gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  {d.category}
                </span>
                <span className="text-ink-soft tabular-nums">
                  {formatBRL(d.amount)}
                  <span className="text-ink-faint"> · {Math.round((d.amount / total) * 100)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
