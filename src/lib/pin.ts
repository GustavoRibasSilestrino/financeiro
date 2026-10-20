const KEY = "ninho.pin";

interface StoredPin {
  salt: string;
  hash: string;
}

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

async function digest(salt: string, pin: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${pin}`)));
}

function read(): StoredPin | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredPin) : null;
  } catch {
    return null;
  }
}

export function hasPin(): boolean {
  return read() !== null;
}

export async function setPin(pin: string): Promise<void> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  localStorage.setItem(KEY, JSON.stringify({ salt, hash: await digest(salt, pin) } satisfies StoredPin));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = read();
  if (!stored) return true;
  return (await digest(stored.salt, pin)) === stored.hash;
}

export function clearPin() {
  localStorage.removeItem(KEY);
}

export const PIN_PATTERN = /^\d{4,6}$/;
