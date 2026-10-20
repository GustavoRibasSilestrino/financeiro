import { useState } from "react";
import { monthYearLabel } from "../lib/debts";
import { formatBRL } from "../lib/finance";
import { monthKey } from "../lib/storage";
import type { Objective } from "../lib/types";
import { EditRow } from "./EditRow";

interface Props {
  objectives: Objective[];
  currentKey: string;
  onChange: (objectives: Objective[]) => void;
}

const field = "w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent";

/** Months from the viewed month to the deadline, counting both ends. */
function monthsLeft(from: string, deadline: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [dy, dm] = deadline.split("-").map(Number);
  return (dy - fy) * 12 + (dm - fm) + 1;
}

export function ObjectivesSection({ objectives, currentKey, onChange }: Props) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState<Record<string, string>>({});

  // the plan is measured from the real current month, never from a past month being browsed
  const from = currentKey > monthKey(new Date()) ? currentKey : monthKey(new Date());

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = Number(target.replace(",", "."));
    if (!name.trim() || !Number.isFinite(t) || t <= 0) return;
    onChange([
      ...objectives,
      { id: crypto.randomUUID(), name: name.trim(), target: t, saved: 0, deadline: /^\d{4}-\d{2}$/.test(deadline) ? deadline : undefined },
    ]);
    setName("");
    setTarget("");
    setDeadline("");
  }

  function contribute(o: Objective) {
    const v = Number((adding[o.id] ?? "").replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) return;
    onChange(objectives.map((x) => (x.id === o.id ? { ...x, saved: Math.round((x.saved + v) * 100) / 100 } : x)));
    setAdding((a) => ({ ...a, [o.id]: "" }));
  }

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Objetivos</p>
      <p className="text-ink-soft text-sm mt-1">Viagem, carro, entrada do apartamento... quanto guardar por mês para chegar lá</p>

      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">Objetivo</label>
          <input className={field} placeholder="Viagem, notebook..." value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-32">
          <label className="text-xs text-ink-faint">Quanto preciso</label>
          <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
            <span className="text-ink-faint text-sm">R$</span>
            <input className="w-full outline-none py-1.5 bg-transparent" placeholder="0" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
        </div>
        <div className="w-40">
          <label className="text-xs text-ink-faint">Até (opcional)</label>
          <input type="month" className={field} min={from} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <button type="submit" className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {objectives.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhum objetivo ainda.</li>}
        {objectives.map((o) => {
          if (editingId === o.id) {
            return (
              <EditRow
                key={o.id}
                fields={[
                  { key: "name", label: "Objetivo", kind: "text" },
                  { key: "target", label: "Quanto preciso", kind: "number", width: "w-28" },
                  { key: "saved", label: "Já guardei", kind: "number", width: "w-28" },
                  { key: "deadline", label: "Até", kind: "month", width: "w-40" },
                ]}
                initial={{ name: o.name, target: String(o.target), saved: String(o.saved), deadline: o.deadline ?? "" }}
                onCancel={() => setEditingId(null)}
                onSave={(v) => {
                  const t = Number(String(v.target).replace(",", "."));
                  const s = Number(String(v.saved).replace(",", ".")) || 0;
                  if (!String(v.name).trim() || !Number.isFinite(t) || t <= 0 || s < 0) return;
                  onChange(
                    objectives.map((x) =>
                      x.id === o.id
                        ? { ...x, name: String(v.name).trim(), target: t, saved: s, deadline: /^\d{4}-\d{2}$/.test(String(v.deadline)) ? String(v.deadline) : undefined }
                        : x
                    )
                  );
                  setEditingId(null);
                }}
              />
            );
          }

          const ratio = Math.min(o.saved / o.target, 1);
          const missing = Math.max(o.target - o.saved, 0);
          const left = o.deadline ? monthsLeft(from, o.deadline) : null;
          let plan = "";
          if (missing === 0) plan = "Objetivo concluído! 🎉";
          else if (left === null) plan = "Sem prazo definido.";
          else if (left <= 0) plan = `O prazo (${monthYearLabel(o.deadline!)}) já passou e faltam ${formatBRL(missing)}.`;
          else plan = `Guarde ${formatBRL(missing / left)} por mês durante ${left} ${left === 1 ? "mês" : "meses"} (até ${monthYearLabel(o.deadline!)}).`;

          return (
            <li key={o.id} className="py-4 group">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.name}</p>
                  <p className="text-xs text-ink-faint tabular-nums">
                    {formatBRL(o.saved)} de {formatBRL(o.target)} · {Math.round(ratio * 100)}%
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditingId(o.id)} className="text-ink-faint opacity-60 hover:opacity-100 hover:text-rust-dark transition-opacity cursor-pointer p-1.5 -m-1.5" aria-label="Editar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => window.confirm(`Remover o objetivo "${o.name}"?`) && onChange(objectives.filter((x) => x.id !== o.id))}
                    className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer p-1.5 -m-1.5 text-lg leading-none"
                    aria-label="Remover"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div
                className="mt-3 h-2.5 rounded-full bg-paper-soft overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ratio * 100)}
                aria-label={`Progresso de ${o.name}`}
              >
                <div className="h-full rounded-full bg-sage transition-all duration-500" style={{ width: `${ratio * 100}%` }} />
              </div>
              <p className="mt-2 text-sm text-ink-soft">{plan}</p>

              {missing > 0 && (
                <form
                  className="mt-2 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    contribute(o);
                  }}
                >
                  <div className="w-28 flex items-baseline gap-1 border-b border-line focus-within:border-rust">
                    <span className="text-ink-faint text-xs">R$</span>
                    <input
                      className="w-full outline-none py-1 bg-transparent text-sm"
                      inputMode="decimal"
                      placeholder="0"
                      aria-label={`Valor guardado em ${o.name}`}
                      value={adding[o.id] ?? ""}
                      onChange={(e) => setAdding((a) => ({ ...a, [o.id]: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="text-xs border border-line text-ink-soft hover:border-rust hover:text-rust-dark px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                    guardei
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
