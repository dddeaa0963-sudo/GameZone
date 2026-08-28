import React, { useState } from 'react';
import { Plus, Calendar, ChevronDown, Bell, Menu, ArrowRight, Download, CreditCard, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletViewProps {
  currentUser: any;
  userOrders: any[];
  userBalanceRequests: any[];
  currencySymbol: string;
  getOrderStatusDisplay: (status: string) => { label: string; bg: string; text: string; border: string; icon: React.ReactNode };
  setSelectedBalanceRequest: (req: any) => void;
  handleViewChange: (view: string) => void;
  setIsSidebarOpen?: (isOpen: boolean) => void;
  unreadNotificationsCount?: number;
}

const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  userOrders,
  userBalanceRequests,
  currencySymbol,
  handleViewChange,
  setIsSidebarOpen,
  unreadNotificationsCount,
}) => {
  const [fromDate, setFromDate] = useState('2025-08-21');
  const [toDate, setToDate] = useState('2026-08-21');
  const [activeTab, setActiveTab] = useState('all');

  const totalPurchases = (Array.isArray(userOrders) ? userOrders : [])
    .filter(o => o.status === 'accepted' || o.status === 'completed' || o.status === 'processing')
    .reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
    
  const totalIncome = currentUser?.balance || 0; // Using balance for now as a proxy

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white pb-24 font-sans" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      
      {/* Header */}
      <header className="sticky top-0 z-[60] shrink-0 bg-gradient-to-l from-[#08051F] via-[#120d3d] to-[#1e1366] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-white/5">
        <div className="w-full max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleViewChange('home')}>
             <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
               <span className="text-white">Game</span>
               <span className="text-gray-300 ml-1.5">Zone</span>
             </h1>
             <Gamepad2 className="w-7 h-7 text-white" />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Hexagon Coin Icon */}
            <div className="w-8 h-8 text-[#D4AF37] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
              </svg>
            </div>

            {/* Bell */}
            <button
              onClick={() => handleViewChange('notifications')}
              className="relative text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {(unreadNotificationsCount || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0B0E17]"></span>
              )}
            </button>

            {/* Balance Badge */}
            <div 
              className="flex items-center gap-1.5 cursor-pointer group"
              onClick={() => handleViewChange('add_balance')}
            >
              <div className="bg-[#1e1366] text-white p-1 rounded-full group-hover:bg-[#2B1B9A] transition-colors">
                <Plus className="w-3 h-3" />
              </div>
              <span className="font-bold text-white text-sm" dir="ltr">
                {(currentUser?.balance || 0).toFixed(0)} $
              </span>
            </div>

            {/* Hamburger Menu */}
            {setIsSidebarOpen && (
              <button
                className="text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Back Arrow */}
            <button
              className="text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-1"
              onClick={() => handleViewChange('home')}
            >
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        
        {/* 3. Balance Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          
          {/* Card 1: Purple Gradient (Income/Received) */}
          <div className="bg-gradient-to-b from-[#9b4dff] to-[#7628d6] p-4 rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-[1.02]">
            <span className="text-xl font-bold text-white mb-2" dir="ltr">
              <span className="text-sm font-normal mr-0.5">$</span>
              {totalIncome.toFixed(3)}
            </span>
            <span className="text-xs text-white font-bold text-center">الوارد</span>
          </div>

          {/* Card 2: Red Gradient (Total Purchases) */}
          <div className="bg-gradient-to-b from-[#ff4d4d] to-[#d62828] p-4 rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-[1.02]">
            <span className="text-xl font-bold text-white mb-2" dir="ltr">
              <span className="text-sm font-normal mr-0.5">$</span>
              {totalPurchases.toFixed(3)}
            </span>
            <span className="text-xs text-white font-bold text-center">اجمالي مشتريات</span>
          </div>
          
          {/* Card 3: Green Gradient (Current Balance) */}
          <div className="bg-gradient-to-b from-[#1cdb6d] to-[#0ea950] p-4 rounded-xl flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-[1.02]">
            <span className="text-xl font-bold text-white mb-2" dir="ltr">
              <span className="text-sm font-normal mr-0.5">$</span>
              {(currentUser?.balance || 0).toFixed(3)}
            </span>
            <span className="text-xs text-white font-bold text-center">رصيدك الحالي</span>
          </div>

        </div>

        {/* 4. Date Range Filter */}
        <div className="flex flex-row gap-3 w-full mb-1">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 pr-1 text-right">من تاريخ</label>
            <div className="relative">
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/5 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full text-center"
                dir="ltr"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e1366] pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 pr-1 text-right">إلى تاريخ</label>
            <div className="relative">
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/5 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full text-center"
                dir="ltr"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e1366] pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={() => handleViewChange('add_balance')}
          className="w-full bg-[#2B1B9A] hover:bg-[#1e1366] text-white font-bold py-4 rounded-full shadow-[0_4px_15px_rgba(43,27,154,0.4)] transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mb-6"
        >
          <span className="text-lg tracking-wide">إيداع</span>
          <Plus className="w-5 h-5 font-bold" />
        </button>

        {/* 5. Transactions History Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide text-right">سجل المعاملات</h3>
          
          {/* Filter Pills */}
          <div className="w-full overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2.5 w-max flex-row-reverse">
              {[
                { id: 'all', label: 'الكل', count: 0 },
                { id: 'orders', label: 'طلبات', count: 0 },
                { id: 'refunds', label: 'مسترجع الطلبات', count: 0 },
              ].map(filter => {
                const isActive = activeTab === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveTab(filter.id)}
                    className={`flex flex-row-reverse items-center gap-2 px-5 py-2.5 rounded-full border transition-all \${isActive ? 'bg-[#1e1366] border-[#2B1B9A] text-white shadow-lg' : 'bg-white dark:bg-[#111118] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1145]'}`}
                  >
                    <span className="text-sm font-bold whitespace-nowrap">{filter.label}</span>
                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold \${isActive ? 'bg-[#3b28cc] text-white' : 'bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                      {filter.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 mt-2">
            
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#D4AF37]/30 bg-transparent text-[#F9D71C] font-bold text-sm shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              <span>اجمالي :</span>
              <span dir="ltr">0$</span>
            </div>
            
            <button 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e1366] hover:bg-[#2B1B9A] border border-[#2B1B9A] text-white transition-all text-sm font-bold shadow-lg"
            >
              تصدير اكسل
            </button>
            
          </div>

          {/* Empty State View */}
          <div className="py-24 flex flex-col items-center justify-center text-center mt-4">
            <div className="mb-4 text-gray-500 opacity-60">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
                <circle cx="12" cy="15" r="2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-500 dark:text-gray-400">لا توجد عناصر</h3>
          </div>

        </div>

      </main>
    </div>
  );
};

export default WalletView;
