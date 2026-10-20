import { useEffect, useState } from "react";
import { getReceipt } from "../lib/receipts";

interface Props {
  id: string;
  title: string;
  onRemove: () => void;
  onClose: () => void;
}

export function ReceiptViewer({ id, title, onRemove, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    getReceipt(id)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) return setFailed(true);
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setFailed(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.removeEventListener("keydown", onKey);
    };
  }, [id, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Comprovante de ${title}`}>
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative max-w-lg w-full bg-card border border-line rounded-3xl p-4 shadow-warm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="font-medium truncate">{title}</p>
          <button onClick={onClose} className="text-ink-faint hover:text-ink text-2xl leading-none cursor-pointer" aria-label="Fechar">
            ×
          </button>
        </div>
        {failed ? (
          <p className="text-sm text-ink-soft py-10 text-center">Não foi possível abrir o comprovante.</p>
        ) : url ? (
          <img src={url} alt={`Comprovante de ${title}`} className="w-full max-h-[70vh] object-contain rounded-xl bg-black/30" />
        ) : (
          <p className="text-sm text-ink-soft py-10 text-center">Carregando...</p>
        )}
        <button
          onClick={() => window.confirm("Remover a foto deste comprovante?") && onRemove()}
          className="mt-3 text-sm text-brick hover:underline cursor-pointer"
        >
          Remover foto
        </button>
      </div>
    </div>
  );
}
