import { useState } from "react";
import { EditRow } from "./EditRow";
import { formatBRL } from "../lib/finance";
import type { Debt } from "../lib/types";

interface Props {
  debts: Debt[];
  onAdd: (debt: Debt) => void;
  onRemove: (id: string) => void;
  onAdvance: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Debt>) => void;
}

export function DebtsSection({ debts, onAdd, onRemove, onAdvance, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const activeDebts = debts.filter((d) => d.paidInstallments < d.totalInstallments);
  const total = activeDebts.reduce((s, d) => s + d.installmentAmount, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    const n = Number(installments) || 1;
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      installmentAmount: v,
      totalInstallments: n,
      paidInstallments: 0,
    });
    setName("");
    setAmount("");
    setInstallments("");
  }

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Dívidas e parcelamentos</p>
          <p className="text-ink-soft text-sm mt-1">O que ainda tá sendo pago aos pouquinhos</p>
        </div>
        <p className="font-display text-2xl text-brick">{formatBRL(total)}</p>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">O que é?</label>
          <input
            className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent"
            placeholder="Celular, empréstimo..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-32">
          <label className="text-xs text-ink-faint">Valor da parcela</label>
          <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
            <span className="text-ink-faint text-sm">R$</span>
            <input
              className="w-full outline-none py-1.5 bg-transparent"
              placeholder="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="w-28">
          <label className="text-xs text-ink-faint">Parcelas</label>
          <input
            className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent"
            placeholder="12"
            inputMode="numeric"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
        >
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {debts.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhuma dívida cadastrada.</li>}
        {debts.map((d) => {
          const done = d.paidInstallments >= d.totalInstallments;
          if (editingId === d.id) {
            return (
              <EditRow
                key={d.id}
                fields={[
                  { key: "name", label: "O que é?", kind: "text" },
                  { key: "amount", label: "Parcela", kind: "number", width: "w-24" },
                  { key: "total", label: "Parcelas", kind: "number", width: "w-20" },
                  { key: "paid", label: "Pagas", kind: "number", width: "w-20" },
                ]}
                initial={{ name: d.name, amount: String(d.installmentAmount), total: String(d.totalInstallments), paid: String(d.paidInstallments) }}
                onCancel={() => setEditingId(null)}
                onSave={(v) => {
                  const n = Number(String(v.amount).replace(",", "."));
                  const total = Math.max(Math.round(Number(v.total)) || 1, 1);
                  const paid = Math.min(Math.max(Math.round(Number(v.paid)) || 0, 0), total);
                  if (!String(v.name).trim() || !Number.isFinite(n) || n <= 0) return;
                  onUpdate(d.id, { name: String(v.name).trim(), installmentAmount: n, totalInstallments: total, paidInstallments: paid });
                  setEditingId(null);
                }}
              />
            );
          }
          return (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 group">
              <div className={`min-w-0 ${done ? "opacity-50" : ""}`}>
                <p className={`truncate ${done ? "line-through" : ""}`}>{d.name}</p>
                <p className="text-[11px] text-ink-faint">
                  {d.paidInstallments}/{d.totalInstallments} parcelas pagas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`tabular-nums text-ink-soft ${done ? "opacity-50" : ""}`}>
                  {formatBRL(d.installmentAmount)}
                </span>
                {!done && (
                  <button
                    onClick={() => onAdvance(d.id)}
                    className="text-[11px] text-sage-dark border border-sage/50 bg-sage-soft rounded-full px-2.5 py-1 hover:bg-sage/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    paguei essa
                  </button>
                )}
                <button
                  onClick={() => setEditingId(d.id)}
                  className="text-ink-faint opacity-60 hover:opacity-100 hover:text-rust-dark transition-opacity cursor-pointer p-1.5 -m-1.5"
                  aria-label="Editar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => onRemove(d.id)}
                  className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer p-1.5 -m-1.5 text-lg leading-none"
                  aria-label="Remover"
                >
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
