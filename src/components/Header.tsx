import { labelForMonthKey, shiftMonthKey } from "../lib/storage";

interface Props {
  currentKey: string;
  onChange: (key: string) => void;
}

export function Header({ currentKey, onChange }: Props) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-ink-soft">{today()}</p>
        <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight">Ninho</h1>
      </div>

      <div className="flex items-center bg-card border border-line rounded-full p-1 shadow-warm shrink-0">
        <button
          onClick={() => onChange(shiftMonthKey(currentKey, -1))}
          className="w-10 h-10 shrink-0 rounded-full grid place-content-center text-ink-soft hover:bg-paper-soft hover:text-ink active:bg-paper-soft transition-colors cursor-pointer text-lg"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="font-display font-semibold text-sm sm:text-base px-1 sm:px-3 min-w-[104px] sm:min-w-[150px] text-center first-letter:uppercase">
          {labelForMonthKey(currentKey)}
        </span>
        <button
          onClick={() => onChange(shiftMonthKey(currentKey, 1))}
          className="w-10 h-10 shrink-0 rounded-full grid place-content-center text-ink-soft hover:bg-paper-soft hover:text-ink active:bg-paper-soft transition-colors cursor-pointer text-lg"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>
    </header>
  );
}

function today() {
  const d = new Date();
  const label = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
