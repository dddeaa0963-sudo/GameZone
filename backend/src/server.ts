process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));

import mongoose from "mongoose";
import connectDB from "./db/mongoose.js";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import rateLimit from 'express-rate-limit';

import path from "path";
import TelegramBotPackage from "node-telegram-bot-api";
const TelegramBot = (TelegramBotPackage as any).default || TelegramBotPackage;

import { startSyncService } from "./services/syncService";

import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import bannerRoutes from './routes/bannerRoutes';
import orderRoutes from './routes/orderRoutes';
import settingsRoutes from './routes/settingsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import balanceRequestRoutes from './routes/balanceRequestRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import apiProviderRoutes from './routes/apiProviderRoutes';
import gameRoutes from './routes/gameRoutes';

import paymentMethodRoutes from './routes/paymentMethodRoutes';

// Connect to MongoDB
connectDB();


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8929700558:AAERztvvVRr5SxtCvkn7eQWDn07Sf2hYTqo';

// 2. منع تكرار الإنشاء (Singleton Pattern)
let bot: any;
if (!(global as any).tgBotInstance) {
    (global as any).tgBotInstance = new TelegramBot(TELEGRAM_BOT_TOKEN, { 
        polling: {
            params: {
                timeout: 10
            }
        } 
    });
}
bot = (global as any).tgBotInstance;

if (bot.listeners('polling_error').length === 0) {
    // 1. إدارة إغلاق الاتصال (Graceful Shutdown)
    process.once('SIGINT', () => bot.stopPolling());
    process.once('SIGTERM', () => bot.stopPolling());

    // 3. معالجة أخطاء الـ Polling وتجاهل 409 Conflict لمنع الإغراق
    bot.on('polling_error', (error: any) => {
        if ((error as any).code === 'ETELEGRAM' && error.message.includes('409')) {
            // Ignore 409 conflict quietly
        } else if ((error as any).message && (error as any).message.includes('EFATAL')) {
            // Ignore ETIMEDOUT / EFATAL errors as the bot will automatically reconnect
        } else if ((error as any).code === 'EFATAL') {
            // Ignore ETIMEDOUT
        } else {
            console.error('Telegram polling error:', error);
        }
    });

    // Listen for callback queries from inline keyboards
    bot.on('callback_query', async (callbackQuery: any) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = msg?.chat.id;

    if (!data || !chatId || !msg) return;

    try {
        if (data.startsWith('order_status_')) {
            const [_, __, newStatus, orderId] = data.split('_');
            const statusMap: Record<string, string> = {
                'processing': 'قيد المعالجة',
                'completed': 'مكتمل',
                'accepted': 'مقبول',
                'rejected': 'مرفوض',
                'cancelled': 'ملغي',
                'refunded': 'مسترجع',
                'failed': 'فشل'
            };
            
            const Order = (await import("./models/Order.js")).default;
            await Order.findOneAndUpdate({ $or: [{ _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }, { id: Number(orderId) }, { id: orderId }] }, { status: newStatus });
            
            bot.editMessageText(
                `${(msg as any).text}\n\n<b>الحالة الجديدة:</b> ${statusMap[newStatus]}`, 
                { chat_id: chatId, message_id: msg.message_id, parse_mode: 'HTML' }
            );
            bot.answerCallbackQuery(callbackQuery.id, { text: 'تم تحديث حالة الطلب إلى: ' + statusMap[newStatus] });
        }
        else if (data.startsWith('approve_deposit_') || data.startsWith('reject_deposit_')) {
            const isApprove = data.startsWith('approve_deposit_');
            const reqId = isApprove ? data.replace('approve_deposit_', '') : data.replace('reject_deposit_', '');
            
            const BalanceRequest = (await import("./models/BalanceRequest.js")).default; const User = (await import("./models/User.js")).default;
            const reqSnap = await BalanceRequest.findById(reqId);
            
            if (!reqSnap) {
                bot.answerCallbackQuery(callbackQuery.id, { text: 'الطلب غير موجود', show_alert: true });
                return;
            }
            
            if (reqSnap.status !== 'Pending') {
                 bot.answerCallbackQuery(callbackQuery.id, { text: 'تمت معالجة هذا الطلب مسبقاً', show_alert: true });
                 return;
            }

            const newStatus = isApprove ? 'Approved' : 'Rejected';
            reqSnap.status = newStatus;
            await reqSnap.save();

            // If approved, add balance to user
            if (isApprove && (reqSnap.userId) && reqSnap.amount) {
                try {
                    
                    let user = await User.findById(reqSnap.userId).catch(() => null);
                    
                    if (user) {
                        user.balance = (user.balance || 0) + parseFloat(reqSnap.amount.toString());
                        
                    }
                } catch (err) {
                    console.error("Failed to update Mongoose user balance:", err);
                }
            }
            bot.editMessageText(
                `${(msg as any).text}\n\n<b>الحالة:</b> ${isApprove ? '✅ تمت الموافقة' : '❌ تم الرفض'}`, 
                { chat_id: chatId, message_id: msg.message_id, parse_mode: 'HTML' }
            );
            bot.answerCallbackQuery(callbackQuery.id, { text: isApprove ? 'تمت الموافقة وإضافة الرصيد' : 'تم رفض الطلب' });
        }
    } catch (e) {
        console.error("Callback query error:", e);
        bot.answerCallbackQuery(callbackQuery.id, { text: 'حدث خطأ أثناء المعالجة', show_alert: true });
    }
});
}

let cachedChatId: string | number | null = process.env.TELEGRAM_ADMIN_CHAT_ID || null;

export async function sendTelegramMessage(text: string, options?: any) {
  if (cachedChatId) {
      bot.sendMessage(cachedChatId, text, { parse_mode: 'HTML', ...options }).catch(console.error);
      return;
  }
  
  try {
      const updates = await bot.getUpdates();
      for (let i = updates.length - 1; i >= 0; i--) {
          if (updates[i].message && updates[i].message?.chat?.id) {
              cachedChatId = updates[i].message?.chat.id;
              if (cachedChatId) {
                  bot.sendMessage(cachedChatId, text, { parse_mode: 'HTML', ...options }).catch(console.error);
                  return;
              }
          }
      }
  } catch(e) {}
}

export async function sendTelegramPhoto(photo: string | Buffer, caption: string, options?: any) {
  if (cachedChatId) {
      bot.sendPhoto(cachedChatId, photo, { caption, parse_mode: 'HTML', ...options }).catch(console.error);
      return;
  }
  
  try {
      const updates = await bot.getUpdates();
      for (let i = updates.length - 1; i >= 0; i--) {
          if (updates[i].message && updates[i].message?.chat?.id) {
              cachedChatId = updates[i].message?.chat.id;
              if (cachedChatId) {
                  bot.sendPhoto(cachedChatId, photo, { caption, parse_mode: 'HTML', ...options }).catch(console.error);
                  return;
              }
          }
      }
  } catch(e) {}
}


async function startServer() {
  await connectDB();
  const app = express();
  app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : true,
    credentials: true
  }));
  app.set('trust proxy', 1);
  const PORT = process.env.PORT || 4000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // CWP Compatibility Middleware: Fix '+' converted to ' ' in requests
  app.use((req, res, next) => {
    const fixSpacesToPlus = (obj) => {
      if (!obj) return;
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (['password', 'token', 'uri', 'url', 'base64', 'image', 'phone', 'number'].some(k => key.toLowerCase().includes(k))) {
            obj[key] = obj[key].replace(/ /g, '+');
          }
        } else if (typeof obj[key] === 'object') {
          fixSpacesToPlus(obj[key]);
        }
      }
    };
    
    if (req.query) fixSpacesToPlus(req.query);
    if (req.body) fixSpacesToPlus(req.body);
    
    next();
  });


  // Middleware to fix corrupted '+' signs that turned into spaces
  app.use((req, res, next) => {
    const fixPlus = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          if (obj[key].startsWith('data:image')) {
            obj[key] = obj[key].replace(/ /g, '+');
          } else if (obj[key].startsWith(' ') && obj[key].trim().length > 0) {
            // Revert leading space to '+' for fields that typically use it (e.g. phones, IDs)
            obj[key] = '+' + obj[key].substring(1);
          }
        } else if (typeof obj[key] === 'object') {
          fixPlus(obj[key]);
        }
      }
    };
    
    if (req.body) fixPlus(req.body);
    if (req.query) fixPlus(req.query);
    
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000, // Increased to allow polling
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'تم تجاوز الحد المسموح به من الطلبات، يرجى المحاولة بعد 15 دقيقة.' }
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'تم تجاوز الحد المسموح به لطلبات تسجيل الدخول، يرجى المحاولة بعد ساعة.' }
  });

  app.use('/api/users/login', authLimiter);
  app.use('/api/', apiLimiter);

  
  let mockCategories: any[] = [];
  let mockProducts: any[] = [];

  app.use('/api/categories', (req, res, next) => {
    if (!process.env.MONGO_URI) {
        if (req.method === 'GET') return res.json(mockCategories);
        if (req.method === 'POST') {
            const newItem = { ...req.body, _id: Date.now().toString() };
            mockCategories.push(newItem);
            return res.status(201).json(newItem);
        }
        if (req.method === 'PUT') {
            const id = req.path.replace('/', '');
            const index = mockCategories.findIndex(c => c._id === id);
            if (index > -1) {
                mockCategories[index] = { ...mockCategories[index], ...req.body };
                return res.json(mockCategories[index]);
            }
            return res.status(404).json({ message: 'Not found' });
        }
        if (req.method === 'DELETE') {
            const id = req.path.replace('/', '');
            mockCategories = mockCategories.filter(c => c._id !== id);
            return res.json({ message: 'Deleted' });
        }
    }
    next();
  });

  app.use('/api/products', (req, res, next) => {
    if (!process.env.MONGO_URI) {
        if (req.method === 'GET') return res.json(mockProducts);
        if (req.method === 'POST') {
            const newItem = { ...req.body, _id: Date.now().toString() };
            mockProducts.push(newItem);
            return res.status(201).json(newItem);
        }
        if (req.method === 'PUT') {
            const id = req.path.replace('/', '');
            const index = mockProducts.findIndex(c => c._id === id);
            if (index > -1) {
                mockProducts[index] = { ...mockProducts[index], ...req.body };
                return res.json(mockProducts[index]);
            }
            return res.status(404).json({ message: 'Not found' });
        }
        if (req.method === 'DELETE') {
            const id = req.path.replace('/', '');
            mockProducts = mockProducts.filter(c => c._id !== id);
            return res.json({ message: 'Deleted' });
        }
    }
    next();
  });

  // MongoDB API Routes
  app.use('/api/users', userRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/banners', bannerRoutes);
  app.use('/api/payment_methods', paymentMethodRoutes);
  app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/balance_requests', balanceRequestRoutes);
app.use('/api/favorites', wishlistRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/admin/api-providers', apiProviderRoutes);
  app.use('/api/games', gameRoutes);


  // API routes
    app.get("/api/provider/products", async (req, res) => {
    try {
        const provider = req.query.provider;
        if (provider === 'alragheb') {
            const { default: alraghebService } = await import('./services/AlraghebService');
            // Alragheb content endpoint gives categories and products. We can just use the getProducts for a generic list, or getContent(0) then get products for each? The prompt says getProducts fetches products. Let's use getProducts().
            const productsRes = await alraghebService.getProducts();
            // Assuming it returns an array of products or an object with a data array.
            // Let's normalize it to the same format as Eshhanle if possible, or just pass it to the frontend to handle.
            res.json({ success: true, data: productsRes.data || productsRes });
        } else {
            const { default: eshhanleService } = await import('./services/EshhanleService');
            const products = await eshhanleService.getProducts();
            res.json({ success: true, data: products.data || products });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error?.message || "Failed to fetch products" });
    }
  });

  app.get("/api/provider/balance", async (req, res) => {
    try {
        const provider = req.query.provider;
        if (provider === 'alragheb') {
            const { default: alraghebService } = await import('./services/AlraghebService');
            const profile = await alraghebService.getProfile();
            res.json({ balance: profile?.balance || profile?.data?.balance || 0, currency: profile?.currency || profile?.data?.currency || 'USD', name: profile?.name || profile?.data?.name || 'Alragheb Store' });
        } else {
            const { default: eshhanleService } = await import('./services/EshhanleService');
            const profile = await eshhanleService.getProfile();
            res.json({ balance: profile.balance || 0, currency: profile.currency || 'USD', name: profile.name });
        }
    } catch (error: any) {
        res.status(500).json({ error: error?.message || "Failed to fetch balance" });
    }
  });

  app.post("/api/auth/signup/notify", (req, res) => {
    try {
        const { email, userData } = req.body;
        sendTelegramMessage(`👤 <b>مستخدم جديد مسجل!</b>\n\n<b>البريد:</b> ${email}\n<b>الاسم:</b> ${userData?.name || 'غير محدد'}\n<b>الهاتف:</b> ${userData?.phone || 'غير محدد'}`);
        res.json({ success: true });
    } catch(e) {
        res.json({ success: false });
    }
  });

  app.post("/api/balance-requests/notify", (req, res) => {
    try {
        const request = req.body;
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '✅ موافقة', callback_data: `approve_deposit_${request.id}` },
                        { text: '❌ رفض', callback_data: `reject_deposit_${request.id}` }
                    ]
                ]
            }
        };
        const text = `💰 <b>طلب شحن رصيد جديد!</b>\n\n<b>الاسم:</b> ${request.userName || 'غير محدد'}
<b>البريد:</b> ${request.userEmail || 'غير محدد'}
<b>رقم الهاتف:</b> ${request.userPhone || 'غير محدد'}
<b>الرقم التسلسلي (ID):</b> ${request.userId || 'غير محدد'}\n<b>المبلغ:</b> ${request.amount || request.amountUSD || 0} $\n<b>الطريقة:</b> ${request.method || 'غير محدد'}\n<b>رقم الحوالة:</b> ${request.transactionId || request.operationNumber || 'غير محدد'}\n<b>الوقت:</b> ${new Date().toLocaleString('ar-SA')}`;
        
        if (request.image) {
           let photoData = request.image;
           if (typeof photoData === 'string' && photoData.startsWith('data:image')) {
               const base64Data = photoData.replace(/^data:image\/\w+;base64,/, "");
               photoData = Buffer.from(base64Data, 'base64');
           }
           sendTelegramPhoto(photoData, text, options);
        } else {
           sendTelegramMessage(text, options);
        }
        res.json({ success: true });
    } catch(e) {
        res.json({ success: false });
    }
  });

  app.post("/api/orders/notify", (req, res) => {
    try {
        const { order, items } = req.body;
        const itemName = order.product || order.title || (items && items.length > 0 ? items[0].productName : order.productId);
        const price = order.price || order.priceUSD || order.totalPrice;
        
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'قيد المعالجة ⏳', callback_data: `order_status_processing_${order.id}` },
                        { text: 'مقبول ✅', callback_data: `order_status_accepted_${order.id}` }
                    ],
                    [
                        { text: 'مرفوض ❌', callback_data: `order_status_rejected_${order.id}` },
                        { text: 'ملغي 🚫', callback_data: `order_status_cancelled_${order.id}` }
                    ],
                    [
                        { text: 'مسترجع 💸', callback_data: `order_status_refunded_${order.id}` },
                        { text: 'فشل ⚠️', callback_data: `order_status_failed_${order.id}` }
                    ]
                ]
            }
        };
        
        sendTelegramMessage(`🛒 <b>طلب شراء جديد!</b>\n\n<b>رقم الطلب:</b> ${order.orderNumber || order.id || 'غير محدد'}\n<b>المنتج:</b> ${itemName}\n<b>المبلغ:</b> ${price}\n<b>الاسم:</b> ${order.userName || 'غير محدد'}
<b>البريد:</b> ${order.userEmail || 'غير محدد'}
<b>رقم الهاتف:</b> ${order.userPhone || 'غير محدد'}
<b>الرقم التسلسلي (ID):</b> ${order.userId || 'غير محدد'}\n<b>معلومات اللاعب (ID):</b> ${order.playerData || order.playerId || 'غير محدد'}\n<b>الوقت:</b> ${new Date(order.createdAt || Date.now()).toLocaleString('ar-SA')}`, options);
        res.json({ success: true });
    } catch(e) {
        res.json({ success: false });
    }
  });

  const fs = require('fs');
  let frontendDist = path.join(__dirname, '../../frontend/dist');
  if (!fs.existsSync(frontendDist)) frontendDist = path.join(__dirname, 'frontend_dist');
  if (!fs.existsSync(frontendDist)) frontendDist = path.join(process.cwd(), 'frontend_dist');
  if (!fs.existsSync(frontendDist)) frontendDist = path.join(__dirname, '../frontend_dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    app.get('*', (req, res) => {
      res.status(503).send('Frontend build not found. Please wait while the application is starting...');
    });
  }

  startSyncService();
  app.listen(PORT, "0.0.0.0", () => {
  });
}

startServer();
