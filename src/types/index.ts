export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // ISO date string
  createdAt: string; // ISO datetime string
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

// 默认分类
export const DEFAULT_CATEGORIES: Category[] = [
  // 支出分类
  { id: 'food', name: '餐饮', icon: '🍜', type: 'expense', color: '#ef4444' },
  { id: 'transport', name: '交通', icon: '🚗', type: 'expense', color: '#f97316' },
  { id: 'shopping', name: '购物', icon: '🛒', type: 'expense', color: '#eab308' },
  { id: 'entertainment', name: '娱乐', icon: '🎮', type: 'expense', color: '#84cc16' },
  { id: 'living', name: '生活', icon: '🏠', type: 'expense', color: '#22c55e' },
  { id: 'medical', name: '医疗', icon: '💊', type: 'expense', color: '#14b8a6' },
  { id: 'education', name: '学习', icon: '📚', type: 'expense', color: '#06b6d4' },
  { id: 'social', name: '社交', icon: '🎁', type: 'expense', color: '#3b82f6' },
  { id: 'clothing', name: '服饰', icon: '👔', type: 'expense', color: '#8b5cf6' },
  { id: 'digital', name: '数码', icon: '📱', type: 'expense', color: '#a855f7' },
  { id: 'pet', name: '宠物', icon: '🐱', type: 'expense', color: '#ec4899' },
  { id: 'other_expense', name: '其他', icon: '📦', type: 'expense', color: '#6b7280' },
  
  // 收入分类
  { id: 'salary', name: '工资', icon: '💰', type: 'income', color: '#22c55e' },
  { id: 'bonus', name: '奖金', icon: '🎉', type: 'income', color: '#10b981' },
  { id: 'investment', name: '理财', icon: '📈', type: 'income', color: '#14b8a6' },
  { id: 'sideline', name: '副业', icon: '💼', type: 'income', color: '#06b6d4' },
  { id: 'gift', name: '红包', icon: '🧧', type: 'income', color: '#ef4444' },
  { id: 'refund', name: '退款', icon: '💸', type: 'income', color: '#f97316' },
  { id: 'other_income', name: '其他', icon: '✨', type: 'income', color: '#6b7280' },
];
