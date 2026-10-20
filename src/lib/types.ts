export type Category =
  | "Moradia"
  | "Alimentação"
  | "Transporte"
  | "Saúde"
  | "Lazer"
  | "Educação"
  | "Assinaturas"
  | "Outros";

export const CATEGORIES: Category[] = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Assinaturas",
  "Outros",
];

export type CategoryLimits = Partial<Record<Category, number>>;

export interface Expense {
  id: string;
  name: string;
  category: Category;
  amount: number;
  fixed: boolean;
  /** Day the money left (YYYY-MM-DD). Older entries have none. */
  date?: string;
  tags?: string[];
  note?: string;
  /** Part of a weekly series; occurrences share the id and are regenerated every month. */
  weeklyGroup?: string;
  /** Split with other people: what was paid in total and among how many (amount is only my share). */
  splitTotal?: number;
  splitPeople?: number;
  /** Others already paid me back their share. */
  received?: boolean;
  /** A photo of the receipt is stored on this device (IndexedDB), keyed by the expense id. */
  hasReceipt?: boolean;
}

export interface Objective {
  id: string;
  name: string;
  target: number;
  saved: number;
  /** Month (YYYY-MM) the goal should be reached by. */
  deadline?: string;
}

export interface MonthClosing {
  /** Where the leftover went: "reserve" or an objective id. */
  to: string;
  toName: string;
  moved: number;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  /** Day of the month the money arrives. */
  day: number;
  recurring?: boolean;
}

export interface Purchase {
  id: string;
  name: string;
  amount: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  paid: boolean;
  recurring?: boolean;
  /** Itemized charges (e.g. credit card purchases); when present they add up to `amount`. */
  purchases?: Purchase[];
}

export interface Debt {
  id: string;
  name: string;
  installmentAmount: number;
  totalInstallments: number;
  /** First month (YYYY-MM) with an installment due. */
  startMonth?: string;
  /** Legacy counter from before debts had a start month. */
  paidInstallments?: number;
}

export interface MonthData {
  income: number;
  extraIncome: number;
  goal: number;
  note: string;
  categoryLimits?: CategoryLimits;
  /** Extra income sources beyond the two fixed fields above. */
  incomes?: IncomeSource[];
  /** Savings goals with a name and a target; carried forward like category limits. */
  objectives?: Objective[];
  closing?: MonthClosing;
  /** Emergency fund: amount saved so far and target in months of spending. Carried forward like category limits. */
  reserveSaved?: number;
  reserveMonths?: number;
  expenses: Expense[];
  bills: Bill[];
  debts: Debt[];
}

export const emptyMonth = (): MonthData => ({
  income: 0,
  extraIncome: 0,
  goal: 0,
  note: "",
  expenses: [],
  bills: [],
  debts: [],
});

export type Store = Record<string, MonthData>;
