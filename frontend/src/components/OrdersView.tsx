import React, { useState, useMemo } from 'react';
import { Search, Menu, Bell, PlusCircle, Gamepad2, Calendar, ChevronDown, Download, ShoppingBag, FileText, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, Smartphone, Globe, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

interface OrdersViewProps {
  orderSearchQuery: string;
  setOrderSearchQuery: (query: string) => void;
  orderFilter: string;
  setOrderFilter: (filter: string) => void;
  filteredOrders: any[];
  getOrderStatusDisplay: (status: string) => { label: string; bg: string; text: string; border: string; icon: React.ReactNode };
  setSelectedOrder: (order: any) => void;
  setIsSidebarOpen?: (isOpen: boolean) => void;
  unreadNotificationsCount?: number;
  currentUser?: any;
  handleViewChange?: (view: string) => void;
}

const OrdersView: React.FC<OrdersViewProps> = ({
  orderSearchQuery,
  setOrderSearchQuery,
  orderFilter,
  setOrderFilter,
  filteredOrders,
  getOrderStatusDisplay,
  setSelectedOrder,
  setIsSidebarOpen,
  unreadNotificationsCount,
  currentUser,
  handleViewChange,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // Derive counts for status filters
  const statusCounts = {
    all: filteredOrders.length,
    processing: filteredOrders.filter(o => o.status === 'processing').length,
    completed: filteredOrders.filter(o => o.status === 'completed' || o.status === 'accepted').length,
    waiting: filteredOrders.filter(o => o.status === 'waiting' || o.status === 'pending').length,
    rejected: filteredOrders.filter(o => o.status === 'rejected').length,
    canceled: filteredOrders.filter(o => o.status === 'canceled').length,
  };

  // Derive counts for source filters (mocked for now, assuming order.source exists)
  const sourceCounts = {
    all: filteredOrders.length,
    api: filteredOrders.filter(o => o.source === 'API').length,
    website: filteredOrders.filter(o => o.source === 'Website').length,
    app: filteredOrders.filter(o => o.source === 'App').length,
  };

  const finalFilteredOrders = useMemo(() => {
    let result = filteredOrders;
    if (fromDate) {
      result = result.filter(o => new Date(o.date) >= new Date(fromDate));
    }
    if (toDate) {
      result = result.filter(o => new Date(o.date) <= new Date(toDate));
    }
    if (sourceFilter !== 'all') {
      result = result.filter(o => o.source?.toLowerCase() === sourceFilter.toLowerCase());
    }
    return result;
  }, [filteredOrders, fromDate, toDate, sourceFilter]);

  const totalAmount = finalFilteredOrders.reduce((acc, order) => {
    const priceStr = order.price?.toString().replace(/[^0-9.-]+/g, "");
    const num = parseFloat(priceStr);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const handleExport = () => {
    if (finalFilteredOrders.length === 0) return;
    setIsExporting(true);
    setTimeout(() => {
      const ws = XLSX.utils.json_to_sheet(finalFilteredOrders.map(o => ({
        'رقم الطلب': o.orderNumber,
        'الخدمة': o.title,
        'التاريخ': o.date,
        'السعر': o.price,
        'الحالة': getOrderStatusDisplay(o.status).label,
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, "orders.xlsx");
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white pb-24 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-[60] shrink-0 bg-gradient-to-l from-[#08051F] via-[#120d3d] to-[#1e1366] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-white/5">
        <div className="w-full max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {setIsSidebarOpen && (
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            {handleViewChange && (
              <button
                onClick={() => handleViewChange('notifications')}
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {(unreadNotificationsCount || 0) > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                )}
              </button>
            )}

            {handleViewChange && (
              <div 
                className="flex items-center gap-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#D4AF37]/30 transition-colors"
                onClick={() => handleViewChange('add_balance')}
              >
                <PlusCircle className="w-4 h-4 text-[#F9D71C]" />
                <span className="font-bold text-[#F9D71C] text-sm" dir="ltr">
                  {currentUser?.balance?.toFixed(2) || '0.00'} $
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleViewChange?.('home')}>
             <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
               <span className="text-white">Game</span>
               <span className="text-gray-300 ml-1.5">Zone</span>
             </h1>
             <Gamepad2 className="w-7 h-7 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 flex flex-col gap-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">طلباتي</h2>
        </div>

        {/* Date Filters */}
        <div className="flex flex-row gap-4 w-full">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 pr-1">من</label>
            <div className="relative">
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 pr-1">إلى</label>
            <div className="relative">
              <input 
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="بحث برقم الطلب، UUID، بيانات الطلب، أو اسم الخدمة"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-full pr-12 pl-4 py-3.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {orderSearchQuery && (
              <button 
                onClick={() => setOrderSearchQuery('')}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          <button className="w-14 h-[52px] shrink-0 bg-gradient-to-br from-[#4f38ff] to-[#2B1B9A] rounded-full flex items-center justify-center text-white shadow-[0_4px_15px_rgba(79,56,255,0.4)] transition-transform hover:scale-105 active:scale-95">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Status Filters */}
        <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2.5 w-max pb-2">
            {[
              { id: 'all', label: 'الكل', count: statusCounts.all },
              { id: 'completed', label: 'مقبول', count: statusCounts.completed },
              { id: 'processing', label: 'قيد المعالجة', count: statusCounts.processing },
              { id: 'waiting', label: 'انتظار', count: statusCounts.waiting },
              { id: 'rejected', label: 'مرفوض', count: statusCounts.rejected },
              { id: 'canceled', label: 'ملغي', count: statusCounts.canceled },
            ].map(filter => {
              // Map UI filter to the internal orderFilter if needed
              const isStatusActive = orderFilter === filter.id || (orderFilter === 'accepted' && filter.id === 'completed');
              
              return (
                <button
                  key={filter.id}
                  onClick={() => setOrderFilter(filter.id === 'completed' ? 'accepted' : filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isStatusActive ? 'bg-[#1e1366] border-[#3b28cc] text-white shadow-[0_0_15px_rgba(59,40,204,0.3)]' : 'bg-white dark:bg-[#0f0a29] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1145]'}`}
                >
                  <span className="text-sm font-bold whitespace-nowrap">{filter.label}</span>
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isStatusActive ? 'bg-[#3b28cc] text-white' : 'bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Filters */}
        <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2.5 w-max pb-2">
            {[
              { id: 'all', label: 'الكل', count: sourceCounts.all, icon: Globe },
              { id: 'website', label: 'من الموقع', count: sourceCounts.website, icon: Globe },
              { id: 'api', label: 'API', count: sourceCounts.api, icon: Code },
              { id: 'app', label: 'تطبيق', count: sourceCounts.app, icon: Smartphone },
            ].map(filter => {
              const isActive = sourceFilter === filter.id;
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSourceFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${isActive ? 'bg-[#1e1366] border-[#3b28cc] text-white' : 'bg-white dark:bg-[#0f0a29] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1145]'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold whitespace-nowrap">{filter.label}</span>
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#3b28cc] text-white' : 'bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary & Export */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <button 
            onClick={handleExport}
            disabled={isExporting || finalFilteredOrders.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1e1366] hover:bg-[#2B1B9A] border border-[#3b28cc]/50 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-[0_0_10px_rgba(59,40,204,0.2)]"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            تصدير اكسل
          </button>
          
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F9D71C] font-bold text-sm shadow-[0_0_10px_rgba(212,175,55,0.1)]">
            <span>إجمالي :</span>
            <span dir="ltr">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-4 mt-4">
          <AnimatePresence mode="popLayout">
            {finalFilteredOrders.length > 0 ? (
              finalFilteredOrders.map((order, index) => {
                const statusDisplay = getOrderStatusDisplay(order.status);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    key={order.id || index} 
                    className="bg-white dark:bg-[#0f0f13] border border-gray-200 dark:border-white/5 p-4 rounded-2xl shadow-lg flex flex-col gap-3 transition-all hover:border-gray-200 dark:border-white/10 cursor-pointer active:scale-[0.98]"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1.5">
                           <span className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-0.5 rounded-md font-bold tracking-wider">#{order.orderNumber || order.id}</span>
                           <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {order.date}
                           </span>
                         </div>
                         <h3 className="font-bold text-white text-sm sm:text-base leading-tight">{order.title}</h3>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span className="font-mono font-bold text-[#F9D71C] text-lg bg-[#D4AF37]/10 px-2 py-0.5 rounded-lg border border-[#D4AF37]/20">{order.price}</span>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusDisplay.bg.replace('bg-', 'bg-').replace('50', '900/30')} ${statusDisplay.text} ${statusDisplay.border.replace('100', '800/50')}`}>
                          <div className="scale-75">{statusDisplay.icon}</div>
                          <span className="text-[11px] font-bold">{statusDisplay.label}</span>
                        </div>
                      </div>
                    </div>
                    {order.responseInfo && (
                      <div className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-black/40 p-2.5 rounded-xl border border-gray-200 dark:border-white/5 leading-relaxed">
                        {order.responseInfo}
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-[#1e1366] to-[#0f0a29] flex items-center justify-center shadow-[0_0_30px_rgba(59,40,204,0.2)] border border-[#3b28cc]/30">
                   <ShoppingBag className="w-10 h-10 text-blue-400/80" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">لا توجد عناصر</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[250px]">لا يوجد طلبات مطابقة لمعايير البحث أو الفلاتر المحددة حالياً.</p>
                {handleViewChange && (
                  <button 
                    onClick={() => handleViewChange('home')}
                    className="mt-6 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-gray-200 dark:border-white/10"
                  >
                    استعرض الخدمات
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default OrdersView;
