import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface HeaderProps {
  income: number;
  expense: number;
  balance: number;
}

export function Header({ income, expense, balance }: HeaderProps) {
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <header className="relative overflow-hidden">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
      
      {/* 动态装饰圆 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/15 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-rose-300/20 rounded-full blur-md" />
      </div>

      {/* 网格装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>
      
      {/* 内容区 */}
      <div className="relative px-6 pt-10 pb-12">
        {/* 标题区 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span className="text-white/90 text-xs font-medium">记录美好生活</span>
          </div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-wide">
            小账本
          </h1>
        </div>

        {/* 余额展示 */}
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-white/70 text-sm mb-2 tracking-wider">本月结余</p>
          <div className="relative inline-block">
            <p className={`text-5xl font-black tracking-tight ${balance >= 0 ? 'text-white' : 'text-red-200'}`}>
              <span className="text-3xl mr-1">¥</span>{formatMoney(Math.abs(balance))}
            </p>
            {balance < 0 && (
              <span className="absolute -top-2 -right-6 text-red-200 text-lg">−</span>
            )}
          </div>
        </div>

        {/* 收支卡片 */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          {/* 收入卡片 */}
          <div className="group relative bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="absolute top-3 right-3 w-10 h-10 bg-emerald-400/30 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-200" />
            </div>
            <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">收入</p>
            <p className="text-2xl font-bold text-white">
              <span className="text-lg">¥</span> {formatMoney(income)}
            </p>
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400/60 rounded-full" style={{ width: income > 0 ? '100%' : '0%' }} />
            </div>
          </div>

          {/* 支出卡片 */}
          <div className="group relative bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="absolute top-3 right-3 w-10 h-10 bg-rose-400/30 rounded-full flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-200" />
            </div>
            <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">支出</p>
            <p className="text-2xl font-bold text-white">
              <span className="text-lg">¥</span> {formatMoney(expense)}
            </p>
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400/60 rounded-full" style={{ width: expense > 0 ? '100%' : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 底部曲线 */}
      <div className="absolute -bottom-1 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
          <path 
            d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,70 1440,50 L1440,100 L0,100 Z" 
            fill="#fef7ee"
          />
        </svg>
      </div>
    </header>
  );
}
