export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind bg-class or hex code
  icon: string;  // Lucide icon name
  budget?: number; // Optional budget limit
}

export type TransactionType = 'income' | 'expense' | 'fixed_expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  type: TransactionType;
}

export type BillFrequency = 'monthly' | 'quarterly' | 'annual';

export interface RecurringBill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // Next due date YYYY-MM-DD
  frequency: BillFrequency;
  notifyDaysBefore: number;
  logoType?: 'netflix' | 'paypal' | 'spotify' | 'other';
  isPaid?: boolean;
  categoryId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string; // ISO string
  type: 'budget_warning' | 'bill_warning' | 'system';
  read: boolean;
}

export interface FinancialSummary {
  income: number;
  fixedExpenses: number;
  variableExpenses: number;
  availableBalance: number;
}
