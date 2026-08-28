import { Request, Response } from 'express';
import GlobalNotification from '../models/GlobalNotification';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await GlobalNotification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const newNotification = new GlobalNotification(req.body);
    const createdNotification = await newNotification.save();
    res.status(201).json(createdNotification);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notif = await GlobalNotification.findById(req.params.id);
    if (notif) {
      await notif.deleteOne();
      res.json({ message: 'Notification removed' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const updateNotification = async (req: Request, res: Response) => {
  try {
    const notif = await GlobalNotification.findById(req.params.id);
    if (notif) {
      Object.assign(notif, req.body);
      const updated = await notif.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
