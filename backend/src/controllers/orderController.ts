import { Request, Response } from 'express';
import Order from '../models/Order';
import { sendTelegramMessage } from '../server';
import User from '../models/User';
import Product from '../models/Product';
import mongoose from 'mongoose';
import crypto from 'crypto';
import EshhanleService from '../services/EshhanleService';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) res.json(order);
    else res.status(404).json({ message: 'Order not found' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    // Process API order if mapped
    if (orderData.status !== 'rejected') {
       const product = await Product.findOne({ name: orderData.product });
       if (product && product.apiMapping) {
          if (!orderData.manual) {
              const orderUuid = crypto.randomUUID();
              try {
                 const providerRes = await EshhanleService.createOrder(
                     product.apiMapping,
                     orderData.quantity || 1,
                     orderData.playerData || orderData.phone || '',
                     orderUuid
                 );
                 
                 if (providerRes && providerRes.status === 'OK') {
                    orderData.status = (providerRes.data?.status === 'accepted' || providerRes.data?.status === 'completed') ? 'accepted' : (providerRes.data?.status === 'rejected' || providerRes.data?.status === 'canceled') ? 'rejected' : 'processing';
                    orderData.responseInfo = providerRes.data?.status === 'accepted' ? 'تم التنفيذ بنجاح' : `[Auto-API] قيد المعالجة - ID: ${providerRes.data?.order_id || ''}`;
                    orderData.providerOrderId = providerRes.data?.order_id;
                    orderData.synced = true;
                 } else {
                    orderData.status = 'rejected';
                    orderData.responseInfo = `[Auto-API] Error: Provider rejected the order.`;
                    orderData.synced = false;
                 }
              } catch (apiError: any) {
                 orderData.status = 'rejected';
                 orderData.responseInfo = `[Auto-API] Exception: ${apiError.message || apiError.code}`;
                 orderData.synced = false;
              }
          } else {
              orderData.status = 'processing';
              orderData.responseInfo = `Pending manual send`;
              orderData.synced = false;
          }
       }
    }
    
    // Deduct balance from user (if not rejected immediately)
    if (orderData.status !== 'rejected') {
        const user = await User.findOne({ $or: [{ email: orderData.userEmail }, { _id: orderData.userId }] });
        if (user) {
            const orderPrice = parseFloat(String(orderData.price).split(' ')[0]);
            user.balance = (user.balance || 0) - orderPrice;
            await user.save();
        }
    }
    
    const order = new Order(orderData);
    const createdOrder = await order.save();
    
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'قيد المعالجة ⏳', callback_data: `order_status_processing_${createdOrder.id}` },
                    { text: 'مقبول ✅', callback_data: `order_status_accepted_${createdOrder.id}` }
                ],
                [
                    { text: 'مرفوض ❌', callback_data: `order_status_rejected_${createdOrder.id}` },
                    { text: 'ملغي 🚫', callback_data: `order_status_cancelled_${createdOrder.id}` }
                ],
                [
                    { text: 'مسترجع 💸', callback_data: `order_status_refunded_${createdOrder.id}` },
                    { text: 'فشل ⚠️', callback_data: `order_status_failed_${createdOrder.id}` }
                ]
            ]
        }
    };
    sendTelegramMessage(`🛒 <b>طلب شراء جديد!</b>\n\n<b>رقم الطلب:</b> ${createdOrder.orderNumber || createdOrder.id || 'غير محدد'}\n<b>المنتج:</b> ${createdOrder.product}\n<b>المبلغ:</b> ${createdOrder.price}\n<b>الاسم:</b> ${createdOrder.userName || 'غير محدد'}\n<b>البريد:</b> ${createdOrder.userEmail || 'غير محدد'}\n<b>رقم الهاتف:</b> ${createdOrder.userPhone || 'غير محدد'}\n<b>الرقم التسلسلي (ID):</b> ${createdOrder.userId || 'غير محدد'}\n<b>معلومات اللاعب (ID):</b> ${createdOrder.playerData || createdOrder.playerId || 'غير محدد'}\n<b>الوقت:</b> ${new Date(createdOrder.createdAt || Date.now()).toLocaleString('ar-SA')}`, options).catch(() => {});
    
    res.status(201).json(createdOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const orderId = req.params.id;
    
    // Check if admin is trying to send to API manually
    if (updates.action === 'send_to_api') {
       const order = await Order.findById(orderId);
       if (!order) return res.status(404).json({ message: 'Order not found' });
       const oldStatus = order.status;
       
       const product = await Product.findOne({ name: order.product });
       if (product && product.apiMapping) {
            const orderUuid = crypto.randomUUID();
            let providerRes;
            try {
               providerRes = await EshhanleService.createOrder(
                   product.apiMapping,
                   order.quantity || 1,
                   order.playerData || order.phone || '',
                   orderUuid
               );
               
               if (providerRes && providerRes.status === 'OK') {
                  order.status = (providerRes.data?.status === 'accepted' || providerRes.data?.status === 'completed') ? 'accepted' : (providerRes.data?.status === 'rejected' || providerRes.data?.status === 'canceled') ? 'rejected' : 'processing';
                  order.responseInfo = providerRes.data?.status === 'accepted' ? 'تم التنفيذ بنجاح' : `[Manual-API] قيد المعالجة - ID: ${providerRes.data?.order_id || ''}`;
                  order.providerOrderId = providerRes.data?.order_id;
                  order.synced = true;
               } else {
                  order.status = 'rejected';
                  order.responseInfo = `[Manual-API] Error: Provider rejected the order.`;
                  order.synced = false;
               }
            } catch (apiError: any) {
               order.status = 'rejected';
               order.responseInfo = `[Manual-API] Exception: ${apiError.message || apiError.code}`;
               order.synced = false;
            }
            
            // Refund if rejected now but wasn't before
            if (oldStatus !== 'rejected' && order.status === 'rejected') {
                const user = await User.findOne({ $or: [{ email: order.userEmail }, { _id: order.userId }] });
                if (user) {
                    const orderPrice = parseFloat(String(order.price).split(' ')[0]);
                    user.balance = (user.balance || 0) + orderPrice;
                    await user.save();
                }
            }
            
            const updated = await order.save();
            return res.json(updated);
       } else {
            return res.status(400).json({ message: 'Product not mapped to API' });
       }
    }

    const oldOrder = await Order.findById(orderId);
    if (!oldOrder) return res.status(404).json({ message: 'Order not found' });

    const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
    if (order) {
        if (oldOrder.status !== 'rejected' && order.status === 'rejected') {
            // Refund
            const user = await User.findOne({ $or: [{ email: order.userEmail }, { _id: order.userId }] });
            if (user) {
                const orderPrice = parseFloat(String(order.price).split(' ')[0]);
                user.balance = (user.balance || 0) + orderPrice;
                await user.save();
            }
        } else if (oldOrder.status === 'rejected' && order.status !== 'rejected') {
            // Deduct again
            const user = await User.findOne({ $or: [{ email: order.userEmail }, { _id: order.userId }] });
            if (user) {
                const orderPrice = parseFloat(String(order.price).split(' ')[0]);
                user.balance = (user.balance || 0) - orderPrice;
                await user.save();
            }
        }
        res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncOrderProvider = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.providerOrderId) return res.status(400).json({ message: 'Order has no provider ID to sync' });
    if (order.status !== 'processing') return res.status(400).json({ message: 'Order is not in processing state' });
    
    const oldStatus = order.status;
    let providerRes;
    
    try {
      providerRes = await EshhanleService.checkOrders([order.providerOrderId], false);
      if (providerRes && providerRes.status === 'OK' && providerRes.data && providerRes.data.length > 0) {
          const providerOrderInfo = providerRes.data[0];
          
          if (providerOrderInfo.status === 'wait') {
             // Still processing
             return res.json(order);
          } else if (providerOrderInfo.status === 'accepted' || providerOrderInfo.status === 'completed') {
             order.status = 'accepted';
             order.responseInfo = 'تم التنفيذ بنجاح (مُزامن)';
          } else if (providerOrderInfo.status === 'rejected' || providerOrderInfo.status === 'canceled') {
             order.status = 'rejected';
             order.responseInfo = `مرفوض من المزود (مُزامن)`;
          } else {
             // Unknown status?
             return res.json(order);
          }
      } else {
          return res.status(400).json({ message: 'Failed to fetch status from provider or invalid format' });
      }
    } catch (apiError: any) {
       return res.status(500).json({ message: `Provider Check Exception: ${apiError.message || apiError.code}` });
    }
    
    // Adjust balance if status changed
    if (oldStatus !== 'rejected' && order.status === 'rejected') {
        const user = await User.findOne({ $or: [{ email: order.userEmail }, { _id: order.userId }] });
        if (user) {
            const orderPrice = parseFloat(String(order.price).split(' ')[0]);
            user.balance = (user.balance || 0) + orderPrice;
            await user.save();
        }
    } else if (oldStatus === 'rejected' && order.status !== 'rejected') {
        const user = await User.findOne({ $or: [{ email: order.userEmail }, { _id: order.userId }] });
        if (user) {
            const orderPrice = parseFloat(String(order.price).split(' ')[0]);
            user.balance = (user.balance || 0) - orderPrice;
            await user.save();
        }
    }
    
    const updated = await order.save();
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
