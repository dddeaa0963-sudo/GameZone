import React from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, XCircle, Package, Hash, User, Phone, MapPin, DollarSign, Loader2 } from 'lucide-react';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  getOrderStatusDisplay: (status: string) => { label: string; bg: string; text: string; border: string; icon: React.ReactNode };
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose, getOrderStatusDisplay }) => {
  if (!order) return null;
  const statusDisplay = getOrderStatusDisplay(order.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-50 dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">تفاصيل الطلب</h2>
              <p className="text-xs text-gray-500 font-mono">{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 no-scrollbar">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">حالة الطلب</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${statusDisplay.bg} ${statusDisplay.text} ${statusDisplay.border} border`}>
                {statusDisplay.icon}
                <span>{statusDisplay.label}</span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">التاريخ</p>
              <p className="font-bold text-gray-900 dark:text-white">{order.date}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-400" />
              بيانات المنتج
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">المنتج</span>
                <span className="font-bold text-gray-900 dark:text-white">{order.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">القسم</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.subCategory}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">الكمية</span>
                <span className="font-bold text-gray-900 dark:text-white">{order.quantity || 1}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">السعر الإجمالي</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{order.price}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 dark:text-gray-400">معرف اللاعب/البيانات</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{order.playerData || 'غير متوفر'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              بيانات المشتري
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">الاسم</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.userName || order.userEmail}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 dark:text-gray-400">رقم الهاتف</span>
                <span className="font-medium text-gray-900 dark:text-white" dir="ltr">{order.userPhone || 'غير متوفر'}</span>
              </div>
            </div>
          </div>

          {(order.adminNote || order.responseInfo) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm">ملاحظات الإدارة</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">{order.adminNote || order.responseInfo}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderDetailsModal;
