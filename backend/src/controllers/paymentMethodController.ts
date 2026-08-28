import { Request, Response } from 'express';
import PaymentMethod from '../models/PaymentMethod';

export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const newMethod = new PaymentMethod(req.body);
    const createdMethod = await newMethod.save();
    res.status(201).json(createdMethod);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (method) {
      Object.assign(method, req.body);
      const updatedMethod = await method.save();
      res.json(updatedMethod);
    } else {
      res.status(404).json({ message: 'Payment method not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (method) {
      await method.deleteOne();
      res.json({ message: 'Payment method removed' });
    } else {
      res.status(404).json({ message: 'Payment method not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
