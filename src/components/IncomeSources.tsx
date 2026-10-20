import { useState } from "react";
import { formatBRL } from "../lib/finance";
import type { IncomeSource } from "../lib/types";
import { EditRow } from "./EditRow";

interface Props {
  incomes: IncomeSource[];
  onChange: (incomes: IncomeSource[]) => void;
}

const field = "w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent";

export function IncomeSources({ incomes, onChange }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("");
  const [recurring, setRecurring] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const total = incomes.reduce((s, i) => s + i.amount, 0);
  const sorted = [...incomes].sort((a, b) => a.day - b.day);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    const d = Math.min(Math.max(Math.round(Number(day)) || 1, 1), 31);
    onChange([...incomes, { id: crypto.randomUUID(), name: name.trim(), amount: v, day: d, recurring }]);
    setName("");
    setAmount("");
    setDay("");
  }

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Outras entradas</p>
          <p className="text-ink-soft text-sm mt-1">Freelas, aluguel recebido, pensão... com o dia em que caem</p>
        </div>
        <p className="font-display text-2xl text-sage-dark">{formatBRL(total)}</p>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">De onde vem?</label>
          <input className={field} placeholder="Freela, aluguel..." value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-28">
          <label className="text-xs text-ink-faint">Valor</label>
          <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
            <span className="text-ink-faint text-sm">R$</span>
            <input className="w-full outline-none py-1.5 bg-transparent" placeholder="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="w-20">
          <label className="text-xs text-ink-faint">Cai dia</label>
          <input className={field} placeholder="5" inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-soft pb-1.5 cursor-pointer">
          <input type="checkbox" className="stamp-checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          todo mês
        </label>
        <button type="submit" className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {incomes.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhuma entrada extra cadastrada.</li>}
        {sorted.map((i) =>
          editingId === i.id ? (
            <EditRow
              key={i.id}
              fields={[
                { key: "name", label: "De onde vem?", kind: "text" },
                { key: "amount", label: "Valor", kind: "number", width: "w-24" },
                { key: "day", label: "Cai dia", kind: "number", width: "w-20" },
                { key: "recurring", label: "todo mês", kind: "check" },
              ]}
              initial={{ name: i.name, amount: String(i.amount), day: String(i.day), recurring: i.recurring !== false }}
              onCancel={() => setEditingId(null)}
              onSave={(v) => {
                const n = Number(String(v.amount).replace(",", "."));
                const d = Math.min(Math.max(Math.round(Number(v.day)) || 1, 1), 31);
                if (!String(v.name).trim() || !Number.isFinite(n) || n <= 0) return;
                onChange(incomes.map((x) => (x.id === i.id ? { ...x, name: String(v.name).trim(), amount: n, day: d, recurring: v.recurring === true } : x)));
                setEditingId(null);
              }}
            />
          ) : (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-3 group">
              <div className="min-w-0">
                <p className="truncate">{i.name}</p>
                <p className="text-[11px] text-ink-faint">
                  cai dia {i.day}
                  {i.recurring !== false ? " · todo mês" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-sage-dark">{formatBRL(i.amount)}</span>
                <button onClick={() => setEditingId(i.id)} className="text-ink-faint opacity-60 hover:opacity-100 hover:text-rust-dark transition-opacity cursor-pointer p-1.5 -m-1.5" aria-label="Editar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                </button>
                <button onClick={() => onChange(incomes.filter((x) => x.id !== i.id))} className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer p-1.5 -m-1.5 text-lg leading-none" aria-label="Remover">
                  ×
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </section>
  );
}
