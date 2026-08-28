import React, { useState } from 'react';
import { UserPlus, User, Mail, Phone, MapPin, DollarSign, Lock, EyeOff, Eye } from 'lucide-react';

interface RegisterViewProps {
  registerForm: any;
  setRegisterForm: (form: any) => void;
  registerError: string;
  handleRegister: (e: React.FormEvent) => void;
  handleViewChange: (view: string) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({
  registerForm,
  setRegisterForm,
  registerError,
  handleRegister,
  handleViewChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-8 h-8 ml-1" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إنشاء حساب</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">انضم إلينا بخطوات بسيطة</p>
        </div>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          {registerError && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800/50">{registerError}</div>}
          
          <div>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" required value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="الاسم الكامل" />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" required value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" placeholder="البريد الإلكتروني" />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" required value={registerForm.phone} onChange={e => setRegisterForm({...registerForm, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" placeholder="رقم الهاتف" />
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select required value={registerForm.country} onChange={e => setRegisterForm({...registerForm, country: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none">
                <option value="">اختر الدولة</option>
                <option value="SY">سوريا</option>
                <option value="SA">السعودية</option>
                <option value="AE">الإمارات</option>
                <option value="EG">مصر</option>
                <option value="TR">تركيا</option>
                <option value="US">الولايات المتحدة</option>
              </select>
            </div>
            <div className="relative w-1/3">
              <DollarSign className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select required value={registerForm.currency} onChange={e => setRegisterForm({...registerForm, currency: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-7 pl-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none">
                <option value="USD">USD</option>
                <option value="SYP">SYP</option>
              </select>
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} required value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" placeholder="كلمة المرور" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showConfirmPassword ? 'text' : 'password'} required value={registerForm.confirmPassword} onChange={e => setRegisterForm({...registerForm, confirmPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" placeholder="تأكيد كلمة المرور" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl mt-2 transition-colors active:scale-[0.98]">
            تسجيل
          </button>
        </form>
        
        <div className="text-center mt-1 border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            لديك حساب بالفعل؟ <button onClick={() => handleViewChange('login')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">تسجيل الدخول</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;
