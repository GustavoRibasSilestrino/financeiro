import { daysInMonth, monthKey } from "./storage";

const pad = (n: number) => String(n).padStart(2, "0");

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today when viewing the current month, otherwise the first day of the viewed month. */
export function defaultExpenseDate(key: string): string {
  return key === monthKey(new Date()) ? todayISO() : `${key}-01`;
}

export function monthBounds(key: string): { min: string; max: string } {
  return { min: `${key}-01`, max: `${key}-${pad(daysInMonth(key))}` };
}

/** "2026-10-07" → "07/10" */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseTags(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split(/[,;]/)
        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean)
    )
  );
}
