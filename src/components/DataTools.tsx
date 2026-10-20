import { useRef, useState } from "react";
import { exportBackup, exportCsv, parseBackup } from "../lib/backup";
import type { Store } from "../lib/types";

interface Props {
  store: Store;
  onImport: (store: Store) => void;
}

export function DataTools({ store, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const hasData = Object.keys(store).length > 0;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const imported = parseBackup(await file.text());
      const months = Object.keys(imported).length;
      if (!window.confirm(`Importar ${months} ${months === 1 ? "mês" : "meses"}? Isso substitui os dados atuais deste aparelho.`)) return;
      onImport(imported);
      setMessage({ text: "Backup importado com sucesso.", error: false });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Não foi possível importar.", error: true });
    }
  }

  const btn =
    "text-sm px-4 py-2 rounded-full border border-line text-ink-soft hover:border-rust hover:text-rust-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Seus dados</p>
      <p className="text-ink-soft text-sm mt-1">
        Tudo fica salvo só neste aparelho. Faça um backup de vez em quando, e use-o para levar tudo para outro celular.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btn} disabled={!hasData} onClick={() => exportBackup(store)}>
          Baixar backup
        </button>
        <button className={btn} onClick={() => fileRef.current?.click()}>
          Importar backup
        </button>
        <button className={btn} disabled={!hasData} onClick={() => exportCsv(store)}>
          Exportar planilha (CSV)
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.error ? "text-brick" : "text-sage-dark"}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
