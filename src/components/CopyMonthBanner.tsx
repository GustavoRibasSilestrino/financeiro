interface Props {
  onCopy: () => void;
}

export function CopyMonthBanner({ onCopy }: Props) {
  return (
    <section className="bg-rust-soft rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-rust-dark">
        Este mês ainda está vazio. Quer trazer renda, contas e dívidas do mês anterior?
      </p>
      <button
        onClick={onCopy}
        className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
      >
        Copiar do mês anterior
      </button>
    </section>
  );
}
