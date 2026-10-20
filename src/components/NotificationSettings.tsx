import { useState } from "react";
import { disableNotifications, enableNotifications, notificationsEnabled, notificationsSupported } from "../lib/notify";

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(notificationsEnabled);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const supported = notificationsSupported();

  async function turnOn() {
    const result = await enableNotifications();
    if (result === "ok") {
      setEnabled(true);
      setMessage({ text: "Lembretes ativados.", error: false });
    } else if (result === "denied") {
      setMessage({ text: "O navegador bloqueou as notificações. Libere nas permissões do site e tente de novo.", error: true });
    } else {
      setMessage({ text: "Este navegador não suporta notificações.", error: true });
    }
  }

  function turnOff() {
    disableNotifications();
    setEnabled(false);
    setMessage({ text: "Lembretes desativados.", error: false });
  }

  const btn =
    "text-sm px-4 py-2 rounded-full border border-line text-ink-soft hover:border-rust hover:text-rust-dark transition-colors cursor-pointer";

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Lembretes de vencimento</p>
      <p className="text-ink-soft text-sm mt-1">
        Um aviso, uma vez por dia, para contas que vencem hoje, amanhã ou já venceram. Os avisos aparecem quando você
        abre o app ou volta a ele. Com o app fechado, o celular não consegue avisar, porque isso exigiria um servidor.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {!supported ? (
          <p className="text-sm text-ink-faint">Este navegador não suporta notificações.</p>
        ) : enabled ? (
          <button className={btn} onClick={turnOff}>
            Desativar lembretes
          </button>
        ) : (
          <button className={btn} onClick={turnOn}>
            Ativar lembretes
          </button>
        )}
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.error ? "text-brick" : "text-sage-dark"}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
