import mongoose, { Schema, Document } from 'mongoose';

export interface IApiProvider extends Document {
    name: string;
    type: 'Game Verification' | 'Game Top-Up' | 'Email' | 'Payment' | 'SMS' | 'Custom REST API' | string;
    baseUrl: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    authenticationType: 'API Key' | 'Bearer Token' | 'Basic Authentication' | 'Custom Header' | 'OAuth 2.0' | 'No Authentication';
    encryptedCredentials: {
        apiKey?: string;
        apiSecret?: string;
        token?: string;
    };
    headers: { key: string; value: string }[];
    responseMapping: {
        successField?: string;
        playerNameField?: string;
        playerIdField?: string;
    };
    timeout: number;
    retryCount: number;
    enabled: boolean;
    status: 'Connected' | 'Disconnected' | 'Error' | 'Disabled' | 'Not Tested';
    lastTestAt?: Date;
    lastSuccessfulTestAt?: Date;
    lastError?: string;
}

const ApiProviderSchema: Schema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    baseUrl: { type: String, required: true },
    endpoint: { type: String, default: '' },
    method: { type: String, default: 'POST' },
    authenticationType: { type: String, default: 'No Authentication' },
    encryptedCredentials: {
        apiKey: { type: String },
        apiSecret: { type: String },
        token: { type: String },
    },
    headers: [{ key: String, value: String }],
    responseMapping: {
        successField: { type: String },
        playerNameField: { type: String },
        playerIdField: { type: String },
    },
    timeout: { type: Number, default: 5000 },
    retryCount: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    status: { type: String, default: 'Not Tested' },
    lastTestAt: { type: Date },
    lastSuccessfulTestAt: { type: Date },
    lastError: { type: String },
}, { timestamps: true });

export default mongoose.models.ApiProvider as mongoose.Model<IApiProvider> || mongoose.model<IApiProvider>('ApiProvider', ApiProviderSchema);
