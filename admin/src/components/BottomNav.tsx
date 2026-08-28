import React from 'react';
import { User, Wallet, Home, ShoppingBag, Layers } from 'lucide-react';

interface BottomNavProps {
  hideBottomNav: boolean;
  currentView: string;
  handleViewChange: (view: any) => void;
  getBottomNavColor: (view: string) => string;
}

const BottomNav: React.FC<BottomNavProps> = ({ hideBottomNav, currentView, handleViewChange }) => {
  if (hideBottomNav) return null;

  const isActive = (view: string) => currentView === view;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-[#050505] pb-safe pointer-events-auto border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] lg:hidden" dir="rtl">
      <nav className="flex items-end pb-2 justify-between px-6 h-[72px] w-full max-w-md mx-auto relative">
        
        <button onClick={() => handleViewChange('account')} className={`flex flex-col items-center justify-center p-1 transition-colors gap-1 ${isActive('account') ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <User className={`w-5 h-5 transition-all duration-300 ${isActive('account') ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
            <span className="text-[10px] font-bold">حسابي</span>
        </button>
        
        <button onClick={() => handleViewChange('wallet')} className={`flex flex-col items-center justify-center p-1 transition-colors gap-1 ${isActive('wallet') ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Wallet className={`w-5 h-5 transition-all duration-300 ${isActive('wallet') ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
            <span className="text-[10px] font-bold">المحفظة</span>
        </button>
        
        {/* Centered Main Home Button */}
        <div className="relative flex flex-col items-center justify-center z-10 px-2 h-full">
            <button 
               onClick={() => handleViewChange('home')}
               className={`absolute -top-6 w-[64px] h-[64px] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(43,27,154,0.6)] transition-all duration-300 active:scale-95 border-[6px] border-[#050505] ${isActive('home') ? 'bg-gradient-to-br from-[#4f38ff] to-[#2B1B9A] text-white scale-105 shadow-[0_8px_30px_rgba(79,56,255,0.7)]' : 'bg-[#1A1060] text-gray-300 hover:bg-[#2B1B9A]'}`}
            >
              <Home className="w-6 h-6" />
            </button>
            <span className={`text-[10px] font-bold mt-auto ${isActive('home') ? 'text-white' : 'text-gray-500'}`}>الرئيسية</span>
        </div>

        <button onClick={() => handleViewChange('orders')} className={`flex flex-col items-center justify-center p-1 transition-colors gap-1 ${isActive('orders') ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <ShoppingBag className={`w-5 h-5 transition-all duration-300 ${isActive('orders') ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
            <span className="text-[10px] font-bold">طلباتي</span>
        </button>
        
        <button onClick={() => handleViewChange('add_balance')} className={`flex flex-col items-center justify-center p-1 transition-colors gap-1 ${isActive('add_balance') ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Layers className={`w-5 h-5 transition-all duration-300 ${isActive('add_balance') ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
            <span className="text-[10px] font-bold">رصيد</span>
        </button>
      
      </nav>
    </div>
  );
};

export default BottomNav;
