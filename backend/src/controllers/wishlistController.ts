import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist';
import Product from '../models/Product';

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wishlistItems = await Wishlist.find({ userId }).populate('productId');
    res.json(wishlistItems);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleWishlistItem = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;
    const existingItem = await Wishlist.findOne({ userId, productId });
    
    if (existingItem) {
      await existingItem.deleteOne();
      res.json({ message: 'Removed from wishlist', added: false });
    } else {
      const newItem = new Wishlist({ userId, productId });
      await newItem.save();
      res.status(201).json({ message: 'Added to wishlist', added: true });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
