import { labelForMonthKey, shiftMonthKey } from "../lib/storage";

interface Props {
  currentKey: string;
  onChange: (key: string) => void;
}

export function Header({ currentKey, onChange }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-line/70">
      <div>
        <p className="text-sm text-ink-soft tracking-wide">{today()}</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">
          Ninho
        </h1>
        <p className="text-ink-soft mt-2 max-w-md">
          Um cantinho pra organizar o que entra, o que sai, e o que sobra pra você guardar.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-card border border-line rounded-full px-2 py-2 shadow-warm">
        <button
          onClick={() => onChange(shiftMonthKey(currentKey, -1))}
          className="w-8 h-8 rounded-full grid place-content-center text-ink-soft hover:bg-paper-soft hover:text-ink transition-colors cursor-pointer"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="font-display text-lg px-3 min-w-[170px] text-center">
          {labelForMonthKey(currentKey)}
        </span>
        <button
          onClick={() => onChange(shiftMonthKey(currentKey, 1))}
          className="w-8 h-8 rounded-full grid place-content-center text-ink-soft hover:bg-paper-soft hover:text-ink transition-colors cursor-pointer"
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
