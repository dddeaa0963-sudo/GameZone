import React, { useState } from 'react';
import { Shield, Lock, Fingerprint } from 'lucide-react';

interface SecurityViewProps {
  currentUser: any;
  updateUserAndStorage: (user: any) => void;
  showNotification: (type: string, message: string) => void;
  setPinSetupStep: (step: number) => void;
  setPinInput: (input: string) => void;
  setTempPin: (pin: string) => void;
  setShowPinSetupModal: (show: boolean) => void;
  requestFingerprint: (mode: 'login' | 'setup') => Promise<boolean>;
}

const SecurityView: React.FC<SecurityViewProps> = ({
  currentUser,
  updateUserAndStorage,
  showNotification,
  setPinSetupStep,
  setPinInput,
  setTempPin,
  setShowPinSetupModal,
  requestFingerprint,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== currentUser.password) {
      setPasswordMessage({ text: 'كلمة السر الحالية غير صحيحة', type: 'error' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ text: 'كلمتا السر غير متطابقتين', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'كلمة السر يجب أن تكون 6 أحرف على الأقل', type: 'error' });
      return;
    }
    
    const updatedUser = { ...currentUser, password: newPassword };
    updateUserAndStorage(updatedUser);
    
    setPasswordMessage({ text: 'تم تغيير كلمة السر بنجاح', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    setTimeout(() => {
      setPasswordMessage({ text: '', type: '' });
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="text-center mb-2">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex flex-col items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الحماية والأمان</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">تغيير كلمة السر وإعداد رمز الحماية</p>
      </div>
      
      {passwordMessage.text && (
        <div className={`p-4 rounded-xl text-sm font-bold border ${passwordMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
          {passwordMessage.text}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">رمز الحماية (PIN)</h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-tight">يطلب عند الدخول وعدم النشاط</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (currentUser.pin) {
                  const updatedUser = { ...currentUser };
                  delete updatedUser.pin;
                  updatedUser.fingerprintEnabled = false;
                  updateUserAndStorage(updatedUser);
                  showNotification('info', 'تم إلغاء رمز الحماية');
                } else {
                  setPinSetupStep(1);
                  setPinInput('');
                  setTempPin('');
                  setShowPinSetupModal(true);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentUser.pin ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentUser.pin ? 'translate-x-1' : '-translate-x-5'}`} />
            </button>
          </div>
        </div>
        
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">الدخول بالبصمة</h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-tight">استخدام البصمة لفك القفل</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                if (!currentUser.pin) {
                  showNotification('error', 'يجب تعيين رمز الحماية أولاً');
                  return;
                }
                const nextState = !currentUser.fingerprintEnabled;
                if (nextState) {
                   const success = await requestFingerprint('setup');
                   if (!success) return;
                }
                const updatedUser = { ...currentUser, fingerprintEnabled: nextState };
                updateUserAndStorage(updatedUser);
                showNotification(updatedUser.fingerprintEnabled ? 'success' : 'info', updatedUser.fingerprintEnabled ? 'تم تفعيل البصمة' : 'تم إيقاف البصمة');
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${currentUser.fingerprintEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentUser.fingerprintEnabled ? 'translate-x-1' : '-translate-x-5'}`} />
            </button>
          </div>
        </div>
      </div>
      
      <form onSubmit={handlePasswordSave} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-5">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-500" /> تغيير كلمة السر
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">كلمة السر الحالية</label>
            <input type="password" required value={currentPassword || ""} onChange={e => setCurrentPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">كلمة السر الجديدة</label>
            <input type="password" required value={newPassword || ""} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">تأكيد كلمة السر الجديدة</label>
            <input type="password" required value={confirmNewPassword || ""} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" />
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-blue-900 to-black hover:from-blue-800 hover:to-gray-900 text-white font-bold py-3.5 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-md">
          حفظ التغييرات
        </button>
      </form>
    </div>
  );
};

export default SecurityView;
