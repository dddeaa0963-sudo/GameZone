import React, { useState, useEffect } from 'react';
import { Server, Layers, RefreshCw, X, Package } from 'lucide-react';

export const FetchProviderView: React.FC<{showNotification: (type: string, message: string) => void}> = ({showNotification}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('eshhanle');
  const [apiBalance, setApiBalance] = useState<string | null>(null);
  const [apiBalanceLoading, setApiBalanceLoading] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [providerProductsList, setProviderProductsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('providerProductsList');
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('providerProductsList', JSON.stringify(providerProductsList));
  }, [providerProductsList]);
  const [selectedProviderCategory, setSelectedProviderCategory] = useState('');
  
  const [fetchProviderConfig, setFetchProviderConfig] = useState(() => {
    const saved = localStorage.getItem('fetchProviderConfig');
    if (saved) return JSON.parse(saved);
    return {
    categoryId: '',
    profitMargin: '0',
    productNamePrefix: '',
    inputType: 'id',
    marginType: 'fixed',
    storeType: 'normal',
    minQty: 1,
    maxQty: 1000
    };
  });

  // Save to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('fetchProviderConfig', JSON.stringify(fetchProviderConfig));
  }, [fetchProviderConfig]);

  

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Build hierarchical categories for better display
        const mainCats = data.filter(c => !c.parent);
        const result = [];
        mainCats.forEach(main => {
            result.push({ ...main, displayName: main.name });
            const subs = data.filter(c => String(c.parent) === String(main._id));
            subs.forEach(sub => {
                result.push({ ...sub, displayName: `${main.name} > ${sub.name}` });
                const subSubs = data.filter(c => String(c.parent) === String(sub._id));
                subSubs.forEach(ss => {
                    result.push({ ...ss, displayName: `${main.name} > ${sub.name} > ${ss.name}` });
                });
            });
        });
        setCategories(result);
      } else {
        setCategories([]);
      }
    } catch (e) {}
  };

  const fetchApiBalance = async () => {
    setApiBalanceLoading(true);
    try {
      const res = await fetch(`/api/provider/balance?provider=${selectedProvider}`);
      const data = await res.json();
      setApiBalance(data.balance);
    } catch (e) {
      setApiBalance(null);
    } finally {
      setApiBalanceLoading(false);
    }
  };

  const handleFetchProviderProducts = async () => {
    setIsFetchingProducts(true);
    try {
      const res = await fetch(`/api/provider/products?provider=${selectedProvider}`);
      if (res.ok) {
        const data = await res.json();
        const pData = data.data; 
        setProviderProductsList(Array.isArray(pData) ? pData : (pData?.products || pData?.data || pData?.response || []));
      } else {
        const errData = await res.json().catch(() => ({}));
        showNotification('error', errData.error ? 'فشل جلب المنتجات: ' + errData.error : 'فشل جلب المنتجات من المزود');
      }
    } catch (e: any) {
      showNotification('error', 'حدث خطأ في الاتصال: ' + e.message);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const handleAddProduct = async (prod: any) => {
    if (!fetchProviderConfig.categoryId) {
      showNotification('error', 'يرجى اختيار القسم أولاً');
      return;
    }
    const basePrice = parseFloat(prod.price) || 0;
    const profit = parseFloat(fetchProviderConfig.profitMargin) || 0;
    const finalPrice = fetchProviderConfig.marginType === 'percentage' 
      ? basePrice + (basePrice * profit / 100) 
      : basePrice + profit;
    const productName = fetchProviderConfig.productNamePrefix ? `${fetchProviderConfig.productNamePrefix} - ${prod.name}` : prod.name;
    
    const newProd = {
      name: productName,
      category: fetchProviderConfig.categoryId,
      price: finalPrice,
      originalPrice: finalPrice,
      stock: 9999,
      status: 'Active',
            apiMapping: prod.id.toString(),
      requiredInput: fetchProviderConfig.inputType,
      image: prod.category_img || 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=200&fit=crop',
      storeType: fetchProviderConfig.storeType,
      ...(fetchProviderConfig.storeType === 'quantities' ? {
        unitPrice: finalPrice,
        unitPriceUSD: finalPrice,
        unitPriceSYP: finalPrice,
        minQty: parseInt(fetchProviderConfig.minQty as any) || 1,
        maxQty: parseInt(fetchProviderConfig.maxQty as any) || 1000,
      } : {})
    };
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        showNotification('success', `تم إضافة ${productName} بنجاح`);
      } else {
        const err = await res.json();
        showNotification('error', 'فشل إضافة المنتج: ' + (err.message || ''));
      }
    } catch (err) {
      showNotification('error', 'فشل إضافة المنتج');
    }
  };

  
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchApiBalance();
    setProviderProductsList([]);
    setSelectedProviderCategory('');
    handleFetchProviderProducts();
  }, [selectedProvider]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
        <Server className="w-6 h-6 text-rose-500" /> جلب منتجات من المزود (API)
      </h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Server className="w-6 h-6 text-indigo-500" />
          اختيار المزود
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedProvider('eshhanle')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${selectedProvider === 'eshhanle' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Eshhanle
          </button>
          <button
            onClick={() => setSelectedProvider('alragheb')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all border-2 ${selectedProvider === 'alragheb' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Alragheb Store
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl mb-6 text-sm leading-relaxed border border-blue-100 dark:border-blue-800/30">
          <p className="font-bold mb-2 flex items-center gap-2"><Layers className="w-4 h-4" /> تعليمات هامة:</p>
          <ul className="list-disc list-inside space-y-1 pr-2">
            <li>اختر القسم الذي تريد إضافة المنتجات إليه في متجرك.</li>
            <li>حدد هامش الربح الإضافي (بالدولار) ليتم إضافته على سعر المزود.</li>
            <li>سيتم جلب جميع المنتجات المتاحة من المزود لتختار منها.</li>
          </ul>
        </div>

        {/* API Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
              <img src="https://eshhanle.com/images/logo.png" alt="Eshhanle" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Eshhanle&background=f43f5e&color=fff'; }} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">Eshhanle API</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">مزود الخدمات</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">رصيد الحساب</div>
              {apiBalanceLoading ? (
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ) : (
                <div className="font-mono font-bold text-green-600 dark:text-green-400" dir="ltr">{apiBalance} $</div>
              )}
            </div>
            <button onClick={fetchApiBalance} disabled={apiBalanceLoading} className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors">
              <RefreshCw className={`w-5 h-5 ${apiBalanceLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Configurations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">القسم</label>
            <select 
              value={fetchProviderConfig.categoryId}
              onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, categoryId: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">-- اختر القسم --</option>
              {categories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.displayName || cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">هامش الربح ($)</label>
            <input 
              type="number"
              step="0.01"
              min="0"
              placeholder="مثال: 0.50"
              value={fetchProviderConfig.profitMargin}
              onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, profitMargin: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع هامش الربح</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="marginType" 
                  value="fixed" 
                  checked={fetchProviderConfig.marginType === 'fixed' || !fetchProviderConfig.marginType} 
                  onChange={() => setFetchProviderConfig({ ...fetchProviderConfig, marginType: 'fixed' })} 
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-bold">مبلغ ثابت</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="marginType" 
                  value="percentage" 
                  checked={fetchProviderConfig.marginType === 'percentage'} 
                  onChange={() => setFetchProviderConfig({ ...fetchProviderConfig, marginType: 'percentage' })} 
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm font-bold">نسبة مئوية (%)</span>
              </label>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع المتجر للخدمات المستوردة</label>
            <select 
              value={fetchProviderConfig.storeType || 'normal'} 
              onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, storeType: e.target.value })} 
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            >
              <option value="normal">عادي</option>
              <option value="quantities">كميات (إدخال كمية)</option>
            </select>
          </div>

          {(fetchProviderConfig.storeType === 'quantities') && (
            <>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">أقل كمية</label>
                <input 
                  type="number" 
                  value={fetchProviderConfig.minQty || 1} 
                  onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, minQty: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">أكثر كمية</label>
                <input 
                  type="number" 
                  value={fetchProviderConfig.maxQty || 1000} 
                  onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, maxQty: e.target.value })} 
                  className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نوع حقل الإدخال المطلوب للطلب</label>
            <select 
              value={fetchProviderConfig.inputType} 
              onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, inputType: e.target.value })} 
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="id">معلومات اللاعب (ID)</option>
              <option value="phone">رقم الهاتف</option>
              <option value="email_password">البريد الإلكتروني وكلمة السر</option>
              <option value="link">الرابط</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">بادئة اسم المنتج (اختياري)</label>
            <input 
              type="text"
              placeholder="إذا تُرك فارغاً سيتم استخدام اسم المزود"
              value={fetchProviderConfig.productNamePrefix}
              onChange={(e) => setFetchProviderConfig({ ...fetchProviderConfig, productNamePrefix: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button 
            onClick={handleFetchProviderProducts}
            disabled={isFetchingProducts}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 shadow-lg shadow-rose-600/30"
          >
            {isFetchingProducts ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
            جلب المنتجات
          </button>
        </div>

        {providerProductsList.length > 0 && (
          <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
            {!selectedProviderCategory ? (
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">اختر القسم الخاص بالمزود لتصفح المنتجات</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from(new Map(providerProductsList.map(p => [p.category_name, {name: p.category_name, img: p.category_img}])).values()).filter((c: any) => c.name).map((cat: any, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedProviderCategory(cat.name)}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-rose-500 hover:shadow-lg hover:-translate-y-1 transition-all bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white dark:bg-gray-700 overflow-hidden shrink-0 shadow-sm">
                        {cat.img ? (
                          <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Layers className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 text-center line-clamp-2 w-full">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-rose-500" />
                    منتجات قسم: {selectedProviderCategory}
                  </h4>
                  <button
                    onClick={() => setSelectedProviderCategory('')}
                    className="text-xs md:text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl transition-colors shadow-sm hover:shadow-md"
                  >
                    العودة للأقسام
                  </button>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-right text-sm text-gray-700 dark:text-gray-300">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 text-gray-900 dark:text-white backdrop-blur-sm">
                        <tr>
                          <th className="px-4 py-3 font-bold border-b border-gray-200 dark:border-gray-700">الصورة</th>
                          <th className="px-4 py-3 font-bold border-b border-gray-200 dark:border-gray-700">المنتج</th>
                          <th className="px-4 py-3 font-bold border-b border-gray-200 dark:border-gray-700">سعر المزود</th>
                          <th className="px-4 py-3 font-bold border-b border-gray-200 dark:border-gray-700">السعر النهائي</th>
                          <th className="px-4 py-3 font-bold border-b border-gray-200 dark:border-gray-700 text-center">إضافة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providerProductsList
                          .filter(prod => prod.category_name === selectedProviderCategory)
                          .map((prod: any, idx: number) => {
                            const basePrice = parseFloat(prod.price) || 0;
                            const profit = parseFloat(fetchProviderConfig.profitMargin) || 0;
                            const finalPriceNum = fetchProviderConfig.marginType === 'percentage' 
                              ? basePrice + (basePrice * profit / 100) 
                              : basePrice + profit;
                            const finalPrice = finalPriceNum.toFixed(2);
                            return (
                              <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                                    {prod.category_img ? <img src={prod.category_img} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-2.5 text-gray-400" />}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{prod.name}</td>
                                <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400 font-mono" dir="ltr">{basePrice.toFixed(4)} $</td>
                                <td className="px-4 py-3 font-bold text-green-600 dark:text-green-400 font-mono" dir="ltr">{finalPrice} $</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    onClick={() => handleAddProduct(prod)}
                                    className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-900/30 dark:hover:bg-indigo-600 dark:text-indigo-400 dark:hover:text-white py-2 px-4 rounded-xl font-bold text-xs transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                                  >
                                    إضافة المنتج
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
