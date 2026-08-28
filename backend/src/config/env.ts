import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
export const MONGO_URI = rawUri.replace('mongodb srv', 'mongodb+srv');
export const NODE_ENV = process.env.NODE_ENV || 'production';

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '';
