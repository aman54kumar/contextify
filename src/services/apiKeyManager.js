const API_KEY_STORAGE_KEY = 'contextify_api_keys';

// Get default API key from environment variable
const getDefaultApiKey = (provider) => {
    if (provider === 'openai') {
        return import.meta.env.VITE_OPENAI_API_KEY || '';
    }
    if (provider === 'gemini') {
        return import.meta.env.VITE_GEMINI_API_KEY || '';
    }
    return '';
};

export const saveApiKeys = (provider, apiKey) => {
    try {
        const keys = JSON.parse(localStorage.getItem(API_KEY_STORAGE_KEY) || '{}');
        keys[provider] = apiKey;
        localStorage.setItem(API_KEY_STORAGE_KEY, JSON.stringify(keys));
        return true;
    } catch (error) {
        console.error('Failed to save API key:', error);
        return false;
    }
};

export const getApiKey = (provider) => {
    try {
        const keys = JSON.parse(localStorage.getItem(API_KEY_STORAGE_KEY) || '{}');
        // First check localStorage, then fall back to environment variable
        return keys[provider] || getDefaultApiKey(provider);
    } catch (error) {
        console.error('Failed to retrieve API key:', error);
        return getDefaultApiKey(provider);
    }
};

export const clearApiKeys = () => {
    try {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear API keys:', error);
        return false;
    }
};

export const validateApiKey = (provider, key) => {
    if (provider === 'openai') return key.startsWith('sk-');
    if (provider === 'claude') return key.startsWith('sk-ant-');
    if (provider === 'gemini') return key.startsWith('AIza');
    return false;
};
