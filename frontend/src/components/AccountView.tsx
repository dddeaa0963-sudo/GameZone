import React, { useState, useEffect } from 'react';
import { Camera, Loader2, Bell, Menu, ArrowRight, Plus, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccountViewProps {
  currentUser: any;
  updateUserAndStorage: (user: any) => void;
  showNotification: (type: string, message: string) => void;
  handleViewChange?: (view: string) => void;
  setIsSidebarOpen?: (isOpen: boolean) => void;
  unreadNotificationsCount?: number;
}

const AccountView: React.FC<AccountViewProps> = ({
  currentUser,
  updateUserAndStorage,
  showNotification,
  handleViewChange,
  setIsSidebarOpen,
  unreadNotificationsCount,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [username, setUsername] = useState(currentUser?.login_id || currentUser?.id || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  
  const [profileImage, setProfileImage] = useState<string | null>(currentUser?.profileImage || currentUser?.image || null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const nameParts = (currentUser.name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setUsername(currentUser.login_id || currentUser.id || '');
      setProfileImage(currentUser.profileImage || currentUser.image || null);
    }
  }, [currentUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification('error', 'حجم الصورة يجب أن يكون أقل من 2 ميغابايت');
        return;
      }
      setIsImageUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const result = canvas.toDataURL('image/jpeg', 0.6);
          setProfileImage(result);
          const updatedUser = { ...currentUser, profileImage: result, image: result };
          updateUserAndStorage(updatedUser);
          
          setIsImageUploading(false);
          showNotification('success', 'تم تحديث الصورة الشخصية');
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        setIsImageUploading(false);
        showNotification('error', 'حدث خطأ أثناء رفع الصورة');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    setTimeout(() => {
      const fullName = `${firstName} ${lastName}`.trim();
      const updatedUser = { ...currentUser, name: fullName, phone };
      updateUserAndStorage(updatedUser);
      setIsProfileSaving(false);
      showNotification('success', 'تم حفظ التغييرات بنجاح');
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-[#07070E] dark:text-white pb-24 font-sans" dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      
      {/* Header */}
      <header className="sticky top-0 z-[60] shrink-0 bg-gradient-to-l from-[#08051F] via-[#120d3d] to-[#1e1366] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-white/5">
        <div className="w-full max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleViewChange?.('home')}>
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
              onClick={() => handleViewChange?.('notifications')}
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
              onClick={() => handleViewChange?.('wallet')}
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
              onClick={() => handleViewChange?.('home')}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pt-10 flex flex-col gap-6">
        
        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="relative group cursor-pointer">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white dark:bg-[#1A1A24] border-2 border-[#2B1B9A] shadow-[0_0_20px_rgba(43,27,154,0.3)] flex items-center justify-center overflow-hidden relative">
              {isImageUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin absolute" />
              ) : profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gray-500">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 left-0 bg-[#FF3B30] w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>
        
        {/* Form Section */}
        <form onSubmit={handleProfileSave} className="flex flex-col gap-5 w-full">
          
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-white tracking-wide text-right">البيانات الشخصية</h3>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 relative bg-white dark:bg-[#1A1A24] rounded-full px-5 py-3 border border-gray-200 dark:border-white/5 focus-within:border-[#2B1B9A] transition-colors">
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">الاسم الاول</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                className="w-full bg-transparent text-sm text-white font-bold focus:outline-none"
                placeholder="First Name"
              />
            </div>
            
            <div className="flex-1 relative bg-white dark:bg-[#1A1A24] rounded-full px-5 py-3 border border-gray-200 dark:border-white/5 focus-within:border-[#2B1B9A] transition-colors">
              <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">الاسم الاخير</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                className="w-full bg-transparent text-sm text-white font-bold focus:outline-none"
                placeholder="Last Name"
              />
            </div>
          </div>
          
          <div className="relative bg-white dark:bg-[#1A1A24] rounded-full px-5 py-3 border border-gray-200 dark:border-white/5 focus-within:border-[#2B1B9A] transition-colors">
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">البريد الالكتروني</label>
            <input 
              type="email" 
              value={email} 
              disabled
              className="w-full bg-transparent text-sm text-white font-bold focus:outline-none opacity-80"
              placeholder="Email"
              dir="ltr"
            />
          </div>
          
          <div className="relative bg-white dark:bg-[#1A1A24] rounded-full px-5 py-3 border border-gray-200 dark:border-white/5 focus-within:border-[#2B1B9A] transition-colors">
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">اسم المستخدم</label>
            <input 
              type="text" 
              value={username} 
              disabled
              className="w-full bg-transparent text-sm text-white font-bold focus:outline-none opacity-80"
              placeholder="Username"
              dir="ltr"
            />
          </div>
          
          <div className="relative bg-white dark:bg-[#1A1A24] rounded-full px-5 py-3 border border-gray-200 dark:border-white/5 focus-within:border-[#2B1B9A] transition-colors">
            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">هاتف</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="w-full bg-transparent text-sm text-white font-bold focus:outline-none"
              placeholder="Phone Number"
              dir="ltr"
            />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <button 
              type="submit" 
              disabled={isProfileSaving} 
              className="w-full bg-gradient-to-r from-[#2B1B9A] to-[#4f38ff] hover:opacity-90 disabled:opacity-80 text-white font-bold py-4 rounded-full shadow-[0_4px_20px_rgba(43,27,154,0.4)] transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isProfileSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...
                </>
              ) : (
                'حفظ البيانات'
              )}
            </button>

            <button 
              type="button"
              onClick={() => handleViewChange?.('security')}
              className="text-[#3b28cc] hover:text-[#4f38ff] text-sm font-bold text-center transition-colors pb-8"
            >
              إعدادات الحماية ورمز PIN
            </button>
          </div>
          
        </form>

      </main>
    </div>
  );
};

export default AccountView;
