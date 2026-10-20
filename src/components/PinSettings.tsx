import { useState } from "react";
import { clearPin, hasPin, PIN_PATTERN, setPin } from "../lib/pin";

interface Props {
  onLock: () => void;
}

export function PinSettings({ onLock }: Props) {
  const [enabled, setEnabled] = useState(hasPin);
  const [editing, setEditing] = useState(false);
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!PIN_PATTERN.test(pin)) return setMessage({ text: "Use de 4 a 6 números.", error: true });
    if (pin !== confirm) return setMessage({ text: "Os dois PINs não são iguais.", error: true });
    await setPin(pin);
    setEnabled(true);
    setEditing(false);
    setPinValue("");
    setConfirm("");
    setMessage({ text: "PIN ativado. Ele será pedido quando você abrir o app.", error: false });
  }

  function remove() {
    if (!window.confirm("Remover o bloqueio por PIN?")) return;
    clearPin();
    setEnabled(false);
    setMessage({ text: "PIN removido.", error: false });
  }

  const btn =
    "text-sm px-4 py-2 rounded-full border border-line text-ink-soft hover:border-rust hover:text-rust-dark transition-colors cursor-pointer";
  const field = "w-28 text-center tracking-[0.3em] border-b border-line focus:border-rust outline-none py-1.5 bg-transparent";

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Bloqueio por PIN</p>
      <p className="text-ink-soft text-sm mt-1">
        Pede um PIN ao abrir o app e quando você volta a ele depois de um tempo. Ele só impede que outra pessoa abra o app
        neste aparelho; os dados não são criptografados.
      </p>

      {editing ? (
        <form onSubmit={save} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-ink-faint">Novo PIN</label>
            <input type="password" inputMode="numeric" maxLength={6} autoFocus className={field} value={pin} onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label className="text-xs text-ink-faint">Repita o PIN</label>
            <input type="password" inputMode="numeric" maxLength={6} className={field} value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))} />
          </div>
          <button type="submit" className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer">
            salvar
          </button>
          <button type="button" className={btn} onClick={() => setEditing(false)}>
            cancelar
          </button>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className={btn} onClick={() => { setMessage(null); setEditing(true); }}>
            {enabled ? "Alterar PIN" : "Ativar PIN"}
          </button>
          {enabled && (
            <>
              <button className={btn} onClick={onLock}>
                Bloquear agora
              </button>
              <button className={btn} onClick={remove}>
                Remover PIN
              </button>
            </>
          )}
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm ${message.error ? "text-brick" : "text-sage-dark"}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
