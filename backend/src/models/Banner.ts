import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title?: string;
  image: string;
  link?: string;
  isActive: boolean;
}

const BannerSchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);
