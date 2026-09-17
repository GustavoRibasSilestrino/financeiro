import { useEffect, useMemo, useState } from "react";
import { getMonth, loadStore, monthKey, saveStore } from "../lib/storage";
import type { MonthData, Store } from "../lib/types";

export function useStore() {
  const [store, setStore] = useState<Store>(() => loadStore());
  const [currentKey, setCurrentKey] = useState<string>(() => monthKey(new Date()));

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const month = useMemo(() => getMonth(store, currentKey), [store, currentKey]);

  function updateMonth(updater: (m: MonthData) => MonthData) {
    setStore((prev) => ({
      ...prev,
      [currentKey]: updater(getMonth(prev, currentKey)),
    }));
  }

  const availableKeys = useMemo(
    () =>
      Array.from(new Set([...Object.keys(store), currentKey])).sort((a, b) =>
        a.localeCompare(b)
      ),
    [store, currentKey]
  );

  return { store, month, currentKey, setCurrentKey, updateMonth, availableKeys };
}
