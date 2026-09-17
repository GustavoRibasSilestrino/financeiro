import { formatBRL } from "../lib/finance";

export interface GoalPoint {
  key: string;
  label: string;
  goal: number;
  balance: number;
}

interface Props {
  data: GoalPoint[];
}

export function GoalsHistory({ data }: Props) {
  const withGoal = data.filter((d) => d.goal > 0);

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Histórico de metas</p>
      <p className="text-ink-soft text-sm mt-1">Como você foi nos últimos meses</p>

      {withGoal.length === 0 ? (
        <p className="text-ink-faint text-sm mt-6">
          Ainda sem metas nos meses passados. Defina uma pra começar a acompanhar.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-dashed divide-line">
          {withGoal.map((d) => {
            const hit = d.balance >= d.goal;
            const pct = Math.round((Math.max(d.balance, 0) / d.goal) * 100);
            return (
              <li key={d.key} className="py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className={hit ? "text-sage-dark" : "text-ink-soft"}>
                    {formatBRL(Math.max(d.balance, 0))} de {formatBRL(d.goal)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-paper-soft overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.max(pct, 3), 100)}%`,
                      background: hit ? "#55725a" : "#c8912f",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
