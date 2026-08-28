import mongoose, { Schema, Document } from 'mongoose';

export interface IBalanceRequest extends Document {
  userId?: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  amount: number;
  amountUSD?: number;
  amountSYP?: number;
  currency?: string;
  method: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'processing' | 'accepted' | 'rejected';
  transactionId?: string;
  operationNumber?: string;
  date?: string;
  note?: string;
  image?: string;
}

const BalanceRequestSchema: Schema = new Schema({
  userId: { type: String, ref: 'User' },
  userEmail: { type: String },
  userName: { type: String },
  userPhone: { type: String },
  amount: { type: Number, required: true },
  amountUSD: { type: Number },
  amountSYP: { type: Number },
  currency: { type: String },
  method: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'processing', 'accepted', 'rejected'], default: 'processing' },
  transactionId: { type: String },
  operationNumber: { type: String },
  date: { type: String },
  note: { type: String },
  image: { type: String }
}, {
  timestamps: true,
  strict: false // allow other fields just in case
});

export default mongoose.models.BalanceRequest || mongoose.model<IBalanceRequest>("BalanceRequest", BalanceRequestSchema);
