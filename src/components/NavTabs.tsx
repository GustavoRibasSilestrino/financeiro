export type TabId = "resumo" | "metas" | "gastos" | "evolucao" | "calendario";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "resumo", label: "Resumo" },
  { id: "metas", label: "Metas" },
  { id: "gastos", label: "Gastos" },
  { id: "evolucao", label: "Evolução" },
  { id: "calendario", label: "Calendário" },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function NavTabs({ active, onChange }: Props) {
  return (
    <nav className="flex flex-wrap gap-2 mt-8" aria-label="Seções">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
              isActive
                ? "bg-ink text-paper border-ink"
                : "bg-card text-ink-soft border-line hover:border-rust hover:text-rust-dark"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
