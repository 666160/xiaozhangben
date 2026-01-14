import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { MonthlyStats, CategoryStats } from '../types';

interface StatisticsProps {
  monthlyTrend: MonthlyStats[];
  expenseStats: CategoryStats[];
  incomeStats: CategoryStats[];
}

export function Statistics({ monthlyTrend, expenseStats, incomeStats }: StatisticsProps) {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const stats = activeTab === 'expense' ? expenseStats : incomeStats;
  const total = stats.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* 月度趋势 */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="font-bold text-gray-800">收支趋势</h3>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend} barGap={4}>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(241, 147, 51, 0.1)' }}
                contentStyle={{
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px',
                }}
                formatter={(value: number) => `¥${value.toLocaleString()}`}
              />
              <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} name="收入" />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="支出" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-income" />
            <span className="text-sm text-gray-600">收入</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-expense" />
            <span className="text-sm text-gray-600">支出</span>
          </div>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-800">本月分类</h3>
          </div>

          {/* 切换标签 */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'expense' 
                  ? 'bg-expense text-white' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              支出
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === 'income' 
                  ? 'bg-income text-white' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              收入
            </button>
          </div>
        </div>

        {stats.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <span className="text-4xl block mb-2">📊</span>
            暂无{activeTab === 'expense' ? '支出' : '收入'}数据
          </div>
        ) : (
          <>
            {/* 分类列表 */}
            <div className="space-y-3">
              {stats.slice(0, 6).map((stat, index) => (
                <div 
                  key={stat.categoryId}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl">{stat.icon}</span>
                    <span className="flex-1 font-medium text-gray-700">{stat.categoryName}</span>
                    <span className="text-sm text-gray-500">{stat.count}笔</span>
                    <span className={`font-bold ${activeTab === 'expense' ? 'text-expense' : 'text-income'}`}>
                      ¥{stat.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stat.percentage}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {stat.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

            {/* 总计 */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-600">本月{activeTab === 'expense' ? '支出' : '收入'}合计</span>
              <span className={`text-xl font-bold ${activeTab === 'expense' ? 'text-expense' : 'text-income'}`}>
                ¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
