import { useState } from "react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ninho.theme", next);
    } catch {
      // storage can be blocked (private mode); the theme still applies for this visit
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#0f1226" : "#5b4bf0");
    setTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 rounded-full bg-card border border-line shadow-warm grid place-content-center text-ink-soft hover:text-ink transition-colors cursor-pointer"
      aria-label={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {theme === "dark" ? (
          <path d="M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
        )}
      </svg>
    </button>
  );
}
