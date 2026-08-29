import localforage from 'localforage';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});
apiClient.interceptors.response.use(res => res, err => Promise.reject(err));

const POLL_INTERVAL = 5000; // 5 seconds polling to prevent server overload

export const listenToOrders = (callback: (orders: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/orders');
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToBalanceRequests = (callback: (requests: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/balance_requests');
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToUsers = (callback: (users: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/users');
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToProducts = (callback: (products: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/products', { params: { t: new Date().getTime() } });
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToPaymentMethods = (callback: (methods: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/payment_methods');
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToCategories = (callback: (cats: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/categories', { params: { t: new Date().getTime() } });
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToSettings = (callback: (settings: any) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/settings');
            if (data) callback(data);
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};

export const listenToGlobalNotifications = (callback: (notifs: any[]) => void) => {
    let active = true;
    const poll = async () => {
        if (!active) return;
        try {
            const { data } = await apiClient.get('/api/notifications');
            callback(data.map((d: any) => ({ ...d, id: d._id })));
        } catch (e) {}
        if (active) setTimeout(poll, POLL_INTERVAL);
    };
    poll();
    return () => { active = false; };
};


export const getCategoriesDB = async () => {
    try {
        const { data } = await apiClient.get('/api/categories', { params: { t: new Date().getTime() } });
        return data.map((d: any) => ({ ...d, id: d._id }));
    } catch (e) {
        
        return null;
    }
};

export const syncAllDataToDB = async (retryCount = 0) => {
    try {
        
        const categories = await localforage.getItem('categories') || [];
        const subCategories = await localforage.getItem('subCategories') || {};
        const subSubCategories = await localforage.getItem('subSubCategories') || {};
        
        let allCategories = [...(categories as any[])];
        
        for (const [parentId, subs] of Object.entries(subCategories)) {
            for (const sub of (subs)) {
                allCategories.push({ ...sub, parent: parentId });
            }
        }
        
        for (const [parentId, subs] of Object.entries(subSubCategories)) {
            for (const sub of (subs)) {
                allCategories.push({ ...sub, parent: parentId });
            }
        }
        
        const formatted = allCategories.map(c => ({ ...c, _id: String(c.id || c._id) }));
        const uniqueCategories = [];
        const seenIds = new Set();
        for (const cat of formatted) {
            if (!seenIds.has(cat._id)) {
                seenIds.add(cat._id);
                uniqueCategories.push(cat);
            }
        }
        await apiClient.post('/api/categories/sync', { categories: uniqueCategories });
    } catch (e) {
        if (retryCount < 3) {
            setTimeout(() => syncAllDataToDB(retryCount + 1), 2000);
        } else {
            
        }
    }
};

export const saveCategoriesDB = async (categories: any[]) => {
    
    if (categories) await localforage.setItem("categories", categories);
    await syncAllDataToDB();
    return true;
};

export const deleteCategoryDB = async (id: number | string) => {
    try {
        await apiClient.delete(`/api/categories/${id}`);
        return true;
    } catch (e: any) {
        if (e.response?.status !== 404) 
        return false;
    }
};

export const getCategories = getCategoriesDB;

export const getSubcategoriesDB = async (data?: any) => [];
export const saveSubcategoriesDB = async (data?: any) => {  if(data) await localforage.setItem("subCategories", data); await syncAllDataToDB(); return true; };
export const getSubSubcategoriesDB = async (data?: any) => [];
export const saveSubSubcategoriesDB = async (data?: any) => {  if(data) await localforage.setItem("subSubCategories", data); await syncAllDataToDB(); return true; };

export const getProductsDB = async () => {
    try {
        const { data } = await apiClient.get('/api/products', { params: { t: new Date().getTime() } });
        return data.map((d: any) => ({ ...d, id: d._id, category_id: d.category?._id || d.category }));
    } catch (e) {
        
        return null;
    }
};

export const saveProductDB = async (product: any) => {
    if (product.category_id && !product.category) product.category = product.category_id;
    try {
        if (product.id || product._id) {
            await apiClient.put(`/api/products/${product.id || product._id}`, product);
        } else {
            await apiClient.post('/api/products', product);
        }
        return true;
    } catch (e) {
        
        return false;
    }
};

export const saveProductsDB = async (products: any[]) => {
    try {
        const uniqueProducts = [];
        const seenIds = new Set();
        for (const p of products) {
            const id = String(p.id || p._id);
            if (!seenIds.has(id)) {
                seenIds.add(id);
                uniqueProducts.push({ ...p, _id: id });
            }
        }
        await apiClient.post('/api/products/sync', { products: uniqueProducts });
        return true;
    } catch (e) {
        
        return false;
    }
};

export const deleteProductDB = async (id: number | string) => {
    try {
        await apiClient.delete(`/api/products/${id}`);
        return true;
    } catch (e: any) {
        if (e.response?.status !== 404) 
        return false;
    }
};

export const getPaymentMethodsDB = async () => {
    try {
        const { data } = await apiClient.get('/api/payment_methods');
        return data.map((d: any) => ({ ...d, id: d._id }));
    } catch (e) {
        
        return [];
    }
};

export const savePaymentMethodDB = async (method: any) => {
    try {
        let res;
        if (method.id || method._id) {
            res = await apiClient.put(`/api/payment_methods/${method.id || method._id}`, method);
        } else {
            res = await apiClient.post('/api/payment_methods', method);
        }
        return res.data;
    } catch (e) {
        
        throw e;
    }
};

export const deletePaymentMethodDB = async (id: string | number) => {
    try {
        await apiClient.delete(`/api/payment_methods/${id}`);
        return true;
    } catch (e: any) {
        if (e.response?.status !== 404) {
            
        }
        return false;
    }
};

export const getSettingsDB = async () => {
    try {
        const { data } = await apiClient.get('/api/settings');
        return data || {};
    } catch (e) {
        
        return null;
    }
};

export const saveSettingsDB = async (settings: any) => {
    try {
        await apiClient.post('/api/settings', settings);
        return true;
    } catch (e) {
        
        return false;
    }
};

export const saveGlobalNotificationDB = async (notification: any) => {
    try {
        const { data } = await apiClient.post('/api/notifications', notification);
        return data;
    } catch (e) {
        
        return false;
    }
};

export const updateGlobalNotificationDB = async (id: string | number, updates: any) => {
    try {
        await apiClient.put(`/api/notifications/${id}`, updates);
        return true;
    } catch (e) {
        // Ignore 404 as it might have been deleted
        if (e.response && e.response.status !== 404) {
            
        }
        return false;
    }
};

export const getBalanceRequestsDB = async () => {
    try {
        const { data } = await apiClient.get('/api/balance_requests');
        return data.map((d: any) => ({ ...d, id: d._id }));
    } catch (e) {
        if (e.message !== "Network Error") 
        return [];
    }
};

export const saveBalanceRequestDB = async (request: any) => {
    try {
        await apiClient.post('/api/balance_requests', request);
        await apiClient.post('/api/notifications/telegram/deposit', request).catch(() => {});
        return true;
    } catch (e) {
        
        return false;
    }
};

export const updateBalanceRequestDB = async (id: string | number, updates: any) => {
    try {
        await apiClient.put(`/api/balance_requests/${id}`, updates);
        return true;
    } catch (e) {
        
        return false;
    }
};

export const deleteBalanceRequestDB = async (id: string | number) => {
    try {
        await apiClient.delete(`/api/balance_requests/${id}`);
        return true;
    } catch (e) {
        
        return false;
    }
};

export const getOrders = async () => {
    try {
        const { data } = await apiClient.get('/api/orders');
        return data.map((d: any) => ({ ...d, id: d._id }));
    } catch (e) {
        if (e.message !== "Network Error") 
        return [];
    }
};

export const getUserOrders = async (userId: string) => {
    try {
        const { data } = await apiClient.get('/api/orders'); // would need query param, but keeping simple
        return data.filter((o: any) => o.user === userId || o.user?._id === userId).map((d: any) => ({ ...d, id: d._id }));
    } catch (e) {
        
        return [];
    }
};

export const createOrder = async (order: any, items: any[] = []) => {
    try {
        let orderToNotify = order;
        try {
            const { data } = await apiClient.post('/api/orders', order);
            if (data) orderToNotify = data;
        } catch (dbError) {
            
        }
        await apiClient.post('/api/orders/notify', { order: orderToNotify, items }).catch(() => {});
        return orderToNotify;
    } catch (e) {
        
        return false;
    }
};

// Auth and User
export const signUpUser = async (email: string, password: string, userData: any) => {
    try {
        const { data } = await apiClient.post('/api/users', { email, password, ...userData });
        return { authData: { user: data }, userData: { ...data, id: data._id }, id: data._id };
    } catch (e: any) {
        throw new Error(e.response?.data?.message || e.message);
    }
};

export const signInUser = async (email: string, password: string) => {
    try {
        const { data } = await apiClient.post('/api/users/login', { email, password });
        return { authData: { user: data }, userData: { ...data, id: data._id }, id: data._id };
    } catch (e: any) {
        throw new Error(e.response?.data?.message || e.message);
    }
};

export const signOutUser = async () => {
    return true; // client side
};

export const getUsersDB = async () => {
    try {
        const { data } = await apiClient.get('/api/users');
        return data.map((d: any) => ({ ...d, id: d._id }));
    } catch (e) {
        
        return null;
    }
};

export const getUserById = async (id: string | number): Promise<any> => {
    const idStr = String(id);
    if (!id || !/^[0-9a-fA-F]{24}$/.test(idStr)) {
        return null;
    }
    try {
        const { data } = await apiClient.get(`/api/users/${encodeURIComponent(idStr)}`);
        return { ...data, id: data._id };
    } catch (e: any) {
        
        if (e.response && e.response.status === 404) {
             return { notFound: true };
        }
        return null;
    }
};

export const updateUserDB = async (id: string, updates: any) => {
    const idStr = String(id);
    if (!id || !/^[0-9a-fA-F]{24}$/.test(idStr)) {
        return false;
    }
    try {
        await apiClient.put(`/api/users/${idStr}`, updates);
        return true;
    } catch (e) {
        
        return false;
    }
};

export const deleteUserDB = async (id: string) => {
    const idStr = String(id);
    if (!id || !/^[0-9a-fA-F]{24}$/.test(idStr)) {
        return false;
    }
    try {
        await apiClient.delete(`/api/users/${idStr}`);
        return true;
    } catch (e) {
        
        return false;
    }
};

export const updateUser = updateUserDB;
export const updateProfile = updateUserDB;


// Wishlist
export const getWishlist = (userId: string) => apiClient.get(`/api/favorites/${encodeURIComponent(userId)}`);
export const toggleWishlistItem = (data: { userId: string, productId: string }) => apiClient.post('/api/favorites/toggle', data);

// --- API Providers API ---

// --- API Providers API ---
export const getApiProviders = async () => {
    const { data } = await apiClient.get('/api/admin/api-providers');
    return data;
};

export const createApiProvider = async (providerData: any) => {
    const { data } = await apiClient.post('/api/admin/api-providers', providerData);
    return data;
};

export const updateApiProvider = async (id: string, providerData: any) => {
    const { data } = await apiClient.put(`/api/admin/api-providers/${id}`, providerData);
    return data;
};

export const deleteApiProvider = async (id: string) => {
    const { data } = await apiClient.delete(`/api/admin/api-providers/${id}`);
    return data;
};

export const testApiProvider = async (id: string) => {
    const { data } = await apiClient.post(`/api/admin/api-providers/${id}/test`);
    return data;
};

