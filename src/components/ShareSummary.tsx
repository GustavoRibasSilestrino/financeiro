import { useState } from "react";
import { summaryImage, summaryText, type Summary } from "../lib/share";

interface Props {
  summary: Summary;
}

export function ShareSummary({ summary }: Props) {
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const hasData = summary.income > 0 || summary.out > 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(summaryText(summary));
      setMessage({ text: "Resumo copiado. É só colar na conversa.", error: false });
    } catch {
      setMessage({ text: "Não foi possível copiar neste navegador.", error: true });
    }
  }

  async function share() {
    setBusy(true);
    try {
      const blob = await summaryImage(summary);
      const file = new File([blob], `ninho-${summary.label.toLowerCase().replaceAll(" ", "-")}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: summaryText(summary) });
        setMessage(null);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({ text: "Imagem baixada.", error: false });
      }
    } catch (err) {
      // closing the share sheet is not an error
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setMessage({ text: "Não foi possível gerar a imagem.", error: true });
      }
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "text-sm px-4 py-2 rounded-full border border-line text-ink-soft hover:border-rust hover:text-rust-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <section className="bg-card border border-line rounded-3xl shadow-warm p-5 sm:p-8">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Compartilhar resumo</p>
      <p className="text-ink-soft text-sm mt-1">Gera uma imagem ou um texto do mês para mandar no WhatsApp ou guardar.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btn} disabled={!hasData || busy} onClick={share}>
          {busy ? "Gerando..." : "Compartilhar imagem"}
        </button>
        <button className={btn} disabled={!hasData} onClick={copy}>
          Copiar texto
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-sm ${message.error ? "text-brick" : "text-sage-dark"}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
