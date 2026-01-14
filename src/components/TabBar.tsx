import { BookOpen, BarChart3, Settings } from 'lucide-react';

type TabType = 'records' | 'stats' | 'settings';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'records' as const, icon: BookOpen, label: '账单' },
    { id: 'stats' as const, icon: BarChart3, label: '统计' },
    { id: 'settings' as const, icon: Settings, label: '设置' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30">
      {/* 背景模糊层 */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50" />
      
      <div className="relative flex items-center justify-around max-w-lg mx-auto py-2 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center py-2 px-8 transition-all duration-300"
            >
              {/* 选中背景 */}
              {isActive && (
                <div className="absolute inset-x-2 top-0 h-full bg-gradient-to-b from-primary-100/80 to-primary-50/50 rounded-2xl" />
              )}
              
              {/* 图标容器 */}
              <div className={`relative z-10 p-2 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-400/30' 
                  : 'text-gray-400'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : ''}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              
              {/* 标签 */}
              <span className={`relative z-10 text-xs mt-1 font-semibold transition-colors
                ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
