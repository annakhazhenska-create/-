
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  limit?: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Харчування', icon: 'Utensils', color: '#f87171' },
  { id: 'transport', name: 'Транспорт', icon: 'Car', color: '#60a5fa' },
  { id: 'housing', name: 'Житло', icon: 'Home', color: '#fbbf24' },
  { id: 'entertainment', name: 'Розваги', icon: 'Gamepad2', color: '#a78bfa' },
  { id: 'health', name: 'Здоров\'я', icon: 'HeartPulse', color: '#f472b6' },
  { id: 'shopping', name: 'Покупки', icon: 'ShoppingBag', color: '#fb923c' },
  { id: 'salary', name: 'Зарплата', icon: 'Wallet', color: '#4ade80' },
  { id: 'other', name: 'Інше', icon: 'MoreHorizontal', color: '#94a3b8' },
];
