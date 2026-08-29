import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const setting = await Setting.findById('global');
    if (setting) {
      const data = setting.toObject();
      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;
      res.json(data);
    } else {
      res.json({});
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const setting = await Setting.findByIdAndUpdate(
      'global',
      { $set: req.body },
      { new: true, upsert: true }
    );
    const data = setting.toObject();
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
