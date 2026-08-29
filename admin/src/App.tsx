import * as apiModule from './api';
import { motion, AnimatePresence } from 'motion/react';
import AdminView from './admin/AdminView';

import OrderDetailsModal from './components/OrderDetailsModal';
import BalanceRequestDetailsModal from './components/BalanceRequestDetailsModal';


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import localforage from 'localforage';
import { signUpUser, signInUser, signOutUser, createOrder, getOrders, syncAllDataToDB, updateUserDB } from './api';
import BottomNav from './components/BottomNav';
import Marquee from './components/Marquee';
import FloatingActionButton from './components/FloatingActionButton';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import PaymentsView from './components/PaymentsView';
import NotificationsView from './components/NotificationsView';
import SecurityView from './components/SecurityView';
import AccountView from './components/AccountView';


import AddBalanceView from './components/AddBalanceView';
import PinSetupModal from './components/PinSetupModal';









import { Server, ShoppingBag, Send, Menu, Home, PlusCircle, Plus, User, Wallet, X, CheckCircle, XCircle, Clock, Loader2, Moon, Sun, Search, Gamepad2, Megaphone, Code, Users, Palette, Layers, Bell, Eye, EyeOff, Lock, Mail, Phone, MapPin, DollarSign, LogIn, UserPlus, Camera, Upload, MessageCircle, MoreVertical, Facebook, Instagram, Youtube, ArrowRight, ArrowLeft, ChevronDown, Copy, Shield, Fingerprint, Settings, AlertCircle, LayoutDashboard, Trash2, ShoppingCart, CreditCard, Image as ImageIcon, Link as LinkIcon, Edit, Package, Delete, ArrowRightLeft } from 'lucide-react';

type View = 'home' | 'orders' | 'wallet' | 'account' | 'add_balance' | 'login' | 'register' | 'payments' | 'notifications' | 'security' | 'admin';
type OrderFilter = 'all' | 'accepted' | 'rejected' | 'processing';


const PageLoader = ({ loadingText }: { loadingText?: string }) => (
  <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="relative flex items-center justify-center w-32 h-32 mb-6">
      {/* Pulsing circle with green glow */}
      <div className="absolute inset-4 bg-green-500/20 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] shadow-[0_0_30px_10px_rgba(34,197,94,0.3)]"></div>
      <div className="absolute inset-6 bg-green-400/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] delay-150 shadow-[0_0_20px_rgba(34,197,94,0.4)]"></div>
      
      {/* Inner glowing circle */}
      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center relative border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.6)] backdrop-blur-sm">
         {/* Three bouncing dots */}
         <div className="flex items-center justify-center gap-1.5">
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
         </div>
      </div>
    </div>
    {loadingText && (
      <div className="text-xl font-bold text-gray-800 dark:text-gray-200 animate-pulse mt-2">
        {loadingText}
      </div>
    )}
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [addPaymentMethodModal, setAddPaymentMethodModal] = useState<boolean>(false);
  const [newPaymentMethodForm, setNewPaymentMethodForm] = useState({ id: null as any, name: '', info: '', link: '', note: '', image: '' as string | null, minDeposit: '', qrCode: '' as string | null });
  const [confirmOrderStatus, setConfirmOrderStatus] = useState<any | null>(null);

  const [adminFabOpen, setAdminFabOpen] = useState(false);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(() => {
    return localStorage.getItem('isAdmin') === 'true' ? 'admin' : 'login';
  });
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('جاري التحميل...');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedBalanceRequest, setSelectedBalanceRequest] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');
  
  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode.toString());
  }, [isDarkMode]);
  const [searchQuery, setSearchQuery] = useState('');

  type NotificationAlert = {
    id: number;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    date: string;
    read: boolean;
  };

  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => {
    const saved = localStorage.getItem('user_notifications');
    if (saved && saved !== 'undefined' && saved !== 'null') {
    }
    return [
      { id: 1, title: 'ترحيب', message: 'مرحباً بك في منصتنا!', type: 'success', date: new Date().toISOString().split('T')[0], read: false }
    ];
  });

  useEffect(() => {
    // Attempt to sync local data to MongoDB on app load
    syncAllDataToDB().catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('user_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleMainCat = () => setShowAddCatModal(true);
    const handleSubCat = () => { setNewSubCatType('sub'); setShowAddSubCatModal(true); };
    const handleSubSubCat = () => { setNewSubCatType('subsub'); setShowAddSubCatModal(true); };
    
    window.addEventListener('OPEN_ADD_MAIN_CAT', handleMainCat);
    window.addEventListener('OPEN_ADD_SUB_CAT', handleSubCat);
    window.addEventListener('OPEN_ADD_SUB_SUB_CAT', handleSubSubCat);
    
    return () => {
      window.removeEventListener('OPEN_ADD_MAIN_CAT', handleMainCat);
      window.removeEventListener('OPEN_ADD_SUB_CAT', handleSubCat);
      window.removeEventListener('OPEN_ADD_SUB_SUB_CAT', handleSubSubCat);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
        setIsAdminSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<any | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<any | null>(null);
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState<any | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<any | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [orderForm, setOrderForm] = useState({ playerId: '', playerPassword: '', quantity: 1, packageId: '1' });
  
  const handleCategorySelect = (id: number | null) => {
    setIsLoading(true);
    setTimeout(() => {
        setSelectedCategoryId(id);
        setSelectedSubCategoryId(null);
        setSelectedSubSubCategoryId(null);
        setSelectedProductId(null);
        setOrderForm({ playerId: '', playerPassword: '', quantity: 1, packageId: '1' });
        setIsLoading(false);
    }, 300);
  };

  const handleSubCategorySelect = (id: number | null) => {
    setIsLoading(true);
    setTimeout(() => {
        setSelectedSubCategoryId(id);
        setSelectedSubSubCategoryId(null);
        setSelectedProductId(null);
        if (id === null) {
          setOrderForm({ playerId: '', playerPassword: '', quantity: 1, packageId: '1' });
        }
        setIsLoading(false);
    }, 300);
  };

  const handleSubSubCategorySelect = (id: number | null) => {
    setIsLoading(true);
    setTimeout(() => {
        setSelectedSubSubCategoryId(id);
        setSelectedProductId(null);
        setIsLoading(false);
    }, 300);
  };

  const handleProductSelect = (id: number | null) => {
    setIsLoading(true);
    setTimeout(() => {
        setSelectedProductId(id);
        setIsLoading(false);
    }, 300);
  };
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [balanceAdminModal, setBalanceAdminModal] = useState<{isOpen: boolean, userEmail: string, userName: string, type: 'add' | 'withdraw', amount: string, note: string}>({isOpen: false, userEmail: '', userName: '', type: 'add', amount: '', note: ''});
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({isOpen: false, title: '', message: '', action: () => {}});
  const [rejectModal, setRejectModal] = useState<{isOpen: boolean, idx: number, note: string}>({isOpen: false, idx: 0, note: ''});
  const [touchStartBanner, setTouchStartBanner] = useState<any | null>(null);
  const [touchEndBanner, setTouchEndBanner] = useState<any | null>(null);
  const [notification, setNotification] = useState<{show: boolean, type: 'success' | 'error' | 'info', message: string} | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('isAuthenticated');
    return saved === 'true';
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('isAdmin');
    return saved === 'true';
  });
  
  const [adminView, _setAdminView] = useState<'dashboard' | 'categories' | 'settings' | 'users' | 'orders' | 'payments' | 'fetch-provider' | 'content' | 'providers' | 'banners' | 'notifications' | 'paymentMethods' | 'api_providers' | 'products'>('dashboard');
  
  useEffect(() => {
    setIsLoading(true);
    const path = location.pathname.toLowerCase();
    
    if (path === '/' || path === '') _setAdminView('dashboard');
    else if (path === '/categories') _setAdminView('categories');
    else if (path === '/products') _setAdminView('products');
    else if (path === '/settings') _setAdminView('settings');
    else if (path === '/users') _setAdminView('users');
    else if (path === '/orders') _setAdminView('orders');
    else if (path === '/payments') _setAdminView('payments');
    else if (path === '/fetch-provider') _setAdminView('fetch-provider');
    else if (path === '/content') _setAdminView('content');
    else if (path === '/providers') _setAdminView('providers');
    else if (path === '/banners') _setAdminView('banners');
    else if (path === '/notifications') _setAdminView('notifications');
    else if (path === '/payment-methods') _setAdminView('paymentMethods');
    else if (path === '/api_providers') _setAdminView('api_providers');
    
    window.scrollTo(0, 0);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, [location.pathname]);

  const setAdminView = (view: any) => {
    if (view === 'dashboard') navigate('/');
    else if (view === 'paymentMethods') navigate('/payment-methods');
    else navigate(`/${view}`);
  };

  const [categoryAdminTab, setCategoryAdminTab] = useState<'main' | 'sub' | 'subsub' | 'products'>('main');
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [orderProcessingMode, setOrderProcessingMode] = useState<'immediate' | 'manual'>(() => {
    return (localStorage.getItem('orderProcessingMode') as 'immediate' | 'manual') || 'immediate';
  });
  
  const getSafeFakeUsers = () => {
    try {
      const stored = localStorage.getItem('fake_users');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  };
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('adminEmail') || 'alhawamedadeaa@gmail.com');
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('adminPassword') || 'Aa2008');
  
  useEffect(() => {
    localforage.getItem('categories').then((saved: any) => { if (saved && Array.isArray(saved) && saved.length > 0) setCategories(saved); }).catch(()=>{});
    localforage.getItem('subCategories').then((saved: any) => { if (saved && Object.keys(saved).length > 0) setSubCategories(saved); }).catch(()=>{});
    localforage.getItem('subSubCategories').then((saved: any) => { if (saved && Object.keys(saved).length > 0) setSubSubCategories(saved); }).catch(()=>{});
    localforage.getItem('products').then((saved: any) => { if (saved && Object.keys(saved).length > 0) setProducts(saved); }).catch(()=>{});

    const fetchDataFromServer = async (retryCount = 0) => {
      if (retryCount === 0) setIsLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ]);
        const catData = await catRes.json();
        const prodData = await prodRes.json();
        
        if (Array.isArray(catData)) {
          const mainCats = [];
          const subCatsObj = {};
          const subSubCatsObj = {};
          const catMap = new Map();
          catData.forEach(c => catMap.set(c._id, c));
          catData.forEach(c => {
             const legacyCat = { ...c, id: c._id };
             if (!c.parent) {
                mainCats.push(legacyCat);
             } else {
                let parentCat = catMap.get(String(c.parent));
                if (parentCat && parentCat.parent) {
                   if (!subSubCatsObj[c.parent]) subSubCatsObj[c.parent] = [];
                   subSubCatsObj[c.parent].push(legacyCat);
                } else {
                   if (!subCatsObj[c.parent]) subCatsObj[c.parent] = [];
                   subCatsObj[c.parent].push(legacyCat);
                }
             }
          });
          setCategories(mainCats);
          setSubCategories(subCatsObj);
          setSubSubCategories(subSubCatsObj);
          localforage.setItem('categories', mainCats);
          localforage.setItem('subCategories', subCatsObj);
          localforage.setItem('subSubCategories', subSubCatsObj);
        }
        
        if (Array.isArray(prodData)) {
          const groupedProducts = {};
          prodData.forEach(p => {
            const catId = p.category?._id || p.category;
            if (!groupedProducts[catId]) groupedProducts[catId] = [];
            
            // Map Mongoose product fields to legacy fields so the frontend doesn't break
            groupedProducts[catId].push({
              ...p,
              id: p._id,
              name: p.name,
              minQty: p.stock > 0 ? 1 : 0,
              unitPrice: p.price,
              unitPriceUSD: p.price,
              unitPriceSYP: p.price * 15000,
              storeType: p.packages ? 'packages' : (p.unitPrice ? 'quantities' : 'packages'),
              packages: p.packages || [{id: '1', name: 'الكمية 1', price: p.price}],
              inputType: p.apiMapping ? 'id' : 'id_zone'
            });
          });
          setProducts(groupedProducts);
          localforage.setItem('products', groupedProducts);
        }
      } catch(e) {}
    };
    fetchDataFromServer();
    window.addEventListener('REFRESH_ADMIN_DATA', fetchDataFromServer as any);
    return () => window.removeEventListener('REFRESH_ADMIN_DATA', fetchDataFromServer as any);
  }, []);

  const [marqueeText, setMarqueeText] = useState(() => localStorage.getItem('marqueeText') || '🎉 مرحباً بك في Game Zone! نتشرف بخدمتكم - التحديث الجديد للمنصة قريباً مع مزايا رائعة... استمتعوا بأفضل الخدمات!');
  const [exchangeRate, setExchangeRate] = useState<number>(15000);
  const [bannersConfig, setBannersConfig] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('bannersConfig');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migrate old bannerConfig if it exists
      const oldSaved = localStorage.getItem('bannerConfig');
      if (oldSaved && oldSaved !== 'undefined' && oldSaved !== 'null') {
        const parsed = JSON.parse(oldSaved);
        if (parsed) {
           return Array.isArray(parsed) ? parsed : [parsed];
        }
      }
      return [];
    } catch {
      return [];
    }
  });
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [adminBannerIndex, setAdminBannerIndex] = useState(0);

  // Removed banner interval from here
  const [fabOptions, setFabOptions] = useState(() => {
    const defaultOptions = [
        { id: 'whatsapp', name: 'واتساب', url: '#', type: 'whatsapp' },
        { id: 'whatsapp_group', name: 'مجتمعنا', url: '#', type: 'whatsapp_group' },
        { id: 'facebook', name: 'فيسبوك', url: '#', type: 'facebook' },
        { id: 'instagram', name: 'انستغرام', url: '#', type: 'instagram' },
        { id: 'youtube', name: 'يوتيوب', url: '#', type: 'youtube' }
      ];
    try {
      const saved = localStorage.getItem('fabOptions');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : defaultOptions;
      }
      return defaultOptions;
    } catch {
      return defaultOptions;
    }
  });

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const user = JSON.parse(saved);
        if (!user.id) {
          user.id = Math.floor(Math.random() * 900000 + 100000);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Also update in fake_users if possible
          const fakeUsers = getSafeFakeUsers();
          const i = fakeUsers.findIndex((u: any) => u.email === user.email);
          if (i >= 0) {
            fakeUsers[i].id = user.id;
            localStorage.setItem('fake_users', JSON.stringify(fakeUsers));
          }
        }
        return user;
      } catch (e) {
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    if (currentUser) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } catch (e) {
        try {
          const cleaned = { ...currentUser, profileImage: undefined, image: undefined };
          localStorage.setItem('currentUser', JSON.stringify(cleaned));
        } catch (innerE) {}
      }
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [isAuthenticated, currentUser]);

  const [activePopupNotification, setActivePopupNotification] = useState<any>(null);

  const [notifTrigger, setNotifTrigger] = useState(0);

  useEffect(() => {
    const handleNotifUpdate = () => setNotifTrigger(prev => prev + 1);
    window.addEventListener('global_notifications_updated', handleNotifUpdate);
    return () => window.removeEventListener('global_notifications_updated', handleNotifUpdate);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const globalNotifs = JSON.parse(localStorage.getItem('global_notifications') || '[]');
      let hasUpdates = false;
      let newLocalNotifs = [...notifications];
      let newActivePopup = activePopupNotification;

      const ignoredPopups = JSON.parse(localStorage.getItem('ignored_popups') || '{}');
      const updatedGlobalNotifs = globalNotifs.map((n: any) => {
        const isTargetMatch = n.target === 'all' || n.target === currentUser.email;
        const isUnread = !(n.readBy || []).includes(currentUser.email);
        const isIgnored = ignoredPopups[n.id] && ignoredPopups[n.id] > Date.now();
        
        if (isTargetMatch && isUnread) {
          if ((n.type === 'popup' || n.alertType === 'popup') && !newActivePopup && !isIgnored) {
            newActivePopup = n;
            hasUpdates = true;
          } else if (n.type === 'bell') {
            if (!newLocalNotifs.find(ln => ln.id === n.id)) {
              newLocalNotifs.unshift({
                id: n.id,
                title: n.title,
                message: n.message,
                type: 'info',
                date: n.date,
                read: false
              });
              hasUpdates = true;
            }
          }
          // Mark as read in global state
          const updatedReadBy = [...(n.readBy || []), currentUser.email];
          Promise.resolve(apiModule).then(api => {
             if (api.updateGlobalNotificationDB) {
                if (typeof n.id === 'string' && /^[a-f\d]{24}$/i.test(n.id)) {
                    api.updateGlobalNotificationDB(n.id, { readBy: updatedReadBy }).catch(() => {});
                }
             }
          });
          return { ...n, readBy: updatedReadBy };
        }
        return n;
      });

      if (hasUpdates) {
        if (newLocalNotifs.length !== notifications.length) {
          setNotifications(newLocalNotifs);
        }
        if (newActivePopup && newActivePopup.id !== activePopupNotification?.id) {
          setActivePopupNotification(newActivePopup);
        }
        localStorage.setItem('global_notifications', JSON.stringify(updatedGlobalNotifs));
      }
    }
  }, [currentUser, notifications, notifTrigger]);

  // Periodic poll to update balance
  useEffect(() => {
    if (isAuthenticated && currentUser && !isAdmin) {
      const interval = setInterval(() => {
        // Check fake_users first
        const fakeUsers = getSafeFakeUsers();
        const fakeMe = fakeUsers.find((u: any) => u.email === currentUser.email);
        if (fakeMe) {
          if (fakeMe.balance !== currentUser.balance) {
            setCurrentUser((prev: any) => ({ ...prev, balance: fakeMe.balance }));
          }
        } else if (currentUser.id) {
          // If not in fake_users but is a DB user, query it
          Promise.resolve(apiModule).then(api => {
            api.getUserById(currentUser.id).then(dbProfile => {
               if (dbProfile && dbProfile.notFound) {
                   localStorage.removeItem('currentUser');
                   setCurrentUser(null);
                   setIsAuthenticated(false);
               } else if (dbProfile && dbProfile.balance !== currentUser.balance) {
                 setCurrentUser((prev: any) => ({ ...prev, balance: dbProfile.balance }));
                 // Sync fake_users
                 const fu = getSafeFakeUsers();
                 const idx = fu.findIndex((u: any) => u.email === currentUser.email);
                 if (idx > -1) {
                    fu[idx].balance = dbProfile.balance;
                    localStorage.setItem('fake_users', JSON.stringify(fu));
                 }
               }
            }).catch(() => {});
          });
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUser?.email, currentUser?.balance, currentUser?.id, isAdmin]);

  
  
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Security & Lock State
  const [showPinSetupModal, setShowPinSetupModal] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState<1 | 2>(1);
  const [tempPin, setTempPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  
  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const user = JSON.parse(saved);
        if (user.pin) return true;
      } catch (e) {
      }
    }
    return false;
  });
  const [lockPinInput, setLockPinInput] = useState('');
  const [isFingerprintChecking, setIsFingerprintChecking] = useState(false);
  const [lockErrorAnim, setLockErrorAnim] = useState(false);

  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (isAuthenticated && currentUser?.pin && !isLocked) {
        inactivityTimer = setTimeout(() => {
          setIsLocked(true);
        }, 60000); // 1 minute
      }
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('scroll', resetTimer);
    resetTimer();
    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [isAuthenticated, currentUser?.pin, isLocked]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', phone: '', country: '', currency: 'USD', password: '', confirmPassword: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Profile Edit State
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfilePhone, setEditProfilePhone] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Admin Categories Modals State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddSubCatModal, setShowAddSubCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState<any | null>(null);
  const [editSubCatId, setEditSubCatId] = useState<any | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState<string|null>(null);
  const [newSubCatType, setNewSubCatType] = useState<'sub' | 'subsub'>('sub');
  const [newSubCatMainId, setNewSubCatMainId] = useState<any>(null);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatImage, setNewSubCatImage] = useState<string|null>(null);

  const [products, setProducts] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('products');
      if (saved && saved !== 'undefined' && saved !== 'null') return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editProductId, setEditProductId] = useState<any | null>(null);
  const [lastPurchaseTime, setLastPurchaseTime] = useState<number>(0);
  const [newProduct, setNewProduct] = useState({
    subCatId: '',
    name: '',
    desc: '',
    storeType: 'normal',
    priceUSD: '',
    priceSYP: '',
    requiredInput: 'id',
    minQty: '',
    maxQty: '',
    unitPriceUSD: '',
    unitPriceSYP: '', apiProviderId: '', providerProductId: ''
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setEditProfileName(currentUser.name || '');
      setEditProfilePhone(currentUser.phone || '');
      setProfileImage(currentUser.image || null);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };
    
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const [paymentMethods, setPaymentMethods] = useState<any[]>([
    { id: 1, name: 'زين كاش', info: '07800000000', link: 'https://zaincash.iq/pay/1234', note: 'يرجى تحويل المبلغ ثم إرفاق صورة التحويل' },
    { id: 2, name: 'آسيا حوالة', info: '07700000000', link: 'https://asiacell.com/pay', note: 'يرجى كتابة رقم العملية بشكل صحيح' },
    { id: 3, name: 'حوالة بنكية', info: 'رقم الحساب: 123456789 - يرجى كتابة التفاصيل', link: '', note: 'قد تستغرق الحوالة البنكية 24 ساعة للوصول' }
  ]);

  useEffect(() => {
    Promise.resolve(apiModule).then(api => {
      api.getPaymentMethodsDB().then(dbMethods => {
        if (dbMethods && dbMethods.length > 0) {
          setPaymentMethods(dbMethods);
          localforage.setItem('payment_methods', dbMethods);
        } else {
          localforage.getItem('payment_methods').then((saved: any) => {
            if (saved && Array.isArray(saved) && saved.length > 0) {
              setPaymentMethods(saved);
            }
          }).catch(()=>{});
        }
      }).catch(()=>{});
    }).catch(()=>{});
  }, []);

  const currencySymbol = currentUser?.currency === 'SYP' ? 'ل.س' : '$';

  const defaultCategories = [
    { id: 1, name: 'الألعاب', iconName: 'Gamepad2', icon: <Gamepad2 className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 2, name: 'التسويق', iconName: 'Megaphone', icon: <Megaphone className="w-6 h-6" />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
    { id: 3, name: 'البرمجة', iconName: 'Code', icon: <Code className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { id: 4, name: 'إدارة حسابات', iconName: 'Users', icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 5, name: 'التصميم', iconName: 'Palette', icon: <Palette className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-gray-300' },
    { id: 6, name: 'خدمات أخرى', iconName: 'Layers', icon: <Layers className="w-6 h-6" />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  ];

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeCats = () => {};
    let unsubscribeProds = () => {};
    Promise.resolve(apiModule).then(api => {
      // Categories
      unsubscribeCats = api.listenToCategories((dbCats) => {
         if (dbCats === null) return; // Do not overwrite on network error
         const catArray = Array.isArray(dbCats) ? dbCats : [];
         const filtered = catArray.filter((c: any) => !c.name.startsWith('__'));
         
         // Build trees for legacy state (main, sub, subSub)
         const mainCats = filtered.filter((c: any) => !c.parent);
         const subCatsObj: Record<string, any[]> = {};
         const subSubCatsObj: Record<string, any[]> = {};
         
         const getParentId = (p: any) => p && typeof p === 'object' ? p._id || p.id : p;
         mainCats.forEach((main: any) => {
             const mainId = main.id || main._id;
             const subs = filtered.filter((c: any) => getParentId(c.parent)?.toString() === mainId?.toString());
             if (subs.length > 0) subCatsObj[mainId] = subs;
             
             subs.forEach((sub: any) => {
                 const subId = sub.id || sub._id;
                 const subSubs = filtered.filter((c: any) => getParentId(c.parent)?.toString() === subId?.toString());
                 if (subSubs.length > 0) subSubCatsObj[subId] = subSubs;
             });
         });

         setCategories(mainCats);
         localforage.setItem('categories', mainCats.map((c: any) => ({...c, icon: undefined})));
         
         setSubCategories(subCatsObj);
         localforage.setItem('subCategories', subCatsObj);
         
         setSubSubCategories(subSubCatsObj);
         localforage.setItem('subSubCategories', subSubCatsObj);
      });
      // Products
      unsubscribeProds = api.listenToProducts((dbProds) => {
        if (dbProds === null) return; // Do not overwrite on network error
        if(dbProds && dbProds.length > 0) {
           const mappedProds: Record<string, any[]> = {};
           dbProds.forEach((prod: any) => {
              let cId = (prod.category_id || prod.category?._id || prod.category?.id || prod.category)?.toString();
              if(!mappedProds[cId]) mappedProds[cId] = [];
              let desc = prod.description || '';
              let priceUSD = prod.price || 0;
              let priceSYP = 0;
              let unitPriceUSD = prod.unitPrice || 0;
              let unitPriceSYP = 0;
              
              if (desc.startsWith('{')) {
                 try {
                     const parsed = JSON.parse(desc);
                     desc = parsed.desc || '';
                     priceUSD = parsed.priceUSD || priceUSD;
                     priceSYP = parsed.priceSYP || 0;
                     unitPriceUSD = parsed.unitPriceUSD || unitPriceUSD;
                     unitPriceSYP = parsed.unitPriceSYP || 0;
                 } catch (e) {}
              }

              mappedProds[cId].push({
                  ...prod,
                  description: desc,
                  priceUSD, priceSYP, unitPriceUSD, unitPriceSYP,
                  minQty: prod.min_qty || prod.minQty,
                  maxQty: prod.max_qty || prod.maxQty,
                  storeType: prod.store_type || prod.storeType,
                  requiredInput: prod.required_input || prod.requiredInput
              });
           });
           setProducts(mappedProds);
           localforage.setItem('products', mappedProds);
        } else {
           setProducts({});
        }
      });

    });
  }, []);
  const defaultSubCategories: Record<number, { id: number, name: string, image?: string }[]> = {
    1: [{ id: 101, name: 'ببجي موبايل' }, { id: 102, name: 'فري فاير' }, { id: 103, name: 'فالورانت' }],
    2: [{ id: 201, name: 'تيك توك' }, { id: 202, name: 'انستغرام' }, { id: 203, name: 'فيسبوك' }],
    3: [{ id: 301, name: 'تصميم مواقع' }, { id: 302, name: 'تطبيقات هاتف' }],
    4: [{ id: 401, name: 'إدارة سوشيال ميديا' }],
    5: [{ id: 501, name: 'شعارات' }, { id: 502, name: 'بوسترات' }],
    6: [{ id: 601, name: 'أخرى' }]
  };

  const [subCategories, setSubCategories] = useState<Record<number, { id: number, name: string, image?: string }[]>>(defaultSubCategories);

  const [subSubCategories, setSubSubCategories] = useState<Record<number, { id: number, name: string, image?: string }[]>>({});

  // localforage gets removed to prevent racing with MongoDB fetch


  const filteredCategories = Array.isArray(categories) ? categories.filter(cat => cat?.name?.includes(searchQuery)) : [];

  const handleViewChange = (view: View) => {
    let targetView = view;
    if (!isAuthenticated && view !== 'home' && view !== 'login' && view !== 'register') {
      targetView = 'login';
    }

    if (currentView === 'add_balance' && targetView !== 'add_balance') {
      setAddBalanceForm({ amount: '', operationNumber: '', image: '' });
      setSelectedPaymentMethod(null);
    }

    if (currentView === 'home' && targetView !== 'home') {
      // Leaving home clears product draft
      setOrderForm({ playerId: '', playerPassword: '', quantity: 1, packageId: '1' });
    }

    if (targetView === 'home') {
      setSelectedCategoryId(null);
      setSelectedSubCategoryId(null);
      setOrderForm({ playerId: '', playerPassword: '', quantity: 1, packageId: '1' });
    }

    if (targetView === currentView) {
      if (targetView === 'home') {
        setIsSidebarOpen(false);
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          setSearchQuery(''); // Reset search on reload
        }, 400);
        return;
      }
      setIsSidebarOpen(false);
      return;
    }
    setIsSidebarOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      setCurrentView(targetView);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }, 400);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsProfileSaving(true);
    
    try {
      Promise.resolve(apiModule).then(api => {
        api.updateProfile(currentUser.id, {
          name: editProfileName,
          phone: editProfilePhone,
          image: profileImage
        }).catch(err => {});
      }).catch(err => {});
    } catch (e) {}
    // Simulate API call
    setTimeout(() => {
      setCurrentUser({
        ...currentUser,
        name: editProfileName,
        phone: editProfilePhone,
        image: profileImage
      });

      // Also update in localStorage to persist simple edits
      const users = getSafeFakeUsers();
      const updatedUsers = users.map((u: any) => 
        u.email === currentUser.email ? { ...u, name: editProfileName, phone: editProfilePhone, image: profileImage } : u
      );
      localStorage.setItem('fake_users', JSON.stringify(updatedUsers));

      setProfileMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
      setIsProfileSaving(false);
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    }, 600);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (currentPassword !== currentUser.password) {
      setPasswordMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' });
      return;
    }

    setCurrentUser({
      ...currentUser,
      password: newPassword
    });

    const users = getSafeFakeUsers();
    const updatedUsers = users.map((u: any) => 
      u.email === currentUser.email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem('fake_users', JSON.stringify(updatedUsers));

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
    setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
  };

  

    const checkLoginBlock = () => {
    const blockUntil = localStorage.getItem('loginBlockedUntil');
    if (blockUntil && Date.now() < parseInt(blockUntil)) {
      const remaining = Math.ceil((parseInt(blockUntil) - Date.now()) / 1000 / 60);
      return `تم حظرك مؤقتاً بسبب المحاولات الخاطئة. يرجى المحاولة بعد ${remaining} دقيقة.`;
    }
    if (blockUntil && Date.now() >= parseInt(blockUntil)) {
      localStorage.removeItem('loginBlockedUntil');
      localStorage.removeItem('loginAttempts');
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    const blockMsg = checkLoginBlock();
    if (blockMsg) {
       setLoginError(blockMsg);
       return;
    }
    e.preventDefault();

    setIsLoading(true);
    try {
      const isAdminCredentials = (loginForm.email === adminEmail || loginForm.email === 'ddeaa0961@gmail.com' || loginForm.email === 'alhawamedadeaa@gmail.com') && (loginForm.password === adminPassword || loginForm.password === 'Aa2008');
      
      let authData, userData;
      try {
        const result = await signInUser(loginForm.email, loginForm.password);
        authData = result.authData;
        userData = result.userData;
      } catch (err: any) {
        if (isAdminCredentials) {
            // Create the admin user in the database if they don't exist
            try {
                const newAdmin = await signUpUser(
                    loginForm.email, 
                    loginForm.password, 
                    { name: 'مدير النظام', phone: '', country: '', role: 'Admin', isAdmin: true }
                );
                authData = newAdmin.authData;
                userData = newAdmin.userData;
                if (userData) {
                    userData.isAdmin = true;
                    await updateUserDB(userData.id, userData);
                }
            } catch (regErr) {
                // If it still fails, just fallback to local admin
                userData = {
                    id: Date.now().toString(),
                    email: loginForm.email,
                    password: loginForm.password,
                    name: 'مدير النظام',
                    role: 'Admin', isAdmin: true,
                    balance: 0
                };
            }
        } else {
            throw err;
        }
      }

      
      // Delay to show the loading screen as requested
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isAdminUser = (loginForm.email === adminEmail || loginForm.email === 'ddeaa0961@gmail.com' || loginForm.email === 'alhawamedadeaa@gmail.com') && (loginForm.password === adminPassword || loginForm.password === 'Aa2008');

      const user: any = userData ? {
        id: userData.id,
        login_id: userData.login_id || (authData?.user as any)?.user_metadata?.login_id || userData.id,
        email: userData.email,
        password: userData.password || loginForm.password,
        name: userData.name || userData.username || (authData?.user as any)?.user_metadata?.name || 'مستخدم',
        phone: userData.phone || (authData?.user as any)?.user_metadata?.phone || '',
        country: userData.country || (authData?.user as any)?.user_metadata?.country || '',
        balance: userData.balance || 0,
        isBlocked: userData.isBlocked,
        image: userData.image || null,
        isAdmin: isAdminUser || userData.isAdmin || false,
        pin: userData.pin || null
      } : {
        id: (authData?.user as any)?.id,
        login_id: (authData?.user as any)?.user_metadata?.login_id || (authData?.user as any)?.id,
        email: loginForm.email,
        password: loginForm.password,
        name: (authData?.user as any)?.user_metadata?.name || 'مستخدم',
        phone: (authData?.user as any)?.user_metadata?.phone || '',
        image: (authData?.user as any)?.user_metadata?.image || null,
        country: (authData?.user as any)?.user_metadata?.country || '',
        balance: 0,
        isAdmin: isAdminUser,
        pin: null
      };

      try {
        const fakeUsers = getSafeFakeUsers();
        const fakeMatch = fakeUsers.find((u: any) => u.email === user.email);
        if (fakeMatch) {
            const index = fakeUsers.findIndex((u: any) => u.email === user.email);
            fakeUsers[index] = { ...fakeMatch, ...user, password: user.password || fakeMatch.password };
            user.balance = fakeMatch.balance !== undefined ? fakeMatch.balance : user.balance;
            user.pin = fakeMatch.pin !== undefined ? fakeMatch.pin : user.pin;
            user.isBlocked = fakeMatch.isBlocked !== undefined ? fakeMatch.isBlocked : user.isBlocked;
            user.image = fakeMatch.image || user.image;
            localStorage.setItem('fake_users', JSON.stringify(fakeUsers));
        } else {
            fakeUsers.push(user);
            localStorage.setItem('fake_users', JSON.stringify(fakeUsers));
        }
      } catch(e) {}

      if (user.isBlocked) {
        setLoginError('تم حظر هذا الحساب من قبل الإدارة.');
        return;
      }
      
      setIsAuthenticated(true);
      if (typeof user.balance === 'undefined') {
        user.balance = 0;
      }
      setCurrentUser(user);
      setLoginForm({ email: '', password: '' });
      setLoginError('');
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginBlockedUntil');
      
      if (user.isAdmin) {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        showNotification('success', 'تم تسجيل الدخول بصلاحيات المسؤول');
        setCurrentView('admin');
      } else {
        setIsAdmin(false);
        localStorage.removeItem('isAdmin');
        showNotification('success', 'لا تنسى ذكر الله والصلاة على النبي 🤍');
        navigate('/');
      }

      if (user.pin) {
        setIsLocked(true);
      }
    } catch (error: any) {
      
      // Fallback for local users if server db wiped
      const fakeUsers = getSafeFakeUsers();
      const localUser = fakeUsers.find((u: any) => u.email === loginForm.email && u.password === loginForm.password);
      if (localUser) {
        setIsAuthenticated(true);
        setIsAdmin(localUser.isAdmin || false);
        setCurrentUser(localUser);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', String(localUser.isAdmin || false));
        setLoginForm({ email: '', password: '' });
        setLoginError('');
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('loginBlockedUntil');
        showNotification('success', 'تم تسجيل الدخول بنجاح');
        setCurrentView(localUser.isAdmin ? 'admin' : 'login');
        setIsLoading(false);
        if (localUser.pin) setIsLocked(true);
        return;
      }

      // Fallback for hardcoded admin if DB fails
      if ((loginForm.email === 'alhawamedadeaa@gmail.com' || loginForm.email === 'ddeaa0961@gmail.com') && loginForm.password === 'Aa2008') {
        try {
           const api = await Promise.resolve(apiModule);
           // Attempt to create the admin in DB if missing
           await api.signUpUser(loginForm.email, loginForm.password, {
              name: 'مدير النظام',
              phone: '',
              country: 'سوريا',
              balance: 0,
              role: 'Admin', isAdmin: true
           });
           // Re-attempt login to get real DB data
           const { authData, userData } = await api.signInUser(loginForm.email, loginForm.password);
           setIsAuthenticated(true);
           setIsAdmin(true);
           setCurrentUser(userData);
           localStorage.setItem('isAuthenticated', 'true');
           localStorage.setItem('isAdmin', 'true');
           setLoginForm({ email: '', password: '' });
           setLoginError('');
           showNotification('success', 'تم إنشاء وتفعيل حساب المسؤول في قاعدة البيانات');
           setCurrentView('admin');
           setIsLoading(false);
           return;
        } catch (dbErr) {
           // If it still fails, use local only
           setIsAuthenticated(true);
           setIsAdmin(true);
           setCurrentUser({ email: loginForm.email, name: 'مدير النظام', balance: 0, id: 999999, login_id: 1, role: 'Admin', isAdmin: true });
           localStorage.setItem('isAuthenticated', 'true');
           localStorage.setItem('isAdmin', 'true');
           setLoginForm({ email: '', password: '' });
           setLoginError('');
           showNotification('success', 'تم تسجيل الدخول بصلاحيات المسؤول (محلي)');
           setCurrentView('admin');
           setIsLoading(false);
           return;
        }
      }

      let errorMsg = error.message === 'Signin failed' || error.message === 'Invalid email or password' || error.message === 'Invalid login credentials' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : error.message || 'حدث خطأ أثناء تسجيل الدخول';
      
      let attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
      localStorage.setItem('loginAttempts', attempts.toString());
      if (attempts >= 5) {
        localStorage.setItem('loginBlockedUntil', (Date.now() + 15 * 60 * 1000).toString());
        setLoginError(`تم حظرك مؤقتاً بسبب كثرة المحاولات الخاطئة. يرجى المحاولة بعد 15 دقيقة.`);
      } else {
        setLoginError(`${errorMsg} (المحاولة ${attempts} من 5)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.phone || !registerForm.country) {
       setRegisterError('يرجى تعبئة جميع الحقول');
       return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
       setRegisterError('كلمة المرور غير متطابقة');
       return;
    }
    try {
      await signUpUser(registerForm.email, registerForm.password, {
        name: registerForm.name,
        phone: registerForm.phone,
        country: registerForm.country
      });
      setRegisterError('');
      setRegisterForm({ name: '', email: '', phone: '', country: '', currency: 'USD', password: '', confirmPassword: '' });
      showNotification('success', 'تم تسجيل الحساب بنجاح، يمكنك تسجيل الدخول الآن');
      handleViewChange('login');
    } catch (error: any) {
      try {
        const fakeUsers = getSafeFakeUsers();
        if (fakeUsers.find((u: any) => u.email === registerForm.email)) {
          setRegisterError('البريد الإلكتروني مسجل مسبقاً');
          return;
        }
        fakeUsers.push({
          id: Date.now().toString(),
          email: registerForm.email,
          password: registerForm.password,
          name: registerForm.name,
          phone: registerForm.phone,
          country: registerForm.country,
          balance: 0,
          isAdmin: false,
          pin: null
        });
        localStorage.setItem('fake_users', JSON.stringify(fakeUsers));
        setRegisterError('');
        setRegisterForm({ name: '', email: '', phone: '', country: '', currency: 'USD', password: '', confirmPassword: '' });
        showNotification('success', 'تم تسجيل الحساب بنجاح، يمكنك تسجيل الدخول الآن');
        handleViewChange('login');
        return;
      } catch (fallbackError) {}
      
      let errorMsg = error.message || 'حدث خطأ أثناء التسجيل';
      if (errorMsg.includes('email rate limit exceeded') || errorMsg.includes('rate_limit_exceeded')) {
        errorMsg = 'لقد تجاوزت الحد المسموح به للتسجيل. يرجى المحاولة بعد قليل أو استخدام بريد مختلف.';
      }
      setRegisterError(errorMsg);
    }
  };

  const handleLogout = async () => {
    setLoadingText('جاري تسجيل الخروج...');
    setIsLoading(true);
    setActivePopupNotification(null);
    if (currentUser) {
        setCurrentUser(prev => prev ? { ...prev, balance: 0 } : null);
    }
    try {
      await signOutUser();
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (e) {
    } finally {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('currentUser');
      
      // Let StoreApp handle the login view by navigating there
      window.location.href = '/login';
    }
  };

  const getBottomNavColor = (view: View) => {
    return currentView === view ? 'text-white bg-gradient-to-r from-blue-900 to-black dark:from-red-600 dark:to-red-900 dark:text-white dark:font-bold dark:backdrop-blur-md dark:border dark:border-red-500/30 font-bold rounded-full shadow-lg shadow-blue-900/30 dark:shadow-red-900/40' : 'text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-blue-600 dark:hover:text-white font-medium rounded-full';
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [addBalanceForm, setAddBalanceForm] = useState({
    amount: '',
    operationNumber: '',
    image: null as string | null
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    target: 'all',
    type: 'bell'
  });

  const [balanceRequests, setBalanceRequests] = useState<any[]>([]);

  useEffect(() => {
    Promise.resolve(apiModule).then(api => {
      api.getBalanceRequestsDB().then(dbRequests => {
        if (dbRequests && dbRequests.length > 0) {
          setBalanceRequests(dbRequests);
          localforage.setItem('balanceRequests', dbRequests);
        } else {
          localforage.getItem('balanceRequests').then((saved: any) => {
            if (saved && Array.isArray(saved) && saved.length > 0) {
              setBalanceRequests(saved);
            } else {
              setBalanceRequests([]);
              localforage.setItem('balanceRequests', []);
            }
          }).catch(()=>{});
        }
      }).catch(()=>{});
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    localforage.getItem('orders').then((saved: any) => {
        if (saved && Array.isArray(saved) && saved.length > 0) {
            setOrders(saved);
            prevOrdersRef.current = saved;
        }
    }).catch(()=>{});
  }, []);

  const [orders, setOrders] = useState<any[]>(() => {
    const defaultOrders = [
      { 
        id: 1, orderNumber: "ORD_1", title: 'شحن شدات ببجي', status: 'accepted', date: '2023-10-25', price: '15.00$',
        subCategory: 'العاب', subSubCategory: 'ببجي موبايل', product: '600 شدة', quantity: 1,
        playerData: 'ID: 5123456789', responseInfo: 'تم الشحن بنجاح', adminNote: 'تم الشحن و إضافة الرصيد لحسابك، شكراً لثقتك.' 
      },
      { 
        id: 2, orderNumber: "ORD_2", title: 'حملة تسويقية عبر جوجل', status: 'processing', date: '2023-10-26', price: '300.00$',
        subCategory: 'تسويق', subSubCategory: 'جوجل ادز', product: 'حملة 10 ايام', quantity: 1,
        playerData: 'رابط الموقع: www.example.com', responseInfo: 'قيد المراجعة في جوجل', adminNote: 'جاري العمل على تجهيز الكلمات المفتاحية للحملة.'
      },
      { 
        id: 3, orderNumber: "ORD_3", title: 'تطوير موقع تعريفي', status: 'rejected', date: '2023-10-22', price: '500.00$',
        subCategory: 'برمجة', subSubCategory: 'تطوير الويب', product: 'موقع 3 صفحات', quantity: 1,
        playerData: 'المجال: تجارة الكترونية', responseInfo: 'مرفوض لنقص التفاصيل', adminNote: 'يرجى تزويدنا بتفاصيل أكثر عن القسم الذي تريد إضافته للموقع وإعادة الطلب.'
      },
      { 
        id: 4, orderNumber: "ORD_4", title: 'إدارة حسابات التواصل', status: 'accepted', date: '2023-10-27', price: '250.00$',
        subCategory: 'ادارة', subSubCategory: 'تواصل اجتماعي', product: 'ادارة انستقرام', quantity: 1,
        playerData: 'الحساب: @AlazeazMatrex', responseInfo: 'تم البدء بالعمل', adminNote: 'تم نشر أول تصميم في حسابك بنجاح.'
      },
    ];
    const saved = localStorage.getItem('orders');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try { 
        const parsed = JSON.parse(saved); 
        return Array.isArray(parsed) ? parsed : defaultOrders;
      } catch (e) {}
    }
    return defaultOrders;
  });

  useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (e) {
      // keep only the last 100 orders
      if (orders.length > 100) {
        try {
          localStorage.setItem('orders', JSON.stringify(orders.slice(-100)));
        } catch(e2){}
      }
    }
  }, [orders]);

  const prevOrdersRef = useRef<any[]>([]);
  const prevBalanceReqsRef = useRef<any[]>([]);

  // Firebase Real-time Synchronization
  useEffect(() => {
    let unsubscribeOrders: any;
    let unsubscribeBalanceReqs: any;
    let unsubscribeUsers: any;
    let unsubscribeSettings: any;
    let unsubscribePaymentMethods: any;
    let unsubscribeGlobalNotifications: any;
    
    Promise.resolve(apiModule).then(api => {
      if (api.listenToOrders) {
        unsubscribeOrders = api.listenToOrders((dbOrders) => {
          const sorted = dbOrders.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
          
          if (currentUser?.email) {
             const userOrders = sorted.filter(o => o.userEmail === currentUser.email || o.userId === currentUser.id);
             const prevUserOrders = prevOrdersRef.current.filter(o => o.userEmail === currentUser.email || o.userId === currentUser.id);
             
             if (prevOrdersRef.current.length > 0) {
                 userOrders.forEach(o => {
                     const prevO = prevUserOrders.find(po => po.id === o.id);
                     if (prevO && prevO.status !== o.status) {
                         if (o.status === 'accepted') {
                             showNotification('success', `تمت الموافقة على طلبك: ${o.product || o.title}`);
                         } else if (o.status === 'rejected') {
                             showNotification('error', `تم رفض طلبك: ${o.product || o.title}`);
                         }
                     }
                 });
             }
          }
          
          prevOrdersRef.current = sorted;
          setOrders(sorted);
          localforage.setItem('orders', sorted);
        });
      }
      if (api.listenToBalanceRequests) {
        unsubscribeBalanceReqs = api.listenToBalanceRequests((dbReqs) => {
          const sorted = dbReqs.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
          
          if (currentUser?.email) {
             const userReqs = sorted.filter(o => o.userEmail === currentUser.email || o.userId === currentUser.id);
             const prevUserReqs = prevBalanceReqsRef.current.filter(o => o.userEmail === currentUser.email || o.userId === currentUser.id);
             
             if (prevBalanceReqsRef.current.length > 0) {
                 userReqs.forEach(o => {
                     const prevO = prevUserReqs.find(po => po.id === o.id);
                     if (prevO && prevO.status !== o.status) {
                         if (o.status === 'accepted') {
                             showNotification('success', `تمت الموافقة على طلب شحن الرصيد بمبلغ ${o.amount || o.amountUSD}`);
                         } else if (o.status === 'rejected') {
                             showNotification('error', `تم رفض طلب شحن الرصيد بمبلغ ${o.amount || o.amountUSD}`);
                         }
                     }
                 });
             }
          }
          
          prevBalanceReqsRef.current = sorted;
          setBalanceRequests(sorted);
        });
      }
      if (api.listenToUsers) {
        unsubscribeUsers = api.listenToUsers((dbUsers) => {
          try {
             localStorage.setItem('fake_users', JSON.stringify(dbUsers));
          } catch (e) {}
          
          if (currentUser && currentUser.email) {
             const me = dbUsers.find((u: any) => u.email === currentUser.email);
             if (me) {
                 setCurrentUser((prev: any) => ({ ...prev, balance: me.balance, name: me.name, image: me.image, phone: me.phone }));
             }
          }
        });
      }
      if (api.listenToSettings) {
        unsubscribeSettings = api.listenToSettings((settings: any) => {
          if (settings) {
            if (settings.marqueeText) setMarqueeText(settings.marqueeText);
            if (settings.exchangeRate) setExchangeRate(settings.exchangeRate);
            if (settings.adminEmail) setAdminEmail(settings.adminEmail);
            if (settings.adminPassword) setAdminPassword(settings.adminPassword);
            if (settings.bannersConfig) setBannersConfig(settings.bannersConfig);
            if (settings.fabOptions) setFabOptions(settings.fabOptions);
            if (settings.orderProcessingMode) setOrderProcessingMode(settings.orderProcessingMode);
          }
        });
      }
      if (api.listenToPaymentMethods) {
        unsubscribePaymentMethods = api.listenToPaymentMethods((dbMethods) => {
           if (dbMethods && dbMethods.length > 0) {
             setPaymentMethods(dbMethods);
             localforage.setItem('payment_methods', dbMethods);
           }
        });
      }
      if (api.listenToGlobalNotifications) {
        unsubscribeGlobalNotifications = api.listenToGlobalNotifications((notifs) => {
           if (notifs && notifs.length > 0) {
             localStorage.setItem('global_notifications', JSON.stringify(notifs));
             window.dispatchEvent(new Event('global_notifications_updated'));
           }
        });
      }
    });
    
    return () => {
              if (unsubscribeOrders) unsubscribeOrders();
       if (unsubscribeBalanceReqs) unsubscribeBalanceReqs();
       if (unsubscribeUsers) unsubscribeUsers();
       if (unsubscribeSettings) unsubscribeSettings();
       if (unsubscribePaymentMethods) unsubscribePaymentMethods();
       if (unsubscribeGlobalNotifications) unsubscribeGlobalNotifications();
    };
  }, [currentUser?.email]);

  // محاكاة الاستعلام وإرسال الطلبات التي لم ترسل للـ API أو لوحة التحكم كل 5 دقائق
  useEffect(() => {
    const checkPending = () => {
      if (!currentUser?.email) return;
      
      // التشييك على الطلبات التي لم ترسل للـ API
      setOrders(prevOrders => {
        const hasUnsynced = prevOrders.some(o => o.status === 'processing' && o.synced === false && o.userEmail === currentUser?.email);
        if (!hasUnsynced) return prevOrders;
        
        return prevOrders.map(o => {
          if (o.status === 'processing' && o.synced === false && o.userEmail === currentUser?.email) {
            setTimeout(() => {
              showNotification('info', `تم رفع الطلب المعلق ${o.orderNumber} للوحة التحكم`);
            }, 0);
            return { ...o, synced: true, responseInfo: 'تم الإرسال إلى لوحة التحكم / API', adminNote: 'بانتظار موافقة المشرف أو رد API' };
          }
          return o;
        });
      });

      // التشييك على طلبات الرصيد التي لم ترسل
      setBalanceRequests(prevRequests => {
        const hasUnsynced = prevRequests.some(r => r.status === 'processing' && r.synced === false && r.userEmail === currentUser?.email);
        if (!hasUnsynced) return prevRequests;
        
        const updated = prevRequests.map(r => {
          if (r.status === 'processing' && r.synced === false && r.userEmail === currentUser?.email) {
            return { ...r, synced: true };
          }
          return r;
        });
        localforage.setItem('balanceRequests', updated);
        return updated;
      });
    };

    const interval = setInterval(checkPending, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUser?.email]);



  const userOrders = currentUser && Array.isArray(orders) ? orders.filter(o => o?.userEmail === currentUser.email) : [];
  const userBalanceRequests = currentUser && Array.isArray(balanceRequests) ? balanceRequests.filter(r => r?.userEmail === currentUser.email) : [];

  const filteredOrders = Array.isArray(userOrders) ? userOrders.filter(o => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const searchLower = orderSearchQuery.toLowerCase();
    const matchesSearch = !orderSearchQuery || 
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.title.toLowerCase().includes(searchLower) ||
      (o.playerData && o.playerData.toLowerCase().includes(searchLower));
    return matchesFilter && matchesSearch;
  }) : [];

  const getOrderStatusDisplay = (status: string) => {
    switch (status) {
      case 'accepted':
        return { label: 'مقبول', bg: 'bg-emerald-50 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: <CheckCircle className="w-4 h-4" /> };
      case 'rejected':
        return { label: 'مرفوض', bg: 'bg-red-50 dark:bg-red-900/40', text: 'text-red-500 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: <XCircle className="w-4 h-4" /> };
      case 'processing':
        return { label: 'انتظار (قيد المعالجة)', bg: 'bg-amber-50 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', icon: <Clock className="w-4 h-4" /> };
      default:
        return { label: 'غير معروف', bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700', icon: <Clock className="w-4 h-4" /> };
    }
  };

  const hideBottomNav = currentView === 'login' || currentView === 'register' || currentView === 'admin' || isAdmin || isKeyboardOpen || selectedProductId !== null;

  const productPackages = [
    { id: '1', name: 'حزمة أساسية', price: 5 },
    { id: '2', name: 'حزمة مميزة', price: 15 },
    { id: '3', name: 'حزمة احترافية', price: 30 },
  ];


  const handleAddBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentMethod) {
      showNotification('error', 'يجب اختيار طريقة الدفع أولاً');
      return;
    }
    const amountFloat = parseFloat(addBalanceForm.amount);
    if (!addBalanceForm.amount || amountFloat <= 0) {
      showNotification('error', 'الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (selectedPaymentMethod.minDeposit) {
      const minDepositFloat = parseFloat(selectedPaymentMethod.minDeposit);
      if (amountFloat < minDepositFloat) {
        showNotification('error', `أقل مبلغ للإيداع لهذه الطريقة هو ${minDepositFloat} ${currencySymbol}`);
        return;
      }
    }
    if (!addBalanceForm.operationNumber || addBalanceForm.operationNumber.trim() === '') {
      showNotification('error', 'الرجاء إدخال رقم العملية أو رقم المحول');
      return;
    }

    const operationExists = balanceRequests.some(req => req.operationNumber === addBalanceForm.operationNumber);
    if (operationExists) {
      showNotification('error', 'رقم العملية مسجل مسبقاً في طلب آخر');
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      const newRequest = {
        id: Date.now() + Math.random(),
        userEmail: currentUser?.email,
        userName: currentUser?.name,
        userId: currentUser?.login_id || currentUser?.id,
        userPhone: currentUser?.phone,
        amount: addBalanceForm.amount + ' ' + currencySymbol,
        status: 'processing',
        synced: true,
        date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true}),
        method: selectedPaymentMethod.name,
        operationNumber: addBalanceForm.operationNumber,
        image: addBalanceForm.image
      };
      
      Promise.resolve(apiModule).then(api => api.saveBalanceRequestDB(newRequest).catch(()=>{})).catch(()=>{});
      
      setBalanceRequests(prev => {
        const newReqs = [newRequest, ...prev];
        localforage.setItem('balanceRequests', newReqs);
        return newReqs;
      });
      
      setNotifications(prev => [{
        id: Date.now() + Math.random(),
        title: 'طلب شحن جديد',
        message: `تم استلام طلب شحن بقيمة ${addBalanceForm.amount} ${currencySymbol} قيد المراجعة.`,
        type: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false
      }, ...prev]);

      showNotification('success', 'تم ارسال طلب الشحن بنجاح، يرجى الانتظار');
      
      setAddBalanceForm({ amount: '', operationNumber: '', image: null });
      setSelectedPaymentMethod(null);
      setIsTransitioning(false);
      handleViewChange('wallet');
    }, 500);
  };

  const handlePurchase = () => {
      const now = Date.now();
      if (now - lastPurchaseTime < 30000) {
        showNotification('error', `يرجى الانتظار ${Math.ceil((30000 - (now - lastPurchaseTime)) / 1000)} ثانية قبل تقديم طلب جديد`);
        return;
      }
      
      const targetId = selectedSubSubCategoryId || selectedSubCategoryId;
      const targetProd = (products[targetId] || []).find((p: any) => p.id === selectedProductId);
      if (!targetProd) return;
      
      const storeType = targetProd.storeType || 'normal';
      let basePrice = storeType === 'quantities' ? (targetProd.unitPriceUSD || targetProd.unitPrice || targetProd.price) : (targetProd.priceUSD || targetProd.price);
      let totalPrice = storeType === 'quantities' ? (orderForm.quantity || Number(targetProd.minQty)) * basePrice : basePrice;
      if (currentUser?.currency === 'SYP') {
          totalPrice = totalPrice * exchangeRate;
      }

      if (!currentUser) {
        handleViewChange('login');
        return;
      }
      
      if (currentUser.balance < totalPrice) {
          showNotification('error', 'ليس لديك رصيد كافي لإتمام العملية');
          return;
      }
      
      setLastPurchaseTime(now);
      setIsTransitioning(true);
      setTimeout(() => {
          // Deduct balance immediately upon purchase
          const updatedUser = {
            ...currentUser,
            balance: Number(currentUser.balance) - Number(totalPrice)
          };
          updateUserAndStorage(updatedUser);
          
          let plData = orderForm.playerId;
          if (targetProd.requiredInput === 'email_password') {
             plData += ` / ${orderForm.playerPassword}`;
          }

          const newOrder = {
            id: Date.now() + Math.random(),
            userEmail: currentUser.email,
            userName: currentUser.name || '',
            userPhone: currentUser.phone || '',
            userId: currentUser.id || currentUser.login_id || '',
            orderNumber: `ORD_${Date.now().toString().slice(-4)}`,
            title: targetProd.name || 'طلب جديد',
            status: 'processing',
            synced: true, // يذهب للـ api / لوحة التحكم فوراً
            date: new Date().toISOString().split('T')[0],
            price: Number(totalPrice).toFixed(2) + ' ' + currencySymbol,
            subCategory: categories.find(c => c.id === selectedCategoryId)?.name || '',
            subSubCategory: selectedSubSubCategoryId 
                ? (subSubCategories[selectedSubCategoryId!] || []).find(s => s.id === selectedSubSubCategoryId)?.name 
                : (subCategories[selectedCategoryId!] || []).find(s => s.id === selectedSubCategoryId)?.name || '',
            product: targetProd.name,
            quantity: storeType === 'quantities' ? orderForm.quantity : 1,
            playerData: plData || 'غير متوفر',
            responseInfo: 'تم الإرسال إلى لوحة التحكم / API',
            adminNote: 'بانتظار موافقة المشرف أو رد API'
          };
          
          createOrder(newOrder).catch(() => {});
          
          setOrders(prevOrders => {
            const newOrders = [newOrder, ...prevOrders];
            localforage.setItem('orders', newOrders);
            return newOrders;
          });
          
          setNotifications(prev => [{
            id: Date.now() + Math.random(),
            title: 'طلب جديد',
            message: `تم استلام طلبك لـ ${targetProd.name} وهو الآن قيد المعالجة.`,
            type: 'info',
            date: new Date().toISOString().split('T')[0],
            read: false
          }, ...prev]);
          
          showNotification('success', 'تم ارسال طلبك بنجاح');
          setSelectedCategoryId(null);
          setSelectedSubCategoryId(null);
          setSelectedSubSubCategoryId(null);
          setSelectedProductId(null);
          setOrderForm({ playerId: '', playerPassword: '', quantity: 1, packageId: '1' });
          setIsTransitioning(false);
          handleViewChange('orders');
      }, 500);
  };

  const updateUserAndStorage = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      const fakeUsers = getSafeFakeUsers();
      const i = fakeUsers.findIndex((u: any) => u.email === updatedUser.email);
      if (i >= 0) {
        fakeUsers[i] = { ...fakeUsers[i], ...updatedUser };
        localStorage.setItem('fake_users', JSON.stringify(fakeUsers));
      }
    } catch (e) {
      try {
        const fakeUsers = getSafeFakeUsers();
        const cleanedUsers = fakeUsers.map((u: any) => ({ ...u, profileImage: undefined }));
        localStorage.setItem('fake_users', JSON.stringify(cleanedUsers));
        const cleanedUser = { ...updatedUser, profileImage: undefined };
        localStorage.setItem('currentUser', JSON.stringify(cleanedUser));
      } catch (innerE) {}
    }
    const userId = updatedUser.id || updatedUser.login_id;
    if (userId) {
      Promise.resolve(apiModule).then(api => {
        const payload: any = {
           name: updatedUser.name,
           phone: updatedUser.phone,
           balance: updatedUser.balance,
           image: updatedUser.image,
           pin: updatedUser.pin,
           password: updatedUser.password
        };
        api.updateUser(userId, payload).catch(() => {});
      });
    }
  };

  const requestFingerprint = async (action: 'setup' | 'verify') => {
    try {
      if (!window.PublicKeyCredential) {
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(window.confirm(`جهازك لا يدعم البصمة أو الاتصال غير آمن (HTTP). هل تريد ${action === 'setup' ? 'تفعيل' : 'تأكيد'} البصمة وهمياً للمتابعة؟`));
          }, 300);
        });
      }
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      if (action === 'setup') {
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);
        
        await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: { name: "Store App" },
            user: {
              id: userId,
              name: currentUser?.email || "user@example.com",
              displayName: currentUser?.name || "User"
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 }
            ],
            authenticatorSelection: { 
              authenticatorAttachment: "platform", 
              userVerification: "required" 
            },
            timeout: 60000,
            attestation: "none"
          }
        });
        return true;
      } else {
        await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            userVerification: "required",
            timeout: 60000
          }
        });
        return true;
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('feature is not enabled') || e.message.includes('cross-origin'))) {
         return new Promise<boolean>((resolve) => {
           setTimeout(() => {
             resolve(window.confirm(`بيئة المعاينة تمنع البصمة. هل تريد ${action === 'setup' ? 'تفعيل' : 'تأكيد'} البصمة وهمياً للمتابعة؟`));
           }, 300);
         });
      } else if (e.name === 'NotAllowedError') {
         showNotification('error', 'تم رفض إذن البصمة أو تم الإلغاء');
      } else if (e.name === 'NotSupportedError') {
         showNotification('error', 'جهازك لا يدعم البصمة');
      } else {
         showNotification('error', 'فشلت عملية المصادقة بالبصمة');
      }
      return false;
    }
  };

  const handleFingerprintUnlock = async () => {
    setIsFingerprintChecking(true);
    const success = await requestFingerprint('verify');
    setIsFingerprintChecking(false);
    if (success) {
      setIsLocked(false);
      setLockPinInput('');
    } else {
      showNotification('error', 'فشل التحقق من البصمة');
    }
  };

  useEffect(() => {
    if (isLocked && currentUser?.fingerprintEnabled) {
      // Auto-trigger fingerprint unlock if enabled and supported
      handleFingerprintUnlock();
    }
  }, [isLocked, currentUser?.fingerprintEnabled]);

  if (isLocked) {
    return (
      <div className={`${isDarkMode ? 'dark' : ''} fixed inset-0 flex flex-col items-center justify-center p-6 z-[100] bg-[#0B0F19] overflow-y-auto`}>
        {/* Ambient Glowing Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="w-full max-w-sm flex flex-col items-center relative z-10">
          
          {/* Avatar / GZ Badge */}
          <div className="w-24 h-24 mb-6 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <Gamepad2 className="w-12 h-12 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-2 tracking-wide">
            Game Zone Store
          </h2>
          <p className="text-slate-400 mb-10 text-center text-sm font-medium tracking-wide">
            التطبيق مقفل لحمايتك. أدخل رمز الحماية للمتابعة.
          </p>
          
          <motion.div 
            animate={lockErrorAnim ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[280px] mb-8 relative flex flex-col items-center gap-6" 
            dir="ltr"
          >
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              value={lockPinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setLockPinInput(val);
                if (val.length === 4) {
                  setTimeout(() => {
                    if (val === currentUser?.pin) {
                      setIsLocked(false);
                      setLockPinInput('');
                    } else {
                      setLockErrorAnim(true);
                      setTimeout(() => {
                        setLockErrorAnim(false);
                        setLockPinInput('');
                      }, 400);
                    }
                  }, 200);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-16 text-center text-4xl text-white tracking-[0.5em] focus:outline-none focus:border-blue-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all"
              placeholder="••••"
            />
            {currentUser?.fingerprintEnabled && (
              <button onClick={handleFingerprintUnlock} className="w-16 h-16 rounded-2xl bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400/50 transition-all active:scale-90">
                {isFingerprintChecking ? <Loader2 className="w-7 h-7 animate-spin" /> : <Fingerprint className="w-7 h-7 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
              </button>
            )}
          </motion.div>
          
          <button 
            onClick={handleLogout} 
            className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors flex items-center gap-2 mt-4 hover:bg-white/5 px-4 py-2 rounded-full"
          >
            تسجيل الخروج بدلاً من ذلك
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="${isDarkMode ? 'dark' : ''} flex flex-col h-[100dvh] overflow-hidden bg-gray-50 dark:bg-black font-sans transition-colors duration-300 relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-[200] relative">
            <PageLoader loadingText={loadingText} />
          </motion.div>
        )}
      </AnimatePresence>

            {/* Top Bar */}
      {!['login', 'register'].includes(currentView) && (
        <header className="sticky top-0 z-[60] shrink-0 bg-gradient-to-l from-[#08051F] via-[#120d3d] to-[#1e1366] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-b border-white/5">
          {currentView === 'admin' ? (
            <div className="w-full max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                   <Gamepad2 className="w-6 h-6 text-emerald-400" />
                   <div className="flex flex-col">
                     <h1 className="text-base font-black leading-tight tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                       <span className="text-white">Game</span>
                       <span className="text-gray-300 ml-1">Zone</span>
                     </h1>
                     <p className="text-[9px] text-gray-400 font-bold leading-none mt-0.5">لوحة التحكم</p>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setAdminView('settings')}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('isAdmin');
                    setCurrentView('login');
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogIn className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
              {/* Right Side: Hamburger, Bell, Balance */}
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => handleViewChange('notifications')}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                <div 
                  className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleViewChange('add_balance')}
                >
                  <PlusCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-bold text-green-500 dark:text-green-400 text-sm" dir="ltr">
                    {currentUser?.balance?.toFixed(2) || '0.00'} $
                  </span>
                </div>
              </div>

              {/* Left Side: Logo and Store Name */}
              <div className="flex items-center gap-2" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                <h1 className="text-lg font-black text-white leading-tight">Game Zone</h1>
                <div className="w-10 h-10 bg-gray-900 dark:bg-black rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                  <img src="/gamezone-logo.png" alt="Game Zone" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.style.setProperty('display', 'flex'); }} />
                  <div className="hidden w-full h-full items-center justify-center bg-blue-600">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      )}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative" id="main-scroll-container">
        <main className={`w-full min-h-full ${currentView === 'admin' ? 'max-w-[1600px]' : 'max-w-2xl'} mx-auto p-3 sm:p-4 md:p-6 ${hideBottomNav ? 'pb-4' : 'pb-24 sm:pb-32'}`}>
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" className="w-full h-full">
              
            </motion.div>
          )}

          {currentView === 'login' && (
            <motion.div key="login" className="w-full h-full">
              <LoginView loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} handleViewChange={handleViewChange} loginError={loginError} />
            </motion.div>
          )}

          {currentView === 'register' && (
            <motion.div key="register" className="w-full h-full">
              <RegisterView registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleViewChange={handleViewChange} registerError={registerError} />
            </motion.div>
          )}

          {currentView === 'payments' && (
            <motion.div key="payments" className="w-full h-full">
              <PaymentsView userBalanceRequests={userBalanceRequests} getOrderStatusDisplay={getOrderStatusDisplay} setSelectedBalanceRequest={setSelectedBalanceRequest} />
            </motion.div>
          )}

          {currentView === 'notifications' && (
            <motion.div key="notifications" className="w-full h-full">
              <NotificationsView notifications={notifications} setNotifications={setNotifications} showNotification={showNotification} setShowClearConfirmModal={() => {}} handleViewChange={handleViewChange} />
            </motion.div>
          )}

          {currentView === 'security' && (
            <motion.div key="security" className="w-full h-full">
              <SecurityView 
                currentUser={currentUser} 
                showNotification={showNotification} 
                updateUserAndStorage={updateUserAndStorage} 
                setPinSetupStep={(v: number) => setPinSetupStep(v as 1 | 2)}
                setPinInput={setPinInput}
                setTempPin={setTempPin}
                setShowPinSetupModal={setShowPinSetupModal}
                requestFingerprint={requestFingerprint as any}
              />
            </motion.div>
          )}

          {currentView === 'account' && (
            <motion.div key="account" className="w-full h-full">
              <AccountView currentUser={currentUser} updateUserAndStorage={updateUserAndStorage} showNotification={showNotification} />
            </motion.div>
          )}

          {currentView === 'wallet' && (
            <motion.div key="wallet" className="w-full h-full">
              
            </motion.div>
          )}

          {currentView === 'orders' && (
            <motion.div key="orders" className="w-full h-full">
              
            </motion.div>
          )}

          {currentView === 'add_balance' && (
            <motion.div key="add_balance" className="w-full h-full">
              
            </motion.div>
          )}

        {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full"
            >
              <AdminView 
                adminEmail={adminEmail} setAdminEmail={setAdminEmail} adminPassword={adminPassword} setAdminPassword={setAdminPassword}
                adminFabOpen={adminFabOpen} adminUserSearch={adminUserSearch} adminView={adminView} balanceRequests={balanceRequests} bannersConfig={bannersConfig} categories={categories} categoryAdminTab={categoryAdminTab} confirmModal={confirmModal} currentUser={currentUser} currentView={currentView} fabOptions={fabOptions} getOrderStatusDisplay={getOrderStatusDisplay} getSafeFakeUsers={getSafeFakeUsers} isAdmin={isAdmin} marqueeText={marqueeText} notification={notification} notificationForm={notificationForm} notifications={notifications} orderProcessingMode={orderProcessingMode} orders={orders} paymentMethods={paymentMethods} products={products} setAddPaymentMethodModal={setAddPaymentMethodModal} setNewPaymentMethodForm={setNewPaymentMethodForm} setAdminFabOpen={setAdminFabOpen} setAdminUserSearch={setAdminUserSearch} setAdminView={setAdminView} setBalanceAdminModal={setBalanceAdminModal} setBalanceRequests={setBalanceRequests} setBannersConfig={setBannersConfig} setCategories={setCategories} setCategoryAdminTab={setCategoryAdminTab} setConfirmModal={setConfirmModal} setConfirmOrderStatus={setConfirmOrderStatus} setCurrentUser={setCurrentUser} setEditCatId={setEditCatId} setEditProductId={setEditProductId} setEditSubCatId={setEditSubCatId} setFabOptions={setFabOptions} setIsLoading={setIsLoading} setMarqueeText={setMarqueeText} setNewCatImage={setNewCatImage} setNewCatName={setNewCatName} setNewProduct={setNewProduct} setNewSubCatImage={setNewSubCatImage} setNewSubCatMainId={setNewSubCatMainId} setNewSubCatName={setNewSubCatName} setNewSubCatType={setNewSubCatType} setNotificationForm={setNotificationForm} setNotifications={setNotifications} setOrderProcessingMode={setOrderProcessingMode} exchangeRate={exchangeRate} setExchangeRate={setExchangeRate} setOrders={setOrders} setPaymentMethods={setPaymentMethods} setProducts={setProducts} setRejectModal={setRejectModal} setShowAddCatModal={setShowAddCatModal} setShowAddProductModal={setShowAddProductModal} setShowAddSubCatModal={setShowAddSubCatModal} setSubCategories={setSubCategories} setSubSubCategories={setSubSubCategories} showNotification={showNotification} subCategories={subCategories} subSubCategories={subSubCategories}
              />
            </motion.div>
          )}
            
            {currentView !== 'home' && currentView !== 'orders' && currentView !== 'login' && currentView !== 'register' && currentView !== 'account' && currentView !== 'wallet' && currentView !== 'add_balance' && currentView !== 'payments' && currentView !== 'notifications' && currentView !== 'security' && currentView !== 'admin' && (
               <div className="mt-8 flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800">
                 <p className="text-gray-700 dark:text-gray-300 text-center font-medium">هذه الصفحة قيد التطوير ({currentView})</p>
               </div>
            )}
        </AnimatePresence>
        
      
      {/* Add/Edit Payment Method Modal */}
      {addPaymentMethodModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in flex flex-col max-h-full">
             <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
               <h3 className="text-xl font-bold text-white">
                 {newPaymentMethodForm.id ? 'تعديل طريقة دفع' : 'إضافة طريقة دفع جديدة'}
               </h3>
               <button onClick={() => setAddPaymentMethodModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                 <X className="w-5 h-5 text-gray-500" />
               </button>
             </div>
             
             <div className="p-6 overflow-y-auto flex flex-col gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم الطريقة <span className="text-rose-500">*</span></label>
                   <input 
                     type="text" 
                     value={newPaymentMethodForm.name}
                     onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, name: e.target.value})}
                     className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="مثال: حوالة بنكية، زين كاش..."
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">معلومات الدفع (الرقم أو الحساب) <span className="text-rose-500">*</span></label>
                   <input 
                     type="text" 
                     value={newPaymentMethodForm.info}
                     onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, info: e.target.value})}
                     className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-left"
                     placeholder="مثال: 07800000000"
                     dir="ltr"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رابط الدفع (اختياري)</label>
                   <input 
                     type="text" 
                     value={newPaymentMethodForm.link || ''}
                     onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, link: e.target.value})}
                     className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="رابط توجيه..."
                     dir="ltr"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ملاحظة أسفل الطريقة (اختياري)</label>
                   <input 
                     type="text" 
                     value={newPaymentMethodForm.note || ''}
                     onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, note: e.target.value})}
                     className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="مثال: يرجى كتابة رقم العملية بشكل صحيح"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الحد الأدنى (اختياري)</label>
                   <input 
                     type="text" 
                     value={newPaymentMethodForm.minDeposit || ''}
                     onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, minDeposit: e.target.value})}
                     className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="مثال: 5 $"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">صورة/أيقونة الطريقة (اختياري)</label>
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={newPaymentMethodForm.image || ''}
                       onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, image: e.target.value})}
                       className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="رابط الأيقونة..."
                       dir="ltr"
                     />
                     <label className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                       <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                       <input 
                         type="file" 
                         accept="image/*"
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target?.files?.[0];
                           if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                               setNewPaymentMethodForm({...newPaymentMethodForm, image: reader.result as string});
                             };
                             reader.readAsDataURL(file);
                           }
                         }}
                       />
                     </label>
                   </div>
                   {newPaymentMethodForm.image && <img src={newPaymentMethodForm.image} className="mt-2 w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-white" />}
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">باركود (QR Code) الدفع (اختياري)</label>
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={newPaymentMethodForm.qrCode || ''}
                       onChange={(e) => setNewPaymentMethodForm({...newPaymentMethodForm, qrCode: e.target.value})}
                       className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="رابط الباركود..."
                       dir="ltr"
                     />
                     <label className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                       <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                       <input 
                         type="file" 
                         accept="image/*"
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target?.files?.[0];
                           if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                               setNewPaymentMethodForm({...newPaymentMethodForm, qrCode: reader.result as string});
                             };
                             reader.readAsDataURL(file);
                           }
                         }}
                       />
                     </label>
                   </div>
                   {newPaymentMethodForm.qrCode && <img src={newPaymentMethodForm.qrCode} className="mt-2 w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-white" />}
                </div>
             </div>
             
             <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0">
               <button 
                 onClick={async () => {
                   if (!newPaymentMethodForm.name || !newPaymentMethodForm.info) {
                     showNotification('error', 'يرجى إدخال اسم الطريقة ومعلومات الدفع');
                     return;
                   }
                   
                   let minDepositVal = undefined;
                   if (newPaymentMethodForm.minDeposit) {
                     minDepositVal = parseFloat(String(newPaymentMethodForm.minDeposit).replace(/[^0-9.]/g, ''));
                   }

                   const methodToSave = { ...newPaymentMethodForm };
                   if (minDepositVal !== undefined && !isNaN(minDepositVal)) {
                     methodToSave.minDeposit = minDepositVal;
                   } else {
                     delete methodToSave.minDeposit;
                   }

                   try {
                     const api = await Promise.resolve(apiModule);
                     const savedMethod = await api.savePaymentMethodDB(methodToSave);
                     const finalMethod = { ...savedMethod, id: savedMethod._id || savedMethod.id };
                     
                     const updatedMethods = newPaymentMethodForm.id 
                       ? paymentMethods.map(m => m.id === newPaymentMethodForm.id ? finalMethod : m)
                       : [...paymentMethods, finalMethod];
                       
                     setPaymentMethods(updatedMethods);
                     localforage.setItem('payment_methods', updatedMethods);
                     
                     setAddPaymentMethodModal(false);
                     showNotification('success', 'تم حفظ طريقة الدفع بنجاح');
                   } catch (e) {
                     showNotification('error', 'حدث خطأ أثناء حفظ طريقة الدفع');
                   }
                 }}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
               >
                 حفظ التغييرات
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Confirm Order Status Modal */}
      {confirmOrderStatus && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <h3 className="text-xl font-bold mb-4 text-white">
              تغيير حالة الطلب
            </h3>
            
            <div className="space-y-4 mb-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الحالة الجديدة</label>
                  <select 
                    value={confirmOrderStatus.status || 'processing'}
                    onChange={(e) => setConfirmOrderStatus({ ...confirmOrderStatus, status: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="processing">قيد المعالجة</option>
                    <option value="accepted">مقبول ومكتمل</option>
                    <option value="rejected">مرفوض</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ملاحظة (اختياري)</label>
                  <textarea 
                    value={confirmOrderStatus.note || ''}
                    onChange={(e) => setConfirmOrderStatus({ ...confirmOrderStatus, note: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                    placeholder="سبب الرفض أو رسالة إضافية للمستخدم..."
                  />
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={async () => {
                   const { orderId, status } = confirmOrderStatus;
                   setConfirmOrderStatus(null);
                   setLoadingText('جاري تحديث حالة الطلب...');
                   setIsLoading(true);
                   try {
                       await fetch(`/api/orders/${orderId}`, {
                           method: 'PUT',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ status, adminNote: confirmOrderStatus.note || 'تم تغيير حالة الطلب' })
                       });
                       
                       setOrders(prev => {
                           const newOrders = prev.map(o => o.id === orderId ? { ...o, status, adminNote: confirmOrderStatus.note || o.adminNote } : o);
                           localforage.setItem('orders', newOrders);
                           return newOrders;
                       });
                       showNotification('success', 'تم تحديث حالة الطلب بنجاح');
                   } catch (e) {
                       showNotification('error', 'حدث خطأ أثناء التحديث');
                   } finally {
                       setIsLoading(false);
                   }
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${confirmOrderStatus.status === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                تأكيد
              </button>
              <button 
                onClick={() => setConfirmOrderStatus(null)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer hidden */}
      </main>
      </div>

      
      {/* Admin Sidebar Overlay */}
      <AnimatePresence>
        {isAdminSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAdminSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar Content */}
      <AnimatePresence>
        {isAdminSidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-[70vw] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl z-[80] flex flex-col overflow-hidden border-l border-gray-100 dark:border-gray-800"
            dir="rtl"
          >
            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col gap-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 overflow-hidden">
                    {currentUser?.image ? (
                      <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-white truncate max-w-[120px]">{currentUser?.name || 'مدير النظام'}</h2>
                    <p className="text-gray-400 text-xs truncate max-w-[120px]">{currentUser?.email || 'admin@admin.com'}</p>
                  </div>
                </div>
                <button onClick={() => setIsAdminSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white self-start">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-2 bg-white/5 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/10 shadow-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Wallet className="w-5 h-5 opacity-90" />
                  <span className="font-bold text-sm">الرصيد</span>
                </div>
                <div className="text-white font-black text-lg tracking-wide">
                  {currentUser?.balance?.toFixed(2) || '0.00'} $
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              {[
                { id: 'dashboard', name: 'الرئيسية', icon: <LayoutDashboard className="w-5 h-5" /> },
                { id: 'categories', name: 'إدارة الأقسام', icon: <Layers className="w-5 h-5" /> },
                { id: 'payments', name: 'إدارة الدفعات', icon: <Wallet className="w-5 h-5" /> },
                { id: 'users', name: 'إدارة المستخدمين', icon: <Users className="w-5 h-5" /> },
                { id: 'api_providers', name: 'ربط API', icon: <LinkIcon className="w-5 h-5" /> },
                { id: 'providers', name: 'مزودي الخدمات', icon: <Server className="w-5 h-5" /> },
                { id: 'orders', name: 'الطلبات', icon: <ShoppingBag className="w-5 h-5" /> },
                { id: 'banners', name: 'إدارة البانرات', icon: <ImageIcon className="w-5 h-5" /> },
                { id: 'notifications', name: 'إرسال إشعار', icon: <Bell className="w-5 h-5" /> },
                { id: 'settings', name: 'إعدادات المنصة', icon: <Settings className="w-5 h-5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminView(item.id as any);
                    setIsAdminSidebarOpen(false);
                  }}
                  className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full overflow-hidden ${
                    adminView === item.id 
                      ? 'bg-blue-50/80 dark:bg-blue-500/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {adminView === item.id && (
                    <motion.div 
                      layoutId="sidebar-admin-active"
                      className="absolute right-0 top-1/4 bottom-1/4 w-[3px] bg-blue-600 dark:bg-blue-400 rounded-l-full"
                    />
                  )}
                  
                  <div className={`flex items-center justify-center transition-colors duration-300 ${
                    adminView === item.id 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                  </div>
                  
                  <span className={`text-[15px] transition-colors duration-300 ${
                    adminView === item.id 
                      ? 'font-bold text-blue-700 dark:text-blue-300' 
                      : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                  }`}>
                    {item.name}
                  </span>
                </button>
              ))}
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 mt-2"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-bold">{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
              </button>
            </div>
            
            <div className="mt-auto flex items-center justify-between pt-2 pb-6 px-4 opacity-80">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">برمجة ضياء الحوامده</span>
                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 tracking-wider">Alazeaz Tech</span>
              </div>
              <button
                onClick={() => window.open('https://wa.me/0984319579', '_blank')}
                className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                title="تواصل معنا عبر واتساب"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsAdminSidebarOpen(false);
                  setTimeout(() => {
                    localStorage.removeItem('isAdmin');
                    setCurrentView('login');
                  }, 200);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-bold"
              >
                <LogIn className="w-5 h-5 rotate-180" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
          />
        )}
      </AnimatePresence>

      {/* App Sidebar Content */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-[70vw] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl z-[80] flex flex-col overflow-hidden border-l border-gray-100 dark:border-gray-800"
            dir="rtl"
          >
            <div className="p-4 sm:p-6 bg-gray-50 dark:bg-black border-b border-gray-100 dark:border-gray-800">
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-5 shadow-[0_0_25px_rgba(79,70,229,0.5)] flex flex-col gap-4 overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -ml-8 -mb-8"></div>
                 <div className="relative z-10 flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 overflow-hidden shrink-0 shadow-lg rotate-3 transition-transform hover:rotate-0">
                        {currentUser?.image ? (
                          <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 opacity-80" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white drop-shadow-md tracking-wide">{currentUser?.name || 'مرحباً بك'}</h2>
                        <p className="text-blue-100/90 text-sm font-medium truncate max-w-[140px] drop-shadow-sm" dir="ltr">{currentUser?.email || 'يرجى تسجيل الدخول'}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white self-start backdrop-blur-sm shadow-sm border border-white/10">
                      <X className="w-5 h-5" />
                    </button>
                 </div>
                 
                 {isAuthenticated && currentUser && (
                   <div className="relative z-10 mt-1 bg-black/20 backdrop-blur-md rounded-xl p-3 flex items-center justify-between border border-white/20 shadow-inner">
                     <div className="flex items-center gap-2 text-blue-50">
                       <Wallet className="w-5 h-5 opacity-90" />
                       <span className="font-bold text-sm">الرصيد المتاح</span>
                     </div>
                     <div className="text-white font-black text-lg tracking-wide drop-shadow-md" dir="ltr">
                       {currentUser.balance?.toFixed(2) || '0.00'} $
                     </div>
                   </div>
                 )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              {[
                { id: 'home', name: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
                { id: 'account', name: 'حسابي', icon: <User className="w-5 h-5" /> },
                { id: 'orders', name: 'الطلبات', icon: <ShoppingBag className="w-5 h-5" /> },
                { id: 'wallet', name: 'المحفظة', icon: <Wallet className="w-5 h-5" /> },
                { id: 'add_balance', name: 'شحن رصيد', icon: <PlusCircle className="w-5 h-5" /> },
                { id: 'payments', name: 'دفعاتي', icon: <CreditCard className="w-5 h-5" /> },
                { id: 'notifications', name: 'الإشعارات', icon: <Bell className="w-5 h-5" /> },
                { id: 'security', name: 'الحماية', icon: <Shield className="w-5 h-5" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id as any)}
                  className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full overflow-hidden ${
                    currentView === item.id 
                      ? 'bg-blue-50/80 dark:bg-blue-500/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {currentView === item.id && (
                    <motion.div 
                      layoutId="sidebar-mobile-active"
                      className="absolute right-0 top-1/4 bottom-1/4 w-[3px] bg-blue-600 dark:bg-blue-400 rounded-l-full"
                    />
                  )}
                  
                  <div className={`flex items-center justify-center transition-colors duration-300 ${
                    currentView === item.id 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}>
                    <div className="transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                  </div>
                  
                  <span className={`text-[15px] transition-colors duration-300 ${
                    currentView === item.id 
                      ? 'font-bold text-blue-700 dark:text-blue-300' 
                      : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                  }`}>
                    {item.name}
                  </span>
                </button>
              ))}
              
              {isAdmin && (
                <button
                  onClick={() => handleViewChange('admin')}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 mt-2 border border-red-100 dark:border-red-900/30"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-bold">لوحة الإدارة</span>
                </button>
              )}
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 mt-2"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-bold">{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
              </button>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  setTimeout(() => {
                    localStorage.removeItem('isAdmin');
                    setCurrentView('login');
                  }, 200);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-bold"
              >
                <LogIn className="w-5 h-5 rotate-180" />
                <span>تسجيل الخروج</span>
              </button>
              
              <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/60 w-full">
                <a 
                  href="https://wa.me/0984319579" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 transition-colors py-2"
                >
                  <span className="text-yellow-400 text-xl font-black leading-none pt-0.5">»</span>
                  <span className="font-bold text-sm tracking-wide">برمجة ضياء الحوامده</span>
                  <span className="text-yellow-400 text-xl font-black leading-none pt-0.5">«</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Popup Notification */}
      <AnimatePresence>
        {activePopupNotification && currentView === 'home' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex justify-center items-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border-4 border-blue-100 dark:border-blue-800">
                  <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{activePopupNotification.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 whitespace-pre-wrap leading-relaxed">{activePopupNotification.message}</p>
                <button 
                  onClick={() => {
                     const globalNotifs = JSON.parse(localStorage.getItem('global_notifications') || '[]');
                     // Do not mark it read on server, just locally ignore it for 24 hours
                     const ignoredNotifsStr = localStorage.getItem('ignored_popups') || '{}';
                     let ignoredNotifs = {};
                     try { ignoredNotifs = JSON.parse(ignoredNotifsStr); } catch(e){}
                     ignoredNotifs[activePopupNotification.id] = Date.now() + (24 * 60 * 60 * 1000); // Hide for 24 hours
                     localStorage.setItem('ignored_popups', JSON.stringify(ignoredNotifs));
                     const updated = globalNotifs; // Keep it unchanged in DB to show again tomorrow
                     localStorage.setItem('global_notifications', JSON.stringify(updated));
                     setActivePopupNotification(null);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-500/30"
                >
                  فهمت ذلك
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav 
        hideBottomNav={hideBottomNav}
        currentView={currentView}
        handleViewChange={handleViewChange}
        getBottomNavColor={getBottomNavColor}
      />

      {/* Admin Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center pointer-events-auto p-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{confirmModal.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm leading-relaxed whitespace-pre-wrap">{confirmModal.message}</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmModal({...confirmModal, isOpen: false})} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={confirmModal.action} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-colors"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center pointer-events-auto p-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">تأكيد الرفض</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">الرجاء كتابة سبب رفض هذه الدفعة ليتمكن العميل من معرفته.</p>
              <textarea 
                placeholder="سبب الرفض (اختياري)" 
                className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl max-h-32 min-h-24 p-3 mb-6 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors"
                value={rejectModal.note || ""}
                onChange={(e) => setRejectModal({...rejectModal, note: e.target.value})}
              ></textarea>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setRejectModal({...rejectModal, isOpen: false})} 
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    try {
                        const newReqs = [...balanceRequests];
                        newReqs[rejectModal.idx].status = 'rejected';
                        newReqs[rejectModal.idx].note = rejectModal.note;
                        setBalanceRequests(newReqs);
                        localforage.setItem('balanceRequests', newReqs);
                        showNotification('success', 'تم رفض الدفعة بنجاح');
                        setRejectModal({isOpen: false, idx: 0, note: ''});
                    } catch {}
                  }} 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-colors"
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Balance Modal */}
      {balanceAdminModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center pointer-events-auto p-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className={`absolute top-0 right-0 w-full h-1 bg-gradient-to-r ${balanceAdminModal.type === 'add' ? 'from-emerald-500 to-green-500' : 'from-orange-500 to-red-500'}`}></div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xl font-bold text-white">تعديل رصيد {balanceAdminModal.userName || 'العميل'}</h3>
              <button onClick={() => setBalanceAdminModal({...balanceAdminModal, isOpen: false})} className="text-gray-300 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button 
                  onClick={() => setBalanceAdminModal({...balanceAdminModal, type: 'add'})} 
                  className={`flex-1 py-2 text-sm max-sm:text-xs font-bold rounded-lg transition-all ${balanceAdminModal.type === 'add' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-700 hover:text-gray-700 dark:text-gray-300'}`}
                >
                  إضافة رصيد
                </button>
                <button 
                  onClick={() => setBalanceAdminModal({...balanceAdminModal, type: 'withdraw'})} 
                  className={`flex-1 py-2 text-sm max-sm:text-xs font-bold rounded-lg transition-all ${balanceAdminModal.type === 'withdraw' ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-700 hover:text-gray-700 dark:text-gray-300'}`}
                >
                  سحب رصيد
                </button>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">المبلغ ({currencySymbol})</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                     <Wallet className="h-5 w-5 text-gray-300" />
                   </div>
                   <input
                     type="number"
                     placeholder="0.00"
                     value={balanceAdminModal.amount || ""}
                     onChange={(e) => setBalanceAdminModal({...balanceAdminModal, amount: e.target.value})}
                     className="block w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left font-sans transition-all text-white"
                     dir="ltr"
                   />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ملاحظة (اختياري)</label>
                 <input
                   type="text"
                   placeholder="سبب التعديل..."
                   value={balanceAdminModal.note || ""}
                   onChange={(e) => setBalanceAdminModal({...balanceAdminModal, note: e.target.value})}
                   className="block w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
                 />
              </div>

              <button 
                onClick={() => {
                  const amt = Number(balanceAdminModal.amount);
                  if (!amt || isNaN(amt) || amt <= 0) {
                    showNotification('error', 'الرجاء إدخال مبلغ صحيح');
                    return;
                  }
                  
                  const users = getSafeFakeUsers();
                  const index = users.findIndex((u: any) => u.email === balanceAdminModal.userEmail);
                  if (index > -1) {
                    const change = balanceAdminModal.type === 'add' ? amt : -amt;
                    users[index].balance = (users[index].balance || 0) + change;
                    localStorage.setItem('fake_users', JSON.stringify(users));
                    
                    // Also update in DB
                    if (users[index].id) {
                       Promise.resolve(apiModule).then(api => {
                          api.updateUser(users[index].id, { balance: users[index].balance }).catch(() => {});
                       });
                    }

                    showNotification('success', `تم ${balanceAdminModal.type === 'add' ? 'إضافة' : 'سحب'} الرصيد بنجاح`);
                    setBalanceAdminModal({...balanceAdminModal, isOpen: false});
                    setAdminView('dashboard'); setTimeout(() => setAdminView('users'), 0);
                  }
                }}
                className={`w-full py-3 mt-2 rounded-xl text-white font-bold transition-transform active:scale-95 shadow-lg ${balanceAdminModal.type === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30'}`}
              >
                تأكيد العملية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Selection Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center pointer-events-auto">
          <div className="bg-white dark:bg-gray-900 w-full sm:w-[400px] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white">اختر الحزمة</h3>
              <button onClick={() => setIsPackageModalOpen(false)} className="text-gray-700 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {productPackages.map((pkg, index) => (
                <div 
                  key={pkg.id + '-' + index}
                  onClick={() => {
                    setOrderForm({...orderForm, packageId: pkg.id});
                    setIsPackageModalOpen(false);
                  }}
                  className={`border-2 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all active:scale-[0.98] ${orderForm.packageId === pkg.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700/50'}`}
                >
                  <div className="flex flex-col">
                    <span className={`font-bold ${orderForm.packageId === pkg.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-500'}`}>{pkg.name}</span>
                  </div>
                  <span className={`font-black tracking-wider ${orderForm.packageId === pkg.id ? 'text-emerald-600 dark:text-emerald-300' : 'text-emerald-600 dark:text-emerald-500'}`} dir="ltr">{pkg.price}.00 {currencySymbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Categories Modals */}
      {showAddCatModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center pointer-events-auto p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500"/> {editCatId ? 'تعديل قسم رئيسي' : 'إضافة قسم رئيسي'}</h3>
              <button onClick={() => {setShowAddCatModal(false); setNewCatName(''); setNewCatImage(null); setEditCatId(null);}} className="text-gray-700 hover:text-gray-700 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم القسم الرئيسي</label>
                <input type="text" value={newCatName || ""} onChange={e => setNewCatName(e.target.value)} placeholder="مثال: الألعاب" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">صورة القسم (اختياري)</label>
                {newCatImage ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={newCatImage} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => setNewCatImage(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <X className="w-8 h-8 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">اختر صورة من المعرض</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file){
                        const reader = new FileReader();
                        reader.onloadend = () => setNewCatImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>

              <button 
                onClick={() => {
                  if(!newCatName.trim()){ showNotification('error', 'يرجى إدخال اسم القسم'); return; }
                  
                  if (editCatId !== null) {
                     const newCats = categories.map(c => c.id === editCatId ? { ...c, name: newCatName.trim(), image: newCatImage || undefined } : c);
                     setCategories(newCats);
                     localforage.setItem('categories', newCats.map(c => ({...c, icon: undefined})));
                     Promise.resolve(apiModule).then(api => api.saveCategoriesDB(newCats).catch(()=>{})).catch(()=>{});
                     showNotification('success', 'تم تعديل القسم بنجاح');
                  } else {
                     const newId = Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
                     const newCat = { id: newId, name: newCatName.trim(), image: newCatImage || undefined, iconName: 'Layers', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' };
                     const newCats = [...categories, newCat];
                     setCategories(newCats);
                     localforage.setItem('categories', newCats.map(c => ({...c, icon: undefined})));
                     Promise.resolve(apiModule).then(api => api.saveCategoriesDB(newCats).catch(()=>{})).catch(()=>{});
                     showNotification('success', 'تم إضافة القسم بنجاح');
                     setTimeout(() => window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DATA')), 500);
                  }
                  
                  setShowAddCatModal(false);
                  setNewCatName('');
                  setNewCatImage(null);
                  setEditCatId(null);
                }}
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all active:scale-95"
              >
                {editCatId ? 'حفظ التعديلات' : 'حفظ وإضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSubCatModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center pointer-events-auto p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-blue-500"/> {newSubCatType === 'sub' ? 'إضافة قسم فرعي' : 'إضافة قسم فرع فرعي'}</h3>
              <button onClick={() => {setShowAddSubCatModal(false); setNewSubCatName(''); setNewSubCatImage(null); setNewSubCatMainId(null);}} className="text-gray-700 hover:text-gray-700 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 mb-2">
                <button 
                  onClick={() => setNewSubCatType('sub')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newSubCatType === 'sub' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                >
                  قسم فرعي
                </button>
                <button 
                  onClick={() => setNewSubCatType('subsub')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newSubCatType === 'subsub' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                >
                  فرع فرعي (اختياري)
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {newSubCatType === 'sub' ? 'القسم الرئيسي' : 'القسم الفرعي الأب'}
                </label>
                <select value={newSubCatMainId || ''} onChange={(e) => setNewSubCatMainId(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="rtl">
                  <option value="" disabled>اختر القسم...</option>
                  {newSubCatType === 'sub' ? (
                    categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  ) : (
                    categories.map(cat => (
                      <optgroup key={cat.id} label={`--- ${cat.name} ---`}>
                        {(subCategories[cat.id] || []).map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </optgroup>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الاسم</label>
                <input type="text" value={newSubCatName || ""} onChange={e => setNewSubCatName(e.target.value)} placeholder="الاسم..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">صورة القسم الفرعي (اختياري)</label>
                {newSubCatImage ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={newSubCatImage} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={() => setNewSubCatImage(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <X className="w-8 h-8 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full aspect-video border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">اختر صورة من المعرض</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if(file){
                        const reader = new FileReader();
                        reader.onloadend = () => setNewSubCatImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                )}
              </div>

              <button 
                onClick={() => {
                  if(!newSubCatMainId) { showNotification('error', 'يرجى اختيار القسم'); return; }
                  if(!newSubCatName.trim()){ showNotification('error', 'يرجى إدخال الاسم'); return; }
                  
                  const mainId = String(newSubCatMainId);
                  
                  if (editSubCatId !== null) {
                    if (newSubCatType === 'sub') {
                      let found = false;
                      let oldMainId = '';
                      for (const mId in subCategories) {
                         if (subCategories[mId].find(s => s.id === editSubCatId)) {
                            oldMainId = mId;
                            found = true;
                            break;
                         }
                      }
                      let newSubsParams: Record<string, any[]> = { ...subCategories };
                      const editedSub = { id: editSubCatId, name: newSubCatName.trim(), image: newSubCatImage || undefined };
                      if (oldMainId && oldMainId !== mainId) {
                         newSubsParams[oldMainId as any] = newSubsParams[oldMainId as any].filter(s => s.id !== editSubCatId);
                         newSubsParams[mainId as any] = [...(newSubsParams[mainId as any] || []), editedSub];
                      } else {
                         newSubsParams[mainId as any] = (newSubsParams[mainId as any] || []).map(s => s.id === editSubCatId ? editedSub : s);
                      }
                      setSubCategories(newSubsParams);
                      localforage.setItem('subCategories', newSubsParams);
                      Promise.resolve(apiModule).then(api => api.saveSubcategoriesDB(newSubsParams)).catch(()=>{});
                    } else {
                      let found = false;
                      let oldMainId = '';
                      for (const mId in subSubCategories) {
                         if (subSubCategories[mId].find(s => s.id === editSubCatId)) {
                            oldMainId = mId;
                            found = true;
                            break;
                         }
                      }
                      let newSubsParams: Record<string, any[]> = { ...subSubCategories };
                      const editedSub = { id: editSubCatId, name: newSubCatName.trim(), image: newSubCatImage || undefined };
                      if (oldMainId && oldMainId !== mainId) {
                         newSubsParams[oldMainId as any] = newSubsParams[oldMainId as any].filter(s => s.id !== editSubCatId);
                         newSubsParams[mainId as any] = [...(newSubsParams[mainId as any] || []), editedSub];
                      } else {
                         newSubsParams[mainId as any] = (newSubsParams[mainId as any] || []).map(s => s.id === editSubCatId ? editedSub : s);
                      }
                      setSubSubCategories(newSubsParams);
                      localforage.setItem('subSubCategories', newSubsParams);
                      Promise.resolve(apiModule).then(api => api.saveSubSubcategoriesDB(newSubsParams)).catch(()=>{});
                    }
                    showNotification('success', 'تم تعديل القسم بنجاح');
                  } else {
                    const newId = Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
                    const newSub = { id: newId, name: newSubCatName.trim(), image: newSubCatImage || undefined };
                    
                    if (newSubCatType === 'sub') {
                      const newSubsParams: any = { ...subCategories, [mainId as any]: [...(subCategories[mainId as any] || []), newSub] };
                      setSubCategories(newSubsParams);
                      localforage.setItem('subCategories', newSubsParams);
                      Promise.resolve(apiModule).then(api => api.saveSubcategoriesDB(newSubsParams)).catch(()=>{});
                    } else {
                      const newSubsParams: any = { ...subSubCategories, [mainId as any]: [...(subSubCategories[mainId as any] || []), newSub] };
                      setSubSubCategories(newSubsParams);
                      localforage.setItem('subSubCategories', newSubsParams);
                      Promise.resolve(apiModule).then(api => api.saveSubSubcategoriesDB(newSubsParams)).catch(()=>{});
                    }
                    showNotification('success', 'تم الإضافة بنجاح');
                  }
                  
                  setShowAddSubCatModal(false);
                  setNewSubCatName('');
                  setNewSubCatImage(null);
                  setNewSubCatMainId(null);
                  setEditSubCatId(null);
                }}
                className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95"
              >
                {editSubCatId ? 'حفظ التعديلات' : 'حفظ وإضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddProductModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center pointer-events-auto p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up my-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-green-500"/> {editProductId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button onClick={() => {setShowAddProductModal(false); setEditProductId(null); setNewProduct({ subCatId: '', name: '', desc: '', storeType: 'normal', priceUSD: '', priceSYP: '', requiredInput: 'id', minQty: '', maxQty: '', unitPriceUSD: '', unitPriceSYP: '', apiProviderId: '', providerProductId: '' });}} className="text-gray-700 hover:text-gray-700 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">القسم</label>
                <select value={newProduct.subCatId} onChange={e => setNewProduct({...newProduct, subCatId: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="rtl">
                  <option value="" disabled>اختر القسم...</option>
                  {categories.map(cat => (
                    <optgroup key={cat.id} label={`[ ${cat.name} ]`}>
                      <option value={cat.id}>-- {cat.name} (رئيسي) --</option>
                      {(subCategories[cat.id] || []).map(sub => (
                        <React.Fragment key={`sub_${sub.id}`}>
                           <option value={sub.id}>- {sub.name}</option>
                           {(subSubCategories[sub.id] || []).map(ssub => (
                             <option key={`ssub_${ssub.id}`} value={ssub.id}>&nbsp;&nbsp;&nbsp;-- {ssub.name}</option>
                           ))}
                        </React.Fragment>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم المنتج</label>
                <input type="text" value={newProduct.name || ""} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="مثال: شدات ببجي" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">وصف المنتج</label>
                <textarea value={newProduct.desc || ""} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} placeholder="وصف المنتج..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white min-h-[80px]" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع المتجر</label>
                <select value={newProduct.storeType} onChange={e => {
                  const val = e.target.value;
                  setNewProduct(prev => ({
                    ...prev, 
                    storeType: val, 
                    requiredInput: val === 'quantities' ? 'id' : 'id' // reset
                  }));
                }} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="rtl">
                  <option value="normal">متجر عادي</option>
                  <option value="quantities">متجر كميات</option>
                </select>
              </div>

              {newProduct.storeType === 'normal' ? (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">سعر المنتج ($)</label>
                      <input type="number" value={newProduct.priceUSD || ""} onChange={e => setNewProduct({...newProduct, priceUSD: e.target.value})} placeholder="0.00" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">سعر المنتج (ل.س)</label>
                      <input type="number" value={newProduct.priceSYP || ""} onChange={e => setNewProduct({...newProduct, priceSYP: e.target.value})} placeholder="0.00" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">حقل الإدخال المطلوب</label>
                    <select value={newProduct.requiredInput} onChange={e => setNewProduct({...newProduct, requiredInput: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="rtl">
                      <option value="id">الآيدي (ID)</option>
                      <option value="phone">رقم الهاتف</option>
                      <option value="wallet">رابط المحفظة</option>
                      <option value="email_password">الإيميل وكلمة السر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ربط مع API (اختياري)</label>
                    <div className="flex gap-2">
                        <input type="text" value={newProduct.apiProviderId || ''} onChange={e => setNewProduct({...newProduct, apiProviderId: e.target.value})} placeholder="معرف مزود الـ API" className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="ltr" />
                        <input type="text" value={newProduct.providerProductId || ''} onChange={e => setNewProduct({...newProduct, providerProductId: e.target.value})} placeholder="رقم/معرف المنتج لدى المزود" className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="ltr" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">أدخل معرف مزود الـ API ومعرف المنتج لديهم لتفعيل الشحن التلقائي.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">أقل كمية</label>
                      <input type="number" value={newProduct.minQty || ""} onChange={e => setNewProduct({...newProduct, minQty: e.target.value})} placeholder="مثال: 50" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">أكثر كمية</label>
                      <input type="number" value={newProduct.maxQty || ""} onChange={e => setNewProduct({...newProduct, maxQty: e.target.value})} placeholder="مثال: 1000" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">سعر الواحدة ($)</label>
                      <input type="number" value={newProduct.unitPriceUSD || ""} onChange={e => setNewProduct({...newProduct, unitPriceUSD: e.target.value})} placeholder="0.00" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">سعر الواحدة (ل.س)</label>
                      <input type="number" value={newProduct.unitPriceSYP || ""} onChange={e => setNewProduct({...newProduct, unitPriceSYP: e.target.value})} placeholder="0.00" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">حقل الإدخال المطلوب</label>
                    <select value={newProduct.requiredInput} onChange={e => setNewProduct({...newProduct, requiredInput: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white" dir="rtl">
                      <option value="id">الآيدي (ID)</option>
                    </select>
                  </div>
                </>
              )}

              <button 
                onClick={() => {
                  if(!newProduct.subCatId) return showNotification('error', 'يرجى اختيار القسم الفرعي');
                  if(!newProduct.name.trim()) return showNotification('error', 'يرجى إدخال اسم المنتج');
                  if(!newProduct.desc.trim()) return showNotification('error', 'يرجى إدخال وصف المنتج');
                  
                  if(newProduct.storeType === 'normal') {
                     if(!newProduct.priceUSD && !newProduct.priceSYP) return showNotification('error', 'يرجى تحديد السعر');
                  } else {
                     if(!newProduct.minQty || !newProduct.maxQty || (!newProduct.unitPriceUSD && !newProduct.unitPriceSYP)) return showNotification('error', 'يرجى تعبئة جميع حقول الكميات والأسعار');
                  }

                  let storeObj = { ...products };
                  let newProdItem;
                  let oldSubCatId = '';

                  if (editProductId !== null) {
                    for (const sId in storeObj) {
                       if (storeObj[sId].find((p: any) => p.id === editProductId)) {
                          oldSubCatId = sId;
                          break;
                       }
                    }
                    newProdItem = { id: editProductId, ...newProduct };
                    if (oldSubCatId && oldSubCatId !== newProduct.subCatId) {
                       storeObj[oldSubCatId] = storeObj[oldSubCatId].filter((p: any) => p.id !== editProductId);
                       storeObj[newProduct.subCatId] = [...(storeObj[newProduct.subCatId] || []), newProdItem];
                    } else {
                       storeObj[newProduct.subCatId] = (storeObj[newProduct.subCatId] || []).map((p: any) => p.id === editProductId ? newProdItem : p);
                    }
                    showNotification('success', 'تم تعديل المنتج بنجاح');
                  } else {
                    newProdItem = { id: Date.now(), ...newProduct };
                    if(!storeObj[newProduct.subCatId]) storeObj[newProduct.subCatId] = [];
                    storeObj[newProduct.subCatId].push(newProdItem);
                    showNotification('success', 'تم إضافة المنتج بنجاح');
                     setTimeout(() => window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DATA')), 500);
                  }
                  
                  setProducts(storeObj);
                  localforage.setItem('products', storeObj);
                  
                  Promise.resolve(apiModule).then(api => api.saveProductDB({
                      id: newProdItem.id,
                      name: newProdItem.name,
                      category_id: newProdItem.subCatId,
                      category: newProdItem.subCatId, 
                      description: JSON.stringify({
                          desc: newProdItem.desc,
                          priceUSD: newProdItem.priceUSD,
                          priceSYP: newProdItem.priceSYP,
                          unitPriceUSD: newProdItem.unitPriceUSD,
                          unitPriceSYP: newProdItem.unitPriceSYP
                      }),
                      price: newProdItem.priceUSD ? parseFloat(newProdItem.priceUSD) : (newProdItem.priceSYP ? parseFloat(newProdItem.priceSYP) : 0),
                      storeType: newProdItem.storeType,
                      requiredInput: newProdItem.requiredInput,
                      minQty: newProdItem.minQty ? parseInt(newProdItem.minQty) : 0,
                      maxQty: newProdItem.maxQty ? parseInt(newProdItem.maxQty) : 0,
                      unitPrice: newProdItem.unitPriceUSD ? parseFloat(newProdItem.unitPriceUSD) : (newProdItem.unitPriceSYP ? parseFloat(newProdItem.unitPriceSYP) : 0),
                      apiProviderId: newProdItem.apiProviderId,
                      providerProductId: newProdItem.providerProductId
                  })).catch(err => {});
                  setShowAddProductModal(false);
                  setEditProductId(null);
                  setNewProduct({ subCatId: '', name: '', desc: '', storeType: 'normal', priceUSD: '', priceSYP: '', requiredInput: 'id', minQty: '', maxQty: '', unitPriceUSD: '', unitPriceSYP: '', apiProviderId: '', providerProductId: '' });
                }}
                className="w-full py-3 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-green-500/20"
              >
                {editProductId ? 'حفظ التعديلات' : 'إضافة المنتج'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            getOrderStatusDisplay={getOrderStatusDisplay} 
          />
        )}
      </AnimatePresence>

      {/* Balance Request Details Modal */}
      <AnimatePresence>
        {selectedBalanceRequest && (
          <BalanceRequestDetailsModal 
            request={selectedBalanceRequest} 
            onClose={() => setSelectedBalanceRequest(null)} 
            getOrderStatusDisplay={getOrderStatusDisplay} 
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      {!['login', 'register', 'admin'].includes(currentView) && (
        <div className="fixed bottom-28 left-6 z-[90] flex items-center justify-center">
          <AnimatePresence>
            {isFabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="absolute bottom-16 left-0 flex flex-col items-end gap-3 mb-2 w-max"
              >
                {fabOptions.map((opt, idx) => (
                  <motion.a
                    key={opt.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    href={opt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group flex-row"
                  >
                    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-bold whitespace-nowrap border border-gray-100 dark:border-gray-700">
                      {opt.name}
                    </div>
                    <div
                      className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 active:scale-95 text-white shrink-0"
                      style={{
                        background: opt.type === 'whatsapp' || opt.type === 'whatsapp_group' ? '#25D366' :
                                    opt.type === 'telegram' ? '#0088cc' :
                                    opt.type === 'facebook' ? '#1877F2' :
                                    opt.type === 'instagram' ? '#E4405F' :
                                    opt.type === 'youtube' ? '#FF0000' :
                                    '#6B7280'
                      }}
                    >
                      {opt.type === 'whatsapp' || opt.type === 'whatsapp_group' ? <MessageCircle className="w-6 h-6" /> :
                       opt.type === 'telegram' ? <Send className="w-6 h-6" /> :
                       opt.type === 'facebook' ? <Facebook className="w-6 h-6" /> :
                       opt.type === 'instagram' ? <Instagram className="w-6 h-6" /> :
                       opt.type === 'youtube' ? <Youtube className="w-6 h-6" /> :
                       <LinkIcon className="w-6 h-6" />}
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            {isFabOpen ? <X className="w-6 h-6" /> : <MoreVertical className="w-6 h-6" />}
          </button>
        </div>
      )}
      
      <PinSetupModal
        isOpen={showPinSetupModal}
        onClose={() => {
          setShowPinSetupModal(false);
          setPinInput('');
          setTempPin('');
          setPinSetupStep(1);
        }}
        pinSetupStep={pinSetupStep}
        setPinSetupStep={(v: number) => setPinSetupStep(v as 1 | 2)}
        tempPin={tempPin}
        setTempPin={setTempPin}
        pinInput={pinInput}
        setPinInput={setPinInput}
        onComplete={(pin) => {
          const updatedUser = { ...currentUser, pin };
          updateUserAndStorage(updatedUser);
          showNotification('success', 'تم تعيين رمز الحماية بنجاح');
        }}
      />

      {/* Notification Toast */}
      {notification && notification.show && (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4 animate-fade-in-down pointer-events-none">
          <div className={`shadow-lg rounded-full px-6 py-3 flex items-center gap-3 backdrop-blur-md border ${
            notification.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-100' : 
            notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100' : 
            'bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-100'
          }`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400" />}
            {notification.type === 'info' && <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin text-blue-500 dark:text-blue-400" />}
            <span className="font-bold text-sm tracking-wide">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

