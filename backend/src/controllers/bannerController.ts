import { Request, Response } from 'express';
import Banner from '../models/Banner';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const newBanner = new Banner(req.body);
    const createdBanner = await newBanner.save();
    res.status(201).json(createdBanner);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      Object.assign(banner, req.body);
      const updatedBanner = await banner.save();
      res.json(updatedBanner);
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      await banner.deleteOne();
      res.json({ message: 'Banner removed' });
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) res.json(banner);
    else res.status(404).json({ message: 'Banner not found' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
