import { useState } from "react";
import { balance, formatBRL, goalProgress } from "../lib/finance";
import type { MonthData } from "../lib/types";

interface Props {
  month: MonthData;
  onSetGoal: (goal: number) => void;
}

export function GoalTracker({ month, onSetGoal }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(month.goal || ""));
  const progress = goalProgress(month);
  const bal = balance(month);
  const pct = Math.round(progress * 100);

  function save() {
    const v = Number(draft.replace(",", "."));
    onSetGoal(Number.isFinite(v) && v >= 0 ? v : 0);
    setEditing(false);
  }

  let statusText: string;
  if (bal <= 0) {
    statusText = "ainda não tem sobra este mês";
  } else if (pct >= 100) {
    statusText = `Meta batida! Guardando ${formatBRL(bal)}`;
  } else {
    statusText = `${pct}% da meta, faltam ${formatBRL(Math.max(month.goal - bal, 0))}`;
  }

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-8 flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Meta do mês</p>
        {!editing && (
          <button
            onClick={() => {
              setDraft(String(month.goal || ""));
              setEditing(true);
            }}
            className="text-xs text-rust-dark hover:underline cursor-pointer"
          >
            {month.goal ? "editar" : "definir"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-ink-soft">R$</span>
          <input
            autoFocus
            className="font-display text-2xl bg-transparent border-b border-line focus:border-rust outline-none w-full py-1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="0"
            inputMode="decimal"
          />
          <button onClick={save} className="text-sm bg-rust text-paper px-3 py-1.5 rounded-full hover:bg-rust-dark transition-colors cursor-pointer whitespace-nowrap">
            salvar
          </button>
        </div>
      ) : month.goal ? (
        <>
          <p className="font-display text-3xl mt-3">{formatBRL(month.goal)}</p>
          <p className="text-sm text-ink-soft mt-1">quero guardar esse tanto</p>

          <div className="mt-6">
            <div className="h-3 rounded-full bg-paper-soft overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, bal > 0 ? 4 : 0)}%`,
                  background: pct >= 100 ? "var(--color-sage)" : "var(--color-mustard)",
                }}
              />
            </div>
            <p className="text-sm text-ink-soft mt-2">{statusText}</p>
          </div>
        </>
      ) : (
        <p className="text-ink-soft mt-4 text-sm">
          Sem meta definida ainda. Que tal escolher quanto você quer guardar esse mês?
        </p>
      )}
    </section>
  );
}
