import { Transaction, Category, RecurringBill, AppNotification } from '../types';

// Colombian Peso (COP) Currency Formatter
export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    const parts = Math.round(amount).toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `$${parts.join(",")}`;
  }
}

// Helper to get total income
export function getTotalIncome(transactions: Transaction[], baseIncome: number): number {
  const transactionIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  return baseIncome + transactionIncome;
}

// Helper to get total fixed expenses
export function getTotalFixedExpenses(transactions: Transaction[], baseFixed: number): number {
  const transactionFixed = transactions
    .filter(t => t.type === 'fixed_expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return baseFixed + transactionFixed;
}

// Helper to get variable expenses
export function getTotalVariableExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

// Get spending for a specific category
export function getCategorySpending(transactions: Transaction[], categoryId: string): number {
  return transactions
    .filter(t => t.type === 'expense' && t.categoryId === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);
}

// Parse standard date string (YYYY-MM-DD)
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Get today's date in local YYYY-MM-DD format
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for user-friendly display (e.g. "30 ago 2026")
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Calculate days difference between two dates
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check budget limits and generate notifications
export function checkBudgets(
  transactions: Transaction[],
  categories: Category[],
  currentNotifications: AppNotification[]
): { warnings: AppNotification[]; updatedCategories: string[] } {
  const warnings: AppNotification[] = [];
  const updatedCategories: string[] = [];

  categories.forEach(cat => {
    if (!cat.budget) return;
    const spent = getCategorySpending(transactions, cat.id);
    const ratio = spent / cat.budget;

    // We only alert if it wasn't already alerted today to prevent spam
    const hasExceededAlert = currentNotifications.some(
      n => n.type === 'budget_warning' && n.message.includes(`excedido el presupuesto de ${cat.name}`)
    );
    const hasApproachingAlert = currentNotifications.some(
      n => n.type === 'budget_warning' && n.message.includes(`cerca de tu presupuesto de ${cat.name}`)
    );

    if (ratio >= 1.0 && !hasExceededAlert) {
      warnings.push({
        id: `warn-budget-exceeded-${cat.id}-${Date.now()}`,
        title: `🚨 Presupuesto Excedido: ${cat.name}`,
        message: `Has gastado ${formatCurrency(spent)} de tu presupuesto de ${formatCurrency(cat.budget)} en la categoría ${cat.name}.`,
        date: new Date().toISOString(),
        type: 'budget_warning',
        read: false,
      });
      updatedCategories.push(cat.id);
    } else if (ratio >= 0.85 && ratio < 1.0 && !hasApproachingAlert) {
      warnings.push({
        id: `warn-budget-approaching-${cat.id}-${Date.now()}`,
        title: `⚠️ Límite Cercano: ${cat.name}`,
        message: `Estás al ${(ratio * 100).toFixed(0)}% de tu presupuesto para ${cat.name} (${formatCurrency(spent)} / ${formatCurrency(cat.budget)}).`,
        date: new Date().toISOString(),
        type: 'budget_warning',
        read: false,
      });
      updatedCategories.push(cat.id);
    }
  });

  return { warnings, updatedCategories };
}

// Check upcoming bills and generate notifications
export function checkUpcomingBills(
  bills: RecurringBill[],
  currentDateStr: string,
  currentNotifications: AppNotification[]
): AppNotification[] {
  const warnings: AppNotification[] = [];
  const currentDate = parseDate(currentDateStr);

  bills.forEach(bill => {
    if (bill.isPaid) return;
    const dueDate = parseDate(bill.dueDate);
    const daysLeft = daysBetween(currentDate, dueDate);

    // Notify if within the warning window and hasn't been notified yet for this due date
    const uniqueBillKey = `${bill.id}-${bill.dueDate}`;
    const hasBeenNotified = currentNotifications.some(
      n => n.type === 'bill_warning' && n.message.includes(uniqueBillKey) || n.message.includes(`vence pronto: ${bill.title}`)
    );

    if (daysLeft >= 0 && daysLeft <= bill.notifyDaysBefore && !hasBeenNotified) {
      let daysMessage = daysLeft === 0 ? 'hoy' : `en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`;
      warnings.push({
        id: `warn-bill-${bill.id}-${Date.now()}`,
        title: `📅 Pago Próximo: ${bill.title}`,
        message: `El pago recurrente de ${bill.title} por ${formatCurrency(bill.amount)} vence ${daysMessage} (${bill.dueDate}). [ref:${uniqueBillKey}]`,
        date: new Date().toISOString(),
        type: 'bill_warning',
        read: false,
      });
    }
  });

  return warnings;
}

// Formats date to display format "12/04" or short string
export function formatToDayMonth(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

// Advance recurring bill due date based on frequency
export function advanceDueDate(currentDueDateStr: string, frequency: 'monthly' | 'quarterly' | 'annual'): string {
  const date = parseDate(currentDueDateStr);
  if (frequency === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (frequency === 'quarterly') {
    date.setMonth(date.getMonth() + 3);
  } else if (frequency === 'annual') {
    date.setFullYear(date.getFullYear() + 1);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
