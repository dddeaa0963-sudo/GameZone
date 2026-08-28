import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, Package, Image as ImageIcon, Layers, X } from 'lucide-react';

export const CategoryManager = ({ showNotification }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({isOpen: false, title: '', message: '', action: () => {}});
  
  const [selectedMain, setSelectedMain] = useState<any>(null);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [selectedSubSub, setSelectedSubSub] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        fetch('/api/categories?t=' + new Date().getTime()),
        fetch('/api/products?t=' + new Date().getTime())
      ]);
      const cats = await cRes.json();
      const prods = await pRes.json();
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      setCategories([]);
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
    window.addEventListener('REFRESH_ADMIN_DATA', fetchData);
    return () => window.removeEventListener('REFRESH_ADMIN_DATA', fetchData);
  }, []);

  const handleSaveCategory = async (catData: any) => {
    try {
      const url = catData._id ? `/api/categories/${catData._id}` : '/api/categories';
      const method = catData._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      if(res.ok) {
        showNotification('success', 'تم الحفظ بنجاح');
        fetchData();
        setTimeout(() => window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DATA')), 500);
      } else {
        showNotification('error', 'حدث خطأ أثناء الحفظ');
      }
    } catch(e) {
      showNotification('error', 'حدث خطأ');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذا القسم؟ سيتم حذفه من قاعدة البيانات وواجهة المستخدم.',
      action: async () => {
        try {
          await fetch(`/api/categories/${id}`, { method: 'DELETE' });
          fetchData();
          if(selectedMain?._id === id) setSelectedMain(null);
          if(selectedSub?._id === id) setSelectedSub(null);
          if(selectedSubSub?._id === id) setSelectedSubSub(null);
          showNotification('success', 'تم حذف القسم بنجاح');
        setTimeout(() => window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DATA')), 500);
        } catch(e) {
          showNotification('error', 'حدث خطأ أثناء الحذف');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleSaveProduct = async (prodData: any) => {
    try {
      const url = prodData._id ? `/api/products/${prodData._id}` : '/api/products';
      const method = prodData._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData)
      });
      if(res.ok) {
        showNotification('success', 'تم حفظ المنتج بنجاح');
        fetchData();
        setTimeout(() => window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DATA')), 500);
      } else {
        showNotification('error', 'حدث خطأ أثناء الحفظ');
      }
    } catch(e) { showNotification('error', 'حدث خطأ'); }
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذا المنتج؟ سيتم حذفه من قاعدة البيانات وواجهة المستخدم.',
      action: async () => {
        try {
          await fetch(`/api/products/${id}`, { method: 'DELETE' });
          fetchData();
          showNotification('success', 'تم حذف المنتج بنجاح');
        setTimeout(() => window.dispatchEvent(new CustomEvent('REFRESH_ADMIN_DATA')), 500);
        } catch(e) {
          showNotification('error', 'حدث خطأ أثناء الحذف');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const getParentId = (p: any) => p && typeof p === 'object' ? p._id || p.id : p;
  
  const mainCats = (categories || []).filter(c => !c.parent);
  const subCats = selectedMain ? (categories || []).filter(c => getParentId(c.parent) === selectedMain._id) : [];
  const subSubCats = selectedSub ? (categories || []).filter(c => getParentId(c.parent) === selectedSub._id) : [];
  
  const activeCategoryId = selectedSubSub?._id || selectedSub?._id || selectedMain?._id;
  const currentLevelProducts = activeCategoryId ? (products || []).filter(p => getParentId(p.category) === activeCategoryId) : [];

  const [modalData, setModalData] = useState<any>(null);

  const openCategoryModal = (parent: any, editData?: any) => {
    setModalData({
      type: 'category',
      data: editData || { name: '', image: '', isActive: true, parent: parent?._id || null }
    });
  };

  const openProductModal = (category: any, editData?: any) => {
    if(!category) {
      showNotification('error', 'يرجى تحديد قسم أولاً');
      return;
    }
    setModalData({
      type: 'product',
      data: editData || { 
        name: '', price: 0, stock: 999, status: 'Active', 
        category: category._id, 
        storeType: 'normal', requiredInput: 'id',
        minQty: 1, maxQty: 1000
      }
    });
  };

  const Modal = () => {
    const isCat = modalData?.type === 'category';
    const [form, setForm] = useState(modalData?.data || {});
    
    useEffect(() => {
      if (modalData?.data) {
        setForm(modalData.data);
      }
    }, [modalData]);

    if(!modalData) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-bold">{form._id ? 'تعديل' : 'إضافة'} {isCat ? 'قسم' : 'منتج'}</h3>
             <button onClick={() => setModalData(null)}><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold">الاسم</label>
                {!isCat && form._id && (
                  <span className={`text-xs px-2 py-1 rounded-md font-bold ${form.apiMapping ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {form.apiMapping ? 'منتج مستورد' : 'منتج يدوي'}
                  </span>
                )}
              </div>
              <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
            </div>
            {isCat ? (
              <div>
                  <label className="block text-sm font-bold mb-1">صورة (اختياري)</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input type="text" value={form.image || ''} placeholder="رابط الصورة" onChange={e => setForm({...form, image: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                    <label className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors" title="اختيار من المعرض">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setForm({...form, image: reader.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                  {form.image && (
                    <div className="mt-2">
                      <img src={form.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    </div>
                  )}
                </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold mb-1">السعر</label>
                    <input type="number" value={form.price || 0} onChange={e => setForm({...form, price: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">السعر الأصلي</label>
                    <input type="number" value={form.originalPrice || 0} onChange={e => setForm({...form, originalPrice: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">صورة (اختياري)</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input type="text" value={form.image || ''} placeholder="رابط الصورة" onChange={e => setForm({...form, image: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                    <label className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors" title="اختيار من المعرض">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setForm({...form, image: reader.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                  {form.image && (
                    <div className="mt-2">
                      <img src={form.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-1">الحالة</label>
                  <select value={form.status || 'Active'} onChange={e => setForm({...form, status: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                    <option value="Active">مفعل</option>
                    <option value="Inactive">معطل</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold mb-1">نوع المتجر</label>
                    <select value={form.storeType || 'normal'} onChange={e => setForm({...form, storeType: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="normal">عادي</option>
                      <option value="quantities">كميات (إدخال كمية)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">المطلوب للطلب</label>
                    <select value={form.requiredInput || 'id'} onChange={e => setForm({...form, requiredInput: e.target.value})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      <option value="id">معلومات اللاعب (ID)</option>
                      <option value="phone">رقم الهاتف</option>
                      <option value="email_password">إيميل وكلمة سر</option>
                      <option value="link">الرابط</option>
                    </select>
                  </div>
                </div>

                {form.storeType === 'quantities' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-bold mb-1">أقل كمية</label>
                      <input type="number" value={form.minQty || 1} onChange={e => setForm({...form, minQty: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">أكثر كمية</label>
                      <input type="number" value={form.maxQty || 1000} onChange={e => setForm({...form, maxQty: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                    </div>
                  </div>
                )}
                
                {form.storeType === 'quantities' && (
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                       <label className="block text-sm font-bold mb-1">سعر الوحدة (دولار)</label>
                       <input type="number" step="0.001" value={form.unitPriceUSD || form.unitPrice || form.price || 0} onChange={e => setForm({...form, unitPriceUSD: Number(e.target.value), unitPrice: Number(e.target.value), price: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                     </div>
                     <div>
                       <label className="block text-sm font-bold mb-1">سعر الوحدة (سوري)</label>
                       <input type="number" step="0.001" value={form.unitPriceSYP || (form.price * 15000) || 0} onChange={e => setForm({...form, unitPriceSYP: Number(e.target.value)})} className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                     </div>
                  </div>
                )}
              </>
            )}
            <button onClick={() => {
              if (isCat) handleSaveCategory(form);
              else handleSaveProduct(form);
              setModalData(null);
            }} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg mt-4">
              حفظ
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, items, selected, onSelect, onAdd, onEdit, onDelete, isProduct = false }: any) => (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-w-[250px]">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {isProduct ? <Package className="w-4 h-4 text-emerald-500" /> : <Layers className="w-4 h-4 text-blue-500" />}
          {title}
        </h3>
        <button onClick={onAdd} className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 h-[600px] custom-scrollbar">
        {(items?.length || 0) === 0 ? (
          <div className="text-center p-4 text-gray-400 text-sm">لا يوجد عناصر</div>
        ) : (items || []).map((item: any) => (
          <div 
            key={item._id} 
            onClick={() => onSelect && onSelect(item)}
            className={`group p-3 rounded-xl cursor-pointer flex items-center justify-between border transition-all ${selected?._id === item._id ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {item.image ? (
                <img src={item.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                   {isProduct ? <Package className="w-4 h-4 text-gray-400" /> : <ImageIcon className="w-4 h-4 text-gray-400" />}
                </div>
              )}
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                {isProduct && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{item.price}$</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-100 flex-shrink-0">
              <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg"><Edit className="w-4 h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(item._id); }} className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              {!isProduct && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) return <div className="text-center p-8">جاري التحميل...</div>;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <Layers className="w-6 h-6 text-blue-500" /> 
        إدارة الأقسام والمنتجات
      </h2>
      
      <div className="flex flex-col xl:flex-row gap-4 overflow-x-auto pb-4 items-stretch">
        <Column 
          title="الأقسام الرئيسية" 
          items={mainCats} 
          selected={selectedMain} 
          onSelect={(c: any) => { setSelectedMain(c); setSelectedSub(null); setSelectedSubSub(null); }}
          onAdd={() => openCategoryModal(null)}
          onEdit={(c: any) => openCategoryModal(null, c)}
          onDelete={handleDeleteCategory}
        />
        
        {selectedMain && (
          <Column 
            title="الأقسام الفرعية" 
            items={subCats} 
            selected={selectedSub} 
            onSelect={(c: any) => { setSelectedSub(c); setSelectedSubSub(null); }}
            onAdd={() => openCategoryModal(selectedMain)}
            onEdit={(c: any) => openCategoryModal(selectedMain, c)}
            onDelete={handleDeleteCategory}
          />
        )}
        
        {selectedSub && (
          <Column 
            title="الأقسام الفرع-فرعية" 
            items={subSubCats} 
            selected={selectedSubSub} 
            onSelect={(c: any) => setSelectedSubSub(c)}
            onAdd={() => openCategoryModal(selectedSub)}
            onEdit={(c: any) => openCategoryModal(selectedSub, c)}
            onDelete={handleDeleteCategory}
          />
        )}

        {(selectedMain || selectedSub || selectedSubSub) && (
          <Column 
            title="المنتجات" 
            items={currentLevelProducts} 
            isProduct={true}
            onAdd={() => openProductModal(selectedSubSub || selectedSub || selectedMain)}
            onEdit={(p: any) => openProductModal(selectedSubSub || selectedSub || selectedMain, p)}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      <Modal />

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{confirmModal.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={confirmModal.action}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-bold transition-colors"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategoryManager;
