import React from 'react';
import { ArrowRight, Bell, X, Info, HelpCircle } from 'lucide-react';

interface NotificationsViewProps {
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  showNotification: (type: string, message: string) => void;
  setShowClearConfirmModal: (show: boolean) => void;
  handleViewChange: (view: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  setNotifications,
  showNotification,
  setShowClearConfirmModal,
  handleViewChange,
}) => {
  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleViewChange('home')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors w-10 h-10 flex items-center justify-center shrink-0"
          >
            <ArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setNotifications((notifications || []).map(n => ({...n, read: true})));
              showNotification('success', 'تم تمييز الكل كمقروءة');
            }}
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800/50"
          >
            تحديد كمقروءة
          </button>
          <button 
            onClick={() => setShowClearConfirmModal(true)}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
            title="حذف الإشعارات"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {!notifications || notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-700">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد إشعارات</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">ليس لديك أي إشعارات جديدة في الوقت الحالي</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(notifications || []).map((notification, index) => (
            <div 
              key={notification.id + '-' + index} 
              className={`bg-white dark:bg-gray-900 p-4 rounded-2xl border ${notification.read ? 'border-gray-100 dark:border-gray-800' : 'border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-900/10'} shadow-sm flex items-start gap-4 transition-colors cursor-pointer group`}
              onClick={() => {
                if (!notification.read) {
                  setNotifications((notifications || []).map(n => n.id === notification.id ? {...n, read: true} : n));
                }
                if (notification.type === 'order') {
                  handleViewChange('orders');
                } else if (notification.type === 'balance') {
                  handleViewChange('payments');
                }
              }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                notification.type === 'order' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                notification.type === 'balance' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {notification.type === 'order' ? <ArrowRight className="w-6 h-6 rotate-180" /> : 
                 notification.type === 'balance' ? <Bell className="w-6 h-6" /> : 
                 <Info className="w-6 h-6" />}
              </div>
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`font-bold ${notification.read ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-white'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 whitespace-nowrap">{notification.date}</span>
                </div>
                <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
