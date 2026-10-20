import { useState } from "react";

export interface EditField {
  key: string;
  label: string;
  kind: "text" | "number" | "select" | "check";
  options?: readonly string[];
  width?: string;
}

export type EditValues = Record<string, string | boolean>;

interface Props {
  fields: EditField[];
  initial: EditValues;
  onSave: (values: EditValues) => void;
  onCancel: () => void;
}

const inputCls = "w-full border-b border-line focus:border-rust outline-none py-1.5 bg-transparent";

export function EditRow({ fields, initial, onSave, onCancel }: Props) {
  const [values, setValues] = useState<EditValues>(initial);
  const set = (key: string, value: string | boolean) => setValues((v) => ({ ...v, [key]: value }));

  return (
    <li className="py-3">
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(values);
        }}
      >
        {fields.map((f) => (
          <div key={f.key} className={f.width ?? "flex-1 min-w-[120px]"}>
            {f.kind === "check" ? (
              <label className="flex items-center gap-2 text-sm text-ink-soft pb-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="stamp-checkbox"
                  checked={values[f.key] === true}
                  onChange={(e) => set(f.key, e.target.checked)}
                />
                {f.label}
              </label>
            ) : (
              <>
                <label className="text-xs text-ink-faint">{f.label}</label>
                {f.kind === "select" ? (
                  <select
                    className={`${inputCls} cursor-pointer`}
                    value={String(values[f.key])}
                    onChange={(e) => set(f.key, e.target.value)}
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputCls}
                    inputMode={f.kind === "number" ? "decimal" : undefined}
                    value={String(values[f.key])}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2 pb-1">
          <button
            type="submit"
            className="text-sm bg-rust text-white px-4 py-2 rounded-full hover:bg-rust-dark transition-colors cursor-pointer"
          >
            salvar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm border border-line text-ink-soft px-4 py-2 rounded-full cursor-pointer"
          >
            cancelar
          </button>
        </div>
      </form>
    </li>
  );
}
