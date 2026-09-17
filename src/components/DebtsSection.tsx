import { useState } from "react";
import { formatBRL } from "../lib/finance";
import type { Debt } from "../lib/types";

interface Props {
  debts: Debt[];
  onAdd: (debt: Debt) => void;
  onRemove: (id: string) => void;
  onAdvance: (id: string) => void;
}

export function DebtsSection({ debts, onAdd, onRemove, onAdvance }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("");

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
    <section className="bg-card border border-line rounded-2xl shadow-warm p-6 sm:p-8">
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
          className="text-sm bg-rust text-paper px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
        >
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {debts.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhuma dívida cadastrada.</li>}
        {debts.map((d) => {
          const done = d.paidInstallments >= d.totalInstallments;
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
