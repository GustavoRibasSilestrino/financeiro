import { formatBRL, type CategorySlice } from "../lib/finance";

interface Props {
  current: CategorySlice[];
  previous: CategorySlice[];
  previousLabel: string;
}

export function CategoryCompare({ current, previous, previousLabel }: Props) {
  const prevMap = new Map(previous.map((p) => [p.category, p.amount]));
  const curMap = new Map(current.map((c) => [c.category, c.amount]));
  const categories = Array.from(new Set([...curMap.keys(), ...prevMap.keys()]));

  const rows = categories
    .map((category) => {
      const now = curMap.get(category) ?? 0;
      const before = prevMap.get(category) ?? 0;
      return { category, now, before, diff: now - before, pct: before > 0 ? ((now - before) / before) * 100 : null };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const hasPrevious = previous.length > 0;

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Comparado com o mês passado</p>
      <p className="text-ink-soft text-sm mt-1">Onde você está gastando mais ou menos que em {previousLabel}</p>

      {rows.length === 0 ? (
        <p className="text-ink-faint text-sm mt-8 mb-4">Ainda não há gastos para comparar.</p>
      ) : !hasPrevious ? (
        <p className="text-ink-faint text-sm mt-8 mb-4">Não há gastos em {previousLabel} para comparar.</p>
      ) : (
        <ul className="mt-5 divide-y divide-dashed divide-line">
          {rows.map((r) => {
            const up = r.diff > 0;
            const same = r.diff === 0;
            const tone = same ? "text-ink-soft" : up ? "text-brick" : "text-sage-dark";
            const badge =
              r.pct === null ? "novo" : same ? "igual" : `${up ? "↑" : "↓"} ${Math.abs(Math.round(r.pct))}%`;
            return (
              <li key={r.category} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.category}</p>
                  <p className="text-xs text-ink-faint tabular-nums">
                    {formatBRL(r.now)} agora · {formatBRL(r.before)} antes
                  </p>
                </div>
                <div className={`text-right shrink-0 ${tone}`}>
                  <p className="text-sm font-medium tabular-nums">{badge}</p>
                  {!same && (
                    <p className="text-xs tabular-nums">
                      {up ? "+" : "−"}
                      {formatBRL(Math.abs(r.diff))}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
