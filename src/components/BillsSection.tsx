import { useState } from "react";
import { formatBRL } from "../lib/finance";
import type { Bill } from "../lib/types";

interface Props {
  bills: Bill[];
  onAdd: (bill: Bill) => void;
  onRemove: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export function BillsSection({ bills, onAdd, onRemove, onTogglePaid }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");

  const total = bills.reduce((s, b) => s + b.amount, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    const d = Number(dueDay) || 1;
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), amount: v, dueDay: d, paid: false });
    setName("");
    setAmount("");
    setDueDay("");
  }

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Faturas e contas</p>
          <p className="text-ink-soft text-sm mt-1">Cartão de crédito, luz, água, internet...</p>
        </div>
        <p className="font-display text-2xl text-brick">{formatBRL(total)}</p>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">Qual conta?</label>
          <input
            className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent"
            placeholder="Cartão Nubank, energia..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-ink-faint">Valor</label>
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
        <div className="w-24">
          <label className="text-xs text-ink-faint">Vence dia</label>
          <input
            className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent"
            placeholder="10"
            inputMode="numeric"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="text-sm bg-rust text-paper px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
        >
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {bills.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhuma fatura por aqui.</li>}
        {bills.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3 group">
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                className="stamp-checkbox shrink-0"
                checked={b.paid}
                onChange={() => onTogglePaid(b.id)}
                aria-label="Marcar como paga"
              />
              <div className={`min-w-0 ${b.paid ? "opacity-50" : ""}`}>
                <p className={`truncate ${b.paid ? "line-through" : ""}`}>{b.name}</p>
                <p className="text-[11px] text-ink-faint">vence dia {b.dueDay}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`tabular-nums text-ink-soft ${b.paid ? "opacity-50" : ""}`}>
                {formatBRL(b.amount)}
              </span>
              <button
                onClick={() => onRemove(b.id)}
                className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer p-1.5 -m-1.5 text-lg leading-none"
                aria-label="Remover"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
