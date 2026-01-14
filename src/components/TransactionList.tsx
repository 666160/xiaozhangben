import { format, parseISO, isToday, isYesterday } from 'date-fns';
import zhCN from 'date-fns/locale/zh-CN';
import { Trash2 } from 'lucide-react';
import { Transaction, DEFAULT_CATEGORIES } from '../types';
import { useState } from 'react';

interface TransactionListProps {
  groupedByDate: Record<string, Transaction[]>;
  onDelete: (id: string) => void;
}

export function TransactionList({ groupedByDate, onDelete }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return '今天';
    if (isYesterday(date)) return '昨天';
    return format(date, 'M月d日 EEEE', { locale: zhCN });
  };

  const getDayTotal = (transactions: Transaction[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  };

  const getCategoryInfo = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId) || {
      name: '未知',
      icon: '❓',
      color: '#6b7280',
    };
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      onDelete(id);
      setDeletingId(null);
    } else {
      setDeletingId(id);
      // 3秒后自动取消删除确认状态
      setTimeout(() => setDeletingId(prev => prev === id ? null : prev), 3000);
    }
  };

  const dateEntries = Object.entries(groupedByDate);

  if (dateEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6">
        {/* 装饰背景 */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-orange-200 rounded-full blur-2xl opacity-40 scale-150" />
          <div className="relative w-32 h-32 bg-gradient-to-br from-primary-100 to-orange-100 rounded-3xl flex items-center justify-center rotate-6 shadow-lg">
            <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>📝</div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">还没有账单记录</h3>
        <p className="text-gray-500 text-center max-w-xs leading-relaxed">
          点击右下角的 <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-500 text-white text-xs rounded-full mx-1">+</span> 按钮<br/>开始记录你的第一笔账吧！
        </p>
        
        {/* 引导箭头 */}
        <div className="mt-8 text-primary-400 animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateEntries.map(([dateStr, transactions], dateIndex) => {
        const { income, expense } = getDayTotal(transactions);
        
        return (
          <div 
            key={dateStr} 
            className="animate-slide-up"
            style={{ animationDelay: `${dateIndex * 50}ms` }}
          >
            {/* 日期头部 */}
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full" />
                <h3 className="text-sm font-bold text-gray-800">
                  {formatDateLabel(dateStr)}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {income > 0 && (
                  <span className="px-2 py-1 bg-income/10 text-income rounded-lg font-medium">
                    +¥{income.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                )}
                {expense > 0 && (
                  <span className="px-2 py-1 bg-expense/10 text-expense rounded-lg font-medium">
                    -¥{expense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* 交易列表 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 overflow-hidden">
              {transactions.map((transaction, index) => {
                const category = getCategoryInfo(transaction.categoryId);
                const isDeleting = deletingId === transaction.id;

                return (
                  <div
                    key={transaction.id}
                    className={`flex items-center gap-4 p-4 transition-all duration-200
                      ${index !== transactions.length - 1 ? 'border-b border-gray-100' : ''}
                      ${isDeleting ? 'bg-red-50' : 'hover:bg-gray-50/80'}
                    `}
                  >
                    {/* 图标 */}
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`,
                        border: `1px solid ${category.color}20`
                      }}
                    >
                      {category.icon}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{category.name}</span>
                        <span className="text-xs text-gray-400">
                          {format(parseISO(transaction.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      {transaction.note && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {transaction.note}
                        </p>
                      )}
                    </div>

                    {/* 金额 */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xl font-bold tracking-tight ${
                        transaction.type === 'expense' ? 'text-expense' : 'text-income'
                      }`}>
                        {transaction.type === 'expense' ? '−' : '+'}
                        <span className="text-base">¥</span>
                        {transaction.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* 删除按钮 */}
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0
                        ${isDeleting 
                          ? 'bg-expense text-white scale-110 shadow-lg shadow-expense/30' 
                          : 'text-gray-300 hover:bg-red-50 hover:text-expense'
                        }`}
                      title={isDeleting ? '再次点击确认删除' : '删除'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
