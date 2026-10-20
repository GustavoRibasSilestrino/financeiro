import { formatBRL } from "./finance";
import { daysInMonth, monthKey } from "./storage";
import type { Bill } from "./types";

const ENABLED_KEY = "ninho.notify";
const SENT_KEY = "ninho.notified";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationsEnabled(): boolean {
  try {
    return notificationsSupported() && Notification.permission === "granted" && localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export async function enableNotifications(): Promise<"ok" | "denied" | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  localStorage.setItem(ENABLED_KEY, "1");
  return "ok";
}

export function disableNotifications() {
  localStorage.removeItem(ENABLED_KEY);
}

function readSent(today: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(SENT_KEY) ?? "null") as { date: string; ids: string[] } | null;
    return raw && raw.date === today ? raw.ids : [];
  } catch {
    return [];
  }
}

async function show(title: string, body: string, tag: string) {
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (reg) await reg.showNotification(title, { body, tag, icon: "/icon.svg" });
    else new Notification(title, { body, tag, icon: "/icon.svg" });
  } catch {
    // some browsers refuse the constructor outside a service worker; nothing else to try
  }
}

/** Reminds, once a day per bill, about unpaid bills due tomorrow, today or already overdue. */
export async function notifyDueBills(bills: Bill[]): Promise<number> {
  if (!notificationsEnabled()) return 0;
  const now = new Date();
  const key = monthKey(now);
  const today = `${key}-${String(now.getDate()).padStart(2, "0")}`;
  const last = daysInMonth(key);
  const sent = readSent(today);

  const due = bills
    .filter((b) => !b.paid && !sent.includes(b.id))
    .map((b) => ({ b, diff: Math.min(Math.max(b.dueDay, 1), last) - now.getDate() }))
    .filter(({ diff }) => diff <= 1);

  for (const { b, diff } of due) {
    const when = diff < 0 ? "está atrasada" : diff === 0 ? "vence hoje" : "vence amanhã";
    await show(`${b.name} ${when}`, `${formatBRL(b.amount)} · dia ${b.dueDay}`, `bill-${b.id}`);
  }
  if (due.length) {
    localStorage.setItem(SENT_KEY, JSON.stringify({ date: today, ids: [...sent, ...due.map(({ b }) => b.id)] }));
  }
  return due.length;
}
