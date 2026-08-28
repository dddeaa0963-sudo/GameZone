import React from 'react';
import { Wallet, Copy, Link as LinkIcon, Megaphone, Code, Upload, CheckCircle, Loader2 } from 'lucide-react';

interface AddBalanceViewProps {
  paymentMethods: any[];
  selectedPaymentMethod: any;
  setSelectedPaymentMethod: (method: any) => void;
  handleAddBalanceSubmit: (e: React.FormEvent) => void;
  currencySymbol: string;
  addBalanceForm: any;
  setAddBalanceForm: (form: any) => void;
  showNotification: (type: string, message: string) => void;
  isTransitioning: boolean;
}

const AddBalanceView: React.FC<AddBalanceViewProps> = ({
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  handleAddBalanceSubmit,
  currencySymbol,
  addBalanceForm,
  setAddBalanceForm,
  showNotification,
  isTransitioning,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إضافة رصيد</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">الرجاء اختيار طريقة الدفع المناسبة</p>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {paymentMethods.map(method => (
          <div 
            key={method.id}
            onClick={() => setSelectedPaymentMethod(method)}
            className={`flex flex-col items-center gap-2 cursor-pointer group transition-all`}
          >
            <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all bg-transparent relative overflow-hidden ${selectedPaymentMethod?.id === method.id ? 'border-2 border-blue-500 shadow-md shadow-blue-500/20' : 'border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'}`}>
              {method.image && (
                <img src={method.image} alt={method.name} className="absolute inset-0 w-full h-full object-cover z-0" />
              )}
              <div className={`absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${selectedPaymentMethod?.id === method.id ? '!opacity-0' : ''}`}></div>
              {selectedPaymentMethod?.id === method.id && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-blue-500/10">
                  <div className="bg-blue-500 text-white rounded-full p-1 opacity-90"><CheckCircle className="w-6 h-6" /></div>
                </div>
              )}
            </div>
            <span className={`text-[11px] sm:text-xs font-bold text-center w-full truncate ${selectedPaymentMethod?.id === method.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{method.name}</span>
          </div>
        ))}
      </div>

      {selectedPaymentMethod && (
        <form onSubmit={handleAddBalanceSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-6 animate-fade-in-up mt-4">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800/50 pb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            إرسال طلب الشحن
          </h3>
          
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
              <div className="flex flex-col gap-3 flex-1 w-full text-center md:text-right">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">بيانات الدفع ({selectedPaymentMethod.name})</span>
                <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700/50 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white font-mono break-all leading-relaxed" dir="ltr">{selectedPaymentMethod.info}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPaymentMethod.info);
                    showNotification('success', 'تم نسخ معلومات الدفع بنجاح');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 w-full sm:w-auto mt-1"
                >
                  <Copy className="w-4 h-4" /> نسخ البيانات
                </button>
              </div>
              
              {selectedPaymentMethod.qrCode && (
                <div className="flex flex-col items-center gap-2 shrink-0 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm group">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">امسح الرمز (QR)</span>
                  <div className="relative rounded-xl overflow-hidden bg-white">
                    <img src={selectedPaymentMethod.qrCode} alt={selectedPaymentMethod.name} className="w-32 h-32 sm:w-40 sm:h-40 object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
              )}
            </div>
            
            {selectedPaymentMethod.link && (
              <a href={selectedPaymentMethod.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline mt-2 block w-max flex items-center gap-1">
                <LinkIcon className="w-4 h-4" /> الذهاب للرابط المخصص للدفع
              </a>
            )}
          </div>

          {selectedPaymentMethod.note && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex gap-3 text-amber-800 dark:text-amber-400 text-sm font-bold items-center shadow-sm">
              <Megaphone className="w-5 h-5 shrink-0 text-amber-500" />
              <p>{selectedPaymentMethod.note}</p>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">المبلغ المراد إضافته ({currencySymbol})</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold select-none">{currencySymbol}</span>
                <input 
                  type="number" 
                  value={addBalanceForm.amount || ""}
                  onChange={(e) => setAddBalanceForm({...addBalanceForm, amount: e.target.value})}
                  className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pr-12 pl-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-lg"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رقم العملية (Taxid) أو رقم المحول <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Code className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={addBalanceForm.operationNumber || ""}
                  onChange={(e) => setAddBalanceForm({...addBalanceForm, operationNumber: e.target.value})}
                  className="w-full bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3.5 pr-12 pl-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-left font-mono"
                  placeholder="رقم عملية التحويل"
                  dir="ltr"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">أرفق صورة لعملية التحويل</label>
              <label className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-8 px-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all relative overflow-hidden group">
                {addBalanceForm.image ? (
                  <img src={addBalanceForm.image} alt="صورة التحويل" className="max-h-40 object-contain rounded-xl shadow-sm" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-bold text-center">اضغط لرفع الصورة أو إيصال التحويل</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAddBalanceForm({...addBalanceForm, image: reader.result as string});
                        showNotification('success', 'تم إرفاق الصورة بنجاح');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {addBalanceForm.image && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-center bg-emerald-50 dark:bg-emerald-900/20 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">تم إرفاق الإيصال بنجاح ✓</div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isTransitioning}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2 disabled:from-gray-400 disabled:to-gray-500 mt-2 text-lg"
          >
            {isTransitioning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                تأكيد وإرسال طلب الشحن
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddBalanceView;
