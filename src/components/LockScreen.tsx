import { useEffect, useRef, useState } from "react";
import { verifyPin } from "../lib/pin";

interface Props {
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => ref.current?.focus(), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !pin) return;
    setBusy(true);
    const ok = await verifyPin(pin);
    if (ok) {
      onUnlock();
      return;
    }
    setError(true);
    setPin("");
    // small pause after a wrong guess
    setTimeout(() => setBusy(false), 800);
  }

  return (
    <div className="min-h-screen grid place-content-center px-6">
      <form onSubmit={submit} className="w-full max-w-xs text-center">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">Ninho</h1>
        <p className="text-ink-soft text-sm mt-2">Digite seu PIN para entrar</p>

        <input
          ref={ref}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          aria-label="PIN"
          className="mt-6 w-full text-center text-3xl tracking-[0.5em] bg-card border border-line rounded-2xl py-3 outline-none focus:border-rust"
        />
        <p className="h-6 mt-2 text-sm text-brick" role="alert">
          {error ? "PIN incorreto" : ""}
        </p>

        <button
          type="submit"
          disabled={busy || pin.length < 4}
          className="mt-2 w-full bg-rust text-white rounded-full py-3 font-medium hover:bg-rust-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
