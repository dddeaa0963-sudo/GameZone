import React, { useState } from 'react';
import { LogIn, Mail, Lock, EyeOff, Eye } from 'lucide-react';

interface LoginViewProps {
  loginForm: any;
  setLoginForm: (form: any) => void;
  loginError: string;
  handleLogin: (e: React.FormEvent) => void;
  handleViewChange: (view: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({
  loginForm,
  setLoginForm,
  loginError,
  handleLogin,
  handleViewChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 min-h-[60vh]">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-8 h-8 ml-1" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تسجيل الدخول</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">مرحباً بعودتك إلى المنصة</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {loginError && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800/50">{loginError}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" placeholder="example@email.com" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type={showPassword ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pr-10 pl-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" dir="ltr" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:text-gray-950 font-bold py-3.5 rounded-xl mt-2 transition-colors active:scale-[0.98]">
            دخول
          </button>
        </form>
        
        <div className="text-center mt-2 border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ليس لديك حساب؟ <button onClick={() => handleViewChange('register')} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">إنشاء حساب جديد</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
