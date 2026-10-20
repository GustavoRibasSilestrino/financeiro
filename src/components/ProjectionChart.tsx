import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { monthYearLabel } from "../lib/debts";
import { formatBRL } from "../lib/finance";
import { debtEndings, projectMonths } from "../lib/projection";
import { shortLabelForMonthKey } from "../lib/storage";
import type { MonthData } from "../lib/types";

interface Props {
  month: MonthData;
  currentKey: string;
}

const MONTHS = 8;

export function ProjectionChart({ month, currentKey }: Props) {
  const points = projectMonths(month, currentKey, MONTHS).map((p) => ({ ...p, label: shortLabelForMonthKey(p.key) }));
  const endings = debtEndings(month, currentKey);
  const hasIncome = month.income + month.extraIncome > 0;
  const nothing = points.every((p) => p.committed === 0);

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Próximos meses</p>
      <p className="text-ink-soft text-sm mt-1">
        O que já está comprometido (gastos fixos, contas do mês e parcelas) e quanto sobra da sua renda
      </p>

      {nothing ? (
        <p className="text-ink-faint text-sm mt-10 mb-6">
          Cadastre gastos fixos, contas recorrentes ou parcelas para ver a projeção.
        </p>
      ) : (
        <>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(123, 108, 255, 0.1)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as (typeof points)[number];
                    return (
                      <div className="bg-card border border-line rounded-lg px-3 py-2 shadow-warm text-sm space-y-0.5">
                        <p className="font-medium">{monthYearLabel(p.key)}</p>
                        <p className="text-ink-soft">Gastos fixos {formatBRL(p.fixed)}</p>
                        <p className="text-ink-soft">Contas {formatBRL(p.bills)}</p>
                        <p className="text-ink-soft">Parcelas {formatBRL(p.installments)}</p>
                        {hasIncome && (
                          <p className={p.free >= 0 ? "text-sage-dark" : "text-brick"}>Sobra {formatBRL(p.free)}</p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="fixed" stackId="a" fill="#7b6cff" maxBarSize={36} />
                <Bar dataKey="bills" stackId="a" fill="#fbbf24" maxBarSize={36} />
                <Bar dataKey="installments" stackId="a" fill="#ff6b8a" radius={[6, 6, 0, 0]} maxBarSize={36} />
                {hasIncome && (
                  <Line
                    dataKey="income"
                    stroke="#34d399"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
            <Legend color="bg-[#7b6cff]" label="Gastos fixos" />
            <Legend color="bg-[#fbbf24]" label="Contas" />
            <Legend color="bg-[#ff6b8a]" label="Parcelas" />
            {hasIncome && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 border-t-2 border-dashed border-sage" /> Renda
              </span>
            )}
          </div>

          <ul className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {points.map((p) => (
              <li key={p.key} className="bg-paper-soft rounded-2xl px-3 py-2">
                <p className="text-[11px] text-ink-faint">{monthYearLabel(p.key)}</p>
                <p className="text-sm tabular-nums">{formatBRL(p.committed)}</p>
                {hasIncome && (
                  <p className={`text-[11px] tabular-nums ${p.free >= 0 ? "text-sage-dark" : "text-brick"}`}>
                    {p.free >= 0 ? `sobra ${formatBRL(p.free)}` : `falta ${formatBRL(-p.free)}`}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {endings.length > 0 && (
        <div className="mt-6 border-t border-dashed border-line pt-4">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Quando as parcelas terminam</p>
          <ul className="mt-2 space-y-1.5">
            {endings.map((e) => (
              <li key={e.name + e.endKey} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{e.name}</span>
                <span className="text-ink-soft shrink-0">
                  até {monthYearLabel(e.endKey)} · libera {formatBRL(e.amount)}/mês
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} /> {label}
    </span>
  );
}
