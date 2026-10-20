import { debtInfo, monthYearLabel } from "./debts";
import { CATEGORIES, emptyMonth, type MonthData, type Store } from "./types";

function download(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export function exportBackup(store: Store) {
  download(`ninho-backup-${stamp()}.json`, JSON.stringify(store, null, 2), "application/json");
}

/** Validates and normalizes a backup file; throws a user-readable Error on bad input. */
export function parseBackup(text: string): Store {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Esse arquivo não é um backup válido do Ninho.");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Esse arquivo não é um backup válido do Ninho.");
  }
  const store: Store = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}$/.test(key) || !value || typeof value !== "object") {
      throw new Error("Esse arquivo não é um backup válido do Ninho.");
    }
    const v = value as Partial<MonthData>;
    store[key] = {
      ...emptyMonth(),
      ...v,
      expenses: Array.isArray(v.expenses) ? v.expenses : [],
      bills: Array.isArray(v.bills) ? v.bills : [],
      debts: Array.isArray(v.debts) ? v.debts : [],
    };
  }
  return store;
}

function csvCell(value: string | number | boolean) {
  const s = String(value);
  return /[",;\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function exportCsv(store: Store) {
  const rows: (string | number)[][] = [["Mês", "Tipo", "Descrição", "Categoria", "Valor", "Detalhe"]];
  for (const key of Object.keys(store).sort()) {
    const m = store[key];
    if (m.income) rows.push([key, "Renda", "Salário / renda fixa", "", m.income, ""]);
    if (m.extraIncome) rows.push([key, "Renda", "Extras", "", m.extraIncome, ""]);
    for (const i of m.incomes ?? []) rows.push([key, "Renda", i.name, "", i.amount, `cai dia ${i.day}${i.recurring !== false ? " · todo mês" : ""}`]);
    for (const e of m.expenses) {
      const detail = [e.date, e.fixed ? "fixo" : "variável", (e.tags ?? []).map((t) => `#${t}`).join(" "), e.note].filter(Boolean).join(" · ");
      rows.push([key, "Gasto", e.name, e.category, e.amount, detail]);
    }
    for (const b of m.bills) rows.push([key, "Fatura", b.name, "", b.amount, `vence dia ${b.dueDay}${b.paid ? " (paga)" : ""}`]);
    for (const d of m.debts) {
      const info = debtInfo(d, key);
      const status = { agendada: "agendada", andamento: "em andamento", finalizada: "finalizada" }[info.status];
      rows.push([
        key,
        "Dívida",
        d.name,
        "",
        d.installmentAmount,
        `${status} · ${monthYearLabel(info.start)} a ${monthYearLabel(info.end)} · ${d.totalInstallments} parcelas`,
      ]);
    }
    for (const [cat, limit] of Object.entries(m.categoryLimits ?? {})) {
      if (CATEGORIES.includes(cat as never)) rows.push([key, "Meta de gasto", cat, cat, limit as number, ""]);
    }
  }
  // BOM + ";" so Excel (pt-BR) opens it with accents and columns right
  const csv = "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\n");
  download(`ninho-${stamp()}.csv`, csv, "text/csv;charset=utf-8");
}
