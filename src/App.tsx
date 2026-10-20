import { useEffect, useState } from "react";
import { CategoryBudgets } from "./components/CategoryBudgets";
import { CopyMonthBanner } from "./components/CopyMonthBanner";
import { DataTools } from "./components/DataTools";
import { DueAlerts } from "./components/DueAlerts";
import { BillsSection } from "./components/BillsSection";
import { CalendarView } from "./components/CalendarView";
import { CategoryChart } from "./components/CategoryChart";
import { DebtsSection } from "./components/DebtsSection";
import { CategoryCompare } from "./components/CategoryCompare";
import { ReserveTracker } from "./components/ReserveTracker";
import { LockScreen } from "./components/LockScreen";
import { PinSettings } from "./components/PinSettings";
import { DailyBudget } from "./components/DailyBudget";
import { DailySpendingChart } from "./components/DailySpendingChart";
import { QuickAdd } from "./components/QuickAdd";
import { ProjectionChart } from "./components/ProjectionChart";
import { MonthlySpendingChart } from "./components/MonthlySpendingChart";
import { EvolutionChart, type MonthPoint } from "./components/EvolutionChart";
import { ExpensesSection } from "./components/ExpensesSection";
import { GoalsHistory } from "./components/GoalsHistory";
import { GoalTracker } from "./components/GoalTracker";
import { Header } from "./components/Header";
import { IncomeCard } from "./components/IncomeCard";
import { Ledger } from "./components/Ledger";
import { MonthNote } from "./components/MonthNote";
import { SpendingBar } from "./components/SpendingBar";
import { NavTabs, type TabId } from "./components/NavTabs";
import { useStore } from "./hooks/useStore";
import { hasPin } from "./lib/pin";
import { countableMonth } from "./lib/debts";
import { mergeFromPrevious, previousMonthWithData } from "./lib/recurring";
import { balance, expensesByCategory, totalIncome, totalOut } from "./lib/finance";
import { effectiveCategoryLimits, effectiveReserve, labelForMonthKey, getMonth, shiftMonthKey, shortLabelForMonthKey } from "./lib/storage";
import type { Bill, Debt, Expense } from "./lib/types";

function App() {
  const { store, month, currentKey, setCurrentKey, updateMonth, replaceStore } = useStore();
  const [tab, setTab] = useState<TabId>("resumo");
  const [locked, setLocked] = useState(hasPin);

  // lock again when the user comes back after being away for a minute
  useEffect(() => {
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 60_000 && hasPin()) setLocked(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const previousKey = shiftMonthKey(currentKey, -1);
  const previousMonth = store[previousKey];
  const previousBalance = previousMonth ? balance(countableMonth(previousMonth, previousKey)) : null;

  const history: MonthPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const key = shiftMonthKey(currentKey, -i);
    const raw = getMonth(store, key);
    const m = countableMonth(raw, key);
    history.push({ key, label: shortLabelForMonthKey(key), balance: balance(m), income: totalIncome(m), spent: totalOut(m), goal: m.goal });
  }

  const categoryLimits = effectiveCategoryLimits(store, currentKey);
  const reserve = effectiveReserve(store, currentKey);
  const spentMonths = history.filter((h) => h.spent > 0);
  const avgSpend = spentMonths.length ? spentMonths.reduce((s, h) => s + h.spent, 0) / spentMonths.length : 0;
  const recent = history.filter((h) => h.income > 0).slice(-3);
  const avgSaving = recent.length ? recent.reduce((s, h) => s + h.balance, 0) / recent.length : 0;
  const prevData = previousMonthWithData(store, currentKey);
  const monthIsEmpty =
    month.expenses.length + month.bills.length + month.debts.length === 0 && month.income + month.extraIncome === 0;
  const calc = countableMonth(month, currentKey);
  const categories = expensesByCategory(calc);
  const previousCategories = previousMonth ? expensesByCategory(countableMonth(previousMonth, previousKey)) : [];

  function setBillDueDay(id: string, day: number) {
    updateMonth((m) => ({ ...m, bills: m.bills.map((b) => (b.id === id ? { ...b, dueDay: day } : b)) }));
  }

  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;

  return (
    <div className="min-h-screen relative">
      <div className="paper-texture" aria-hidden />
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-12 pb-28 sm:pb-14 relative z-10">
        <Header currentKey={currentKey} onChange={setCurrentKey} />
        <NavTabs active={tab} onChange={setTab} />

        <main className="mt-5 sm:mt-8 space-y-4 sm:space-y-6">
          {tab === "resumo" && (
            <>
              {monthIsEmpty && prevData && (
                <CopyMonthBanner onCopy={() => prevData && updateMonth((m) => mergeFromPrevious(m, prevData, currentKey))} />
              )}
              <DueAlerts currentKey={currentKey} bills={month.bills} />
              <Ledger month={calc} previousBalance={previousBalance} />
              <DailyBudget month={calc} currentKey={currentKey} />
              <SpendingBar month={calc} />
              <IncomeCard
                month={month}
                onChange={(income, extraIncome) => updateMonth((m) => ({ ...m, income, extraIncome }))}
              />
              <MonthNote note={month.note} onChange={(note) => updateMonth((m) => ({ ...m, note }))} />
              <DataTools store={store} onImport={replaceStore} />
              <PinSettings onLock={() => setLocked(true)} />
            </>
          )}

          {tab === "metas" && (
            <>
              <GoalTracker month={calc} onSetGoal={(goal) => updateMonth((m) => ({ ...m, goal }))} />
              <ReserveTracker
                saved={reserve.saved}
                months={reserve.months}
                avgSpend={avgSpend}
                avgSaving={avgSaving}
                onChange={(saved, months) => updateMonth((m) => ({ ...m, reserveSaved: saved, reserveMonths: months }))}
              />
              <GoalsHistory data={[...history].reverse()} />
            </>
          )}

          {tab === "gastos" && (
            <>
              <CategoryBudgets
                expenses={month.expenses}
                limits={categoryLimits}
                onSetLimit={(category, value) =>
                  updateMonth((m) => {
                    const next = { ...categoryLimits };
                    if (value > 0) next[category] = value;
                    else delete next[category];
                    return { ...m, categoryLimits: next };
                  })
                }
              />
              <ExpensesSection
                expenses={month.expenses}
                currentKey={currentKey}
                onAdd={(expense: Expense) => updateMonth((m) => ({ ...m, expenses: [...m.expenses, expense] }))}
                onRemove={(id) =>
                  updateMonth((m) => ({ ...m, expenses: m.expenses.filter((e) => e.id !== id) }))
                }
                onUpdate={(id, patch) =>
                  updateMonth((m) => ({ ...m, expenses: m.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
                }
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <BillsSection
                  bills={month.bills}
                  onAdd={(bill: Bill) => updateMonth((m) => ({ ...m, bills: [...m.bills, bill] }))}
                  onRemove={(id) => updateMonth((m) => ({ ...m, bills: m.bills.filter((b) => b.id !== id) }))}
                  onTogglePaid={(id) =>
                    updateMonth((m) => ({
                      ...m,
                      bills: m.bills.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)),
                    }))
                  }
                  onUpdate={(id, patch) =>
                    updateMonth((m) => ({ ...m, bills: m.bills.map((b) => (b.id === id ? { ...b, ...patch } : b)) }))
                  }
                />
                <DebtsSection
                  debts={month.debts}
                  currentKey={currentKey}
                  onAdd={(debt: Debt) => updateMonth((m) => ({ ...m, debts: [...m.debts, debt] }))}
                  onRemove={(id) => updateMonth((m) => ({ ...m, debts: m.debts.filter((d) => d.id !== id) }))}
                  onUpdate={(id, patch) =>
                    updateMonth((m) => ({ ...m, debts: m.debts.map((d) => (d.id === id ? { ...d, ...patch } : d)) }))
                  }
                />
              </div>
            </>
          )}

          {tab === "evolucao" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <DailySpendingChart expenses={month.expenses} currentKey={currentKey} />
              </div>
              <div className="lg:col-span-2">
                <MonthlySpendingChart data={history} />
              </div>
              <div className="lg:col-span-2">
                <ProjectionChart month={month} currentKey={currentKey} />
              </div>
              <EvolutionChart data={history} />
              <CategoryChart data={categories} />
              <div className="lg:col-span-2">
                <CategoryCompare current={categories} previous={previousCategories} previousLabel={labelForMonthKey(previousKey)} />
              </div>
            </div>
          )}

          {tab === "calendario" && (
            <CalendarView
              currentKey={currentKey}
              bills={month.bills}
              onAdd={(bill: Bill) => updateMonth((m) => ({ ...m, bills: [...m.bills, bill] }))}
              onRemove={(id) => updateMonth((m) => ({ ...m, bills: m.bills.filter((b) => b.id !== id) }))}
              onTogglePaid={(id) =>
                updateMonth((m) => ({
                  ...m,
                  bills: m.bills.map((b) => (b.id === id ? { ...b, paid: !b.paid } : b)),
                }))
              }
              onSetDueDay={setBillDueDay}
            />
          )}
        </main>

        <footer className="mt-10 pt-6 border-t border-line/70 text-center text-xs text-ink-faint">
          Seus dados ficam só neste navegador — nada é enviado pra lugar nenhum.
        </footer>
      </div>
      <QuickAdd currentKey={currentKey} onAdd={(expense: Expense) => updateMonth((m) => ({ ...m, expenses: [...m.expenses, expense] }))} />
    </div>
  );
}

export default App;
