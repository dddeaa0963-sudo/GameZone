import { Request, Response } from 'express';
import eshhanleService, { EshhanleError } from '../services/EshhanleService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller Example to interact with Eshhanle API
 */

// 1. Get Profile / Balance
export const getEshhanleProfile = async (req: Request, res: Response) => {
  try {
    const profile = await eshhanleService.getProfile();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    if (error instanceof EshhanleError) {
      return res.status(400).json({ success: false, code: error.code, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create Order
export const createEshhanleOrder = async (req: Request, res: Response) => {
  try {
    const { productId, qty, playerId } = req.body;

    if (!productId || !qty || !playerId) {
      return res.status(400).json({ success: false, message: 'الرجاء توفير جميع البيانات المطلوبة (productId, qty, playerId)' });
    }

    // Optional: Generate UUID to prevent duplicate orders
    const orderUuid = uuidv4();

    // Call service to create order
    const result = await eshhanleService.createOrder(productId, qty, playerId, orderUuid);

    // result typically contains: { status: "OK", data: { order_id: "...", status: "wait" } }
    res.json({
      success: true,
      message: 'تم إنشاء الطلب بنجاح',
      orderData: result.data
    });
  } catch (error: any) {
    if (error instanceof EshhanleError) {
      // Return clear error code and message to the frontend based on the error mapper
      return res.status(400).json({
        success: false,
        code: error.code,
        message: error.message
      });
    }
    
    // Internal server error or connection error
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Check Order Status
export const checkEshhanleOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderIds } = req.body; // e.g., ["12345", "67890"]

    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ success: false, message: 'الرجاء توفير مصفوفة orderIds' });
    }

    const statuses = await eshhanleService.checkOrders(orderIds);
    res.json({ success: true, data: statuses });
  } catch (error: any) {
    if (error instanceof EshhanleError) {
      return res.status(400).json({ success: false, code: error.code, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
