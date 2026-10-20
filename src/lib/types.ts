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
