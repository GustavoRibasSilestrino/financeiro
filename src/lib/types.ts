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
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  paid: boolean;
  recurring?: boolean;
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
