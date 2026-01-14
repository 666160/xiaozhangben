import { Plus } from 'lucide-react';

interface AddButtonProps {
  onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 group z-40"
    >
      {/* 光晕效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-rose-500 rounded-full blur-lg opacity-60 group-hover:opacity-80 group-hover:scale-125 transition-all duration-500" />
      
      {/* 主按钮 */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 
                      rounded-full shadow-2xl shadow-orange-500/50
                      flex items-center justify-center
                      group-hover:shadow-orange-500/70 group-hover:scale-110
                      group-active:scale-95 transition-all duration-300">
        <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
      </div>
      
      {/* 脉冲动画 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 animate-ping opacity-30" />
    </button>
  );
}
