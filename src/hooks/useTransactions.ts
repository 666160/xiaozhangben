import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Transaction, DEFAULT_CATEGORIES, CategoryStats, MonthlyStats } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';

const STORAGE_KEY = 'bookkeeping_transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(STORAGE_KEY, []);

  // 添加交易
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, [setTransactions]);

  // 删除交易
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  // 更新交易
  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, [setTransactions]);

  // 按日期排序的交易
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  // 按日期分组
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    sortedTransactions.forEach(t => {
      const dateKey = t.date;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });
    return groups;
  }, [sortedTransactions]);

  // 获取指定月份的交易
  const getMonthTransactions = useCallback((date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return transactions.filter(t => {
      const tDate = parseISO(t.date);
      return isWithinInterval(tDate, { start, end });
    });
  }, [transactions]);

  // 本月统计
  const currentMonthStats = useMemo(() => {
    const monthTx = getMonthTransactions(new Date());
    const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: monthTx.length,
    };
  }, [getMonthTransactions]);

  // 分类统计
  const getCategoryStats = useCallback((type: 'income' | 'expense', date?: Date): CategoryStats[] => {
    const targetDate = date || new Date();
    const monthTx = getMonthTransactions(targetDate).filter(t => t.type === type);
    const total = monthTx.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    monthTx.forEach(t => {
      const current = categoryMap.get(t.categoryId) || { amount: 0, count: 0 };
      categoryMap.set(t.categoryId, {
        amount: current.amount + t.amount,
        count: current.count + 1,
      });
    });

    const stats: CategoryStats[] = [];
    categoryMap.forEach((value, categoryId) => {
      const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
      if (category) {
        stats.push({
          categoryId,
          categoryName: category.name,
          icon: category.icon,
          color: category.color,
          amount: value.amount,
          percentage: total > 0 ? (value.amount / total) * 100 : 0,
          count: value.count,
        });
      }
    });

    return stats.sort((a, b) => b.amount - a.amount);
  }, [getMonthTransactions]);

  // 最近6个月趋势
  const monthlyTrend = useMemo((): MonthlyStats[] => {
    const result: MonthlyStats[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const monthTx = getMonthTransactions(targetDate);
      const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      result.push({
        month: format(targetDate, 'M月', { locale: zhCN }),
        income,
        expense,
        balance: income - expense,
      });
    }

    return result;
  }, [getMonthTransactions]);

  return {
    transactions: sortedTransactions,
    groupedByDate,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    currentMonthStats,
    getCategoryStats,
    monthlyTrend,
    getMonthTransactions,
  };
}
