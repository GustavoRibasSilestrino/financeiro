import { useEffect, useRef, useState } from "react";
import { defaultExpenseDate } from "../lib/dates";
import { CATEGORIES, type Category, type Expense } from "../lib/types";

interface Props {
  currentKey: string;
  onAdd: (expense: Expense) => void;
}

export function QuickAdd({ currentKey, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Alimentação");
  const [saved, setSaved] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), amount: v, category, fixed: false, date: defaultExpenseDate(currentKey) });
    setName("");
    setAmount("");
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    nameRef.current?.focus();
  }

  const field = "w-full border-b border-line focus:border-rust outline-none py-2 bg-transparent";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-30 right-4 sm:right-8 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] sm:bottom-8 w-14 h-14 rounded-full bg-rust text-white shadow-lg shadow-black/40 grid place-content-center hover:bg-rust-dark transition-colors cursor-pointer"
        aria-label="Lançar gasto rápido"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Novo gasto">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <form
            onSubmit={submit}
            className="relative w-full sm:max-w-md bg-card border border-line rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-warm"
          >
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-lg">Novo gasto</p>
              <button type="button" onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink text-2xl leading-none cursor-pointer" aria-label="Fechar">
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-ink-faint">Com o quê?</label>
                <input ref={nameRef} className={field} placeholder="Mercado, uber, almoço..." value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div className="w-32">
                  <label className="text-xs text-ink-faint">Valor</label>
                  <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
                    <span className="text-ink-faint text-sm">R$</span>
                    <input className="w-full outline-none py-2 bg-transparent" placeholder="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-ink-faint">Categoria</label>
                  <select className={`${field} cursor-pointer`} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="mt-6 w-full bg-rust text-white rounded-full py-3 font-medium hover:bg-rust-dark transition-colors cursor-pointer">
              Lançar gasto
            </button>
            <p className="h-5 mt-2 text-center text-sm text-sage-dark" role="status">
              {saved ? "Gasto lançado ✓" : ""}
            </p>
          </form>
        </div>
      )}
    </>
  );
}
