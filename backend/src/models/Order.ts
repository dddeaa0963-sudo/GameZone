import mongoose, { Schema, Document } from 'mongoose';

const OrderSchema: Schema = new Schema({}, { strict: false, timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
