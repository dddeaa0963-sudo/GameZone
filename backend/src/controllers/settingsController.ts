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
    let setting = await Setting.findById('global');
    if (setting) {
      Object.assign(setting, req.body);
      await setting.save();
      const data = setting.toObject();
      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;
      res.json(data);
    } else {
      const newSetting = new Setting({ _id: 'global', ...req.body });
      await newSetting.save();
      const data = newSetting.toObject();
      delete data._id;
      delete data.__v;
      delete data.createdAt;
      delete data.updatedAt;
      res.status(201).json(data);
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
