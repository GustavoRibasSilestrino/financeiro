export type TabId = "resumo" | "metas" | "gastos" | "evolucao" | "calendario";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: "resumo", label: "Resumo", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { id: "metas", label: "Metas", icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" },
  { id: "gastos", label: "Gastos", icon: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 3h18M7 15h4" },
  { id: "evolucao", label: "Evolução", icon: "M4 19V9m6 10V5m6 14v-7m4 7H2" },
  { id: "calendario", label: "Agenda", icon: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function NavTabs({ active, onChange }: Props) {
  return (
    <>
      {/* desktop / tablet: pill tabs */}
      <nav className="hidden sm:flex gap-1 mt-6 p-1 bg-card border border-line rounded-full w-fit shadow-warm" aria-label="Seções">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                isActive ? "bg-rust text-white shadow" : "text-ink-soft hover:text-ink hover:bg-paper-soft"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* mobile: bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-card/90 backdrop-blur-xl border-t border-line"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Seções"
      >
        <div className="grid grid-cols-5 px-1 pt-1.5 pb-1.5">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-[11px] font-medium transition-colors cursor-pointer ${
                  isActive ? "text-rust-dark" : "text-ink-faint"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={`px-4 py-1 rounded-full transition-colors ${isActive ? "bg-rust-soft" : ""}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={tab.icon} />
                  </svg>
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
