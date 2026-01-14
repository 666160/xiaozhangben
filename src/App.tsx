import { useState } from 'react';
import { Header } from './components/Header';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { AddButton } from './components/AddButton';
import { TabBar } from './components/TabBar';
import { Statistics } from './components/Statistics';
import { SettingsPanel } from './components/SettingsPanel';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Transaction } from './types';

type TabType = 'records' | 'stats' | 'settings';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('records');
  
  const {
    transactions,
    groupedByDate,
    addTransaction,
    deleteTransaction,
    currentMonthStats,
    getCategoryStats,
    monthlyTrend,
  } = useTransactions();

  const [, setStoredTransactions] = useLocalStorage<Transaction[]>('bookkeeping_transactions', []);

  const handleImport = (importedTransactions: Transaction[]) => {
    // 合并导入的数据
    setStoredTransactions(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTransactions = importedTransactions.filter(t => !existingIds.has(t.id));
      return [...prev, ...newTransactions];
    });
  };

  const handleClear = () => {
    setStoredTransactions([]);
  };

  const expenseStats = getCategoryStats('expense');
  const incomeStats = getCategoryStats('income');

  return (
    <div className="min-h-screen pb-24">
      {/* 头部 - 只在账单页显示 */}
      {activeTab === 'records' && (
        <Header 
          income={currentMonthStats.income}
          expense={currentMonthStats.expense}
          balance={currentMonthStats.balance}
        />
      )}

      {/* 页面标题 - 非账单页 */}
      {activeTab !== 'records' && (
        <div className="bg-white px-5 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === 'stats' ? '📊 统计分析' : '⚙️ 设置'}
          </h1>
        </div>
      )}

      {/* 主内容区 */}
      <main className="px-5 py-6">
        {activeTab === 'records' && (
          <TransactionList 
            groupedByDate={groupedByDate}
            onDelete={deleteTransaction}
          />
        )}

        {activeTab === 'stats' && (
          <Statistics 
            monthlyTrend={monthlyTrend}
            expenseStats={expenseStats}
            incomeStats={incomeStats}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel 
            transactions={transactions}
            onImport={handleImport}
            onClear={handleClear}
          />
        )}
      </main>

      {/* 添加按钮 - 只在账单页显示 */}
      {activeTab === 'records' && (
        <AddButton onClick={() => setShowForm(true)} />
      )}

      {/* 底部导航 */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 添加表单弹窗 */}
      {showForm && (
        <TransactionForm 
          onSubmit={addTransaction}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default App;
