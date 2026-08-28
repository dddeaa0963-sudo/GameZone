import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, ShieldCheck, Activity, Key, Link2, Clock, CheckCircle2, XCircle, RefreshCw, X, Save } from 'lucide-react';
import { getApiProviders, createApiProvider, updateApiProvider, deleteApiProvider, testApiProvider } from '../api/index.js';

export default function ApiProvidersManager({ showNotification }: { showNotification: (type: 'success'|'error', msg: string) => void }) {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<any>(null);
    
    const [formData, setFormData] = useState<any>({
        name: '',
        type: 'Game Verification',
        baseUrl: '',
        endpoint: '',
        method: 'POST',
        authenticationType: 'No Authentication',
        encryptedCredentials: { apiKey: '', apiSecret: '', token: '' },
        headers: [],
        responseMapping: { successField: '', playerNameField: '', playerIdField: '' }, requestMapping: { productIdField: '', playerIdField: '', zoneIdField: '', extraPayload: '' },
        timeout: 5000,
        retryCount: 0,
        enabled: true
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const providerTypes = ['Game Verification', 'Game Top-Up', 'Email', 'Payment', 'SMS', 'Custom REST API'];
    const authTypes = ['API Key', 'Bearer Token', 'Basic Authentication', 'Custom Header', 'OAuth 2.0', 'No Authentication'];
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        setLoading(true);
        try {
            const data = await getApiProviders();
            setProviders(data);
        } catch (error) {
            showNotification('error', 'فشل في تحميل المزودين');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (provider?: any) => {
        if (provider) {
            setEditingId(provider._id || provider.id);
            setFormData({
                ...provider,
                encryptedCredentials: provider.encryptedCredentials || { apiKey: '', apiSecret: '', token: '' },
                headers: provider.headers || [],
                responseMapping: provider.responseMapping || { successField: '', playerNameField: '', playerIdField: '' }, requestMapping: provider.requestMapping || { productIdField: '', playerIdField: '', zoneIdField: '', extraPayload: '' }
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '', type: 'Game Verification', baseUrl: '', endpoint: '', method: 'POST',
                authenticationType: 'No Authentication', encryptedCredentials: { apiKey: '', apiSecret: '', token: '' },
                headers: [], responseMapping: { successField: '', playerNameField: '', playerIdField: '' }, requestMapping: { productIdField: '', playerIdField: '', zoneIdField: '', extraPayload: '' },
                timeout: 5000, retryCount: 0, enabled: true
            });
        }
        setTestResult(null);
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.baseUrl) {
            showNotification('error', 'يرجى إدخال اسم المزود ورابط الـ API الأساسي');
            return;
        }
        
        try {
            if (editingId) {
                await updateApiProvider(editingId, formData);
                showNotification('success', 'تم التحديث بنجاح');
            } else {
                await createApiProvider(formData);
                showNotification('success', 'تم الإضافة بنجاح');
            }
            setModalOpen(false);
            loadProviders();
        } catch (error) {
            showNotification('error', 'حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المزود؟')) return;
        try {
            await deleteApiProvider(id);
            showNotification('success', 'تم الحذف بنجاح');
            loadProviders();
        } catch (error) {
            showNotification('error', 'فشل الحذف');
        }
    };

    const handleTest = async (id: string) => {
        setTestingId(id);
        setTestResult(null);
        try {
            const result = await testApiProvider(id);
            setTestResult(result);
            if (result.success) {
                showNotification('success', 'نجاح الاتصال بالمزود');
            } else {
                showNotification('error', 'فشل الاتصال بالمزود');
            }
            loadProviders(); // to update status in UI
        } catch (error) {
            showNotification('error', 'خطأ في فحص الاتصال');
        } finally {
            setTestingId(null);
        }
    };

    const addHeader = () => {
        setFormData({ ...formData, headers: [...formData.headers, { key: '', value: '' }] });
    };

    const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
        const newHeaders = [...formData.headers];
        newHeaders[index][field] = val;
        setFormData({ ...formData, headers: newHeaders });
    };

    const removeHeader = (index: number) => {
        const newHeaders = [...formData.headers];
        newHeaders.splice(index, 1);
        setFormData({ ...formData, headers: newHeaders });
    };

    return (
        <div className="flex flex-col gap-6" dir="rtl">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Link2 className="w-6 h-6 text-blue-500" /> إدارة مزودي API (API Providers)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">إدارة الاتصالات الخارجية كبوابات الدفع، التحقق من اللاعبين، ومزودي الخدمات.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                >
                    <PlusCircle className="w-5 h-5" /> إضافة مزود جديد
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Activity className="w-8 h-8 text-blue-500 animate-spin" /></div>
            ) : providers.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center flex flex-col items-center">
                    <ShieldCheck className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-500">لا يوجد مزودي API حالياً</h3>
                    <p className="text-gray-400 mt-2">قم بإضافة مزود جديد لربط النظام بالخدمات الخارجية.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {providers.map((provider) => (
                        <div key={provider._id || provider.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{provider.name}</h3>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md w-fit mt-1">{provider.type}</span>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                                        provider.status === 'Connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        provider.status === 'Error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {provider.status === 'Connected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                                         provider.status === 'Error' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                        {provider.status}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">الطريقة:</span>
                                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300" dir="ltr">{provider.method}</span>
                                    </div>
                                    <div className="flex justify-between truncate">
                                        <span className="text-gray-500">الرابط:</span>
                                        <span className="font-mono text-gray-700 dark:text-gray-300 truncate max-w-[200px]" dir="ltr">{provider.baseUrl}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">المصادقة:</span>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{provider.authenticationType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    onClick={() => handleTest(provider._id || provider.id)}
                                    disabled={testingId === (provider._id || provider.id)}
                                    className="p-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 flex items-center justify-center gap-1 border-l border-gray-100 dark:border-gray-700 transition-colors disabled:opacity-50"
                                >
                                    {testingId === (provider._id || provider.id) ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                                    فحص
                                </button>
                                <button 
                                    onClick={() => handleOpenModal(provider)}
                                    className="p-3 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-center gap-1 border-l border-gray-100 dark:border-gray-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" /> تعديل
                                </button>
                                <button 
                                    onClick={() => handleDelete(provider._id || provider.id)}
                                    className="p-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center justify-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                {editingId ? <Edit className="w-6 h-6 text-blue-500" /> : <PlusCircle className="w-6 h-6 text-green-500" />}
                                {editingId ? 'تعديل مزود API' : 'إضافة مزود API جديد'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex flex-col gap-8 flex-1">
                            {/* Section 1: Basic Info */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">المعلومات الأساسية</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">اسم المزود *</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: API بوبجي الرسمي" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">نوع المزود *</label>
                                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                                            {providerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Endpoint Config */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800 pb-2">إعدادات الاتصال (Endpoint)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الطريقة (Method)</label>
                                        <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono outline-none" dir="ltr">
                                            {methods.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-9">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">الرابط الأساسي (Base URL) *</label>
                                        <input type="text" value={formData.baseUrl} onChange={e => setFormData({...formData, baseUrl: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" placeholder="https://api.example.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">المسار (Endpoint) - اختياري</label>
                                    <input type="text" value={formData.endpoint} onChange={e => setFormData({...formData, endpoint: e.target.value})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" placeholder="/v1/player/verify" />
                                </div>
                            </div>

                            {/* Section 3: Authentication & Security */}
                            <div className="flex flex-col gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-yellow-500" /> المصادقة والحماية (Authentication)
                                </h4>
                                <div className="mb-2">
                                    <select value={formData.authenticationType} onChange={e => setFormData({...formData, authenticationType: e.target.value})} className="w-full max-w-sm border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none">
                                        {authTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                {formData.authenticationType === 'API Key' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">مفتاح API (سيتم تشفيره)</label>
                                            <input type="password" placeholder="••••••••••••••••" value={formData.encryptedCredentials.apiKey} onChange={e => setFormData({...formData, encryptedCredentials: {...formData.encryptedCredentials, apiKey: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-white dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" />
                                        </div>
                                    </div>
                                )}

                                {formData.authenticationType === 'Bearer Token' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Token (سيتم تشفيره)</label>
                                        <input type="password" placeholder="••••••••••••••••" value={formData.encryptedCredentials.token} onChange={e => setFormData({...formData, encryptedCredentials: {...formData.encryptedCredentials, token: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-white dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" />
                                    </div>
                                )}

                                {formData.authenticationType === 'Basic Authentication' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">اسم المستخدم / Key</label>
                                            <input type="password" placeholder="••••••••" value={formData.encryptedCredentials.apiKey} onChange={e => setFormData({...formData, encryptedCredentials: {...formData.encryptedCredentials, apiKey: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-white dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">كلمة المرور / Secret</label>
                                            <input type="password" placeholder="••••••••" value={formData.encryptedCredentials.apiSecret} onChange={e => setFormData({...formData, encryptedCredentials: {...formData.encryptedCredentials, apiSecret: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 bg-white dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 4: Headers */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">الترويسات المخصصة (Headers)</h4>
                                    <button onClick={addHeader} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                                        <PlusCircle className="w-4 h-4" /> إضافة ترويسة
                                    </button>
                                </div>
                                {formData.headers.map((h: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input type="text" placeholder="Key (e.g. Content-Type)" value={h.key} onChange={e => updateHeader(idx, 'key', e.target.value)} className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" />
                                        <input type="text" placeholder="Value" value={h.value} onChange={e => updateHeader(idx, 'value', e.target.value)} className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-800 dark:text-white font-mono outline-none text-left" dir="ltr" />
                                        <button onClick={() => removeHeader(idx)} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {formData.headers.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-2">لا توجد ترويسات مخصصة.</p>
                                )}
                            </div>

                            
                            {/* Section 4.5: Request Mapping (For E-Commerce / Top-up) */}
                            {formData.type === 'Game Top-Up' && (
                                <div className="flex flex-col gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">تعيين بيانات الإرسال (Request Mapping)</h4>
                                    <p className="text-xs text-gray-500">قم بتحديد مفاتيح JSON التي سيتم إرسالها للـ API الخارجي.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">حقل معرف المنتج (Product ID)</label>
                                            <input type="text" placeholder="مثال: service_id" value={formData.requestMapping?.productIdField || ''} onChange={e => setFormData({...formData, requestMapping: {...formData.requestMapping, productIdField: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">حقل معرف اللاعب (Player ID)</label>
                                            <input type="text" placeholder="مثال: player_id" value={formData.requestMapping?.playerIdField || ''} onChange={e => setFormData({...formData, requestMapping: {...formData.requestMapping, playerIdField: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">حقل المنطقة (Zone ID) اختياري</label>
                                            <input type="text" placeholder="مثال: zone_id" value={formData.requestMapping?.zoneIdField || ''} onChange={e => setFormData({...formData, requestMapping: {...formData.requestMapping, zoneIdField: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">بيانات إضافية ثابتة (JSON Payload) - اختياري</label>
                                        <textarea placeholder='{"action": "order", "type": "game"}' value={formData.requestMapping?.extraPayload || ''} onChange={e => setFormData({...formData, requestMapping: {...formData.requestMapping, extraPayload: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" rows={2}></textarea>
                                    </div>
                                </div>
                            )}

                            {/* Section 5: Response Mapping (For Game Verification) */}
                            {(['Game Verification', 'Game Top-Up'].includes(formData.type)) && (
                                <div className="flex flex-col gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">تعيين استجابة الـ API (Response Mapping)</h4>
                                    <p className="text-xs text-gray-500">لتحويل بيانات الـ API الخارجي إلى تنسيق يقبله المتجر. (استخدم المسار مثل: <code>data.player_name</code>)</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">حقل النجاح (Success)</label>
                                            <input type="text" placeholder="مثال: status" value={formData.responseMapping.successField} onChange={e => setFormData({...formData, responseMapping: {...formData.responseMapping, successField: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">حقل اسم اللاعب</label>
                                            <input type="text" placeholder="مثال: data.nickname" value={formData.responseMapping.playerNameField} onChange={e => setFormData({...formData, responseMapping: {...formData.responseMapping, playerNameField: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">حقل المعرف (ID)</label>
                                            <input type="text" placeholder="مثال: data.uid" value={formData.responseMapping.playerIdField} onChange={e => setFormData({...formData, responseMapping: {...formData.responseMapping, playerIdField: e.target.value}})} className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm outline-none text-left" dir="ltr" />
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Test Result Display if any */}
                             {testResult && (
                                <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'}`}>
                                    <h4 className={`font-bold flex items-center gap-2 ${testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                        {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        {testResult.success ? 'نتيجة الفحص: نجاح' : 'نتيجة الفحص: فشل'}
                                    </h4>
                                    <div className="mt-2 text-sm space-y-1">
                                        <p><b>HTTP Status:</b> {testResult.status}</p>
                                        <p><b>Response Time:</b> {testResult.responseTime} ms</p>
                                        {testResult.error && <p className="text-red-600"><b>Error:</b> {testResult.error}</p>}
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-gray-600 dark:text-gray-400 font-bold">عرض الاستجابة كاملة</summary>
                                            <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto font-mono text-xs text-left" dir="ltr">
                                                {JSON.stringify(testResult.data, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                </div>
                            )}

                        </div>
                        
                        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex justify-between">
                            {editingId ? (
                                <button onClick={() => handleTest(editingId)} disabled={testingId === editingId} className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                                    {testingId === editingId ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />} فحص الاتصال
                                </button>
                            ) : <div></div>}
                            
                            <div className="flex gap-3">
                                <button onClick={() => setModalOpen(false)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2.5 rounded-xl font-bold transition-colors">
                                    إلغاء
                                </button>
                                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30">
                                    <Save className="w-5 h-5" /> حفظ المزود
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
