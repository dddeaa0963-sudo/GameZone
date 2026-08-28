import express from 'express';
import ApiProvider from '../models/ApiProvider.js';
import { decrypt } from '../utils/encryption.js';

const router = express.Router();

router.post('/verify-player', async (req, res) => {
    try {
        const { game, playerId } = req.body;
        if (!game || !playerId) {
            return res.status(400).json({ success: false, error: 'game and playerId are required' });
        }

        // Try to find a matching provider. First by exact name, then by regex.
        let provider: any = await ApiProvider.findOne({ type: 'Game Verification', enabled: true, name: game });
        if (!provider) {
            // Try matching name (e.g. "PUBG" matching "PUBG Mobile Verification API")
            const allVerificationProviders = await ApiProvider.find({ type: 'Game Verification', enabled: true });
            provider = allVerificationProviders.find(p => p.name.toLowerCase().includes(game.toLowerCase()) || game.toLowerCase().includes(p.name.toLowerCase()));
        }

        if (!provider) {
            return res.json({ success: false, errorCode: 'PROVIDER_NOT_CONFIGURED', error: 'Player verification is currently unavailable.' });
        }

        let url = provider.baseUrl;
        if (provider.endpoint) url += provider.endpoint;

        // Replace placeholders in URL
        url = url.replace('{{playerId}}', encodeURIComponent(playerId)).replace('{{game}}', encodeURIComponent(game));

        const fetchOptions: RequestInit = {
            method: provider.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // Add custom headers and replace placeholders
        if (provider.headers && provider.headers.length > 0) {
            provider.headers.forEach((h: any) => {
                if (h.key) {
                    let val = h.value;
                    val = val.replace('{{playerId}}', playerId).replace('{{game}}', game);
                    (fetchOptions.headers as any)[h.key] = val;
                }
            });
        }

        // Apply Authentication
        if (provider.authenticationType === 'Bearer Token' && provider.encryptedCredentials?.token) {
            (fetchOptions.headers as any)['Authorization'] = `Bearer ${decrypt(provider.encryptedCredentials.token)}`;
        } else if (provider.authenticationType === 'API Key' && provider.encryptedCredentials?.apiKey) {
             (fetchOptions.headers as any)['X-API-Key'] = decrypt(provider.encryptedCredentials.apiKey);
        } else if (provider.authenticationType === 'Basic Authentication' && provider.encryptedCredentials?.apiKey) {
             const key = decrypt(provider.encryptedCredentials.apiKey);
             const secret = decrypt(provider.encryptedCredentials.apiSecret || '');
             (fetchOptions.headers as any)['Authorization'] = `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
        }

        if (provider.method !== 'GET') {
            const bodyData = {
                game: game,
                playerId: playerId
            };
            fetchOptions.body = JSON.stringify(bodyData);
        }

        // Retry logic with exponential backoff
        const maxRetries = provider.retryCount || 0;
        let attempt = 0;
        let response;
        let fetchErr;

        while (attempt <= maxRetries) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), provider.timeout || 5000);
                fetchOptions.signal = controller.signal;
                
                response = await fetch(url, fetchOptions);
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    break; // Success, exit retry loop
                } else {
                    fetchErr = new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (err: any) {
                fetchErr = err;
            }
            attempt++;
            if (attempt <= maxRetries) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }

        if (!response || !response.ok) {
            return res.json({ success: false, errorCode: 'PROVIDER_ERROR', error: 'Failed to verify player with provider', details: fetchErr?.message });
        }

        let responseData = null;
        try {
            responseData = await response.json();
        } catch (e) {
            return res.json({ success: false, errorCode: 'INVALID_JSON', error: 'Provider returned invalid format' });
        }

        // Apply Response Mapping
        let isSuccess = false;
        let resolvedPlayerName = '';
        let resolvedPlayerId = playerId;

        const getNestedValue = (obj: any, path: string) => {
            if (!path) return undefined;
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        if (provider.responseMapping && provider.responseMapping.successField) {
             const val = getNestedValue(responseData, provider.responseMapping.successField);
             // Consider 'true', true, 200, "OK", 1 as success
             if (val === true || val === 'true' || val === 200 || val === 1 || val === 'OK' || val === 'success') {
                 isSuccess = true;
             }
        } else {
             // Fallback if not configured: assume success if HTTP 200
             isSuccess = true;
        }

        if (provider.responseMapping && provider.responseMapping.playerNameField) {
            resolvedPlayerName = getNestedValue(responseData, provider.responseMapping.playerNameField) || '';
        }

        if (provider.responseMapping && provider.responseMapping.playerIdField) {
             resolvedPlayerId = getNestedValue(responseData, provider.responseMapping.playerIdField) || playerId;
        }

        if (isSuccess) {
             return res.json({
                 success: true,
                 verified: true,
                 playerId: resolvedPlayerId,
                 playerName: resolvedPlayerName
             });
        } else {
             return res.json({
                 success: false,
                 verified: false,
                 errorCode: 'VERIFICATION_FAILED',
                 error: 'Player ID could not be verified'
             });
        }

    } catch (error: any) {
        res.status(500).json({ success: false, errorCode: 'INTERNAL_ERROR', error: error.message });
    }
});

export default router;
