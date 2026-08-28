import React from 'react';
import { DollarSign } from 'lucide-react';

interface PaymentsViewProps {
  userBalanceRequests: any[];
  getOrderStatusDisplay: (status: string) => { label: string; bg: string; text: string; border: string; icon: React.ReactNode };
  setSelectedBalanceRequest: (req: any) => void;
}

const PaymentsView: React.FC<PaymentsViewProps> = ({
  userBalanceRequests,
  getOrderStatusDisplay,
  setSelectedBalanceRequest,
}) => {
  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">دفعاتي</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">سجل الدفعات وحالاتها</p>
      </div>
      <div className="flex flex-col gap-3 mt-2">
        {(Array.isArray(userBalanceRequests) ? userBalanceRequests : []).map((req, index) => {
          const statusInfo = getOrderStatusDisplay(req.status);
          return (
            <div 
              key={(req._id || req.id) + '-' + index} 
              onClick={() => setSelectedBalanceRequest(req)}
              className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-3 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-700 dark:text-gray-300">{req.date}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">طريقة الدفع: {req.method}</span>
                </div>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400" dir="ltr">{req.amount} {req.currency || (String(req.amount).includes(" ") ? "" : "$")}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
                {req.note && req.status !== 'processing' && (
                  <span className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md max-w-[150px] truncate" title={req.note}>{req.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentsView;
