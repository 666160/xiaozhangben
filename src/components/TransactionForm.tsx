import { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { TransactionType, DEFAULT_CATEGORIES, Transaction } from '../types';
import { format } from 'date-fns';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function TransactionForm({ onSubmit, onClose }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const categories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      categoryId,
      note,
      date,
    });

    onClose();
  };

  const quickAmounts = type === 'expense' 
    ? [10, 20, 50, 100, 200, 500]
    : [1000, 2000, 5000, 10000, 20000, 50000];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full sm:w-[480px] sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 表单头部 */}
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">记一笔</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {/* 类型切换 */}
          <div className="flex bg-gray-100 rounded-2xl p-1.5">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                type === 'expense' 
                  ? 'bg-expense text-white shadow-lg shadow-expense/30' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💸 支出
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                type === 'income' 
                  ? 'bg-income text-white shadow-lg shadow-income/30' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💰 收入
            </button>
          </div>

          {/* 金额输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">金额</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-2xl border-2 transition-all
                  ${type === 'expense' 
                    ? 'border-expense/20 focus:border-expense text-expense' 
                    : 'border-income/20 focus:border-income text-income'
                  }`}
              />
            </div>
            {/* 快捷金额 */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                    ${amount === amt.toString()
                      ? type === 'expense'
                        ? 'bg-expense/10 border-expense text-expense'
                        : 'bg-income/10 border-income text-income'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  {amt >= 10000 ? `${amt / 10000}万` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">分类</label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center py-3 px-2 rounded-2xl border-2 transition-all
                    ${categoryId === cat.id
                      ? 'border-primary-400 bg-primary-50 scale-105 shadow-lg'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <span className={`text-xs font-medium ${
                    categoryId === cat.id ? 'text-primary-600' : 'text-gray-600'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 日期选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">日期</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注信息..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary-400 transition-all resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={!amount || !categoryId}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
              ${!amount || !categoryId
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : type === 'expense'
                  ? 'bg-gradient-to-r from-expense to-red-500 text-white shadow-lg shadow-expense/30 hover:shadow-xl active:scale-[0.98]'
                  : 'bg-gradient-to-r from-income to-emerald-500 text-white shadow-lg shadow-income/30 hover:shadow-xl active:scale-[0.98]'
              }`}
          >
            <Plus className="w-5 h-5" />
            确认记账
          </button>
        </form>
      </div>
    </div>
  );
}
