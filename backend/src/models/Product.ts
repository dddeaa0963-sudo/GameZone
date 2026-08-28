import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  storeType?: 'normal' | 'quantities';
  unitPrice?: number;
  unitPriceUSD?: number;
  unitPriceSYP?: number;
  minQty?: number;
  maxQty?: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  image?: string;
  category: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  order: number;
  apiMapping?: string;
  requiredInput?: string;
  apiProviderId?: string;
  providerProductId?: string;
}

const ProductSchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  storeType: { type: String, enum: ['normal', 'quantities'], default: 'normal' },
  unitPrice: { type: Number },
  unitPriceUSD: { type: Number },
  unitPriceSYP: { type: Number },
  minQty: { type: Number, default: 1 },
  maxQty: { type: Number, default: 1000 },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number },
  stock: { type: Number, default: 0 },
  image: { type: String },
  category: { type: String, ref: 'Category', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  notes: { type: String },
  order: { type: Number, default: 0 },
  apiMapping: { type: String },
  requiredInput: { type: String, default: 'id' },
  apiProviderId: { type: String },
  providerProductId: { type: String }
}, {
  timestamps: true
});

export default (mongoose.models.Product as mongoose.Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);
