import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'User' | 'Admin' | 'Super Admin' | 'Staff' | 'Customer';
  status: 'Active' | 'Suspended' | 'active' | 'suspended';
  balance: number;
  phone?: string;
  image?: string;
  country?: string;
  login_id?: string;
  pin?: string;
  currency?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['User', 'Admin', 'Super Admin', 'Staff', 'Customer'], default: 'Customer' },
  status: { type: String, enum: ['Active', 'Suspended', 'active', 'suspended'], default: 'Active' },
  balance: { type: Number, default: 0 },
  phone: { type: String },
  image: { type: String },
  country: { type: String },
  login_id: { type: String },
  pin: { type: String },
  currency: { type: String, default: 'USD' }
}, {
  timestamps: true
});

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
