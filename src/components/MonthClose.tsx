import { useState } from "react";
import { formatBRL } from "../lib/finance";
import type { MonthData, Objective } from "../lib/types";

interface Props {
  month: MonthData;
  /** What is left this month (income minus everything that falls due in it). */
  balance: number;
  objectives: Objective[];
  onClose: (to: "reserve" | string, amount: number) => void;
  onReopen: () => void;
}

export function MonthClose({ month, balance, objectives, onClose, onReopen }: Props) {
  const [to, setTo] = useState<string>("reserve");
  const [draft, setDraft] = useState<string | null>(null);

  const unpaid = month.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const open = objectives.filter((o) => o.saved < o.target);
  const leftover = Math.max(balance, 0);
  const amountText = draft ?? (leftover ? String(Math.round(leftover * 100) / 100) : "");

  if (month.closing) {
    return (
      <section className="bg-sage-soft rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-sage-dark">Mês fechado ✓</p>
          <p className="text-sm text-ink-soft mt-0.5">
            {month.closing.moved > 0
              ? `${formatBRL(month.closing.moved)} foram para ${month.closing.toName}.`
              : "Nada foi guardado neste mês."}
          </p>
        </div>
        <button
          onClick={() => window.confirm("Reabrir o mês? O valor guardado volta a sair de onde foi colocado.") && onReopen()}
          className="text-sm border border-sage/60 text-sage-dark px-4 py-2 rounded-full cursor-pointer hover:bg-sage/20 transition-colors"
        >
          Reabrir
        </button>
      </section>
    );
  }

  function close() {
    const v = Number(amountText.replace(",", "."));
    const amount = Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0;
    if (unpaid.length > 0 && !window.confirm(`Ainda há ${unpaid.length} ${unpaid.length === 1 ? "conta" : "contas"} sem marcar como paga. Fechar mesmo assim?`)) return;
    onClose(to, amount);
    setDraft(null);
  }

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Fechar o mês</p>
      <p className="text-ink-soft text-sm mt-1">Confira as contas e mande a sobra para a reserva ou para um objetivo.</p>

      <ul className="mt-4 space-y-1.5 text-sm">
        <li className={unpaid.length ? "text-mustard" : "text-sage-dark"}>
          {unpaid.length
            ? `${unpaid.length} ${unpaid.length === 1 ? "conta ainda não foi marcada como paga" : "contas ainda não foram marcadas como pagas"} (${formatBRL(unpaidTotal)})`
            : "Todas as contas estão pagas ✓"}
        </li>
        <li className={balance >= 0 ? "text-ink-soft" : "text-brick"}>
          {balance >= 0 ? `Sobrou ${formatBRL(balance)} no mês` : `Faltou ${formatBRL(-balance)} no mês`}
        </li>
      </ul>

      {leftover > 0 && (
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-32">
            <label className="text-xs text-ink-faint">Quanto guardar</label>
            <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
              <span className="text-ink-faint text-sm">R$</span>
              <input className="w-full outline-none py-1.5 bg-transparent" inputMode="decimal" value={amountText} onChange={(e) => setDraft(e.target.value)} aria-label="Valor a guardar" />
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs text-ink-faint">Para onde</label>
            <select className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent cursor-pointer" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Destino da sobra">
              <option value="reserve">Reserva de emergência</option>
              {open.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button onClick={close} className="mt-5 text-sm bg-rust text-white px-5 py-2.5 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
        Fechar mês
      </button>
    </section>
  );
}
