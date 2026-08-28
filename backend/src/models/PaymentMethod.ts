import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  info?: string;
  link?: string;
  note?: string;
  image?: string;
  minDeposit?: number;
  qrCode?: string;
  isActive: boolean;
}

const PaymentMethodSchema: Schema = new Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  info: { type: String },
  link: { type: String },
  note: { type: String },
  image: { type: String },
  minDeposit: { type: Number },
  qrCode: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema);
