import { formatBRL } from "../lib/finance";
import { daysInMonth, monthKey } from "../lib/storage";
import type { Bill } from "../lib/types";

interface Props {
  currentKey: string;
  bills: Bill[];
}

const WINDOW_DAYS = 3;

export function DueAlerts({ currentKey, bills }: Props) {
  const now = new Date();
  if (currentKey !== monthKey(now)) return null;

  const today = now.getDate();
  const last = daysInMonth(currentKey);
  const pending = bills
    .filter((b) => !b.paid)
    .map((b) => ({ bill: b, diff: Math.min(Math.max(b.dueDay, 1), last) - today }))
    .filter((x) => x.diff <= WINDOW_DAYS)
    .sort((a, b) => a.diff - b.diff);

  if (pending.length === 0) return null;

  const label = (diff: number) =>
    diff < 0 ? `venceu há ${-diff} ${-diff === 1 ? "dia" : "dias"}` : diff === 0 ? "vence hoje" : diff === 1 ? "vence amanhã" : `vence em ${diff} dias`;

  return (
    <section className="bg-mustard-soft rounded-3xl p-5 sm:p-6" role="alert">
      <p className="text-sm font-semibold text-ink">
        {pending.length === 1 ? "1 conta precisa de atenção" : `${pending.length} contas precisam de atenção`}
      </p>
      <ul className="mt-2 space-y-1.5">
        {pending.map(({ bill, diff }) => (
          <li key={bill.id} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {bill.name} <span className={diff < 0 ? "text-brick font-medium" : "text-ink-soft"}>· {label(diff)}</span>
            </span>
            <span className="tabular-nums text-ink-soft shrink-0">{formatBRL(bill.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
