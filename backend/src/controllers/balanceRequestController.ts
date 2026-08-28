import { Request, Response } from 'express';
import BalanceRequest from '../models/BalanceRequest';
import User from '../models/User';
import { sendTelegramMessage, sendTelegramPhoto } from '../server';

export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await BalanceRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createRequest = async (req: Request, res: Response) => {
  try {
    const newRequest = new BalanceRequest(req.body);
    const createdRequest = await newRequest.save();
    
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ موافقة', callback_data: `approve_deposit_${createdRequest.id}` },
                    { text: '❌ رفض', callback_data: `reject_deposit_${createdRequest.id}` }
                ]
            ]
        }
    };
    
    const text = `💰 <b>طلب شحن رصيد جديد!</b>\n\n<b>الاسم:</b> ${createdRequest.userName || 'غير محدد'}\n<b>البريد:</b> ${createdRequest.userEmail || 'غير محدد'}\n<b>رقم الهاتف:</b> ${createdRequest.userPhone || 'غير محدد'}\n<b>الرقم التسلسلي (ID):</b> ${createdRequest.userId || 'غير محدد'}\n<b>المبلغ:</b> ${createdRequest.amount || createdRequest.amountUSD || 0} $\n<b>الطريقة:</b> ${createdRequest.method || 'غير محدد'}\n<b>رقم الحوالة:</b> ${createdRequest.transactionId || createdRequest.operationNumber || 'غير محدد'}\n<b>الوقت:</b> ${new Date().toLocaleString('ar-SA')}`;
    
    if (createdRequest.image) {
        let photoData = createdRequest.image;
        if (typeof photoData === 'string' && photoData.startsWith('data:image')) {
            const base64Data = photoData.replace(/^data:image\/\w+;base64,/, "");
            photoData = Buffer.from(base64Data, 'base64');
        }
        sendTelegramPhoto(photoData, text, options).catch(() => {});
    } else {
        sendTelegramMessage(text, options).catch(() => {});
    }
    
    res.status(201).json(createdRequest);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const request = await BalanceRequest.findById(req.params.id);
    if (request) {
      if ((req.body.status === 'Approved' || req.body.status === 'accepted') && request.status !== 'Approved' && request.status !== 'accepted') {
          const user = await User.findById(request.userId);
          if (user) {
              user.balance = (user.balance || 0) + (request.amount || 0);
              await user.save();
          }
      }
      
      Object.assign(request, req.body);
      const updatedRequest = await request.save();
      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Balance request not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const request = await BalanceRequest.findById(req.params.id);
    if (request) {
      await request.deleteOne();
      res.json({ message: 'Request removed' });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
