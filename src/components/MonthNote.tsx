import { useEffect, useState } from "react";

interface Props {
  note: string;
  onChange: (note: string) => void;
}

export function MonthNote({ note, onChange }: Props) {
  const [value, setValue] = useState(note);

  useEffect(() => setValue(note), [note]);

  return (
    <section className="bg-paper-soft border border-dashed border-line rounded-2xl p-6">
      <p className="text-sm uppercase tracking-[0.14em] text-ink-faint">Um bilhete pra você mesmo</p>
      <textarea
        className="w-full bg-transparent outline-none mt-2 text-ink resize-none font-display text-lg leading-relaxed placeholder:text-ink-faint placeholder:font-body placeholder:text-sm"
        rows={2}
        placeholder="Por que essa meta importa esse mês? O que você quer lembrar em dezembro?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onChange(value)}
      />
    </section>
  );
}
