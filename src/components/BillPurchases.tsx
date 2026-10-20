import { useState } from "react";
import { formatBRL } from "../lib/finance";
import type { Purchase } from "../lib/types";

interface Props {
  purchases: Purchase[];
  onChange: (purchases: Purchase[]) => void;
}

export function BillPurchases({ purchases, onChange }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onChange([...purchases, { id: crypto.randomUUID(), name: name.trim(), amount: v }]);
    setName("");
    setAmount("");
  }

  return (
    <div className="basis-full mt-2 bg-paper-soft rounded-2xl p-3 sm:p-4">
      {purchases.length === 0 ? (
        <p className="text-xs text-ink-soft">
          Lance as compras desta fatura e o valor total passa a ser a soma delas.
        </p>
      ) : (
        <ul className="divide-y divide-dashed divide-line">
          {purchases.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
              <span className="min-w-0 truncate">{p.name}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="tabular-nums text-ink-soft">{formatBRL(p.amount)}</span>
                <button
                  type="button"
                  onClick={() => onChange(purchases.filter((x) => x.id !== p.id))}
                  className="text-ink-faint hover:text-brick cursor-pointer text-lg leading-none"
                  aria-label={`Remover ${p.name}`}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2">
        <input
          className="flex-1 min-w-[110px] border-b border-line focus:border-rust outline-none py-1.5 bg-transparent text-sm"
          placeholder="Compra (ex.: Mercado Livre)"
          aria-label="Nome da compra"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="w-24 flex items-baseline gap-1 border-b border-line focus-within:border-rust">
          <span className="text-ink-faint text-xs">R$</span>
          <input
            className="w-full outline-none py-1.5 bg-transparent text-sm"
            placeholder="0"
            inputMode="decimal"
            aria-label="Valor da compra"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button type="submit" className="text-xs bg-rust text-white px-3 py-1.5 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
          adicionar
        </button>
      </form>
    </div>
  );
}
