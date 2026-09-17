import { useState } from "react";
import { formatBRL } from "../lib/finance";
import { CATEGORIES, type Category, type Expense } from "../lib/types";

interface Props {
  expenses: Expense[];
  onAdd: (expense: Expense) => void;
  onRemove: (id: string) => void;
}

export function ExpensesSection({ expenses, onAdd, onRemove }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Outros");
  const [fixed, setFixed] = useState(true);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), amount: v, category, fixed });
    setName("");
    setAmount("");
  }

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Gastos do mês</p>
          <p className="text-ink-soft text-sm mt-1">Contas do dia a dia, fixas ou variáveis</p>
        </div>
        <p className="font-display text-2xl text-brick">{formatBRL(total)}</p>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">Com o quê?</label>
          <input
            className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent"
            placeholder="Aluguel, mercado, uber..."
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
        <div className="w-36">
          <label className="text-xs text-ink-faint">Categoria</label>
          <select
            className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 pb-1.5">
          <button
            type="button"
            onClick={() => setFixed(true)}
            className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
              fixed ? "bg-sage-soft border-sage text-sage-dark" : "border-line text-ink-soft"
            }`}
          >
            fixo
          </button>
          <button
            type="button"
            onClick={() => setFixed(false)}
            className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
              !fixed ? "bg-mustard-soft border-mustard text-rust-dark" : "border-line text-ink-soft"
            }`}
          >
            variável
          </button>
        </div>
        <button
          type="submit"
          className="text-sm bg-rust text-paper px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
        >
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {expenses.length === 0 && (
          <li className="text-ink-faint text-sm py-4">Nenhum gasto lançado ainda.</li>
        )}
        {expenses.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 group">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-line text-ink-soft"
              >
                {e.category}
              </span>
              <span>{e.name}</span>
              <span className="text-[11px] text-ink-faint">{e.fixed ? "fixo" : "variável"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular-nums text-ink-soft">{formatBRL(e.amount)}</span>
              <button
                onClick={() => onRemove(e.id)}
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
