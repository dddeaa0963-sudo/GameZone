import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('category');
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = new Product(req.body);
    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    let product = await Product.findById(req.params.id);
    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      const newProd = new Product({ _id: req.params.id, ...req.body });
      const created = await newProd.save();
      res.status(201).json(created);
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncProducts = async (req: Request, res: Response) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) return res.status(400).json({ message: 'Invalid data' });
    
    const uniqueProds = [];
    const seen = new Set();
    for (const p of products) {
      if (p._id && !seen.has(p._id)) {
        seen.add(p._id);
        uniqueProds.push(p);
      }
    }
    
    const bulkOps = uniqueProds.map(prod => ({
      updateOne: {
        filter: { _id: prod._id },
        update: { $set: prod },
        upsert: true
      }
    }));
    
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps, { ordered: false });
    }
    
    const idsToKeep = uniqueProds.map(p => p._id);
    await Product.deleteMany({ _id: { $nin: idsToKeep } });
    res.json({ message: 'Products synced', count: uniqueProds.length });
  } catch (error: any) {
    console.error(error); res.status(500).json({ message: error.message });
  }
};
