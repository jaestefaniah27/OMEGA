import CryptoJS from 'crypto-js';

export const PrivacyUtils = {
    encrypt(text: string, userId: string): string {
        if (!text) return '';
        return CryptoJS.AES.encrypt(text, userId).toString();
    },

    decrypt(cipherText: string, userId: string): string {
        if (!cipherText) return '';
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, userId);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            console.error('Decryption failed:', e);
            return '[Error de desencriptación]';
        }
    }
};
