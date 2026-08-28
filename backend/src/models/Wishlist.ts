import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
  userId: string;
  productId: string;
}

const WishlistSchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userId: { type: String, ref: 'User', required: true },
  productId: { type: String, ref: 'Product', required: true }
}, {
  timestamps: true
});

export default mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);
