import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  image?: string;
  category: string; // ID of category
  status: 'Active' | 'Inactive';
  notes?: string;
  order: number;
  apiMapping?: string;
  storeType?: 'normal' | 'quantities';
  requiredInput?: string;
  minQty?: number;
  maxQty?: number;
  unitPrice?: number;
}

interface Category {
  _id: string;
  name: string;
}

export const ProductManager: React.FC<{showNotification?: (type: string, message: string) => void}> = ({showNotification}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, action: () => void}>({isOpen: false, title: '', message: '', action: () => {}});
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, originalPrice: 0, stock: -1, status: 'Active', category: '', order: 0, storeType: 'normal', requiredInput: 'id', minQty: 1, maxQty: 1000, unitPrice: 0
  });

  useEffect(() => {
    fetchData();
    window.addEventListener('REFRESH_ADMIN_DATA', fetchData);
    return () => window.removeEventListener('REFRESH_ADMIN_DATA', fetchData);
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products?t=' + new Date().getTime()),
        fetch('/api/categories?t=' + new Date().getTime())
      ]);
      
      if (pRes.ok && cRes.ok) {
        setProducts(await pRes.json());
        const cats = await cRes.json();
        
        // Flatten categories for dropdown
        const flattenCats = (catsArr, parentId = null, level = 0) => {
            let result = [];
            const children = catsArr.filter(c => {
               const getParentId = (p) => p && typeof p === 'object' ? p._id || p.id : p;
               const pId = c.parent ? getParentId(c.parent).toString() : null;
               const targetId = parentId ? parentId.toString() : null;
               return pId === targetId;
            });
            for (const child of children) {
               result.push({ ...child, name: "— ".repeat(level) + child.name });
               result = result.concat(flattenCats(catsArr, child._id, level + 1));
            }
            return result;
        };
        
        setCategories(flattenCats(cats));
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const handleAddProd = () => { setFormData({ name: '', price: 0, originalPrice: 0, stock: -1, status: 'Active', category: '', order: 0, storeType: 'normal', requiredInput: 'id', minQty: 1, maxQty: 1000, unitPrice: 0 }); setShowModal(true); };
    window.addEventListener('OPEN_ADD_PRODUCT', handleAddProd);
    return () => window.removeEventListener('OPEN_ADD_PRODUCT', handleAddProd);
  }, []);

  const handleSave = async () => {
    if (!formData.name) { alert("الرجاء إدخال اسم المنتج"); return; } if (!formData.category) { alert("الرجاء اختيار القسم"); return; }
    try {
      const url = formData._id ? `/api/products/${formData._id}` : '/api/products';
      const method = formData._id ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      fetchData();
    } catch (e) {
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد الحذف',
      message: 'هل أنت متأكد من حذف هذا المنتج نهائياً؟ سيتم حذفه من قاعدة البيانات وواجهة المستخدم.',
      action: async () => {
        try {
          await fetch(`/api/products/${id}`, { method: 'DELETE' });
          fetchData();
        } catch (e) {
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => p.name.includes(search));

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex-wrap gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
            <Package className="w-5 h-5" />
          </div>
          إدارة المنتجات
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <input type="text" placeholder="بحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-green-500 transition-colors" />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button onClick={() => { setFormData({ name: '', price: 0, originalPrice: 0, stock: -1, status: 'Active', category: '', order: 0 }); setShowModal(true); }} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/30">
            <Plus className="w-5 h-5" /> إضافة منتج
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product._id} className="bg-white dark:bg-[#1e293b] hover:bg-gray-50 dark:hover:bg-[#253247] border border-gray-100 dark:border-gray-800 rounded-[2rem] p-5 flex flex-col gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                  <Package className="w-8 h-8" />
                </div>
              )}
              <div className="flex gap-1">
                <button onClick={() => { setFormData({...product, category: (product.category as any)?._id || product.category}); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-gray-900 rounded-lg"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-400 hover:text-rose-500 bg-gray-50 dark:bg-gray-900 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{categories.find(c => c._id === ((product.category as any)?._id || product.category))?.name || 'قسم غير معروف'}</p>
            </div>
            
            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 dark:border-gray-700/50">
              <span className="font-black text-green-600 dark:text-green-400">{product.price}$</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through">{product.originalPrice}$</span>
              )}
              <span className={`mr-auto text-xs px-2 py-1 rounded-md font-bold ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>{product.status === 'Active' ? 'مفعل' : 'معطل'}</span>
              <span className={`text-xs px-2 py-1 rounded-md font-bold ${product.apiMapping ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>{product.apiMapping ? 'مستورد' : 'يدوي'}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{formData._id ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold">اسم المنتج</label>
                  <span className={`text-xs px-2 py-1 rounded-md font-bold ${formData.apiMapping ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                    {formData.apiMapping ? 'منتج مستورد' : 'منتج يدوي'}
                  </span>
                </div>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">القسم (الفرعي / فرع فرعي)</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <option value="" disabled>اختر القسم</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">صورة المنتج (اختياري)</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="text" value={formData.image || ''} placeholder="رابط الصورة" onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                  <label className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-3 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors" title="اختيار من المعرض">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, image: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">السعر (المخفض)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">السعر الأصلي (قبل الخصم)</label>
                <input type="number" value={formData.originalPrice || 0} onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">الحالة</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <option value="Active">مفعل</option>
                  <option value="Inactive">معطل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">الترتيب</label>
                <input type="number" value={formData.order || 0} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
              </div>
              
              <div className="col-span-full">
                <label className="block text-sm font-bold mb-1">ملاحظات / وصف</label>
                <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700 h-24 resize-none" />
              </div>
              
              <div className="col-span-full">
                <label className="block text-sm font-bold mb-1">نوع المتجر</label>
                <select value={formData.storeType || 'normal'} onChange={e => setFormData({...formData, storeType: e.target.value as 'normal' | 'quantities'})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <option value="normal">متجر عادي</option>
                  <option value="quantities">متجر كميات</option>
                </select>
              </div>

              {formData.storeType === 'normal' && (
                <div className="col-span-full">
                  <label className="block text-sm font-bold mb-1">البيانات المطلوبة من العميل</label>
                  <select value={formData.requiredInput || 'id'} onChange={e => setFormData({...formData, requiredInput: e.target.value})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700">
                    <option value="id">الأيدي (ID)</option>
                    <option value="phone">رقم الهاتف</option>
                    <option value="wallet">رابط المحفظة</option>
                    <option value="email_password">الايميل و كلمة السر</option>
                  </select>
                </div>
              )}

              {formData.storeType === 'quantities' && (
                <>
                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-bold mb-1">البيانات المطلوبة من العميل</label>
                    <input type="text" disabled value="الأيدي (ID)" className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-bold mb-1">أقل كمية</label>
                    <input type="number" value={formData.minQty || 1} onChange={e => setFormData({...formData, minQty: Number(e.target.value)})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-bold mb-1">أكثر كمية</label>
                    <input type="number" value={formData.maxQty || 1000} onChange={e => setFormData({...formData, maxQty: Number(e.target.value)})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                  <div className="col-span-full sm:col-span-1">
                    <label className="block text-sm font-bold mb-1">سعر الواحدة ($)</label>
                    <input type="number" step="0.0001" value={formData.unitPrice || 0} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" />
                  </div>
                </>
              )}

              <div className="col-span-full">
                <label className="block text-sm font-bold mb-1">مفتاح الربط البرمجي (API Mapping)</label>
                <input type="text" value={formData.apiMapping || ''} onChange={e => setFormData({...formData, apiMapping: e.target.value})} className="w-full border p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700" dir="ltr" placeholder="provider_product_id" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-800">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-500 font-bold">إلغاء</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30">حفظ المنتج</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};