import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error: any) {
    console.error(error); res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) res.json(category);
    else res.status(404).json({ message: 'Category not found' });
  } catch (error: any) {
    console.error(error); res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const newCategory = new Category(req.body);
    const createdCategory = await newCategory.save();
    res.status(201).json(createdCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    let category = await Category.findById(req.params.id);
    if (category) {
      Object.assign(category, req.body);
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      const newCat = new Category({ _id: req.params.id, ...req.body });
      const created = await newCat.save();
      res.status(201).json(created);
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error: any) {
    console.error(error); res.status(500).json({ message: error.message });
  }
};

export const syncCategories = async (req: Request, res: Response) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories)) return res.status(400).json({ message: 'Invalid data' });
    
    const uniqueCats = [];
    const seen = new Set();
    for (const c of categories) {
      if (c._id && !seen.has(c._id)) {
        seen.add(c._id);
        uniqueCats.push(c);
      }
    }
    
    const bulkOps = uniqueCats.map(cat => ({
      updateOne: {
        filter: { _id: cat._id },
        update: { $set: cat },
        upsert: true
      }
    }));
    
    if (bulkOps.length > 0) {
      await Category.bulkWrite(bulkOps, { ordered: false });
    }
    
    const idsToKeep = uniqueCats.map(c => c._id);
    await Category.deleteMany({ _id: { $nin: idsToKeep } });
    res.json({ message: 'Categories synced', count: uniqueCats.length });
  } catch (error: any) {
    console.error(error); res.status(500).json({ message: error.message });
  }
};
