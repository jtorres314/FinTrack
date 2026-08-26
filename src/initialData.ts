import { Category, Transaction, RecurringBill } from './types';

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_BILL_TEMPLATES = [
  { title: 'Netflix', amount: 10.99, logoType: 'netflix', frequency: 'monthly', notifyDaysBefore: 3 },
  { title: 'Paypal', amount: 3.50, logoType: 'paypal', frequency: 'monthly', notifyDaysBefore: 2 },
  { title: 'Spotify', amount: 10.00, logoType: 'spotify', frequency: 'monthly', notifyDaysBefore: 1 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_RECURRING_BILLS: RecurringBill[] = [];

