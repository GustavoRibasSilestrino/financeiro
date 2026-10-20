import { useState } from "react";
import { formatBRL } from "../lib/finance";

interface Props {
  saved: number;
  months: number;
  /** Average monthly spending, from months that have any. */
  avgSpend: number;
  /** Average amount left over per month recently (can be 0 or negative). */
  avgSaving: number;
  onChange: (saved: number, months: number) => void;
}

export function ReserveTracker({ saved, months, avgSpend, avgSaving, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [savedDraft, setSavedDraft] = useState("");
  const [monthsDraft, setMonthsDraft] = useState("");

  const target = avgSpend * months;
  const ratio = target > 0 ? Math.min(saved / target, 1) : 0;
  const missing = Math.max(target - saved, 0);
  const monthsToGo = avgSaving > 0 && missing > 0 ? Math.ceil(missing / avgSaving) : null;
  const covered = avgSpend > 0 ? saved / avgSpend : 0;

  function start() {
    setSavedDraft(saved ? String(saved) : "");
    setMonthsDraft(String(months));
    setEditing(true);
  }

  function save() {
    const s = Number(savedDraft.replace(",", "."));
    const m = Math.round(Number(monthsDraft));
    onChange(Number.isFinite(s) && s >= 0 ? s : 0, Number.isFinite(m) && m > 0 ? Math.min(m, 36) : 6);
    setEditing(false);
  }

  let eta = "";
  if (target > 0 && missing === 0) eta = "Reserva completa! 🎉";
  else if (monthsToGo !== null) eta = `No ritmo dos últimos meses (sobra de ${formatBRL(avgSaving)}/mês), chega lá em ${monthsToGo} ${monthsToGo === 1 ? "mês" : "meses"}.`;
  else if (target > 0) eta = "Sem sobra recente para estimar quando chega lá.";

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Reserva de emergência</p>
        {!editing && (
          <button onClick={start} className="text-xs text-rust-dark hover:underline cursor-pointer">
            editar
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-ink-faint">Quanto já tenho guardado</label>
            <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
              <span className="text-ink-faint text-sm">R$</span>
              <input autoFocus className="w-full outline-none py-1.5 bg-transparent" inputMode="decimal" placeholder="0" value={savedDraft} onChange={(e) => setSavedDraft(e.target.value)} />
            </div>
          </div>
          <div className="w-28">
            <label className="text-xs text-ink-faint">Meta em meses</label>
            <input className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent" inputMode="numeric" placeholder="6" value={monthsDraft} onChange={(e) => setMonthsDraft(e.target.value)} />
          </div>
          <button onClick={save} className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
            salvar
          </button>
        </div>
      ) : avgSpend <= 0 ? (
        <p className="text-ink-soft text-sm mt-4">
          Lance seus gastos de alguns meses e o app calcula quanto você precisa guardar para cobrir {months} meses sem renda.
        </p>
      ) : (
        <>
          <p className="font-display text-3xl mt-3 tabular-nums">
            {formatBRL(saved)} <span className="text-ink-faint text-base font-normal">de {formatBRL(target)}</span>
          </p>
          <p className="text-sm text-ink-soft mt-1">
            meta: {months} {months === 1 ? "mês" : "meses"} de gastos (média de {formatBRL(avgSpend)}/mês) · hoje cobre {covered.toFixed(1).replace(".", ",")} {covered === 1 ? "mês" : "meses"}
          </p>
          <div
            className="mt-4 h-3 rounded-full bg-paper-soft overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(ratio * 100)}
            aria-label="Progresso da reserva de emergência"
          >
            <div className="h-full rounded-full bg-sage transition-all duration-500" style={{ width: `${ratio * 100}%` }} />
          </div>
          <p className="text-sm text-ink-soft mt-2">{Math.round(ratio * 100)}% da reserva{eta && ` · ${eta}`}</p>
        </>
      )}
    </section>
  );
}
