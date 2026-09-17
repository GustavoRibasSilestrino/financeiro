import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatBRL } from "../lib/finance";

export interface MonthPoint {
  key: string;
  label: string;
  balance: number;
  goal: number;
}

interface Props {
  data: MonthPoint[];
}

export function EvolutionChart({ data }: Props) {
  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-6 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Sua evolução</p>
      <p className="text-ink-soft text-sm mt-1">Quanto sobrou (ou faltou) em cada mês</p>

      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#ddd2ba" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b6156", fontSize: 12 }}
            />
            <ReferenceLine y={0} stroke="#a89d8d" />
            <Tooltip
              cursor={{ fill: "rgba(193, 98, 45, 0.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as MonthPoint;
                return (
                  <div className="bg-card border border-line rounded-lg px-3 py-2 shadow-warm text-sm">
                    <p className="font-medium">{p.label}</p>
                    <p className={p.balance >= 0 ? "text-sage-dark" : "text-brick"}>
                      {formatBRL(p.balance)}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="balance" radius={[6, 6, 6, 6]} maxBarSize={36}>
              {data.map((d) => (
                <Cell key={d.key} fill={d.balance >= 0 ? "#55725a" : "#a33f34"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
