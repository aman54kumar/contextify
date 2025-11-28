import { getApiKey } from './apiKeyManager';
import { getCacheKey, getCachedResult, setCachedResult } from './cacheService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Prompt templates for different measurement types
const PROMPTS = {
    distance: (value, unit, style = 'General') => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} into 2-3 creative, practical, and easy-to-visualize comparisons.
    - Context Style: ${style} (Focus on comparisons related to this theme).
    - AVOID using the input unit itself in the comparison.
    - Be EXTREMELY DIVERSE and RANDOM - DO NOT repeat the same comparisons. Vary widely between: animals (ants, cats, dogs, elephants, giraffes, etc.), buildings (houses, towers, skyscrapers), everyday objects (pencils, books, cars), sports fields, human body parts, vehicles, natural features, etc.
    - AVOID overusing common references like "Blue Whale" - use a wide variety of different comparisons each time.
    - For very small measurements, express as "X of these make a [larger object]" instead of fractions.
    - Be accurate but make it relatable to everyday life. 
    - Return ONLY a JSON array with this exact format: [{"description": "About X football fields", "icon": "⚽"}]. Use appropriate emojis for icons.`,

    weight: (value, unit, style = 'General') => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} into 2-3 creative, practical comparisons.
    - Context Style: ${style} (Focus on comparisons related to this theme).
    - AVOID obvious comparisons (e.g., if input is "50 Earth masses", DO NOT say "50 Earths").
    - Be EXTREMELY DIVERSE and RANDOM - DO NOT repeat the same comparisons. Vary widely between: small animals (ants, mice, cats), medium animals (dogs, humans), large animals (elephants, hippos, rhinos, NOT just whales), vehicles (bikes, cars, trucks, planes), food items, everyday objects (books, phones, furniture), buildings, etc.
    - AVOID overusing "Blue Whale" or any single comparison - use maximum variety.
    - For very small weights, express as "X of these make a [heavier object]" instead of tiny fractions.
    - Return ONLY a JSON array with this exact format: [{"description": "Mass of all oceans combined", "icon": "🌊"}]. Use appropriate emojis for icons.`,

    temperature: (value, unit, style = 'General') => `You are a helpful assistant that creates relatable comparisons. Describe ${value}°${unit} in terms of weather, activities, or familiar reference points.
    - Context Style: ${style} (Focus on comparisons related to this theme).
    - Be CREATIVE and vary your references - use weather conditions, cooking temperatures, natural phenomena, human experiences, etc.
    - Return ONLY a JSON object with this exact format: {"description": "Hotter than a volcano", "icon": "🌋", "comparison": "Melts rock instantly"}. Use appropriate emoji for icon.`,

    time: (value, unit, style = 'General') => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} into 2-3 practical comparisons.
    - Context Style: ${style} (Focus on comparisons related to this theme).
    - Be DIVERSE - vary between movies, songs, activities, historical events, natural processes, human activities, etc.
    - For very short times, express as "X of these make a [longer duration]" instead of tiny fractions.
    - Return ONLY a JSON array with this exact format: [{"description": "Since the Pyramids were built", "icon": "🏛️"}]. Use appropriate emojis for icons.`,

    currency: (value, currency, city, style = 'General') => `You are a helpful assistant that creates relatable purchasing power comparisons. For ${value} ${currency} in ${city}, suggest 3-4 culturally relevant, practical items someone could buy. 
    - Context Style: ${style} (Focus on comparisons related to this theme).
    - Be DIVERSE - vary between food, drinks, transportation, entertainment, everyday items, etc.
    - Avoid fractional quantities. 
    - Return ONLY a JSON array with this exact format: [{"item": "Street tacos", "quantity": "5", "icon": "🌮"}]. Use appropriate emojis for icons.`
};

export const generateContext = async (type, value, unit, city = null, style = 'General') => {
    // Generate cache key (include style)
    const cacheKey = getCacheKey(type, value, unit, city) + `_${style}`;

    // Check cache first
    const cached = getCachedResult(cacheKey);
    if (cached) {
        return { success: true, data: cached, fromCache: true };
    }

    // Get API provider preference
    const provider = localStorage.getItem('contextify_llm_provider') || 'openai';
    const apiKey = getApiKey(provider);

    if (!apiKey) {
        return { success: false, error: 'No API key configured', useStatic: true };
    }

    try {
        let result;
        if (provider === 'openai') {
            result = await callOpenAI(type, value, unit, city, style, apiKey);
        } else if (provider === 'claude') {
            result = await callClaude(type, value, unit, city, style, apiKey);
        } else if (provider === 'gemini') {
            result = await callGemini(type, value, unit, city, style, apiKey);
        } else {
            return { success: false, error: 'Invalid provider', useStatic: true };
        }

        if (result.success) {
            // Cache the result
            setCachedResult(cacheKey, result.data);
        }

        return result;
    } catch (error) {
        console.error('LLM generation error:', error);
        return { success: false, error: error.message, useStatic: true };
    }
};

const callOpenAI = async (type, value, unit, city, style, apiKey) => {
    const prompt = type === 'currency'
        ? PROMPTS[type](value, unit, city, style)
        : PROMPTS[type](value, unit, style);

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that creates relatable unit conversions. Always respond with valid JSON only, no additional text.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 300
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response
    const parsed = JSON.parse(content);

    return { success: true, data: parsed };
};

const callClaude = async (type, value, unit, city, style, apiKey) => {
    const prompt = type === 'currency'
        ? PROMPTS[type](value, unit, city, style)
        : PROMPTS[type](value, unit, style);

    const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 300,
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Claude API error');
    }

    const data = await response.json();
    const content = data.content[0].text.trim();

    // Parse JSON response
    const parsed = JSON.parse(content);

    return { success: true, data: parsed };
};

const callGemini = async (type, value, unit, city, style, apiKey) => {
    const prompt = type === 'currency'
        ? PROMPTS[type](value, unit, city, style)
        : PROMPTS[type](value, unit, style);

    // Use gemini-1.5-flash-002 (stable free tier model)
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${apiKey}`;

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt + " Return ONLY valid JSON." }]
            }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text.trim();

    // Clean up markdown code blocks if present
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse JSON response
    const parsed = JSON.parse(content);

    return { success: true, data: parsed };
};

export const setLLMProvider = (provider) => {
    localStorage.setItem('contextify_llm_provider', provider);
};

export const getLLMProvider = () => {
    return localStorage.getItem('contextify_llm_provider') || 'openai';
};
