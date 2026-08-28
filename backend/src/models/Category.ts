import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: string | null;
  order: number;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  icon: { type: String },
  parent: { type: String, default: null },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
