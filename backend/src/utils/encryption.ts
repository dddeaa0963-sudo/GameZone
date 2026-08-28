import crypto from 'crypto';

// In a real app, this should be in .env. We use a fallback if not provided.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'gamezone_secure_key_123456789012'; // Must be 32 bytes for aes-256-cbc. Let's pad it to 32 bytes if not.
const IV_LENGTH = 16;

function getKey(): Buffer {
    let key = ENCRYPTION_KEY;
    if (key.length < 32) {
        key = key.padEnd(32, '0');
    } else if (key.length > 32) {
        key = key.substring(0, 32);
    }
    return Buffer.from(key, 'utf8');
}

export function encrypt(text: string): string {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        console.error('Encryption error:', e);
        return text;
    }
}

export function decrypt(text: string): string {
    if (!text) return text;
    if (!text.includes(':')) return text; // Probably not encrypted
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift() as string, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption error:', e);
        return text; // Return original on error (maybe it was plaintext)
    }
}
