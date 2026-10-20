// Receipt photos live in IndexedDB, not in the main store: they are big and localStorage is capped at ~5 MB.

const DB = "ninho-receipts";
const STORE = "receipts";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export const saveReceipt = (id: string, blob: Blob) => run("readwrite", (s) => s.put(blob, id)).then(() => undefined);
export const getReceipt = (id: string) => run<Blob | undefined>("readonly", (s) => s.get(id));
export const deleteReceipt = (id: string) => run("readwrite", (s) => s.delete(id)).then(() => undefined);

/** Shrinks a photo to at most `max` px on its long side, as a JPEG, so receipts stay small. */
export async function compressImage(file: File, max = 1000, quality = 0.7): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("imagem inválida"))), "image/jpeg", quality));
}
