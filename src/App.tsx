import { BillsSection } from "./components/BillsSection";
import { CategoryChart } from "./components/CategoryChart";
import { DebtsSection } from "./components/DebtsSection";
import { EvolutionChart, type MonthPoint } from "./components/EvolutionChart";
import { ExpensesSection } from "./components/ExpensesSection";
import { GoalTracker } from "./components/GoalTracker";
import { Header } from "./components/Header";
import { IncomeCard } from "./components/IncomeCard";
import { Ledger } from "./components/Ledger";
import { MonthNote } from "./components/MonthNote";
import { useStore } from "./hooks/useStore";
import { balance, expensesByCategory } from "./lib/finance";
import { getMonth, shiftMonthKey, shortLabelForMonthKey } from "./lib/storage";
import type { Bill, Debt, Expense } from "./lib/types";

function App() {
  const { store, month, currentKey, setCurrentKey, updateMonth } = useStore();

  const previousKey = shiftMonthKey(currentKey, -1);
  const previousMonth = store[previousKey];
  const previousBalance = previousMonth ? balance(previousMonth) : null;

  const history: MonthPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const key = shiftMonthKey(currentKey, -i);
    const m = getMonth(store, key);
    history.push({ key, label: shortLabelForMonthKey(key), balance: balance(m), goal: m.goal });
  }

  const categories = expensesByCategory(month);

  return (
    <div className="min-h-screen relative">
      <div className="paper-texture" aria-hidden />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14 relative z-10">
        <Header currentKey={currentKey} onChange={setCurrentKey} />

        <main className="mt-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <Ledger month={month} previousBalance={previousBalance} />
            <GoalTracker month={month} onSetGoal={(goal) => updateMonth((m) => ({ ...m, goal }))} />
          </div>

          <IncomeCard
            month={month}
            onChange={(income, extraIncome) => updateMonth((m) => ({ ...m, income, extraIncome }))}
          />

          <MonthNote note={month.note} onChange={(note) => updateMonth((m) => ({ ...m, note }))} />

          <ExpensesSection
            expenses={month.expenses}
            onAdd={(expense: Expense) => updateMonth((m) => ({ ...m, expenses: [...m.expenses, expense] }))}
            onRemove={(id) =>
              updateMonth((m) => ({ ...m, expenses: m.expenses.filter((e) => e.id !== id) }))
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            />
            <DebtsSection
              debts={month.debts}
              onAdd={(debt: Debt) => updateMonth((m) => ({ ...m, debts: [...m.debts, debt] }))}
              onRemove={(id) => updateMonth((m) => ({ ...m, debts: m.debts.filter((d) => d.id !== id) }))}
              onAdvance={(id) =>
                updateMonth((m) => ({
                  ...m,
                  debts: m.debts.map((d) =>
                    d.id === id ? { ...d, paidInstallments: Math.min(d.paidInstallments + 1, d.totalInstallments) } : d
                  ),
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EvolutionChart data={history} />
            <CategoryChart data={categories} />
          </div>
        </main>

        <footer className="mt-14 pt-6 border-t border-line/70 text-center text-xs text-ink-faint">
          Seus dados ficam só neste navegador — nada é enviado pra lugar nenhum.
        </footer>
      </div>
    </div>
  );
}

export default App;
