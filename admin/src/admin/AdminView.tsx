import * as apiModule from '../api';
import React from 'react';
import { createPortal } from "react-dom";
import localforage from 'localforage';
import { saveSettingsDB, updateUserDB, deleteUserDB, saveGlobalNotificationDB, deletePaymentMethodDB } from '../api';
import { CategoryManager } from "./CategoryManager";
import ApiProvidersManager from "./ApiProvidersManager";
import { FetchProviderView } from "./FetchProviderView";
import { ProductManager } from "./ProductManager";

const MemoCategoryManager = React.memo(CategoryManager, () => true);
const MemoProductManager = React.memo(ProductManager, () => true);
import { DashboardCharts } from "./DashboardCharts";
import { Link2, ImageIcon, Camera, Link as LinkIcon, Megaphone, MessageCircle, Eye, Package, Send, Facebook, Instagram, Youtube, Menu, Home, ShoppingBag, PlusCircle, Plus, User, Users, Server, Wallet, X, Settings, ArrowRight, CheckCircle, Info, Star, CreditCard, Activity, Bell, Layers, Clock, DollarSign, Loader2, Image, Shield, AlertCircle, FileText, Check, Copy, RefreshCw, Upload, Trash2, Edit, LayoutDashboard, Search, XCircle, ChevronDown } from 'lucide-react';

interface AdminViewProps {
  setNewPaymentMethodForm: any;
  adminFabOpen: any;
  adminUserSearch: any;
  adminView: any;
  balanceRequests: any;
  bannersConfig: any;
  categories: any;
  categoryAdminTab: any;
  confirmModal: any;
  currentUser: any;
  currentView: any;
  fabOptions: any;
  getOrderStatusDisplay: any;
  getSafeFakeUsers: any;
  isAdmin: any;
  marqueeText: any;
  notification: any;
  notificationForm: any;
  notifications: any;
  orderProcessingMode: any;
  orders: any;
  paymentMethods: any;
  products: any;
  setAddPaymentMethodModal: any;
  setAdminFabOpen: any;
  setAdminUserSearch: any;
  setAdminView: any;
  setBalanceAdminModal: any;
  setBalanceRequests: any;
  setBannersConfig: any;
  setCategories: any;
  setCategoryAdminTab: any;
  setConfirmModal: any;
  setConfirmOrderStatus: any;
  setCurrentUser: any;
  setEditCatId: any;
  setEditProductId: any;
  setEditSubCatId: any;
  setFabOptions: any;
  setIsLoading: any;
  setMarqueeText: any;
  setNewCatImage: any;
  setNewCatName: any;
  setNewProduct: any;
  setNewSubCatImage: any;
  setNewSubCatMainId: any;
  setNewSubCatName: any;
  setNewSubCatType: any;
  setNotificationForm: any;
  setNotifications: any;
  setOrderProcessingMode: any;
  setOrders: any;
  setPaymentMethods: any;
  setProducts: any;
  setRejectModal: any;
  setShowAddCatModal: any;
  setShowAddProductModal: any;
  setShowAddSubCatModal: any;
  setSubCategories: any;
  setSubSubCategories: any;
  showNotification: any;
  subCategories: any;
  subSubCategories: any;
  exchangeRate?: number;
  setExchangeRate?: any;
}


const AnimatedNumber = ({ value, decimals = 0, suffix = "" }: { value: number, decimals?: number, suffix?: string }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  React.useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 800, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(value * easeOutQuart);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);
  return <>{displayValue.toFixed(decimals)} {suffix}</>;
};

const AdminView: React.FC<AdminViewProps & { adminEmail?: string; setAdminEmail?: any; adminPassword?: string; setAdminPassword?: any; }> = (props) => {
  const {  setNewPaymentMethodForm, adminFabOpen, adminUserSearch, adminView, balanceRequests, bannersConfig, categories, categoryAdminTab, confirmModal, currentUser, currentView, fabOptions, getOrderStatusDisplay, getSafeFakeUsers, isAdmin, marqueeText, notification, notificationForm, notifications, orderProcessingMode, orders, paymentMethods, products, setAddPaymentMethodModal, setAdminFabOpen, setAdminUserSearch, setAdminView, setBalanceAdminModal, setBalanceRequests, setBannersConfig, setCategories, setCategoryAdminTab, setConfirmModal, setConfirmOrderStatus, setCurrentUser, setEditCatId, setEditProductId, setEditSubCatId, setFabOptions, setIsLoading, setMarqueeText, setNewCatImage, setNewCatName, setNewProduct, setNewSubCatImage, setNewSubCatMainId, setNewSubCatName, setNewSubCatType, setNotificationForm, setNotifications, setOrderProcessingMode, setOrders, setPaymentMethods, setProducts, setRejectModal, setShowAddCatModal, setShowAddProductModal, setShowAddSubCatModal, setSubCategories, setSubSubCategories, showNotification, subCategories, subSubCategories  } = props;
  const [apiBalance, setApiBalance] = React.useState(0);
  const [apiBalanceLoading, setApiBalanceLoading] = React.useState(false);
  const [apiBalanceError, setApiBalanceError] = React.useState('');
  const [alraghebBalance, setAlraghebBalance] = React.useState(0);
  const [alraghebBalanceLoading, setAlraghebBalanceLoading] = React.useState(false);
  const [alraghebBalanceError, setAlraghebBalanceError] = React.useState('');
  
  const [dbUsersBalance, setDbUsersBalance] = React.useState<number | null>(null);
  const [dbUsersCount, setDbUsersCount] = React.useState<number | null>(null);
  const [dbUsersList, setDbUsersList] = React.useState<any[]>([]);
  const [dbSyncLoading, setDbSyncLoading] = React.useState(false);
  const [expandedUsers, setExpandedUsers] = React.useState<Record<string, boolean>>({});
  const [showAddBannerModal, setShowAddBannerModal] = React.useState(false);
  const [editBannerModal, setEditBannerModal] = React.useState<{isOpen: boolean, banner: any}>({isOpen: false, banner: null});
  const [bannerConfirmModal, setBannerConfirmModal] = React.useState<{isOpen: boolean, bannerId: any}>({isOpen: false, bannerId: null});
  const [editSecurityModal, setEditSecurityModal] = React.useState<{isOpen: boolean, userEmail: string, userId: string, password?: string, pin?: string}>({isOpen: false, userEmail: "", userId: ""});
  const [sendUserNotificationModal, setSendUserNotificationModal] = React.useState<{isOpen: boolean, userEmail: string, userId: string, userName: string, title: string, message: string, alertType: string}>({isOpen: false, userEmail: "", userId: "", userName: "", title: "", message: "", alertType: "normal"});
  const [newBannerImage, setNewBannerImage] = React.useState('');
  const [newBannerLink, setNewBannerLink] = React.useState('');
    const [fetchProviderConfig, setFetchProviderConfig] = React.useState({
    subCategoryId: '',
    subSubCategoryId: '',
    profitMargin: '',
    productNamePrefix: '',
    inputType: 'id' // 'id', 'phone', 'email_password'
  });
  const [providerProductsList, setProviderProductsList] = React.useState<any[]>([]);
  const [selectedProviderCategory, setSelectedProviderCategory] = React.useState('');

  const [isFetchingProducts, setIsFetchingProducts] = React.useState(false);
  const [apiProfileName, setApiProfileName] = React.useState('');
  

  const syncDbStats = async () => {
    setDbSyncLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setDbUsersList(data);
        setDbUsersCount(data.length);
        const total = data.reduce((sum: number, u: any) => sum + (Number(u.balance) || 0), 0);
        setDbUsersBalance(total);
        return;
      }
    } catch (e) {
    }
    
    // Fallback
    const localUsers = getSafeFakeUsers();
    setDbUsersList(localUsers);
    setDbUsersCount(localUsers.length);
    const total = localUsers.reduce((sum: number, u: any) => sum + (Number(u.balance) || 0), 0);
    setDbUsersBalance(total);
    setDbSyncLoading(false);
  };

  
  const handleFetchProviderProducts = async () => {
    setIsFetchingProducts(true);
    try {
      const res = await fetch('/api/provider/products');
      if (res.ok) {
        const data = await res.json();
        const pData = data.data; setProviderProductsList(Array.isArray(pData) ? pData : (pData?.products || pData?.data || pData?.response || []));
      } else {
        props.showNotification('error', 'فشل جلب المنتجات من المزود');
      }
    } catch (e) {
      props.showNotification('error', 'حدث خطأ في الاتصال');
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const fetchApiBalance = async () => {
    setApiBalanceLoading(true);
    setApiBalanceError('');
    try {
      const res = await fetch('/api/provider/balance?provider=eshhanle');
      if (res.ok) {
        const data = await res.json();
        setApiBalance(data.balance);
        if (data.name) setApiProfileName(data.name);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (e) {
      setApiBalanceError('فشل الاتصال بالمزود');
    } finally {
      setApiBalanceLoading(false);
    }
  };

  const fetchAlraghebBalance = async () => {
    setAlraghebBalanceLoading(true);
    setAlraghebBalanceError('');
    try {
      const res = await fetch('/api/provider/balance?provider=alragheb');
      if (res.ok) {
        const data = await res.json();
        setAlraghebBalance(data.balance);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (e) {
      setAlraghebBalanceError('فشل الاتصال بالمزود');
    } finally {
      setAlraghebBalanceLoading(false);
    }
  };

  React.useEffect(() => {
    if (adminView === 'dashboard' || adminView === 'users' || adminView === 'providers') {
      if (adminView === 'dashboard' || adminView === 'providers') { fetchApiBalance(); fetchAlraghebBalance(); }
      syncDbStats();
    }
  }, [adminView]);



  return (
    <>
      
            {showAddBannerModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={async () => {
                  setShowAddBannerModal(false);
                  setNewBannerImage('');
                  setNewBannerLink('');
                }} className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">إضافة بانر جديد</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">صورة البانر *</label>
                <div className="flex flex-col gap-2">
                  <label className="w-full bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl px-4 py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                    <Upload className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-blue-600 dark:text-blue-400 font-bold">اختيار صورة من المعرض</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target?.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewBannerImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {newBannerImage && <img src={newBannerImage} className="mt-2 h-32 w-full object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-white" />}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رابط التوجيه (اختياري)</label>
                <input 
                  type="text" 
                  value={newBannerLink}
                  onChange={e => setNewBannerLink(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                  placeholder="https://example.com/target"
                  dir="ltr"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (newBannerImage.trim()) {
                    const newBanner = { id: Date.now(), image: newBannerImage, link: newBannerLink, active: true };
                    const newBanners = [...(props.bannersConfig || []), newBanner];
                    props.setBannersConfig(newBanners);
                    localStorage.setItem('bannersConfig', JSON.stringify(newBanners));
                    saveSettingsDB({ bannersConfig: newBanners });
                    props.showNotification('success', 'تم إضافة البانر');
                    setShowAddBannerModal(false);
                    setNewBannerImage('');
                    setNewBannerLink('');
                  } else {
                    props.showNotification('error', 'يرجى اختيار الصورة');
                  }
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                حفظ
              </button>
              <button 
                onClick={() => {
                  setShowAddBannerModal(false);
                  setNewBannerImage('');
                  setNewBannerLink('');
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

            {currentView === 'admin' && isAdmin && (
              <div className="flex-1 flex flex-col lg:flex-row w-full h-full bg-transparent p-4 sm:p-6 pb-32 gap-6" dir="rtl">
                
                {/* Admin Sidebar */}

                <div className="flex-1 flex flex-col min-w-0">
                {adminView === 'dashboard' ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                       <LayoutDashboard className="w-6 h-6 text-blue-500" /> لوحة التحكم والإحصائيات
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3">
                           <Users className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">إجمالي المستخدمين</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{dbUsersCount !== null ? dbUsersCount : 0}</h3>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                           <Wallet className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">إجمالي أرصدة المستخدمين</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                          {(dbUsersBalance !== null ? dbUsersBalance : 0).toFixed(2)}$
                        </h3>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-3">
                           <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">إجمالي الطلبات</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{orders.length}</h3>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
                           <Server className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">رصيد المورد (API)</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                           {apiBalance !== null ? `${apiBalance}$` : <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />}
                        </h3>
                        <button onClick={fetchApiBalance} className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">تحديث الرصيد</button>
                      </div>
                    </div>
                    <DashboardCharts orders={orders || []} />
                  </div>
                
                ) : adminView === 'content' ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                      <Layers className="w-6 h-6 text-purple-500" /> إدارة المحتوى والأقسام
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Categories & Products Box */}
                      <div 
                        onClick={() => setAdminView('categories')} 
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-3 text-center group"
                      >
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Package className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">إدارة الأقسام والمنتجات</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إضافة وتعديل الأقسام والخدمات/المنتجات</p>
                      </div>

                      {/* Banners Box */}
                      <div 
                        onClick={() => setAdminView('banners')} 
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-3 text-center group"
                      >
                        <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">إدارة البانرات</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">تغيير صور البانرات الإعلانية في الرئيسية</p>
                      </div>

                      {/* Payment Methods Box */}
                      <div 
                        onClick={() => setAdminView('paymentMethods')} 
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-3 text-center group"
                      >
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CreditCard className="w-7 h-7" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">إدارة طرق الدفع</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">إضافة وتعديل حسابات الدفع المتاحة للعملاء</p>
                      </div>
                    </div>
                  </div>
) : adminView === 'categories' ? (
                   <MemoCategoryManager showNotification={props.showNotification} />
                ) : adminView === 'products' ? (
                   <MemoProductManager showNotification={props.showNotification} />
               
                ) : adminView === 'fetch-provider' ? (
                  <FetchProviderView showNotification={props.showNotification} />
                ) : adminView === 'providers' ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                      <Server className="w-6 h-6 text-blue-500" /> إدارة مزودي API
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Alragheb Provider Card */}
                       <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                         <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-6 flex items-center justify-between">
                           <div>
                             <h3 className="text-xl font-bold text-white">الراغب ستور (Alragheb)</h3>
                             <a href="https://alragheb-store.com" target="_blank" rel="noreferrer" className="text-emerald-100 text-sm hover:underline mt-1 block">alragheb-store.com</a>
                           </div>
                           <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                             <Server className="w-6 h-6" />
                           </div>
                         </div>
                         <div className="p-6 flex-1 flex flex-col gap-4">
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex flex-col">
                               <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">رصيد المورد</span>
                               <span className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                 {alraghebBalanceLoading ? <Loader2 className="w-5 h-5 animate-spin mt-2 text-emerald-500" /> : `${alraghebBalance !== null ? alraghebBalance : '0'}$ `}
                               </span>
                             </div>
                             <button onClick={fetchAlraghebBalance} disabled={alraghebBalanceLoading} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors disabled:opacity-50">
                               <RefreshCw className={`w-5 h-5 ${alraghebBalanceLoading ? 'animate-spin' : ''}`} />
                             </button>
                           </div>
                           
                           {alraghebBalanceError && (
                             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                               <AlertCircle className="w-4 h-4" /> {alraghebBalanceError}
                             </div>
                           )}

                           <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             متصل وفعال
                           </div>
                         </div>
                       </div>
                       {/* Eshhanle Provider Card */}
                       <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                         <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center justify-between">
                           <div>
                             <h3 className="text-xl font-bold text-white">اشحنلي (Eshhanle)</h3>
                             <a href="https://eshhanle.online" target="_blank" rel="noreferrer" className="text-blue-100 text-sm hover:underline mt-1 block">eshhanle.online</a>
                           </div>
                           <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                             <Server className="w-6 h-6" />
                           </div>
                         </div>
                         <div className="p-6 flex-1 flex flex-col gap-4">
                           <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div className="flex flex-col">
                               <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">رصيد المورد</span>
                               <span className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                                 {apiBalanceLoading ? <Loader2 className="w-5 h-5 animate-spin mt-2 text-blue-500" /> : `${apiBalance !== null ? apiBalance : '0'}$ `}
                               </span>
                             </div>
                             <button onClick={fetchApiBalance} disabled={apiBalanceLoading} className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-3 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors disabled:opacity-50">
                               <RefreshCw className={`w-5 h-5 ${apiBalanceLoading ? 'animate-spin' : ''}`} />
                             </button>
                           </div>
                           
                           {apiBalanceError && (
                             <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                               <AlertCircle className="w-4 h-4" /> {apiBalanceError}
                             </div>
                           )}

                           <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             متصل وفعال
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                ) : adminView === 'users' ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2"><Users className="w-6 h-6 text-blue-500" /> إدارة المستخدمين</h2>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-300 dark:text-gray-700" />
                      </div>
                      <input
                        type="text"
                        placeholder="البحث بالاسم، الإيميل، أو رقم الدخول..."
                        value={adminUserSearch}
                        onChange={(e) => setAdminUserSearch(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-3 pr-12 pl-4 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-gray-800 dark:text-white"
                      />
                    </div>

                    <div className="w-full">
                      <div className="flex flex-col gap-4 sm:gap-6">
                      {(() => {
                        const fakeUsers = getSafeFakeUsers();
                        const allUsers = dbUsersList.length > 0 ? dbUsersList.map((dbU: any) => {
                          const localU = (Array.isArray(fakeUsers) ? fakeUsers : []).find((fu: any) => fu.email === dbU.email);
                          return {
                            ...localU,
                            ...dbU,
                            password: dbU.password || localU?.password || '',
                            pin: dbU.pin || localU?.pin || ''
                          };
                        }) : fakeUsers;
                        const filteredUsers = (Array.isArray(allUsers) ? allUsers : []).filter((u: any) => 
                          (u.name && u.name.toLowerCase().includes(adminUserSearch.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(adminUserSearch.toLowerCase())) ||
                          (u.id && u.id.toString() === adminUserSearch) ||
                          (u.login_id && u.login_id.toString() === adminUserSearch)
                        );


                        return filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((u: any, idx: number) => {
                          const isExpanded = expandedUsers[u.email] || false;
                          
                          return (
                          <div key={(u.id || u.email) + '-' + idx} className="group relative bg-white dark:bg-[#1a2235] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgb(0,0,0,0.4)] hover:-translate-y-1 overflow-hidden transition-all duration-500">
                            {/* Pro Max Decorative Background Blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
                              <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative shrink-0">
                                  {u.image ? (
                                    <img src={u.image} alt={u.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-md" />
                                  ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-md">
                                      <User className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                  )}
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1a2235] ${u.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 truncate">
                                    {u.name || 'بدون اسم'}
                                    <span className="shrink-0 text-[10px] font-mono bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/50 tracking-wider">#{u.login_id || u.id || 0}</span>
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{u.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 bg-gray-50 sm:bg-transparent dark:bg-gray-800/50 sm:dark:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">الرصيد الحالي</span>
                                <span className="font-black text-xl text-emerald-600 dark:text-emerald-400 tracking-tight" dir="ltr">
                                  {u.balance !== undefined ? parseFloat(u.balance).toFixed(2) : '0.00'}
                                </span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => setExpandedUsers(prev => ({...prev, [u.email]: !prev[u.email]}))}
                              className="w-full flex items-center justify-center py-2.5 bg-gray-50/80 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 text-sm font-bold mb-4 group/btn"
                            >
                              <span className="flex items-center gap-2">
                                {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover/btn:translate-y-0.5'}`} />
                              </span>
                            </button>

                            {isExpanded && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">كلمة المرور</span>
                                  <span className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-blue-600 dark:text-blue-400 select-all">{u.password || 'غير محدد'}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">رمز الحماية (PIN)</span>
                                  <span className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-bold text-emerald-600 dark:text-emerald-400 select-all" dir="ltr">{u.pin || 'غير محدد'}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">رقم الهاتف</span>
                                  <span className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700" dir="ltr">{u.phone || 'غير محدد'}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">الدولة</span>
                                  <span className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700">{u.country || 'غير محدد'}</span>
                                </div>
                                <div>
                                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">تاريخ الانضمام</span>
                                  <span className="text-sm text-gray-800 dark:text-gray-200">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap sm:flex-nowrap justify-between gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                              <button onClick={async () => {
                                const users = getSafeFakeUsers();
                                const index = users.findIndex((user: any) => user.email === u.email);
                                if (index > -1) {
                                  users[index].isActive = !u.isActive;
                                  localStorage.setItem('fake_users', JSON.stringify(users));
                                  if (u.id) updateUserDB(u.id, { isActive: !u.isActive });
                                  showNotification('success', users[index].isActive ? 'تم تنشيط المستخدم' : 'تم إلغاء تنشيط المستخدم');
                                  setAdminView('dashboard'); setTimeout(() => setAdminView('users'), 0);
                                }
                             }} className={`flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-xl font-bold transition-colors ${!u.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {!u.isActive ? 'تنشيط' : 'إلغاء التنشيط'}
                              </button>
                              
                              <button onClick={async () => {
                                setEditSecurityModal({ isOpen: true, userEmail: u.email, userId: u.id || u._id, password: u.password || '', pin: u.pin || '' });
                             }} className="flex-1 min-w-[80px] text-xs sm:text-sm bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 py-2.5 rounded-xl font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">الأمان</button>
                              
                              <button onClick={async () => {
                                setBalanceAdminModal({isOpen: true, userEmail: u.email, userName: u.name, type: 'add', amount: '', note: ''});
                             }} className="flex-1 min-w-[80px] text-xs sm:text-sm bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 py-2.5 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">تعديل رصيد</button>
                              
                              <button onClick={async () => {
                                if (!u.isBlocked) {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'تأكيد الحظر',
                                    message: `هل أنت متأكد من أنك تريد حظر حساب "${u.name || u.email}"؟ لن يتمكن من تسجيل الدخول.`,
                                    action: () => {
                                      const users = getSafeFakeUsers();
                                      const index = users.findIndex((user: any) => user.email === u.email);
                                      if (index > -1) {
                                        users[index].isBlocked = true;
                                        localStorage.setItem('fake_users', JSON.stringify(users));
                                        if (u.id) updateUserDB(u.id, { isBlocked: true });
                                        showNotification('success', 'تم حظر المستخدم');
                                        setAdminView('dashboard'); setTimeout(() => setAdminView('users'), 0);
                                      }
                                      setConfirmModal({...confirmModal, isOpen: false});
                                    }
                                  });
                                } else {
                                  const users = getSafeFakeUsers();
                                  const index = users.findIndex((user: any) => user.email === u.email);
                                  if (index > -1) {
                                    users[index].isBlocked = false;
                                    localStorage.setItem('fake_users', JSON.stringify(users));
                                    if (u.id) updateUserDB(u.id, { isBlocked: false });
                                    showNotification('success', 'تم فك الحظر');
                                    setAdminView('dashboard'); setTimeout(() => setAdminView('users'), 0);
                                  }
                                }
                             }} className={`flex-1 min-w-[80px] text-xs sm:text-sm py-2.5 rounded-xl font-bold transition-colors ${u.isBlocked ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {u.isBlocked ? 'فك الحظر' : 'حظر'}
                              </button>
                              
                              <button onClick={async () => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'تأكيد الحذف',
                                  message: `هل أنت متأكد من أنك تريد حذف حساب "${u.name || u.email}" بشكل نهائي؟`,
                                  action: () => {
                                    const users = (Array.isArray(getSafeFakeUsers()) ? getSafeFakeUsers() : []).filter((user: any) => user.email !== u.email);
                                    localStorage.setItem('fake_users', JSON.stringify(users));
                                    if (u.id) deleteUserDB(u.id);
                                        
                                    const newBalanceReqs = (Array.isArray(balanceRequests) ? balanceRequests : []).filter(req => req.userEmail !== u.email);
                                    setBalanceRequests(newBalanceReqs);
                                    localforage.setItem('balanceRequests', newBalanceReqs);
                                    const newOrders = (Array.isArray(orders) ? orders : []).filter(order => order.userEmail !== u.email);
                                    setOrders(newOrders);
                                    localforage.setItem('orders', newOrders);
                                    showNotification('success', 'تم الحذف بنجاح');
                                    setAdminView('dashboard'); setTimeout(() => setAdminView('users'), 0);
                                    setConfirmModal({...confirmModal, isOpen: false});
                                  }
                                });
                             }} className="flex-1 min-w-[80px] text-xs sm:text-sm bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 py-2.5 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">حذف</button>
                              
                              <button onClick={async () => {
                                setSendUserNotificationModal({isOpen: true, userEmail: u.email, userId: u.id || u._id, userName: u.name, title: "", message: "", alertType: "normal"});
                             }} className="flex-1 min-w-[80px] text-xs sm:text-sm bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 py-2.5 rounded-xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors col-span-2 sm:col-span-1">إشعار</button>
                            </div>
                          </div>
                        );

                        }) : (
                          <div className="py-12 text-center text-gray-700 font-bold bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">لا يوجد مستخدمين مسجلين</div>
                        );

                      })()}
                    </div>
                    </div>
                  </div>
                
                ) : adminView === 'banners' ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                       <ImageIcon className="w-6 h-6 text-purple-500" /> إدارة البانرات
                    </h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                         {/* Plus Button Card */}
                         <div 
                           onClick={() => setShowAddBannerModal(true)} 
                           className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                         >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                              <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">إضافة بانر</span>
                         </div>
                         {/* Banners */}
                         {props.bannersConfig && props.bannersConfig.map((b: any, idx: number) => (
                           <div key={b.id || idx} className="relative rounded-2xl overflow-hidden border border-gray-200 h-32 group">
                             <img src={b.image} className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 flex gap-2 transition-opacity">
                               <button onClick={async () => {
                                 setEditBannerModal({ isOpen: true, banner: b });
                              }} className="bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                                 <Edit className="w-4 h-4" />
                               </button>
                               <button onClick={async () => {
                                 setBannerConfirmModal({ isOpen: true, bannerId: b.id });
                              }} className="bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ) : adminView === 'api_providers' ? (
                  <ApiProvidersManager showNotification={props.showNotification} />
                ) : adminView === 'settings' ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                           <Settings className="w-6 h-6 text-gray-500" /> إعدادات المنصة
                        </h2>
                        <button onClick={async () => {
                            saveSettingsDB({
                                marqueeText: props.marqueeText,
                                adminEmail: props.adminEmail,
                                adminPassword: props.adminPassword,
                                fabOptions: props.fabOptions,
                                exchangeRate: props.exchangeRate
                            });
                            props.showNotification('success', 'تم حفظ الإعدادات بنجاح');
                        }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-colors">
                            حفظ الإعدادات
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex flex-col gap-4 mb-6">
                           <label className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-2">
                             <RefreshCw className="w-5 h-5 text-gray-500" /> سعر صرف العملة (الدولار مقابل الليرة السورية):
                           </label>
                           <div className="flex items-center gap-4">
                             <div className="flex-1 relative">
                               <input type="number" 
                                 value={props.exchangeRate || 15000} 
                                 onChange={(e) => {
                                   const val = parseFloat(e.target.value) || 15000;
                                   if (props.setExchangeRate) props.setExchangeRate(val);
                                 }}
                                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pr-4 pl-12 py-3 font-mono font-bold dark:text-white text-left" 
                               />
                               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">SYP</span>
                             </div>
                             <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600">
                               1 دولار = <span className="font-bold text-gray-900 dark:text-white">{props.exchangeRate || 15000}</span> ل.س
                             </div>
                           </div>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                           <label className="text-gray-700 dark:text-gray-300 font-bold">النص المتحرك (شريط الأخبار):</label>
                           <input type="text" value={props.marqueeText} onChange={e => {
                               props.setMarqueeText(e.target.value);
                               localStorage.setItem('marqueeText', e.target.value);
                          }} className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white" />
                        </div>
                        <div className="flex flex-col gap-4 mt-6">
                           <h3 className="text-lg font-bold text-gray-800 dark:text-white">بيانات الدخول للمسؤول:</h3>
                           <div>
                               <label className="text-gray-700 dark:text-gray-300 font-bold mb-2 block">البريد الإلكتروني:</label>
                               <input type="email" value={props.adminEmail || ''} onChange={e => {
                                   props.setAdminEmail(e.target.value);
                                   localStorage.setItem('adminEmail', e.target.value);
                              }} className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white" />
                           </div>
                           <div>
                               <label className="text-gray-700 dark:text-gray-300 font-bold mb-2 block">كلمة المرور:</label>
                               <input type="text" value={props.adminPassword || ''} onChange={e => {
                                   props.setAdminPassword(e.target.value);
                                   localStorage.setItem('adminPassword', e.target.value);
                              }} className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white" />
                           </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                           <h3 className="text-lg font-bold text-gray-800 dark:text-white">خيارات التواصل (الزر العائم):</h3>
                           {props.fabOptions && props.fabOptions.map((opt: any, idx: number) => (
                               <div key={opt.id || idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 items-end">
                                   <div className="md:col-span-1">
                                       <label className="text-xs text-gray-500 mb-1 block">الاسم:</label>
                                       <input type="text" value={opt.name} onChange={e => {
                                           const newOpts = [...props.fabOptions];
                                           newOpts[idx].name = e.target.value;
                                           props.setFabOptions(newOpts);
                                           localStorage.setItem('fabOptions', JSON.stringify(newOpts));
                                         }} className="w-full border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm" />
                                   </div>
                                   <div className="md:col-span-1">
                                       <label className="text-xs text-gray-500 mb-1 block">الرابط (URL):</label>
                                       <input type="text" value={opt.url} onChange={e => {
                                           const newOpts = [...props.fabOptions];
                                           newOpts[idx].url = e.target.value;
                                           props.setFabOptions(newOpts);
                                           localStorage.setItem('fabOptions', JSON.stringify(newOpts));
                                         }} className="w-full border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm" dir="ltr" />
                                   </div>
                                   <div className="md:col-span-1">
                                       <label className="text-xs text-gray-500 mb-1 block">النوع (أيقونة):</label>
                                       <select value={opt.type} onChange={e => {
                                           const newOpts = [...props.fabOptions];
                                           newOpts[idx].type = e.target.value;
                                           props.setFabOptions(newOpts);
                                           localStorage.setItem('fabOptions', JSON.stringify(newOpts));
                                         }} className="w-full border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-sm">
                                           <option value="whatsapp">واتساب</option>
                                           <option value="whatsapp_group">مجموعة واتساب</option>
                                           <option value="facebook">فيسبوك</option>
                                           <option value="instagram">انستغرام</option>
                                           <option value="youtube">يوتيوب</option>
                                       </select>
                                   </div>
                                   <div className="md:col-span-1">
                                       <button onClick={async () => {
                                           const newOpts = [...props.fabOptions];
                                           newOpts.splice(idx, 1);
                                           props.setFabOptions(newOpts);
                                           localStorage.setItem('fabOptions', JSON.stringify(newOpts));
                                         }} className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors flex items-center justify-center gap-2 w-full text-sm font-bold">
                                           <Trash2 className="w-4 h-4" /> حذف
                                       </button>
                                   </div>
                               </div>
                           ))}
                           <button onClick={async () => {
                               const newOpts = [...(props.fabOptions || []), { id: 'new_' + Date.now(), name: 'تواصل جديد', url: '', type: 'whatsapp' }];
                               props.setFabOptions(newOpts);
                               localStorage.setItem('fabOptions', JSON.stringify(newOpts));
                          }} className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 w-full font-bold mt-2">
                               <Plus className="w-5 h-5" /> إضافة خيار تواصل
                           </button>
                        </div>

                    </div>
                  </div>
                ) : adminView === 'notifications' ? (
                  <div className="flex flex-col gap-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                       <Bell className="w-6 h-6 text-yellow-500" /> إرسال إشعار
                    </h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-4">
                        <input type="text" placeholder="عنوان الإشعار..." value={props.notificationForm?.title || ''} onChange={e => props.setNotificationForm({...props.notificationForm, title: e.target.value})} className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 w-full dark:text-white" />
                        <textarea placeholder="محتوى الإشعار..." value={props.notificationForm?.message || ''} onChange={e => props.setNotificationForm({...props.notificationForm, message: e.target.value})} className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 w-full h-32 dark:text-white"></textarea>
                        <select value={props.notificationForm?.alertType || 'normal'} onChange={e => props.setNotificationForm({...props.notificationForm, alertType: e.target.value})} className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 w-full dark:text-white">
                           <option value="normal">إشعار عادي (جرس الإشعارات)</option>
                           <option value="popup">تنبيه قوي (شاشة منبثقة)</option>
                        </select>
                        <button onClick={async () => {
                           if (!props.notificationForm.title || !props.notificationForm.message) return props.showNotification('error', 'يرجى تعبئة الحقول');
                           const newNotif = { title: props.notificationForm.title, message: props.notificationForm.message, date: new Date().toISOString(), read: false, type: 'global', alertType: props.notificationForm.alertType || 'normal' };
                           const api = apiModule;
                           
                              if (api.saveGlobalNotificationDB) {
                                  const saved = await api.saveGlobalNotificationDB(newNotif);
                                  if (saved) {
                                      const savedWithId = { ...saved, id: saved._id };
                                      const globalNotifs = JSON.parse(localStorage.getItem('global_notifications') || '[]');
                                      const allNotifs = [savedWithId, ...globalNotifs];
                                      localStorage.setItem('global_notifications', JSON.stringify(allNotifs));
                                      window.dispatchEvent(new Event('global_notifications_updated'));
   
                              }
                           props.setNotificationForm({ title: '', message: '', type: 'all', alertType: 'normal' });
                           props.showNotification('success', 'تم إرسال الإشعار بنجاح');
                           }
                        }} className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">إرسال</button>
                    </div>
                  </div>
                ) : adminView === 'paymentMethods' ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                       <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                          <CreditCard className="w-6 h-6 text-blue-500" /> طرق الدفع
                       </h2>
                       <button onClick={async () => {
                          props.setNewPaymentMethodForm({ id: null, name: '', info: '', link: '', note: '', image: null, minDeposit: '', qrCode: null });
                          props.setAddPaymentMethodModal(true);
                       }} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">إضافة طريقة</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {props.paymentMethods && props.paymentMethods.map((pm: any, idx: number) => (
                           <div key={pm.id || idx} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 {pm.image ? <img src={pm.image} className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"><CreditCard className="w-6 h-6 text-gray-400" /></div>}
                                 <div>
                                   <h4 className="font-bold text-gray-900 dark:text-white">{pm.name}</h4>
                                   <p className="text-xs text-gray-500 dark:text-gray-400">{pm.info}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={async () => {
                                   props.setNewPaymentMethodForm({ id: pm.id, name: pm.name || '', info: pm.info || '', link: pm.link || '', note: pm.note || '', image: pm.image || null, minDeposit: pm.minDeposit || '', qrCode: pm.qrCode || null });
                                   props.setAddPaymentMethodModal(true);                                  }} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg hover:bg-blue-100 transition-colors"><Edit className="w-5 h-5"/></button>
                                <button onClick={async () => {
                                 deletePaymentMethodDB(pm.id || pm._id).catch(() => {});
                                 const newPM = props.paymentMethods.filter((x: any) => x.id !== pm.id && x._id !== pm._id);
                                 props.setPaymentMethods(newPM);
                                 localStorage.setItem('paymentMethods', JSON.stringify(newPM));
                                 props.showNotification('success', 'تم الحذف');                                  }} className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5"/></button>
                              </div>
                           </div>
                        ))}
                    </div>
                  </div>
                ) : adminView === 'orders' ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        إدارة الطلبات
                      </h2>
                      <div className="flex items-center gap-2 text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button onClick={async () => {
                          setOrderProcessingMode('immediate');
                          localStorage.setItem('orderProcessingMode', 'immediate');
                          saveSettingsDB({ orderProcessingMode: 'immediate' });
                          showNotification('success', 'تم تفعيل المعالجة الفورية المباشرة لـ API');
                        }} className={`px-4 py-2 rounded-xl font-bold transition-all ${orderProcessingMode === 'immediate' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-700 hover:text-gray-900 dark:hover:text-white'}`}>فوري (API)</button>
                        <button onClick={async () => {
                          setOrderProcessingMode('manual');
                          localStorage.setItem('orderProcessingMode', 'manual');
                          saveSettingsDB({ orderProcessingMode: 'manual' });
                          showNotification('success', 'تم تفعيل المعالجة اليدوية');
                        }} className={`px-4 py-2 rounded-xl font-bold transition-all ${orderProcessingMode === 'manual' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20' : 'text-gray-700 hover:text-gray-900 dark:hover:text-white'}`}>يدوي</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 mt-6">
                      {orders && orders.length > 0 ? orders.map((order: any, idx: number) => (
                        <div key={order.id || idx} className="bg-white dark:bg-[#1e293b] hover:bg-gray-50 dark:hover:bg-[#253247] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] relative overflow-hidden group hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                          <div className={`absolute top-0 right-0 w-2 h-full ${order.status === 'processing' ? 'bg-gradient-to-b from-yellow-400 to-orange-500' : order.status === 'accepted' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-rose-400 to-rose-600'}`}></div>
                          
                          <div className="flex flex-col lg:flex-row justify-between gap-6 pl-2 pr-4">
                            <div className="flex flex-col gap-3 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[1.2rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xl border border-gray-200 dark:border-gray-700">
                                  {order.userName ? order.userName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                     {order.userName || 'مستخدم مجهول'}
                                     <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg">#{order.userId || 0}</span>
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{order.userEmail}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <div className="col-span-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">المنتج / القسم</p>
                                  <p className="font-bold text-gray-900 dark:text-white">{order.title || order.product}</p>
                                  <p className="text-xs text-gray-500 mt-1">{order.subCategory} {order.subSubCategory ? `> ${order.subSubCategory}` : ''}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">بيانات اللاعب</p>
                                  <p className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm" dir="ltr">{order.playerData || 'غير متوفر'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الكمية والسعر</p>
                                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm" dir="ltr">{order.quantity}x {order.price}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رقم الطلب</p>
                                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm" dir="ltr">{order.orderNumber}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">التاريخ</p>
                                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm" dir="ltr">{order.date}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-start lg:items-end gap-4 min-w-[200px]">
                              <div className="flex flex-col items-start lg:items-end gap-1">
                                <span className={`px-5 py-2 rounded-full text-sm font-bold border-2 shadow-sm ${order.status === 'processing' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30 shadow-yellow-500/10' : order.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-emerald-500/10' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 shadow-rose-500/10'}`}>
                                  {props.getOrderStatusDisplay ? props.getOrderStatusDisplay(order.status)?.label : (order.status === 'processing' ? 'قيد المعالجة' : order.status === 'accepted' ? 'مكتمل' : 'مرفوض')}
                                </span>
                              </div>
                              
                              <div className="flex flex-col w-full gap-2 mt-auto">
                                <p className="text-xs text-gray-500 text-center mb-1">{order.synced ? 'تم الإرسال لـ API' : 'محلي (تلقائي)'}</p>
                                {order.responseInfo && <p className="text-xs text-blue-500 text-center mb-1 font-mono">{order.responseInfo}</p>}
                                <button onClick={() => props.setConfirmOrderStatus({isOpen: true, orderId: order.id, status: order.status, note: order.adminNote || ''})} className="w-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                        <Edit className="w-4 h-4" /> تغيير الحالة
                                      </button>
                                      {order.synced && order.status === 'processing' && (
                                        <button onClick={async () => {
                                          try {
                                            const res = await fetch(`/api/orders/${order.id || order._id}/sync-provider`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' }
                                            });
    
                                            if(res.ok) {
                                               const updatedOrder = await res.json();
                                               showNotification('success', 'تمت مزامنة حالة الطلب مع المزود');
                                               setOrders((prev: any) => prev.map((o: any) => (o.id === order.id || o._id === order._id) ? {...o, ...updatedOrder} : o));
                                            }
                                            else {
                                               const err = await res.json();
                                               showNotification('error', `فشل المزامنة: ${err.message || ''}`);
                                            }
                                          } catch(e) {
                                            showNotification('error', 'خطأ في الاتصال');
           
                                          }
                                        }} className="w-full mt-2 text-sm bg-purple-600 text-white hover:bg-purple-700 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                          <RefreshCw className="w-4 h-4" /> تحديث من المزود
                                        </button>
                                      )}
                                      {!order.synced && order.status === 'processing' && (
                                        <button onClick={async () => {
                                          try {
                                            const res = await fetch(`/api/orders/${order.id || order._id}`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ action: 'send_to_api' })
                                            });
    
                                            if(res.ok) {
                                               const updatedOrder = await res.json();
                                               showNotification('success', 'تم إرسال الطلب ومزامنة الرد بنجاح');
                                               setOrders((prev: any) => prev.map((o: any) => (o.id === order.id || o._id === order._id) ? {...o, ...updatedOrder} : o));
                                            }
                                            else {
                                               showNotification('error', 'فشل إرسال الطلب إلى المزود');
                                            }
                                          } catch(e) {
                                            showNotification('error', 'خطأ في الاتصال');
           
                                          }
                                        }} className="w-full mt-2 text-sm bg-blue-600 text-white hover:bg-blue-700 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                          إرسال إلى المزود (API)
                                        </button>
                                      )}

                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                         <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-bold">لا يوجد طلبات حالياً</p>
                         </div>
                      )}
                    </div>
                  </div>
                ) : adminView === 'payments' ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                          <Wallet className="w-5 h-5" />
                        </div>
                        إدارة الدفعات
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {balanceRequests && balanceRequests.length > 0 ? balanceRequests.map((req: any, idx: number) => (
                        <div key={((req._id || req.id) || 'req') + '-' + idx} className="bg-white dark:bg-[#1e293b] hover:bg-gray-50 dark:hover:bg-[#253247] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] relative overflow-hidden group hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                          <div className={`absolute top-0 right-0 w-2 h-full ${req.status === 'processing' ? 'bg-gradient-to-b from-yellow-400 to-orange-500' : req.status === 'accepted' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-rose-400 to-rose-600'}`}></div>
                          
                          <div className="flex flex-col lg:flex-row justify-between gap-6 pl-2 pr-4">
                            <div className="flex flex-col gap-3 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xl border border-gray-200 dark:border-gray-700">
                                  {req.userName ? req.userName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-lg text-gray-900 dark:text-white">{req.userName || 'مستخدم مجهول'}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{req.userEmail}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">طريقة الدفع</p>
                                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-blue-500" />
                                    {req.method}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">التاريخ</p>
                                  <p className="font-bold text-gray-900 dark:text-white font-mono text-sm" dir="ltr">{req.date}</p>
                                </div>
                                {req.userPhone && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الهاتف</p>
                                    <p className="font-bold text-gray-900 dark:text-white font-mono text-sm" dir="ltr">{req.userPhone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-start lg:items-end gap-4 min-w-[200px]">
                              <div className="flex flex-col items-start lg:items-end gap-1">
                                <span className="font-bold text-3xl text-gray-900 dark:text-white" dir="ltr">{req.amount} {req.currency || (String(req.amount).includes(" ") ? "" : "$")}</span>
                                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${req.status === 'processing' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' : req.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'}`}>
                                  {req.status === 'processing' ? 'قيد المراجعة' : req.status === 'accepted' ? 'تم القبول' : 'مرفوض'}
                                </span>
                              </div>
                              
                              <div className="flex flex-col w-full gap-2 mt-auto">
                                <button 
                                  onClick={() => {
                                    const details = document.getElementById(`details-${(req._id || req.id) || idx}`);
                                    if (details) details.classList.toggle('hidden');
                                    }}
                                    className="w-full text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-blue-100 dark:border-blue-500/20"
                                >
                                  <Eye className="w-4 h-4" /> تفاصيل التحويل
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div id={`details-${(req._id || req.id) || idx}`} className="hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">رقم العملية / الحوالة</p>
                                <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">{req.operationNumber || req.transferNumber || 'غير متوفر'}</p>
                              </div>
                              {req.image && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center">
                                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 w-full text-right">صورة الإيصال المرفقة</p>
                                  <img src={req.image} alt="إيصال تحويل" className="max-h-40 w-auto object-contain rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm hover:scale-105 transition-transform" onClick={() => window.open(req.image)} />
                                </div>
                              )}
                            </div>
                            {req.note && (
                              <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">ملاحظة المستخدم</p>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">{req.note}</p>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-wrap gap-3 mt-4 mx-4">
                            {req.status === 'processing' && (
                              <>
                                <button onClick={async () => {
                                    setConfirmModal({
                                        isOpen: true,
                                        title: 'قبول الدفعة',
                                        message: `هل أنت متأكد من قبول الدفعة بقيمة ${req.amount} لحساب ${req.userEmail}؟ سيتم إضافة الرصيد مباشرة.`,
                                        action: () => {
                                            const newReqs = [...balanceRequests];
                                            newReqs[idx].status = 'accepted';
                                            setBalanceRequests(newReqs);
                                            localforage.setItem('balanceRequests', newReqs);
                                            
                                            // Add balance
                                            const users = getSafeFakeUsers();
                                            const userIndex = users.findIndex((u: any) => u.email === req.userEmail);
                                            if (userIndex > -1) {
                                                const cleanAmount = parseFloat(String(req.amount).replace(/[^\d.]/g, '')) || 0;
                                                users[userIndex].balance = (users[userIndex].balance || 0) + cleanAmount;
                                                localStorage.setItem('fake_users', JSON.stringify(users));
                                                
                                                if (currentUser?.email === req.userEmail) {
                                                    setCurrentUser({...currentUser, balance: users[userIndex].balance});
                 

                                                Promise.resolve(apiModule).then(api => {
                                                    if (users[userIndex].id) {
                                                        // api.updateUser(users[userIndex].id, { balance: users[userIndex].balance }).catch(() => {});
                     
                                                    if (req._id || req.id) {
                                                        api.updateBalanceRequestDB(req._id || req.id, { status: 'accepted' }).catch(() => {});
                     
                                             }

             
                                            showNotification('success', 'تم قبول الدفعة وإضافة الرصيد لحساب العميل');
                                            setConfirmModal({...confirmModal, isOpen: false});
         
     );                                  }} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-800/60 px-4 py-2 rounded-xl font-bold flex-1 transition-colors text-sm">قبول وإضافة الرصيد</button>
                                
                                <button onClick={async () => {
                                    setRejectModal({
                                        isOpen: true,
                                        idx,
                                        note: ''
     );                                  }} className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:hover:bg-orange-800/60 px-4 py-2 rounded-xl font-bold flex-1 transition-colors text-sm">رفض الدفعة</button>
{editSecurityModal.isOpen && createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
      <button onClick={() => setEditSecurityModal({...editSecurityModal, isOpen: false})} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
        <Shield className="w-7 h-7 text-amber-500" />
        تعديل بيانات الأمان
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
          <input type="text" value={editSecurityModal.password} onChange={e => setEditSecurityModal({...editSecurityModal, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رمز الأمان (PIN)</label>
          <input type="text" value={editSecurityModal.pin} onChange={e => setEditSecurityModal({...editSecurityModal, pin: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
        </div>
        <button onClick={() => {
           const users = getSafeFakeUsers();
           const index = users.findIndex((u: any) => u.email === editSecurityModal.userEmail);
           if (index > -1) {
             users[index].password = editSecurityModal.password;
             users[index].pin = editSecurityModal.pin;
             localStorage.setItem('fake_users', JSON.stringify(users));
             if (editSecurityModal.userId) {
               updateUserDB(editSecurityModal.userId, { password: editSecurityModal.password, pin: editSecurityModal.pin }).catch(()=>{});
             }
             showNotification('success', 'تم تعديل بيانات الأمان بنجاح');
             setEditSecurityModal({ isOpen: false, userEmail: '', userId: '' });
           }
        }} className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30">
           حفظ التعديلات
        </button>
      </div>
    </div>
  </div>, document.body
)}

{sendUserNotificationModal.isOpen && createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
      <button onClick={() => setSendUserNotificationModal({...sendUserNotificationModal, isOpen: false})} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-3">
        <Bell className="w-7 h-7 text-emerald-500" />
        إرسال إشعار
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">للمستخدم: {sendUserNotificationModal.userName}</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان الإشعار</label>
          <input type="text" value={sendUserNotificationModal.title} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نص الإشعار</label>
          <textarea value={sendUserNotificationModal.message} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, message: e.target.value})} className="w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الإشعار</label>
          <select value={sendUserNotificationModal.alertType} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, alertType: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
            <option value="normal">إشعار عادي (جرس الإشعارات)</option>
            <option value="popup">تنبيه قوي (شاشة منبثقة)</option>
          </select>
        </div>
        <button onClick={async () => {
           if (!sendUserNotificationModal.title || !sendUserNotificationModal.message) return showNotification('error', 'يرجى تعبئة الحقول');
           const newNotif = { title: sendUserNotificationModal.title, message: sendUserNotificationModal.message, date: new Date().toISOString(), read: false, type: 'personal', targetUser: sendUserNotificationModal.userEmail, alertType: sendUserNotificationModal.alertType };
           
           const api = apiModule;
           if (api.saveNotificationDB) {
             const saved = await api.saveNotificationDB(newNotif);
             if (saved) {
               showNotification('success', 'تم إرسال الإشعار بنجاح');
               setSendUserNotificationModal({ isOpen: false, userEmail: '', userId: '', userName: '', title: '', message: '', alertType: 'normal' });
             }
           }
        }} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
           إرسال الإشعار
        </button>
      </div>
    </div>
  </div>, document.body
)}
                              </>
                            )}
                            <button onClick={async () => {
                                setConfirmModal({
                                    isOpen: true,
                                    title: 'تأكيد الحذف',
                                    message: `هل أنت متأكد من حذف هذه الدفعة نهائياً؟`,
                                    action: () => {
                                        const deletedReq = balanceRequests[idx];
                                        const newReqs = [...balanceRequests];
                                        newReqs.splice(idx, 1);
                                        setBalanceRequests(newReqs);
                                        localforage.setItem('balanceRequests', newReqs);
                                        Promise.resolve(apiModule).then(api => {
                                            if (deletedReq.id || deletedReq._id) {
                                                api.deleteBalanceRequestDB(deletedReq.id || deletedReq._id).catch(() => {});
             
         );
                                        showNotification('success', 'تم حذف الدفعة بنجاح');
                                        setConfirmModal({...confirmModal, isOpen: false});
     
 );
                           }} className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-4 py-2 rounded-xl font-bold transition-colors text-sm shrink-0">
                                <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-700 font-bold">لا توجد طلبات شحن</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
                </div>

                {/* Admin FAB Options Popup */}
                {adminFabOpen && (
                  <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 pb-safe transition-opacity" onClick={() => setAdminFabOpen(false)}>
                    <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border border-gray-100 dark:border-gray-800 animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setAdminFabOpen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <X className="w-5 h-5" />
                      </button>
                      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <PlusCircle className="w-6 h-6 text-blue-500" /> إضافة سريع
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        <button onClick={async () => { setAdminFabOpen(false); setAdminView('categories'); setTimeout(() => window.dispatchEvent(new CustomEvent('OPEN_ADD_MAIN_CAT')), 100); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors gap-2 text-indigo-700 dark:text-indigo-400 font-bold group">
                           <Layers className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm">قسم رئيسي</span>
                        </button>
                        
                        <button onClick={async () => { setAdminFabOpen(false); setAdminView('categories'); setTimeout(() => window.dispatchEvent(new CustomEvent('OPEN_ADD_SUB_CAT')), 100); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors gap-2 text-cyan-700 dark:text-cyan-400 font-bold group">
                           <Layers className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm">قسم فرعي</span>
                        </button>

                        <button onClick={async () => { setAdminFabOpen(false); setAdminView('categories'); setTimeout(() => window.dispatchEvent(new CustomEvent('OPEN_ADD_SUB_SUB_CAT')), 100); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-teal-200 dark:border-teal-500/30 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors gap-2 text-teal-700 dark:text-teal-400 font-bold group">
                           <Layers className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm text-center">قسم فرع فرعي</span>
                        </button>
                        
                        <button onClick={async () => { setAdminFabOpen(false); setAdminView('products'); setTimeout(() => window.dispatchEvent(new CustomEvent('OPEN_ADD_PRODUCT')), 100); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors gap-2 text-emerald-700 dark:text-emerald-400 font-bold group">
                           <Package className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm">إضافة منتج</span>
                        </button>
                        <button onClick={async () => { setAdminFabOpen(false); setNewPaymentMethodForm({ id: null, name: '', info: '', link: '', note: '', image: null, minDeposit: '', qrCode: null }); setAddPaymentMethodModal(true); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors gap-2 text-orange-700 dark:text-orange-400 font-bold group">
                           <CreditCard className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm">طريقة دفع</span>
                        </button>
                        <button onClick={async () => { setAdminFabOpen(false); setAdminView('banners'); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors gap-2 text-purple-700 dark:text-purple-400 font-bold group">
                           <ImageIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm">إضافة بانر</span>
                        </button>
                        <button onClick={async () => { props.setAdminFabOpen(false); props.setAdminView('fetch-provider'); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors gap-2 text-rose-700 dark:text-rose-400 font-bold group">
                           <RefreshCw className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm text-center">جلب منتج من المزود</span>
                        </button>
                        <button onClick={async () => { setAdminFabOpen(false); setAdminView('notifications'); }} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors gap-2 text-blue-700 dark:text-blue-400 font-bold col-span-2 group">
                           <Bell className="w-8 h-8 group-hover:scale-110 transition-transform" />
                           <span className="text-sm">إرسال إشعار</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Bottom Navigation Bar (Mobile) */}
                <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-white/10 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between px-2 py-2">
                    <button onClick={() => setAdminView('dashboard')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}>
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="text-[10px] font-bold">الرئيسية</span>
                    </button>
                    <button onClick={() => setAdminView('orders')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === 'orders' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}>
                      <ShoppingBag className="w-5 h-5" />
                      <span className="text-[10px] font-bold">الطلبات</span>
                    </button>
                    <button onClick={() => setAdminView('content')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === 'content' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}>
                      <Layers className="w-5 h-5" />
                      <span className="text-[10px] font-bold truncate max-w-full">الأقسام</span>
                    </button>
                    
                    <div className="relative -top-5 px-2">
                      <button 
                        onClick={() => setAdminFabOpen(true)} 
                        className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95 border-4 border-white dark:border-[#0f172a]"
                      >
                        <Plus className={`w-7 h-7 transition-transform ${adminFabOpen ? 'rotate-45' : ''}`} />
                      </button>
                    </div>
                    
                    


                    <button onClick={() => setAdminView('payments')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === 'payments' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}>
                      <Wallet className="w-5 h-5" />
                      <span className="text-[10px] font-bold truncate max-w-full">الدفعات</span>
                    </button>
                    
                    <button onClick={() => setAdminView('providers')} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === 'providers' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}>
                      <Server className="w-5 h-5" />
                      <span className="text-[10px] font-bold truncate max-w-full">مزودي API</span>
                    </button>
                    <button onClick={() => setAdminView("api_providers")} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === "api_providers" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-blue-500"}`}>
                      <Link2 className="w-5 h-5" />
                      <span className="text-[10px] font-bold truncate max-w-full">ربط API</span>
                    </button>
                    <button onClick={() => setAdminView("users")} className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-all ${adminView === 'users' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'}`}>
                      <Users className="w-5 h-5" />
                      <span className="text-[10px] font-bold truncate max-w-full">العملاء</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

{/* Edit Banner Modal */}
{editBannerModal.isOpen && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
      <button onClick={async () => {
            setEditBannerModal({isOpen: false, banner: null});
          }} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Edit className="w-5 h-5 text-blue-500" /> تعديل بيانات البانر
      </h3>
      <div className="space-y-4">
        <div>
           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الصورة الجديدة (اختياري)</label>
           <input type="file" accept="image/*" onChange={(e) => {
               const file = e.target.files?.[0];
               if(file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                     setEditBannerModal({ ...editBannerModal, banner: { ...editBannerModal.banner, image: reader.result } });
                  };
                  reader.readAsDataURL(file);
               }
           }} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
           {editBannerModal.banner?.image && <img src={editBannerModal.banner.image} className="mt-2 w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />}
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رابط التوجيه (اختياري)</label>
           <input type="url" value={editBannerModal.banner?.link || ''} onChange={(e) => {
              setEditBannerModal({ ...editBannerModal, banner: { ...editBannerModal.banner, link: e.target.value } });
           }} placeholder="https://..." className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-left" dir="ltr" />
        </div>
        <button onClick={async () => {
           if(!editBannerModal.banner?.image) {
              props.showNotification('error', 'يرجى اختيار صورة للبانر');
              return;
           }
           const newBanners = props.bannersConfig.map((b: any) => b.id === editBannerModal.banner.id ? editBannerModal.banner : b);
           props.setBannersConfig(newBanners);
           localStorage.setItem('bannersConfig', JSON.stringify(newBanners));
           saveSettingsDB({ bannersConfig: newBanners });
           props.showNotification('success', 'تم تعديل البانر بنجاح');
           setEditBannerModal({isOpen: false, banner: null});
        }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
           حفظ التعديلات
        </button>
      </div>
    </div>
  </div>
, document.body)}

{/* Banner Delete Confirm Modal */}
{bannerConfirmModal.isOpen && createPortal(
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تأكيد الحذف</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذا البانر نهائياً؟ سيتم إزالته من قاعدة البيانات والواجهة الرئيسية.</p>
      <div className="flex gap-3">
        <button onClick={async () => {
           const newBanners = props.bannersConfig.filter((bx: any) => bx.id !== bannerConfirmModal.bannerId);
           props.setBannersConfig(newBanners);
           localStorage.setItem('bannersConfig', JSON.stringify(newBanners));
           saveSettingsDB({ bannersConfig: newBanners });
           props.showNotification('success', 'تم حذف البانر بنجاح');
           setBannerConfirmModal({isOpen: false, bannerId: null});
        }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
          نعم، احذف
        </button>
        <button onClick={() => setBannerConfirmModal({isOpen: false, bannerId: null})} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          إلغاء
        </button>
      </div>
    </div>
  </div>
, document.body)}
{editSecurityModal.isOpen && createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
      <button onClick={() => setEditSecurityModal({...editSecurityModal, isOpen: false})} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-3">
        <Shield className="w-7 h-7 text-amber-500" />
        تعديل بيانات الأمان
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
          <input type="text" value={editSecurityModal.password} onChange={e => setEditSecurityModal({...editSecurityModal, password: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رمز الأمان (PIN)</label>
          <input type="text" value={editSecurityModal.pin} onChange={e => setEditSecurityModal({...editSecurityModal, pin: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" />
        </div>
        <button onClick={() => {
           const users = getSafeFakeUsers();
           const index = users.findIndex((u: any) => u.email === editSecurityModal.userEmail);
           if (index > -1) {
             users[index].password = editSecurityModal.password;
             users[index].pin = editSecurityModal.pin;
             localStorage.setItem('fake_users', JSON.stringify(users));
             if (editSecurityModal.userId) {
               updateUserDB(editSecurityModal.userId, { password: editSecurityModal.password, pin: editSecurityModal.pin }).catch(()=>{});
             }
             showNotification('success', 'تم تعديل بيانات الأمان بنجاح');
             setEditSecurityModal({ isOpen: false, userEmail: '', userId: '' });
           }
        }} className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30">
           حفظ التعديلات
        </button>
      </div>
    </div>
  </div>, document.body
)}

{sendUserNotificationModal.isOpen && createPortal(
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
      <button onClick={() => setSendUserNotificationModal({...sendUserNotificationModal, isOpen: false})} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors">
        <X className="w-5 h-5" />
      </button>
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-3">
        <Bell className="w-7 h-7 text-emerald-500" />
        إرسال إشعار
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">للمستخدم: {sendUserNotificationModal.userName}</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان الإشعار</label>
          <input type="text" value={sendUserNotificationModal.title} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نص الإشعار</label>
          <textarea value={sendUserNotificationModal.message} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, message: e.target.value})} className="w-full h-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الإشعار</label>
          <select value={sendUserNotificationModal.alertType} onChange={e => setSendUserNotificationModal({...sendUserNotificationModal, alertType: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
            <option value="normal">إشعار عادي (جرس الإشعارات)</option>
            <option value="popup">تنبيه قوي (شاشة منبثقة)</option>
          </select>
        </div>
        <button onClick={async () => {
           if (!sendUserNotificationModal.title || !sendUserNotificationModal.message) return showNotification('error', 'يرجى تعبئة الحقول');
           const newNotif = { title: sendUserNotificationModal.title, message: sendUserNotificationModal.message, date: new Date().toISOString(), read: false, type: 'personal', targetUser: sendUserNotificationModal.userEmail, alertType: sendUserNotificationModal.alertType };
           
           const api = apiModule;
           if (api.saveNotificationDB) {
             const saved = await api.saveNotificationDB(newNotif);
             if (saved) {
               showNotification('success', 'تم إرسال الإشعار بنجاح');
               setSendUserNotificationModal({ isOpen: false, userEmail: '', userId: '', userName: '', title: '', message: '', alertType: 'normal' });
             }
           }
        }} className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl mt-4 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30">
           إرسال الإشعار
        </button>
      </div>
    </div>
  </div>, document.body
)}
    </>
  );
};

export default AdminView;
