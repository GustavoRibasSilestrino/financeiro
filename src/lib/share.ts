import { formatBRL, type CategorySlice } from "./finance";

export interface Summary {
  label: string;
  income: number;
  out: number;
  balance: number;
  categories: CategorySlice[];
}

const TOP = 5;

export function summaryText(s: Summary): string {
  const total = s.categories.reduce((sum, c) => sum + c.amount, 0);
  const lines = [
    `Ninho — ${s.label}`,
    `Entrou: ${formatBRL(s.income)}`,
    `Saiu: ${formatBRL(s.out)}`,
    `${s.balance >= 0 ? "Sobrou" : "Faltou"}: ${formatBRL(Math.abs(s.balance))}`,
  ];
  const top = s.categories.slice(0, TOP);
  if (top.length) {
    lines.push("", "Onde foi o dinheiro:");
    for (const c of top) lines.push(`• ${c.category}: ${formatBRL(c.amount)} (${total ? Math.round((c.amount / total) * 100) : 0}%)`);
  }
  return lines.join("\n");
}

/** Draws the summary as a 1080x1350 PNG, using the app's dark palette. */
export async function summaryImage(s: Summary): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas indisponível");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f1226");
  bg.addColorStop(1, "#1d1a4a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const font = (size: number, weight = 500) => `${weight} ${size}px "Plus Jakarta Sans", "Inter", system-ui, sans-serif`;
  const text = (t: string, x: number, y: number, color: string, f: string, align: CanvasTextAlign = "left") => {
    ctx.fillStyle = color;
    ctx.font = f;
    ctx.textAlign = align;
    ctx.fillText(t, x, y);
  };

  text("Ninho", 80, 130, "#eceefb", font(56, 800));
  text(s.label, 80, 190, "#a4a9c7", font(36));

  const hero = ctx.createLinearGradient(60, 250, W - 60, 600);
  hero.addColorStop(0, "#5b4bf0");
  hero.addColorStop(1, "#a37bff");
  ctx.fillStyle = hero;
  ctx.beginPath();
  ctx.roundRect(60, 250, W - 120, 330, 40);
  ctx.fill();

  text(s.balance >= 0 ? "Sobrou" : "Faltou", 110, 330, "rgba(255,255,255,0.75)", font(34));
  text(formatBRL(Math.abs(s.balance)), 110, 430, "#ffffff", font(92, 800));
  text(`Entrou ${formatBRL(s.income)}`, 110, 510, "rgba(255,255,255,0.85)", font(34));
  text(`Saiu ${formatBRL(s.out)}`, 110, 556, "rgba(255,255,255,0.85)", font(34));

  const top = s.categories.slice(0, TOP);
  const max = Math.max(...top.map((c) => c.amount), 1);
  if (top.length) {
    text("Onde foi o dinheiro", 80, 690, "#eceefb", font(40, 700));
    top.forEach((c, i) => {
      const y = 760 + i * 115;
      text(c.category, 80, y, "#eceefb", font(34));
      text(formatBRL(c.amount), W - 80, y, "#a4a9c7", font(34), "right");
      ctx.fillStyle = "#20244a";
      ctx.beginPath();
      ctx.roundRect(80, y + 20, W - 160, 22, 11);
      ctx.fill();
      ctx.fillStyle = "#7b6cff";
      ctx.beginPath();
      ctx.roundRect(80, y + 20, Math.max((c.amount / max) * (W - 160), 22), 22, 11);
      ctx.fill();
    });
  }

  text("Feito com o Ninho", W / 2, H - 60, "#7a80a3", font(28), "center");

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("falha ao gerar a imagem"))), "image/png"));
}
