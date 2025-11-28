const CACHE_KEY_PREFIX = 'contextify_cache_';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 100; // Maximum number of cached items

export const getCacheKey = (type, value, unit, city = null) => {
    const parts = [type, value, unit];
    if (city) parts.push(city);
    return `${CACHE_KEY_PREFIX}${parts.join('_')}`;
};

export const getCachedResult = (cacheKey) => {
    try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is expired
        if (now - timestamp > CACHE_TTL) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Cache retrieval error:', error);
        return null;
    }
};

export const setCachedResult = (cacheKey, data) => {
    try {
        // Enforce cache size limit
        cleanupOldCache();

        const cacheEntry = {
            data,
            timestamp: Date.now()
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
        return true;
    } catch (error) {
        console.error('Cache storage error:', error);
        return false;
    }
};

export const clearCache = () => {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Cache clear error:', error);
        return false;
    }
};

const cleanupOldCache = () => {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));

        if (cacheKeys.length >= MAX_CACHE_SIZE) {
            // Get all cache entries with timestamps
            const entries = cacheKeys.map(key => {
                try {
                    const cached = JSON.parse(localStorage.getItem(key));
                    return { key, timestamp: cached.timestamp };
                } catch {
                    return { key, timestamp: 0 };
                }
            });

            // Sort by timestamp (oldest first)
            entries.sort((a, b) => a.timestamp - b.timestamp);

            // Remove oldest 20%
            const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
            entries.slice(0, toRemove).forEach(entry => {
                localStorage.removeItem(entry.key);
            });
        }
    } catch (error) {
        console.error('Cache cleanup error:', error);
    }
};
