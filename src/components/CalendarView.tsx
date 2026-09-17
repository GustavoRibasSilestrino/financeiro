import { useState } from "react";
import { formatBRL } from "../lib/finance";
import { daysInMonth, firstWeekdayOfMonth, monthKey } from "../lib/storage";
import type { Bill } from "../lib/types";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

interface Props {
  currentKey: string;
  bills: Bill[];
  onAdd: (bill: Bill) => void;
  onRemove: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onSetDueDay: (id: string, day: number) => void;
}

export function CalendarView({ currentKey, bills, onAdd, onRemove, onTogglePaid, onSetDueDay }: Props) {
  const total = daysInMonth(currentKey);
  const offset = firstWeekdayOfMonth(currentKey);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const isCurrentMonth = currentKey === monthKey(new Date());
  const todayDay = isCurrentMonth ? new Date().getDate() : -1;

  const billsByDay = new Map<number, Bill[]>();
  for (const b of bills) {
    const day = Math.min(Math.max(b.dueDay, 1), total);
    billsByDay.set(day, [...(billsByDay.get(day) ?? []), b]);
  }

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDay) return;
    const v = Number(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    onAdd({ id: crypto.randomUUID(), name: name.trim(), amount: v, dueDay: selectedDay, paid: false });
    setName("");
    setAmount("");
  }

  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <section className="bg-card border border-line rounded-2xl shadow-warm p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Calendário de contas</p>
      <p className="text-ink-soft text-sm mt-1">
        Arraste uma conta pra outro dia pra mudar o vencimento, ou clique num dia pra lançar uma nova.
      </p>

      <div className="mt-6 grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-[11px] uppercase tracking-wide text-ink-faint py-1">
            {w}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dayBills = billsByDay.get(day) ?? [];
          const isToday = day === todayDay;
          const isSelected = day === selectedDay;
          const isDragOver = day === dragOverDay;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverDay(day);
              }}
              onDragLeave={() => setDragOverDay((d) => (d === day ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/bill-id");
                if (id) onSetDueDay(id, day);
                setDragOverDay(null);
              }}
              className={`min-h-[76px] rounded-lg border p-1.5 text-left align-top flex flex-col gap-1 cursor-pointer transition-colors ${
                isSelected
                  ? "border-rust bg-rust-soft/40"
                  : isDragOver
                  ? "border-sage bg-sage-soft/50"
                  : "border-line/70 hover:border-line"
              }`}
            >
              <span
                className={`text-xs ${isToday ? "font-bold text-rust-dark" : "text-ink-faint"}`}
              >
                {day}
              </span>
              <div className="flex flex-col gap-1">
                {dayBills.map((b) => (
                  <span
                    key={b.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/bill-id", b.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePaid(b.id);
                    }}
                    title={`${b.name} · ${formatBRL(b.amount)} — clique pra marcar como paga`}
                    className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-md truncate cursor-grab active:cursor-grabbing ${
                      b.paid
                        ? "bg-sage-soft text-sage-dark line-through opacity-70"
                        : "bg-mustard-soft text-rust-dark"
                    }`}
                  >
                    {b.name}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 border-t border-dashed border-line pt-6">
        {selectedDay ? (
          <>
            <p className="font-display text-xl">Dia {selectedDay}</p>

            <ul className="mt-3 divide-y divide-dashed divide-line">
              {(billsByDay.get(selectedDay) ?? []).length === 0 && (
                <li className="text-ink-faint text-sm py-2">Nada vencendo nesse dia ainda.</li>
              )}
              {(billsByDay.get(selectedDay) ?? []).map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2 group">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="stamp-checkbox"
                      checked={b.paid}
                      onChange={() => onTogglePaid(b.id)}
                      aria-label="Marcar como paga"
                    />
                    <span className={b.paid ? "line-through opacity-50" : ""}>{b.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`tabular-nums text-ink-soft ${b.paid ? "opacity-50" : ""}`}>
                      {formatBRL(b.amount)}
                    </span>
                    <label className="flex items-center gap-1 text-xs text-ink-faint">
                      dia
                      <input
                        type="number"
                        min={1}
                        max={total}
                        value={b.dueDay}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v)) onSetDueDay(b.id, Math.min(Math.max(v, 1), total));
                        }}
                        className="w-12 border-b border-line focus:border-rust outline-none bg-transparent text-center text-ink"
                      />
                    </label>
                    <button
                      onClick={() => onRemove(b.id)}
                      className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer"
                      aria-label="Remover"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <form onSubmit={submitAdd} className="mt-4 flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="text-xs text-ink-faint">Lançar conta pro dia {selectedDay}</label>
                <input
                  className="w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent"
                  placeholder="Cartão, aluguel..."
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
              <button
                type="submit"
                className="text-sm bg-rust text-paper px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
              >
                adicionar
              </button>
            </form>
          </>
        ) : (
          <p className="text-ink-faint text-sm">Clique num dia do calendário pra ver ou lançar contas nele.</p>
        )}
      </div>
    </section>
  );
}
