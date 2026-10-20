import { useState } from "react";
import { defaultExpenseDate, isISODate, monthBounds, parseTags, shortDate } from "../lib/dates";
import { formatBRL } from "../lib/finance";
import { CATEGORIES, type Category, type Expense } from "../lib/types";
import { EditRow } from "./EditRow";

interface Props {
  expenses: Expense[];
  currentKey: string;
  onAdd: (expense: Expense) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Expense>) => void;
}

const field = "w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent";

export function ExpensesSection({ expenses, currentKey, onAdd, onRemove, onUpdate }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Outros");
  const [fixed, setFixed] = useState(true);
  const [date, setDate] = useState(() => defaultExpenseDate(currentKey));
  const [tags, setTags] = useState("");
  const [note, setNote] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "">("");

  const bounds = monthBounds(currentKey);
  // the date shown follows the viewed month, so changing month never leaves a date from another one
  const shownDate = date >= bounds.min && date <= bounds.max ? date : defaultExpenseDate(currentKey);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const q = query.trim().toLowerCase().replace(/^#/, "");
  const filtering = q !== "" || filterCategory !== "";
  const matches = (e: Expense) =>
    (!filterCategory || e.category === filterCategory) &&
    (!q ||
      e.name.toLowerCase().includes(q) ||
      (e.note ?? "").toLowerCase().includes(q) ||
      (e.tags ?? []).some((t) => t.includes(q)));
  const visible = expenses
    .filter(matches)
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (b.e.date ?? "").localeCompare(a.e.date ?? "") || a.i - b.i)
    .map((x) => x.e);
  const visibleTotal = visible.reduce((s, e) => s + e.amount, 0);

  const tagTotals = new Map<string, number>();
  for (const e of expenses) for (const t of e.tags ?? []) tagTotals.set(t, (tagTotals.get(t) ?? 0) + e.amount);
  const tagList = Array.from(tagTotals.entries()).sort((a, b) => b[1] - a[1]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    if (!name.trim() || !Number.isFinite(v) || v <= 0) return;
    const parsedTags = parseTags(tags);
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: v,
      category,
      fixed,
      date: isISODate(shownDate) ? shownDate : undefined,
      tags: parsedTags.length ? parsedTags : undefined,
      note: note.trim() || undefined,
    });
    setName("");
    setAmount("");
    setTags("");
    setNote("");
  }

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
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
          <input className={field} placeholder="Aluguel, mercado, uber..." value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="w-28">
          <label className="text-xs text-ink-faint">Valor</label>
          <div className="flex items-baseline gap-1 border-b border-line focus-within:border-rust">
            <span className="text-ink-faint text-sm">R$</span>
            <input className="w-full outline-none py-1.5 bg-transparent" placeholder="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>
        <div className="w-36">
          <label className="text-xs text-ink-faint">Categoria</label>
          <select className={`${field} cursor-pointer`} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="text-xs text-ink-faint">Data</label>
          <input type="date" className={field} min={bounds.min} max={bounds.max} value={shownDate} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">Tags (opcional)</label>
          <input className={field} placeholder="viagem, presente" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-ink-faint">Observação (opcional)</label>
          <input className={field} placeholder="detalhe do gasto" value={note} onChange={(e) => setNote(e.target.value)} />
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
        <button type="submit" className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
          adicionar
        </button>
      </form>

      {expenses.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, tag ou observação..."
            aria-label="Buscar gasto"
            className="flex-1 min-w-[140px] bg-paper-soft rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rust/50"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | "")}
            aria-label="Filtrar por categoria"
            className="bg-paper-soft rounded-full px-4 py-2 text-sm text-ink-soft outline-none cursor-pointer"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilterCategory("");
              }}
              className="text-xs text-rust-dark hover:underline cursor-pointer"
            >
              limpar
            </button>
          )}
        </div>
      )}

      {tagList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Total por tag">
          {tagList.map(([tag, sum]) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(q === tag ? "" : tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                q === tag ? "bg-rust text-white border-rust" : "border-line text-ink-soft hover:border-rust"
              }`}
            >
              #{tag} · {formatBRL(sum)}
            </button>
          ))}
        </div>
      )}

      {filtering && (
        <p className="mt-3 text-sm text-ink-soft" role="status">
          {visible.length} {visible.length === 1 ? "lançamento" : "lançamentos"} ·{" "}
          <span className="text-ink font-medium">{formatBRL(visibleTotal)}</span>
        </p>
      )}

      <ul className="mt-4 divide-y divide-dashed divide-line">
        {expenses.length === 0 && <li className="text-ink-faint text-sm py-4">Nenhum gasto lançado ainda.</li>}
        {expenses.length > 0 && visible.length === 0 && (
          <li className="text-ink-faint text-sm py-4">Nenhum gasto encontrado com esse filtro.</li>
        )}
        {visible.map((e) =>
          editingId === e.id ? (
            <EditRow
              key={e.id}
              fields={[
                { key: "name", label: "Com o quê?", kind: "text" },
                { key: "amount", label: "Valor", kind: "number", width: "w-24" },
                { key: "category", label: "Categoria", kind: "select", options: CATEGORIES, width: "w-36" },
                { key: "date", label: "Data", kind: "date", width: "w-40" },
                { key: "tags", label: "Tags", kind: "text" },
                { key: "note", label: "Observação", kind: "text" },
                { key: "fixed", label: "fixo (todo mês)", kind: "check" },
              ]}
              initial={{
                name: e.name,
                amount: String(e.amount),
                category: e.category,
                date: e.date ?? "",
                tags: (e.tags ?? []).join(", "),
                note: e.note ?? "",
                fixed: e.fixed,
              }}
              onCancel={() => setEditingId(null)}
              onSave={(v) => {
                const n = Number(String(v.amount).replace(",", "."));
                if (!String(v.name).trim() || !Number.isFinite(n) || n <= 0) return;
                const parsedTags = parseTags(String(v.tags));
                onUpdate(e.id, {
                  name: String(v.name).trim(),
                  amount: n,
                  category: v.category as Category,
                  fixed: v.fixed === true,
                  date: isISODate(String(v.date)) ? String(v.date) : undefined,
                  tags: parsedTags.length ? parsedTags : undefined,
                  note: String(v.note).trim() || undefined,
                });
                setEditingId(null);
              }}
            />
          ) : (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 group">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-line text-ink-soft">{e.category}</span>
                  <span>{e.name}</span>
                  <span className="text-[11px] text-ink-faint">
                    {e.date ? `${shortDate(e.date)} · ` : ""}
                    {e.fixed ? "fixo" : "variável"}
                  </span>
                </div>
                {(e.tags?.length || e.note) && (
                  <p className="mt-1 text-xs text-ink-faint">
                    {e.tags?.map((t) => (
                      <span key={t} className="text-rust-dark mr-2">
                        #{t}
                      </span>
                    ))}
                    {e.note}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-ink-soft">{formatBRL(e.amount)}</span>
                <button
                  onClick={() => setEditingId(e.id)}
                  className="text-ink-faint opacity-60 hover:opacity-100 hover:text-rust-dark transition-opacity cursor-pointer p-1.5 -m-1.5"
                  aria-label="Editar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                  </svg>
                </button>
                <button
                  onClick={() => onRemove(e.id)}
                  className="text-ink-faint opacity-50 group-hover:opacity-100 hover:text-brick transition-opacity cursor-pointer p-1.5 -m-1.5 text-lg leading-none"
                  aria-label="Remover"
                >
                  ×
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </section>
  );
}
