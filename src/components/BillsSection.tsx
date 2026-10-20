import { useState } from "react";
import { EditRow } from "./EditRow";
import { formatBRL } from "../lib/finance";
import type { Bill, Purchase } from "../lib/types";
import { BillPurchases } from "./BillPurchases";

interface Props {
  bills: Bill[];
  onAdd: (bill: Bill) => void;
  onRemove: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Bill>) => void;
}

export function BillsSection({ bills, onAdd, onRemove, onTogglePaid, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");

  const [recurring, setRecurring] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const total = bills.reduce((s, b) => s + b.amount, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    const d = Number(dueDay) || 1;
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), amount: v, dueDay: d, paid: false, recurring });
    setName("");
    setAmount("");
    setDueDay("");
  }

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
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
        <label className="flex items-center gap-2 text-sm text-ink-soft pb-1.5 cursor-pointer">
          <input type="checkbox" className="stamp-checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          todo mês
        </label>
        <button
          type="submit"
          className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
        >
          adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-dashed divide-line">
        {bills.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhuma fatura por aqui.</li>}
        {bills.map((b) =>
          editingId === b.id ? (
            <EditRow
              key={b.id}
              fields={[
                { key: "name", label: "Qual conta?", kind: "text" },
                { key: "amount", label: "Valor", kind: "number", width: "w-24" },
                { key: "dueDay", label: "Vence dia", kind: "number", width: "w-20" },
                { key: "recurring", label: "todo mês", kind: "check" },
              ]}
              initial={{ name: b.name, amount: String(b.amount), dueDay: String(b.dueDay), recurring: b.recurring !== false }}
              onCancel={() => setEditingId(null)}
              onSave={(v) => {
                const n = Number(String(v.amount).replace(",", "."));
                const d = Math.min(Math.max(Math.round(Number(v.dueDay)) || 1, 1), 31);
                if (!String(v.name).trim() || !Number.isFinite(n) || n <= 0) return;
                onUpdate(b.id, { name: String(v.name).trim(), amount: n, dueDay: d, recurring: v.recurring === true });
                setEditingId(null);
              }}
            />
          ) : (
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
                <p className="text-[11px] text-ink-faint">
                  vence dia {b.dueDay}
                  {b.recurring !== false ? " · todo mês" : ""}
                  {" · "}
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === b.id ? null : b.id)}
                    className="text-rust-dark hover:underline cursor-pointer"
                    aria-expanded={openId === b.id}
                  >
                    {b.purchases?.length ? `${b.purchases.length} ${b.purchases.length === 1 ? "compra" : "compras"}` : "detalhar compras"}
                  </button>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`tabular-nums text-ink-soft ${b.paid ? "opacity-50" : ""}`}>
                {formatBRL(b.amount)}
              </span>
              <button
                onClick={() => setEditingId(b.id)}
                className="text-ink-faint opacity-60 hover:opacity-100 hover:text-rust-dark transition-opacity cursor-pointer p-1.5 -m-1.5"
                aria-label="Editar"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(b.id)}
                className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer p-1.5 -m-1.5 text-lg leading-none"
                aria-label="Remover"
              >
                ×
              </button>
            </div>
            {openId === b.id && (
              <BillPurchases
                purchases={b.purchases ?? []}
                onChange={(purchases: Purchase[]) =>
                  onUpdate(b.id, {
                    purchases,
                    amount: purchases.length ? Math.round(purchases.reduce((sum, x) => sum + x.amount, 0) * 100) / 100 : b.amount,
                  })
                }
              />
            )}
          </li>
          )
        )}
      </ul>
    </section>
  );
}
