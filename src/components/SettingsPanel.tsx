import { Download, Upload, Trash2, Info, Heart, FileJson, FileSpreadsheet, FileText, X, Check, ChevronRight } from 'lucide-react';
import { Transaction, DEFAULT_CATEGORIES } from '../types';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';

interface SettingsPanelProps {
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => void;
  onClear: () => void;
}

type ExportFormat = 'json' | 'csv' | 'txt';

interface ExportOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: typeof FileJson;
  color: string;
  bgColor: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'json',
    name: 'JSON 格式',
    description: '完整数据备份，可用于导入恢复',
    icon: FileJson,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    id: 'csv',
    name: 'CSV 表格',
    description: '可用 Excel、WPS 等表格软件打开',
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    id: 'txt',
    name: 'TXT 文本',
    description: '简洁的文本报表，方便查阅打印',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
];

export function SettingsPanel({ transactions, onImport, onClear }: SettingsPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<ExportFormat | null>(null);

  const getCategoryName = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId)?.name || '未知';
  };

  const getCategoryIcon = (categoryId: string) => {
    return DEFAULT_CATEGORIES.find(c => c.id === categoryId)?.icon || '❓';
  };

  // 导出为 JSON
  const exportAsJson = () => {
    const data = JSON.stringify(transactions, null, 2);
    downloadFile(data, 'application/json', 'json');
  };

  // 导出为 CSV
  const exportAsCsv = () => {
    // CSV 头部（添加 BOM 以支持中文）
    const BOM = '\uFEFF';
    const headers = ['日期', '星期', '类型', '分类', '金额(元)', '备注', '记录时间'];
    
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    
    const rows = transactions.map(t => {
      const dateObj = parseISO(t.date);
      const createdObj = parseISO(t.createdAt);
      const weekDay = '星期' + weekDays[dateObj.getDay()];
      
      return [
        format(dateObj, 'yyyy/MM/dd'),  // 使用斜杠格式，Excel 更友好
        weekDay,
        t.type === 'income' ? '收入' : '支出',
        getCategoryName(t.categoryId),
        t.amount.toFixed(2),
        `"${(t.note || '').replace(/"/g, '""')}"`, // 处理引号
        format(createdObj, 'yyyy/MM/dd HH:mm'),
      ];
    });

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, 'text/csv;charset=utf-8', 'csv');
  };

  // 导出为 TXT 文本报表
  const exportAsTxt = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // 按日期分组
    const grouped: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
      if (!grouped[t.date]) grouped[t.date] = [];
      grouped[t.date].push(t);
    });

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    let content = `
╔══════════════════════════════════════════════════════════════╗
║                        小 账 本 报 表                          ║
║                                                              ║
║                  导出时间: ${format(new Date(), 'yyyy-MM-dd HH:mm')}                  ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────── 数据概览 ───────────────────┐
│                                               │
│   📊 总记录数:  ${String(transactions.length).padStart(8)}  笔                   │
│   💰 累计收入:  ${String('¥' + totalIncome.toFixed(2)).padStart(12)}                   │
│   💸 累计支出:  ${String('¥' + totalExpense.toFixed(2)).padStart(12)}                   │
│   ${balance >= 0 ? '📈' : '📉'} 累计结余:  ${String('¥' + balance.toFixed(2)).padStart(12)}                   │
│                                               │
└───────────────────────────────────────────────┘

`;

    // 按日期输出明细
    sortedDates.forEach(date => {
      const dayTransactions = grouped[date];
      const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      content += `\n┌─────────────────────────────────────────────────────────────┐\n`;
      content += `│  📅 ${date}                                              │\n`;
      content += `│     收入: ¥${dayIncome.toFixed(2).padStart(10)}    支出: ¥${dayExpense.toFixed(2).padStart(10)}        │\n`;
      content += `├─────────────────────────────────────────────────────────────┤\n`;

      dayTransactions.forEach(t => {
        const icon = getCategoryIcon(t.categoryId);
        const category = getCategoryName(t.categoryId).padEnd(6);
        const type = t.type === 'income' ? '+' : '-';
        const amount = `${type}¥${t.amount.toFixed(2)}`.padStart(12);
        const note = t.note ? `  ${t.note.slice(0, 20)}` : '';
        content += `│  ${icon} ${category} ${amount}${note.padEnd(30).slice(0, 30)}│\n`;
      });

      content += `└─────────────────────────────────────────────────────────────┘\n`;
    });

    content += `
════════════════════════════════════════════════════════════════
                    ✨ 小账本 - 轻松记录每一笔 ✨
════════════════════════════════════════════════════════════════
`;

    downloadFile(content, 'text/plain;charset=utf-8', 'txt');
  };

  // 下载文件
  const downloadFile = (content: string, mimeType: string, extension: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `小账本_${format(new Date(), 'yyyy-MM-dd_HHmm')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 处理导出
  const handleExport = (formatId: ExportFormat) => {
    switch (formatId) {
      case 'json':
        exportAsJson();
        break;
      case 'csv':
        exportAsCsv();
        break;
      case 'txt':
        exportAsTxt();
        break;
    }
    setExportSuccess(formatId);
    setTimeout(() => {
      setExportSuccess(null);
      setShowExportModal(false);
    }, 1500);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text) as Transaction[];
          if (Array.isArray(data)) {
            onImport(data);
            alert('✅ 导入成功！共导入 ' + data.length + ' 条记录');
          } else {
            alert('❌ 文件格式不正确');
          }
        } else if (file.name.endsWith('.csv')) {
          // 解析 CSV
          const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim());
          if (lines.length < 2) {
            alert('❌ CSV 文件为空');
            return;
          }
          
          const importedData: Transaction[] = [];
          const headers = lines[0].split(',');
          
          // 检测是新格式还是旧格式
          const isNewFormat = headers.includes('星期');
          
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 4) {
              let dateStr: string, typeStr: string, categoryName: string, amount: number, note: string, createdAt: string;
              
              if (isNewFormat) {
                // 新格式: 日期, 星期, 类型, 分类, 金额, 备注, 记录时间
                dateStr = cols[0].replace(/\//g, '-'); // 转换 2026/01/14 -> 2026-01-14
                typeStr = cols[2];
                categoryName = cols[3].replace(/"/g, '');
                amount = parseFloat(cols[4]) || 0;
                note = cols[5]?.replace(/"/g, '') || '';
                createdAt = cols[6] ? new Date(cols[6].replace(/\//g, '-')).toISOString() : new Date().toISOString();
              } else {
                // 旧格式: 日期, 类型, 分类, 金额, 备注, 创建时间
                dateStr = cols[0].replace(/\//g, '-');
                typeStr = cols[1];
                categoryName = cols[2].replace(/"/g, '');
                amount = parseFloat(cols[3]) || 0;
                note = cols[4]?.replace(/"/g, '') || '';
                createdAt = cols[5] ? new Date(cols[5].replace(/\//g, '-')).toISOString() : new Date().toISOString();
              }
              
              const type = typeStr.includes('收入') ? 'income' : 'expense';
              const category = DEFAULT_CATEGORIES.find(c => c.name === categoryName && c.type === type);
              
              importedData.push({
                id: crypto.randomUUID(),
                date: dateStr,
                type,
                categoryId: category?.id || (type === 'income' ? 'other_income' : 'other_expense'),
                amount,
                note,
                createdAt,
              });
            }
          }
          
          if (importedData.length > 0) {
            onImport(importedData);
            alert('✅ 导入成功！共导入 ' + importedData.length + ' 条记录');
          } else {
            alert('❌ 未找到有效数据');
          }
        }
      } catch (err) {
        console.error(err);
        alert('❌ 导入失败，请检查文件格式');
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (showClearConfirm) {
      onClear();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* 数据概览 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">数据概览</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">总记录数</p>
            <p className="text-3xl font-black text-gray-800">{transactions.length}</p>
          </div>
          <div className={`rounded-2xl p-4 ${totalIncome - totalExpense >= 0 
            ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' 
            : 'bg-gradient-to-br from-red-50 to-red-100/50'}`}>
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">累计结余</p>
            <p className={`text-2xl font-black ${totalIncome - totalExpense >= 0 ? 'text-income' : 'text-expense'}`}>
              ¥{(totalIncome - totalExpense).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">累计收入</p>
            <p className="text-xl font-bold text-income">
              ¥{totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-100/50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">累计支出</p>
            <p className="text-xl font-bold text-expense">
              ¥{totalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-4">数据管理</h3>
        
        <div className="space-y-3">
          {/* 导出按钮 */}
          <button
            onClick={() => setShowExportModal(true)}
            disabled={transactions.length === 0}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 
                       hover:border-primary-200 hover:bg-gradient-to-r hover:from-primary-50 hover:to-orange-50 
                       transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-orange-100 
                           flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-7 h-7 text-primary-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">导出数据</p>
              <p className="text-sm text-gray-500">支持 JSON、CSV、TXT 多种格式</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </button>

          {/* 导入按钮 */}
          <button
            onClick={handleImport}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 
                       hover:border-income/50 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 
                       transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 
                           flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-income" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800">导入数据</p>
              <p className="text-sm text-gray-500">支持 JSON、CSV 格式文件</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-income group-hover:translate-x-1 transition-all" />
          </button>

          {/* 清空按钮 */}
          <button
            onClick={handleClear}
            disabled={transactions.length === 0}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group
              disabled:opacity-50 disabled:cursor-not-allowed
              ${showClearConfirm 
                ? 'border-expense bg-gradient-to-r from-red-50 to-rose-50' 
                : 'border-gray-100 hover:border-expense/50 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50'
              }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
              ${showClearConfirm 
                ? 'bg-expense scale-110 shadow-lg shadow-expense/30' 
                : 'bg-gradient-to-br from-red-100 to-rose-100 group-hover:scale-110'}`}>
              <Trash2 className={`w-7 h-7 ${showClearConfirm ? 'text-white' : 'text-expense'}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`font-semibold ${showClearConfirm ? 'text-expense' : 'text-gray-800'}`}>
                {showClearConfirm ? '⚠️ 再次点击确认清空' : '清空所有数据'}
              </p>
              <p className="text-sm text-gray-500">
                {showClearConfirm ? '此操作不可恢复！' : '删除所有账单记录'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 text-lg mb-4">关于</h3>
        
        <div className="text-center py-6">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-orange-200 rounded-full blur-xl opacity-60 scale-150" />
            <div className="relative text-6xl animate-bounce" style={{ animationDuration: '2s' }}>📒</div>
          </div>
          <h4 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-orange-500 mb-1">
            小账本
          </h4>
          <p className="text-sm text-gray-400 mb-4">v1.0.0</p>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            一款简洁优雅的个人记账工具<br/>
            数据存储在本地，安全可靠
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-expense fill-expense animate-pulse" />
            <span>by Claude</span>
          </div>
        </div>
      </div>

      {/* 导出格式选择弹窗 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
            {/* 弹窗头部 */}
            <div className="bg-gradient-to-r from-primary-500 to-orange-500 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">导出数据</h3>
                  <p className="text-white/70 text-sm mt-1">选择导出格式</p>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* 格式选项 */}
            <div className="p-5 space-y-3">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                const isSuccess = exportSuccess === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleExport(option.id)}
                    disabled={isSuccess}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                      ${isSuccess 
                        ? 'border-income bg-income/10' 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98]'
                      }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                      ${isSuccess ? 'bg-income' : option.bgColor}`}>
                      {isSuccess ? (
                        <Check className="w-7 h-7 text-white" />
                      ) : (
                        <Icon className={`w-7 h-7 ${option.color}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-semibold ${isSuccess ? 'text-income' : 'text-gray-800'}`}>
                        {isSuccess ? '导出成功！' : option.name}
                      </p>
                      <p className="text-sm text-gray-500">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 底部提示 */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                💡 提示：JSON 格式可完整恢复数据，CSV 格式适合用表格软件分析
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
