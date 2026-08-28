import mongoose, { Schema, Document } from 'mongoose';

export interface IGlobalNotification extends Document {
  title: string;
  message: string;
  type: string;
  alertType?: string;
  readBy?: string[];
  target?: string;
  date?: string;
}

const GlobalNotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' },
  alertType: { type: String },
  readBy: { type: [String], default: [] },
  target: { type: String, default: 'all' },
  date: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.GlobalNotification || mongoose.model<IGlobalNotification>("GlobalNotification", GlobalNotificationSchema);
