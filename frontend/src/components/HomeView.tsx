import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Share, Info, Shield, X, Layers, Image as ImageIcon, Copy, ArrowRight, ArrowLeft, ChevronLeft, User, ShoppingBag, ShoppingCart, Wallet, Loader2, CheckCircle, Clock, Heart, Package, AlertCircle, Box } from 'lucide-react';
import { Gamepad, Monitor, Smartphone, Headphones, Keyboard, Mouse, Cpu, Server, Network, Wifi, Battery, Speaker, Laptop, Tv, Tablet, Camera, Gamepad2 } from 'lucide-react';
const ICON_MAP: Record<string, any> = { Gamepad, Monitor, Smartphone, Headphones, Keyboard, Mouse, Cpu, Server, Network, Wifi, Battery, Speaker, Laptop, Tv, Tablet, Camera, Gamepad2, Layers, Box };

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent className={className} />;
};
import Marquee from './Marquee';
import HeroSlider from './HeroSlider';

const ProductCard = ({ prod, onClick, currencySymbol, products, isWishlisted, onToggleWishlist, showNotification, exchangeRate = 15000 }: any) => {
  const storeType = prod.storeType || 'normal';
  let basePrice = storeType === 'quantities' ? (prod.unitPriceUSD || prod.unitPrice || prod.price) : (prod.priceUSD || prod.price);
  let price = currencySymbol === 'SYP' ? basePrice * exchangeRate : basePrice;
  
  const isInactive = prod.status === 'Inactive' || prod.status === 'معطل';
  
  const handleClick = () => {
    if (isInactive) {
      if (showNotification) showNotification('error', 'المنتج غير متاح في الوقت الحالي');
    } else {
      onClick();
    }
  };

  return (
    <div onClick={handleClick} className={`bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border ${isInactive ? 'border-red-200 dark:border-red-900/50 opacity-75' : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/50'} flex items-center gap-4 cursor-pointer transition-colors relative`}>
      {prod.image ? (
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
          {isInactive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-2xl">😔</div>}
        </div>
      ) : (
        <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-gray-800 flex items-center justify-center shrink-0 relative">
          <Package className="w-8 h-8 text-blue-500 dark:text-gray-400" />
          {isInactive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-2xl rounded-xl">😔</div>}
        </div>
      )}
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{prod.name}</h4>
        {prod.desc && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{prod.desc}</p>}
        <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">{Number(price).toFixed(2)} {currencySymbol}</div>
      </div>
    </div>
  );
};

const ModalWrapper = ({ selectedProductId, products, currentUser, currencySymbol, orderForm, setOrderForm, handleProductSelect, handlePurchase, isTransitioning, exchangeRate = 15000 }: any) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
        setTimeout(() => {
            document.activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        setIsKeyboardOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    if (selectedProductId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, [selectedProductId]);

  const allCategoryProducts = Object.values(products).find((catProds: any) => catProds.some((p: any) => p.id === selectedProductId)) as any[] || [];
  const prod = allCategoryProducts.find((p: any) => p.id === selectedProductId);
  
  if (!prod) return null;

  const storeType = prod.storeType || 'normal';

  
  const reqInput = prod.requiredInput || 'id';
  const inputLabel = reqInput === 'email_password' ? 'البريد الإلكتروني' : reqInput === 'link' ? 'الرابط' : 'معلومات اللاعب (ID)';

  


  const playerIdVal = orderForm.playerId?.trim() || "";
  let isPlayerIdValid = false;
  let playerIdError = "";
  
  if (playerIdVal.length === 0) {
    isPlayerIdValid = false;
  } else if (reqInput === 'id') {
    if (!/^[0-9\s]+$/.test(playerIdVal)) {
      playerIdError = "يجب أن يحتوي الآيدي على أرقام فقط";
    } else if (playerIdVal.replace(/\s/g, '').length < 5) {
      playerIdError = "يجب أن يتكون الآيدي من 5 أرقام على الأقل";
    } else {
      isPlayerIdValid = true;
    }
  } else if (reqInput === 'link') {
    if (playerIdVal.length < 5 || !playerIdVal.includes('.')) {
      playerIdError = "الرجاء إدخال رابط صحيح";
    } else {
      isPlayerIdValid = true;
    }
  } else if (reqInput === 'email_password') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(playerIdVal)) {
      playerIdError = "الرجاء إدخال بريد إلكتروني صحيح";
    } else {
      isPlayerIdValid = true;
    }
  } else {
    isPlayerIdValid = playerIdVal.length >= 3;
    if (!isPlayerIdValid) playerIdError = "يجب إدخال 3 أحرف على الأقل";
  }

  const passwordVal = orderForm.playerPassword?.trim() || "";
  let isPasswordValid = true;
  let passwordError = "";
  if (reqInput === 'email_password') {
    if (passwordVal.length < 6) {
      isPasswordValid = false;
      if (passwordVal.length > 0) passwordError = "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل";
    }
  }

  const isFormValid = isPlayerIdValid && isPasswordValid && !isTransitioning;


  let usdPrice = (prod.priceUSD || prod.price).toString();
  let calculatedPrice = ((prod.priceUSD || prod.price || 0) * (currentUser?.currency === 'SYP' ? exchangeRate : 1)).toString();

  if (storeType === 'quantities') {
    usdPrice = ((orderForm.quantity || Number(prod.minQty)) * Number(prod.unitPriceUSD || prod.unitPrice)).toFixed(3);
    let baseUnitPrice = (prod.unitPriceUSD || prod.unitPrice || prod.price || 0);
    calculatedPrice = ((orderForm.quantity || Number(prod.minQty)) * (currentUser?.currency === 'SYP' ? baseUnitPrice * exchangeRate : baseUnitPrice)).toFixed(3);
  } else {
    usdPrice = Number(prod.priceUSD || prod.price).toFixed(3);
    let basePrice = (prod.priceUSD || prod.price || 0);
    calculatedPrice = Number(currentUser?.currency === 'SYP' ? basePrice * exchangeRate : basePrice).toFixed(3);
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0F172A]/90 backdrop-blur-md"
        onClick={() => !isTransitioning && handleProductSelect(null)}
      >
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full sm:h-auto sm:max-h-[90dvh] sm:max-w-lg bg-[#0F172A] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-[#1E293B]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1E293B] shrink-0 bg-[#0F172A]/80 backdrop-blur-xl z-10 sticky top-0">
             <button 
               onClick={() => handleProductSelect(null)}
               className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#38BDF8]/20 transition-colors"
             >
               <ChevronLeft className="w-6 h-6" />
             </button>
             <h2 className="text-lg font-bold text-white tracking-wide truncate max-w-[200px]">{prod.name}</h2>
             <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8 relative">
            
            {/* Product Image & Info */}
            <div className="flex flex-col items-center justify-center gap-4">
               <motion.div 
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.1, type: "spring" }}
                 className="w-24 h-24 rounded-2xl bg-[#1E293B] flex items-center justify-center shadow-lg shadow-[#22C55E]/10 border border-[#22C55E]/20 overflow-hidden relative group"
               >
                 {prod.image ? (
                    <img src={prod.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={prod.name} />
                 ) : (
                    <ShoppingBag className="w-10 h-10 text-[#22C55E]" />
                 )}
               </motion.div>
               
               <div className="text-center">
                 <motion.h3 
                   initial={{ y: 10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.15 }}
                   className="text-xl font-bold text-white mb-1"
                 >
                   {prod.name}
                 </motion.h3>
                 {prod.desc && (
                   <motion.p 
                     initial={{ y: 10, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="text-sm text-[#94A3B8]"
                   >
                     {prod.desc}
                   </motion.p>
                 )}
               </div>
            </div>

            {/* Input Fields */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#94A3B8] px-1">{inputLabel}</label>
                <div className="relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={orderForm.playerId || ""}
                    onChange={(e) => setOrderForm({...orderForm, playerId: e.target.value})}
                    className={`w-full bg-[#1E293B] border rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-1 text-white placeholder-[#94A3B8]/50 transition-all shadow-inner ${orderForm.playerId && !isPlayerIdValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500 mb-6' : 'border-[#1E293B] focus:border-[#38BDF8] focus:ring-[#38BDF8] group-hover:border-[#38BDF8]/50'}`}
                    placeholder={`أدخل ${inputLabel} هنا`}
                  />
                  {orderForm.playerId && !isPlayerIdValid && <p className="text-red-500 text-xs mt-2 absolute -bottom-6 right-2">{playerIdError}</p>}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 group-focus-within:text-[#38BDF8] transition-opacity">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {reqInput === 'email_password' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#94A3B8] px-1">كلمة المرور</label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={orderForm.playerPassword || ""}
                      onChange={(e) => setOrderForm({...orderForm, playerPassword: e.target.value})}
                      className={`w-full bg-[#1E293B] border rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-1 text-white placeholder-[#94A3B8]/50 transition-all shadow-inner ${orderForm.playerPassword && !isPasswordValid ? 'border-red-500 focus:border-red-500 focus:ring-red-500 mb-6' : 'border-[#1E293B] focus:border-[#38BDF8] focus:ring-[#38BDF8] group-hover:border-[#38BDF8]/50'}`}
                      placeholder="أدخل كلمة المرور"
                    />
                    {orderForm.playerPassword && !isPasswordValid && <p className="text-red-500 text-xs mt-2 absolute -bottom-6 right-2">{passwordError}</p>}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Package Selector */}
            {storeType === 'normal' && allCategoryProducts.length > 1 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-1.5 relative"
              >
                <label className="text-sm font-medium text-[#94A3B8] px-1">اختر الباقة</label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8]/50 rounded-2xl px-5 py-4 flex items-center justify-between transition-all group shadow-sm"
                >
                  <span className="font-bold text-white">{prod.name}</span>
                  <ChevronLeft className={`w-5 h-5 text-[#94A3B8] transition-transform duration-300 ${isDropdownOpen ? '-rotate-90' : 'rotate-180'}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 top-[100%] left-0 right-0 mt-2 bg-[#1E293B]/95 backdrop-blur-xl border border-[#38BDF8]/20 rounded-2xl shadow-xl shadow-[#0F172A]/50 overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col p-2">
                        {allCategoryProducts.map(p => (
                          <button
                            key={p.id}
                            onClick={() => { handleProductSelect(p.id); setIsDropdownOpen(false); }}
                            className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between ${p.id === selectedProductId ? 'bg-[#38BDF8]/10 text-[#38BDF8] font-bold' : 'text-white hover:bg-[#0F172A]'}`}
                          >
                            <span>{p.name}</span>
                            <span className="text-sm font-mono opacity-80">${Number(p.priceUSD || p.price).toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Quantities Selector */}
            {storeType === 'quantities' && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-medium text-[#94A3B8]">الكمية</label>
                  <span className="text-xs font-bold text-[#38BDF8]">
                    سعر الواحدة: ${Number(prod.unitPriceUSD || prod.unitPrice).toFixed(3)}
                    {currentUser?.currency === 'SYP' && ` (~ ${Number((prod.unitPriceUSD || prod.unitPrice || prod.price) * exchangeRate).toFixed(0)} ${currencySymbol})`}
                  </span>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    min={prod.minQty}
                    max={prod.maxQty}
                    value={orderForm.quantity || 1}
                    onChange={(e) => setOrderForm({...orderForm, quantity: Math.max(Number(prod.minQty), Math.min(Number(prod.maxQty), Number(e.target.value)))})}
                    className="w-full bg-[#1E293B] border border-[#1E293B] rounded-2xl px-5 py-4 text-center text-lg font-bold focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-white transition-all shadow-inner"
                  />
                </div>
              </motion.div>
            )}
            
            {/* Price Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-r from-[#1E293B] to-[#1E293B]/80 rounded-2xl p-5 border border-white/5 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">السعر الإجمالي</span>
                  <div className="flex items-baseline gap-2">
                    <motion.span 
                      key={usdPrice}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-black text-white"
                    >
                      ${parseFloat(usdPrice).toString()}
                    </motion.span>
                    {currentUser?.currency === 'SYP' && (
                      <motion.span 
                        key={calculatedPrice}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-bold text-[#22C55E]"
                      >
                        ~ {parseFloat(calculatedPrice).toString()} {currencySymbol}
                      </motion.span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#0F172A]/50 flex items-center justify-center border border-white/5">
                  <Wallet className="w-6 h-6 text-[#22C55E]" />
                </div>
              </div>
            </motion.div>

            {/* Description / Notes */}
            {prod.description && prod.description.trim() !== '' && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-[#38BDF8]/5 border border-[#38BDF8]/20 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5" />
                <div 
                  className="text-xs text-[#38BDF8]/80 leading-relaxed product-notes-html space-y-1"
                  dangerouslySetInnerHTML={{ __html: prod.description }}
                />
              </motion.div>
            )}

            {/* Bottom Padding for floating button */}
            <div className="h-24 sm:h-0 shrink-0"></div>

          </div>

          {/* Purchase Button - Floating on mobile, fixed at bottom on desktop */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="fixed sm:relative bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/95 to-transparent sm:bg-none sm:border-t sm:border-[#1E293B] shrink-0 z-20"
          >
            <button
              onClick={handlePurchase}
              disabled={!isFormValid}
              className="w-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] active:scale-[0.98] text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isTransitioning ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    جاري التنفيذ...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    شراء الآن
                  </>
                )}
              </span>
            </button>
          </motion.div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};


interface HomeViewProps {
  currentView: string;
  marqueeText: string;
  bannersConfig: any;
  setTouchEndBanner: any;
  setTouchStartBanner: any;
  setCurrentBannerIndex: any;
  touchStartBanner: any;
  touchEndBanner: any;
  currentBannerIndex: any;
  categories: any;
  selectedCategoryId: any;
  subCategories: any;
  selectedSubCategoryId: any;
  subSubCategories: any;
  products: any;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
  selectedProductId: any;
  handleViewChange: any;
  isAuthenticated: any;
  setSelectedCategoryId: any;
  setSelectedSubCategoryId: any;
  setSelectedProductId: any;
  searchQuery: any;
  setSearchQuery: any;
  filteredCategories: any;
  orderForm: any;
  setOrderForm: any;
  handlePurchase: any;
  isTransitioning: any;
  currentUser: any;
  currencySymbol: any;
  handleCategorySelect: any;
  handleSubCategorySelect: any;
  handleSubSubCategorySelect: any;
  handleProductSelect: any;
  selectedSubSubCategoryId: any;
  showNotification?: any;
  exchangeRate?: number;
}


const HomeView: React.FC<HomeViewProps> = ({
  currentView, marqueeText, bannersConfig, setTouchEndBanner, setTouchStartBanner, setCurrentBannerIndex,
  touchStartBanner, touchEndBanner, currentBannerIndex, categories, selectedCategoryId, subCategories,
  selectedSubCategoryId, subSubCategories, products, selectedProductId, handleViewChange, isAuthenticated, wishlist = [], onToggleWishlist,
  setSelectedCategoryId, setSelectedSubCategoryId, setSelectedProductId, searchQuery, setSearchQuery,
  filteredCategories, orderForm,
  setOrderForm, handlePurchase, isTransitioning, currentUser, currencySymbol,
  handleCategorySelect, handleSubCategorySelect, handleSubSubCategorySelect, handleProductSelect,
  selectedSubSubCategoryId, showNotification, exchangeRate
}) => {

  return (
    <>
      <div className="flex flex-col gap-6 mt-2 pb-8">
        {/* Moving Ticker */}
        <Marquee text={marqueeText} />
        {/* Main Banner */}
        <HeroSlider banners={bannersConfig} />
        
  
        
        <div className="relative">
          {selectedCategoryId === null ? (
            <div key="categories">
              {/* Search Bar */}
              <div className="relative mt-1">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-300 dark:text-gray-700" />
                </div>
                <input
                  type="text"
                  value={searchQuery || ""}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن الخدمات أو الأقسام..."
                  className="w-full bg-gray-100/80 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-900 shadow-[inset_0px_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[inset_0px_4px_10px_rgba(0,0,0,0.4)] rounded-2xl py-3.5 pr-12 pl-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" />
                  </button>
                )}
              </div>

              {/* Grid of Categories */}
              <div className="mt-6">
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {filteredCategories.map((category: any) => (
                    <div 
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div className="w-full aspect-square bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-[1.03] active:scale-95 relative overflow-hidden group-hover:border-blue-400 dark:group-hover:border-blue-600">
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                        {category.image ? (
                          <img src={category.image} className="absolute inset-0 w-full h-full object-cover rounded-2xl z-0" alt={category.name} />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 z-20">
                            <DynamicIcon name={category.icon || 'Layers'} className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 text-center leading-tight px-1 w-full truncate">{category.name}</span>
                    </div>
                  ))}
                </div>
              ) : categories.length === 0 && !searchQuery ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                  {[1,2,3,4,5,6].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                       <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mt-1"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <Search className="w-10 h-10 mx-auto mb-2 opacity-50 text-gray-400 dark:text-gray-500" />
                  <p>لا توجد نتائج</p>
                </div>
              )}
              </div>
            </div>
          ) : selectedSubCategoryId === null ? (
            <div key="subcategories" className="mt-2">
              <button onClick={() => handleCategorySelect(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4 hover:text-gray-900 dark:hover:text-white transition-colors">
                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full"><ArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" /></div>
                <span className="font-bold text-sm">العودة للرئيسية</span>
              </button>
              
              {isTransitioning ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 w-full">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex flex-col items-center gap-2">
                       <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                       <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mt-1"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 text-center">
                    {categories.find((c: any) => c.id === selectedCategoryId)?.name}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {(subCategories[selectedCategoryId] || []).map((subCat: any) => (
                      <div 
                        key={subCat.id} 
                        onClick={() => handleSubCategorySelect(subCat.id)} 
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                      >
                        <div className="w-full aspect-square bg-transparent border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-[1.03] active:scale-95 relative overflow-hidden group-hover:border-blue-400 dark:group-hover:border-blue-600">
                          <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                          {subCat.image ? (
                            <img src={subCat.image} className="absolute inset-0 w-full h-full object-cover rounded-2xl z-0" alt={subCat.name} />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 z-20">
                              <DynamicIcon name={subCat.icon || 'Box'} className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 text-center leading-tight px-1 w-full truncate">{subCat.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Products directly under Main Category */}
                  {(products[selectedCategoryId] || []).length > 0 && (
                    <div className="mt-8">
                       <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 text-center">الخدمات المتاحة</h3>
                       <div className="flex flex-col gap-3">
                         {(products[selectedCategoryId] || []).map((prod: any) => (
                           <ProductCard 
     key={prod._id || prod.id}
     prod={prod}
     onClick={() => handleProductSelect(prod._id || prod.id)}
     currencySymbol={currencySymbol}
     products={products}
     isWishlisted={wishlist?.includes(prod._id || prod.id)}
     onToggleWishlist={onToggleWishlist}
     showNotification={showNotification}
     exchangeRate={exchangeRate}
   />
                         ))}
                       </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div key="products" className="mt-2">
              <button onClick={() => handleSubCategorySelect(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4 hover:text-gray-900 dark:hover:text-white transition-colors">
                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full"><ArrowRight className="w-5 h-5 text-gray-700 dark:text-gray-300" /></div>
                <span className="font-bold text-sm">العودة للأقسام الفرعية</span>
              </button>
              
              {isTransitioning ? (
                <div className="flex flex-col gap-3 mt-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-full h-24 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Nested Subcategories (if any) */}
                  {(subSubCategories[selectedSubCategoryId] || []).length > 0 && (
                    <div className="mb-6">
                      <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2 snap-x">
                        {(subSubCategories[selectedSubCategoryId] || []).map((ss: any) => (
                          <div 
                            key={ss.id} 
                            onClick={() => handleSubSubCategorySelect(ss.id === selectedSubSubCategoryId ? null : ss.id)}
                            className={"flex items-center gap-2 px-5 py-2.5 rounded-full border whitespace-nowrap cursor-pointer transition-all duration-300 snap-center shrink-0 shadow-sm " + 
                              (selectedSubSubCategoryId === ss.id 
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-lg shadow-blue-500/30 transform scale-105" 
                                : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700")}
                          >
                            {ss.image && <img src={ss.image} className="w-6 h-6 rounded-md object-cover" alt={ss.name} />}
                            <span className="font-bold text-sm">{ss.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Form instead of Grid */}
                  <div className="w-full">
                    {(() => {
                       const targetId = selectedSubSubCategoryId || selectedSubCategoryId;
                       const prods = (products[targetId] || []);
                       const ssubcount = !selectedSubSubCategoryId ? (subSubCategories[selectedSubCategoryId] || []).length : 0;
                       
                       if(prods.length === 0 && ssubcount === 0) {
                         return (
                           <div className="w-full text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                             لا يوجد باقات حالياً
                           </div>
                         );
                       }
                       
                       if (prods.length > 0) {
                         return (
                           <>
                             <div className="flex flex-col gap-3">
                               {prods.map((prod: any) => (
                                 <ProductCard 
     key={prod._id || prod.id}
     prod={prod}
     onClick={() => handleProductSelect(prod._id || prod.id)}
     currencySymbol={currencySymbol}
     products={products}
     isWishlisted={wishlist?.includes(prod._id || prod.id)}
     onToggleWishlist={onToggleWishlist}
     showNotification={showNotification}
     exchangeRate={exchangeRate}
   />
                               ))}
                             </div>
                             <ModalWrapper 
                               prods={prods}
                               selectedProductId={selectedProductId}
                               currentUser={currentUser}
                               currencySymbol={currencySymbol}
                               orderForm={orderForm}
                               setOrderForm={setOrderForm}
                               handleProductSelect={handleProductSelect}
                               handlePurchase={handlePurchase}
                               isTransitioning={isTransitioning}
                               products={products}
                               exchangeRate={exchangeRate}
                             />
                           </>
                         );
                       }
                       
                       return null;
                    })()}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <a 
          href="https://wa.me/0984319579" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-12 mb-8 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-400 dark:hover:text-slate-300 transition-colors w-full"
        >
          <span className="text-yellow-400 text-2xl font-black leading-none pt-0.5">»</span>
          <span className="font-medium text-sm tracking-wide">برمجة ضياء الحوامده</span>
          <span className="text-yellow-400 text-2xl font-black leading-none pt-0.5">«</span>
        </a>
      </div>
    </>
  );
};

export default HomeView;
