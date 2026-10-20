import { useState } from "react";
import { debtInfo, monthYearLabel, type DebtStatus } from "../lib/debts";
import { formatBRL } from "../lib/finance";
import type { Debt } from "../lib/types";
import { EditRow } from "./EditRow";

interface Props {
  debts: Debt[];
  currentKey: string;
  onAdd: (debt: Debt) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Debt>) => void;
}

type Filter = "todas" | DebtStatus;

const STATUS_LABEL: Record<DebtStatus, string> = {
  andamento: "Em andamento",
  agendada: "Agendada",
  finalizada: "Finalizada",
};

const STATUS_STYLE: Record<DebtStatus, string> = {
  andamento: "bg-sage-soft text-sage-dark",
  agendada: "bg-mustard-soft text-ink",
  finalizada: "bg-paper-soft text-ink-soft",
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "andamento", label: "Em andamento" },
  { id: "agendada", label: "Agendadas" },
  { id: "finalizada", label: "Finalizadas" },
];

export function DebtsSection({ debts, currentKey, onAdd, onRemove, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [installments, setInstallments] = useState("");
  const [start, setStart] = useState(currentKey);
  const [filter, setFilter] = useState<Filter>("todas");
  const [editingId, setEditingId] = useState<string | null>(null);

  const rows = debts.map((d) => ({ debt: d, info: debtInfo(d, currentKey) }));
  const counts: Record<Filter, number> = {
    todas: rows.length,
    andamento: rows.filter((r) => r.info.status === "andamento").length,
    agendada: rows.filter((r) => r.info.status === "agendada").length,
    finalizada: rows.filter((r) => r.info.status === "finalizada").length,
  };
  const visible = rows.filter((r) => filter === "todas" || r.info.status === filter);
  const total = rows.filter((r) => r.info.status === "andamento").reduce((s, r) => s + r.debt.installmentAmount, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    const n = Math.max(Math.round(Number(installments)) || 1, 1);
    if (!name.trim() || !Number.isFinite(v) || v <= 0 || !/^\d{4}-\d{2}$/.test(start)) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      installmentAmount: v,
      totalInstallments: n,
      startMonth: start,
    });
    setName("");
    setAmount("");
    setInstallments("");
    setStart(currentKey);
  }

  const field = "w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent";

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Dívidas e parcelamentos</p>
          <p className="text-ink-soft text-sm mt-1">Parcelas que caem no seu salário, mês a mês</p>
        </div>
        <div className="sm:text-right">
          <p className="font-display text-2xl text-brick">{formatBRL(total)}</p>
          <p className="text-[11px] text-ink-faint">a pagar neste mês</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">O que é?</label>
          <input
            className={field}
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
        <div className="w-24">
          <label className="text-xs text-ink-faint">Nº de parcelas</label>
          <input
            className={field}
            placeholder="12"
            inputMode="numeric"
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="text-xs text-ink-faint">1ª parcela em</label>
          <input type="month" className={field} value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <button
          type="submit"
          className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
        >
          adicionar
        </button>
      </form>

      {debts.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar dívidas">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filter === f.id ? "bg-rust text-white border-rust" : "border-line text-ink-soft hover:border-rust"
              }`}
            >
              {f.label} · {counts[f.id]}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-4 divide-y divide-dashed divide-line">
        {debts.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhuma dívida cadastrada.</li>}
        {debts.length > 0 && visible.length === 0 && (
          <li className="text-ink-faint text-sm py-4">Nenhuma dívida nesse filtro.</li>
        )}
        {visible.map(({ debt: d, info }) => {
          if (editingId === d.id) {
            return (
              <EditRow
                key={d.id}
                fields={[
                  { key: "name", label: "O que é?", kind: "text" },
                  { key: "amount", label: "Parcela", kind: "number", width: "w-24" },
                  { key: "total", label: "Nº de parcelas", kind: "number", width: "w-24" },
                  { key: "start", label: "1ª parcela em", kind: "month", width: "w-40" },
                ]}
                initial={{
                  name: d.name,
                  amount: String(d.installmentAmount),
                  total: String(d.totalInstallments),
                  start: info.start,
                }}
                onCancel={() => setEditingId(null)}
                onSave={(v) => {
                  const n = Number(String(v.amount).replace(",", "."));
                  const total = Math.max(Math.round(Number(v.total)) || 1, 1);
                  if (!String(v.name).trim() || !Number.isFinite(n) || n <= 0 || !/^\d{4}-\d{2}$/.test(String(v.start))) return;
                  onUpdate(d.id, {
                    name: String(v.name).trim(),
                    installmentAmount: n,
                    totalInstallments: total,
                    startMonth: String(v.start),
                  });
                  setEditingId(null);
                }}
              />
            );
          }

          const done = info.status === "finalizada";
          const progress = Math.min(info.paidBefore + (info.status === "andamento" ? 1 : 0), d.totalInstallments);
          return (
            <li key={d.id} className="py-4 group">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`font-medium truncate ${done ? "text-ink-soft" : ""}`}>{d.name}</p>
                  <span className={`inline-block mt-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLE[info.status]}`}>
                    {info.status === "andamento" && info.isLast ? "Última parcela" : STATUS_LABEL[info.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`tabular-nums ${done ? "text-ink-faint" : "text-ink-soft"}`}>
                    {formatBRL(d.installmentAmount)}
                    <span className="text-ink-faint text-xs"> /mês</span>
                  </span>
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
              </div>

              <div
                className="mt-3 h-2 rounded-full bg-paper-soft overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={d.totalInstallments}
                aria-valuenow={progress}
                aria-label={`Parcelas de ${d.name}`}
              >
                <div
                  className={`h-full rounded-full ${done ? "bg-ink-faint" : "bg-sage"}`}
                  style={{ width: `${(progress / d.totalInstallments) * 100}%` }}
                />
              </div>

              <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                <Info label="Parcela" value={info.status === "andamento" ? `${info.index} de ${d.totalInstallments}` : `${d.totalInstallments} no total`} />
                <Info label="Início" value={monthYearLabel(info.start)} />
                <Info label="Término" value={monthYearLabel(info.end)} />
                <Info
                  label={done ? "Total pago" : "Falta pagar"}
                  value={done ? formatBRL(info.totalAmount) : `${formatBRL(info.remainingAmount)} (${info.remaining}x)`}
                />
              </dl>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink-soft tabular-nums">{value}</dd>
    </div>
  );
}
