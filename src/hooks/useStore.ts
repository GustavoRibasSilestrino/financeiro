import { useEffect, useMemo, useState } from "react";
import { materializeMonth } from "../lib/recurring";
import { getMonth, loadStore, monthKey, saveStore } from "../lib/storage";
import type { MonthData, Store } from "../lib/types";

export function useStore() {
  const [currentKey, setKey] = useState<string>(() => monthKey(new Date()));
  const [store, setStore] = useState<Store>(() => materializeMonth(loadStore(), monthKey(new Date())));

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const month = useMemo(() => getMonth(store, currentKey), [store, currentKey]);

  function setCurrentKey(key: string) {
    setKey(key);
    setStore((prev) => materializeMonth(prev, key));
  }

  function updateMonth(updater: (m: MonthData) => MonthData) {
    setStore((prev) => ({
      ...prev,
      [currentKey]: updater(getMonth(prev, currentKey)),
    }));
  }

  function replaceStore(next: Store) {
    setStore(next);
  }

  return { store, month, currentKey, setCurrentKey, updateMonth, replaceStore };
}
