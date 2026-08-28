import express from 'express';
import ApiProvider from '../models/ApiProvider.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = express.Router();

function maskSecret(secret?: string): string {
    if (!secret) return '';
    return '••••••••••••••••';
}

// GET all providers
router.get('/', async (req, res) => {
    try {
        const providers = await ApiProvider.find().sort({ createdAt: -1 });
        const safeProviders = providers.map(p => {
            const pObj = p.toObject();
            if (pObj.encryptedCredentials) {
                if (pObj.encryptedCredentials.apiKey) pObj.encryptedCredentials.apiKey = maskSecret(pObj.encryptedCredentials.apiKey);
                if (pObj.encryptedCredentials.apiSecret) pObj.encryptedCredentials.apiSecret = maskSecret(pObj.encryptedCredentials.apiSecret);
                if (pObj.encryptedCredentials.token) pObj.encryptedCredentials.token = maskSecret(pObj.encryptedCredentials.token);
            }
            return pObj;
        });
        res.json(safeProviders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST new provider
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.encryptedCredentials) {
            if (data.encryptedCredentials.apiKey) data.encryptedCredentials.apiKey = encrypt(data.encryptedCredentials.apiKey);
            if (data.encryptedCredentials.apiSecret) data.encryptedCredentials.apiSecret = encrypt(data.encryptedCredentials.apiSecret);
            if (data.encryptedCredentials.token) data.encryptedCredentials.token = encrypt(data.encryptedCredentials.token);
        }
        const provider = new ApiProvider(data);
        await provider.save();
        res.status(201).json(provider);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update provider
router.put('/:id', async (req, res) => {
    try {
        const provider = await ApiProvider.findById(req.params.id);
        if (!provider) return res.status(404).json({ message: 'Provider not found' });

        const data = { ...req.body };
        
        // Handle credential updates (preserve existing if masked)
        if (data.encryptedCredentials) {
            if (data.encryptedCredentials.apiKey && data.encryptedCredentials.apiKey.includes('••••')) {
                data.encryptedCredentials.apiKey = provider.encryptedCredentials?.apiKey;
            } else if (data.encryptedCredentials.apiKey) {
                data.encryptedCredentials.apiKey = encrypt(data.encryptedCredentials.apiKey);
            }

            if (data.encryptedCredentials.apiSecret && data.encryptedCredentials.apiSecret.includes('••••')) {
                data.encryptedCredentials.apiSecret = provider.encryptedCredentials?.apiSecret;
            } else if (data.encryptedCredentials.apiSecret) {
                data.encryptedCredentials.apiSecret = encrypt(data.encryptedCredentials.apiSecret);
            }

            if (data.encryptedCredentials.token && data.encryptedCredentials.token.includes('••••')) {
                data.encryptedCredentials.token = provider.encryptedCredentials?.token;
            } else if (data.encryptedCredentials.token) {
                data.encryptedCredentials.token = encrypt(data.encryptedCredentials.token);
            }
        }

        Object.assign(provider, data);
        await provider.save();
        res.json(provider);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE provider
router.delete('/:id', async (req, res) => {
    try {
        await ApiProvider.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST test connection
router.post('/:id/test', async (req, res) => {
    try {
        const provider = await ApiProvider.findById(req.params.id);
        if (!provider) return res.status(404).json({ message: 'Provider not found' });

        const startTime = Date.now();
        let url = provider.baseUrl;
        if (provider.endpoint) url += provider.endpoint;
        
        const fetchOptions: RequestInit = {
            method: provider.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Add custom headers
        if (provider.headers && provider.headers.length > 0) {
            provider.headers.forEach(h => {
                if (h.key) (fetchOptions.headers as any)[h.key] = h.value;
            });
        }

        // Apply Authentication
        if (provider.authenticationType === 'Bearer Token' && provider.encryptedCredentials?.token) {
            (fetchOptions.headers as any)['Authorization'] = `Bearer ${decrypt(provider.encryptedCredentials.token)}`;
        } else if (provider.authenticationType === 'API Key' && provider.encryptedCredentials?.apiKey) {
             // Basic assumption for API Key if header name is not specified (user should specify in headers for full control, but we add default here if needed, else we rely on custom headers)
             // We can check if custom headers already have an API key placeholder, or just assume Authorization if custom is missing.
             // Usually, users put "Authorization" in custom headers and we inject it, but let's just do a generic one if authType is set
             (fetchOptions.headers as any)['X-API-Key'] = decrypt(provider.encryptedCredentials.apiKey);
        } else if (provider.authenticationType === 'Basic Authentication' && provider.encryptedCredentials?.apiKey) {
             const key = decrypt(provider.encryptedCredentials.apiKey);
             const secret = decrypt(provider.encryptedCredentials.apiSecret || '');
             (fetchOptions.headers as any)['Authorization'] = `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
        }

        let bodyData = null;
        if (provider.method !== 'GET') {
            // Send dummy data for test if game verification
            if (provider.type === 'Game Verification') {
                bodyData = {
                    playerId: 'test_123',
                    game: 'test_game'
                };
                fetchOptions.body = JSON.stringify(bodyData);
            }
        }

        // Mock AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), provider.timeout || 5000);
        fetchOptions.signal = controller.signal;

        let response;
        try {
            response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);
        } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            provider.status = 'Error';
            provider.lastError = fetchErr.message;
            provider.lastTestAt = new Date();
            await provider.save();
            return res.json({ success: false, error: fetchErr.message, responseTime: Date.now() - startTime });
        }

        const responseTime = Date.now() - startTime;
        let responseData = null;
        
        try {
            responseData = await response.json();
        } catch (e) {
            try {
                responseData = await response.text();
            } catch (e) {}
        }

        if (response.ok) {
            provider.status = 'Connected';
            provider.lastError = '';
            provider.lastSuccessfulTestAt = new Date();
        } else {
            provider.status = 'Error';
            provider.lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        provider.lastTestAt = new Date();
        await provider.save();

        res.json({
            success: response.ok,
            status: response.status,
            responseTime,
            data: responseData,
            error: response.ok ? null : provider.lastError
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
