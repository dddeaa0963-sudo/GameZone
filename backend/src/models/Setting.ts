import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Omit<Document, '_id'> {
  _id: string;
  [key: string]: any;
}

const SettingSchema: Schema = new Schema({
  _id: { type: String, default: 'global' },
}, { strict: false, timestamps: true });

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
