import { getApiKey } from './apiKeyManager';
import { getCacheKey, getCachedResult, setCachedResult } from './cacheService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper to get base value for better LLM accuracy
// Helper to get base value for better LLM accuracy
const getBaseValue = (type, value, unit) => {
    const val = parseFloat(value);
    if (isNaN(val)) return null;

    // Helper to format large numbers without scientific notation if possible
    const format = (n, u) => {
        if (n < 1e6 && n > 1e-3) return { val: n, unit: u, str: `${n.toLocaleString()} ${u}` };
        return { val: n, unit: u, str: `${n.toExponential(2)} ${u}` };
    };

    if (type === 'distance') {
        // Convert to meters
        if (unit === 'm') return format(val, 'meters');
        if (unit === 'km') return format(val * 1000, 'meters');
        if (unit === 'ft') return format(val * 0.3048, 'meters');
        if (unit === 'mi') return format(val * 1609.34, 'meters');
        if (unit === 'cm') return format(val / 100, 'meters');
        if (unit === 'mm') return format(val / 1000, 'meters');
        if (unit === 'ly') return format(val * 9.461e15, 'meters');
        if (unit === 'pc') return format(val * 3.086e16, 'meters');
        if (unit === 'au') return format(val * 1.496e11, 'meters');
        if (unit === 'nm') return format(val * 1e-9, 'meters');
        if (unit === 'angstrom') return format(val * 1e-10, 'meters');
        if (unit === 'solar_radius') return format(val * 6.957e8, 'meters');
    }

    if (type === 'weight') {
        // Convert to kg
        if (unit === 'kg') return format(val, 'kg');
        if (unit === 'g') return format(val / 1000, 'kg');
        if (unit === 'mg') return format(val / 1e6, 'kg');
        if (unit === 'lb') return format(val * 0.453592, 'kg');
        if (unit === 'oz') return format(val * 0.0283495, 'kg');
        if (unit === 'ton') return format(val * 1000, 'kg');
        if (unit === 'solar_mass') return format(val * 1.989e30, 'kg');
        if (unit === 'earth_mass') return format(val * 5.972e24, 'kg');
        if (unit === 'u') return format(val * 1.66e-27, 'kg');
        if (unit === 'electron_mass') return format(val * 9.109e-31, 'kg');
    }

    if (type === 'time') {
        // Convert to seconds
        if (unit === 's') return format(val, 'seconds');
        if (unit === 'm') return format(val * 60, 'seconds');
        if (unit === 'h') return format(val * 3600, 'seconds');
        if (unit === 'd') return format(val * 86400, 'seconds');
        if (unit === 'y') return format(val * 3.154e7, 'seconds');
        if (unit === 'millennium') return format(val * 3.154e10, 'seconds');
        if (unit === 'galactic_year') return format(val * 7.26e15, 'seconds'); // ~230M years
        if (unit === 'ms') return format(val / 1000, 'seconds');
        if (unit === 'us') return format(val / 1e6, 'seconds');
        if (unit === 'ns') return format(val / 1e9, 'seconds');
        if (unit === 'planck_time') return format(val * 5.39e-44, 'seconds');
    }

    if (type === 'temperature') {
        // Convert to Celsius
        if (unit === 'c') return format(val, 'Celsius');
        if (unit === 'f') return format((val - 32) * 5 / 9, 'Celsius');
        if (unit === 'k') return format(val - 273.15, 'Celsius');
        if (unit === 'planck_temp') return format(1.417e32, 'Celsius');
        if (unit === 'core_sun') return format(1.5e7, 'Celsius');
    }

    return null;
};

// Standard reference sizes for accurate calculations
const REFERENCE_SIZES = {
    distance: `
    - Football Field: 100 meters
    - City Block: 100 meters (approx)
    - Bus: 12 meters
    - Eiffel Tower: 300 meters
    - Mt. Everest: 8,848 meters
    - Earth Diameter: 12,742 km
    - Sun Diameter: 1.4 million km
    - AU (Earth-Sun): 150 million km
    - Light Year: 9.46 trillion km
    - Milky Way Diameter: 100,000 light years
    `,
    weight: `
    - Blue Whale: 150,000 kg (150 tons)
    - Elephant: 5,000 kg (5 tons)
    - Car: 2,000 kg (2 tons)
    - Human: 70 kg
    - Apple: 0.2 kg
    - Earth Mass: 5.97 x 10^24 kg
    - Sun Mass: 1.989 x 10^30 kg
    `,
    time: `
    - Movie: 2 hours
    - Day: 24 hours
    - Year: 365 days
    - Human Lifespan: 80 years
    - Recorded History: 5,000 years
    - Age of Universe: 13.8 billion years
    `
};

// Prompt templates for different measurement types
const PROMPTS = {
    distance: (value, unit, style = 'General', base = null) => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} ${base ? `(approx ${base.str})` : ''} into exactly 3 creative, practical, and easy-to-visualize comparisons.
    - Context Style: ${style} (STRICTLY adhere to this theme).
    - REFERENCE SIZES (USE THESE CONSTANTS):
      ${REFERENCE_SIZES.distance}
    - MATH CHECK (CRITICAL):
      - 1. Identify the Reference Object size.
      - 2. MAGNITUDE CHECK: Is Input (${value} ${unit}) > Reference Object?
         - YES: Result MUST be "X times the [Object]". (e.g., 10 ly > 4.3 ly Alpha Centauri -> "2.3 times the distance").
         - NO: Result MUST be a fraction.
      - 3. Calculate the ratio.
    - PHRASING RULES (STRICT):
      - DO NOT use scientific notation or tiny percentages (e.g., NO "0.000067%").
      - If ratio < 0.01 (1%), use "1 in X" or "1/X" (e.g., "1/1000th of the distance", "One millionth of the width").
      - DO NOT repeat the input value. Start directly with the magnitude.
    - SCALE AWARENESS: Match the scale of the comparison to the input.
      - If input is ASTRONOMICAL (e.g., light years, parsecs), comparisons MUST be astronomical (distance to stars, galaxy width, etc.). DO NOT stack small objects (e.g., "trillions of bananas").
      - If input is MICROSCOPIC (e.g., nanometers), comparisons MUST be microscopic (atoms, DNA, viruses).
      - If input is HUMAN SCALE (e.g., meters, km), use everyday objects (buses, buildings, cities).
    - IF style is 'Sports', ONLY use sports fields, equipment, athletes, or game-related distances.
    - IF style is 'Pop Culture', ONLY use movies, TV shows, celebrities, or famous fictional objects.
    - IF style is 'Nature', ONLY use animals, plants, landscapes, or natural phenomena.
    - IF style is 'Science', ONLY use atoms, cells, planets, or scientific instruments.
    - AVOID using the input unit itself in the comparison.
    - Be DIVERSE within the chosen style - do not repeat the same comparisons.
    - AVOID overusing common references like "Blue Whale" unless it fits the specific style perfectly.
    - For very small measurements, express as "X of these make a [larger object]" instead of fractions.
    - Return ONLY a JSON array with this exact format: [{"description": "About X football fields", "icon": "⚽"}]. Use appropriate emojis for icons.`,

    weight: (value, unit, style = 'General', base = null) => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} ${base ? `(approx ${base.str})` : ''} into exactly 3 creative, practical comparisons.
    - Context Style: ${style} (STRICTLY adhere to this theme).
    - REFERENCE SIZES (USE THESE CONSTANTS):
      ${REFERENCE_SIZES.weight}
    - MATH CHECK (CRITICAL):
      - 1. Identify the Reference Object size.
      - 2. MAGNITUDE CHECK: Is Input (${value} ${unit}) > Reference Object?
         - YES: Result MUST be "X times the [Object]".
         - NO: Result MUST be a fraction.
      - 3. Calculate the ratio.
    - PHRASING RULES (STRICT):
      - DO NOT use scientific notation or tiny percentages.
      - If ratio < 0.01, use "1 in X" or "1/X".
      - DO NOT repeat the input value.
    - SCALE AWARENESS: Match the scale of the comparison to the input.
      - If input is MASSIVE (e.g., planets, stars), comparisons MUST be massive (Earths, Suns, black holes). DO NOT stack small objects.
      - If input is TINY (e.g., atoms), comparisons MUST be tiny.
    - IF style is 'Sports', ONLY use equipment (balls, weights), athletes, or stadium structures.
    - IF style is 'Pop Culture', ONLY use movie props, famous characters, or celebrity references.
    - IF style is 'Nature', ONLY use animals, rocks, trees, or water bodies.
    - AVOID obvious comparisons (e.g., if input is "50 Earth masses", DO NOT say "50 Earths").
    - Be DIVERSE within the chosen style.
    - AVOID overusing "Blue Whale" unless it fits the style (e.g., Nature).
    - For very small weights, express as "X of these make a [heavier object]" instead of tiny fractions.
    - Return ONLY a JSON array with this exact format: [{"description": "Mass of all oceans combined", "icon": "🌊"}]. Use appropriate emojis for icons.`,

    temperature: (value, unit, style = 'General', base = null) => `You are a helpful assistant that creates relatable comparisons. Describe ${value}°${unit} ${base ? `(approx ${base.str})` : ''} in terms of weather, activities, or familiar reference points.
    - Context Style: ${style} (STRICTLY adhere to this theme).
    - PHRASING RULES (STRICT):
      - DO NOT repeat the input value.
      - Start directly with the magnitude.
    - SCALE AWARENESS: Match the intensity.
      - If EXTREME HEAT (thousands/millions of degrees), compare to stars, nuclear blasts, or planetary cores.
      - If EXTREME COLD (near absolute zero), compare to deep space or liquid nitrogen.
    - IF style is 'Sports', relate to playing conditions, athlete body temp, or equipment limits.
    - IF style is 'Pop Culture', relate to movie scenes (e.g., Hoth, Mordor) or famous quotes.
    - Be CREATIVE and vary your references within the style.
    - Return ONLY a JSON object with this exact format: {"description": "Hotter than a volcano", "icon": "🌋", "comparison": "Melts rock instantly"}. Use appropriate emoji for icon.`,

    time: (value, unit, style = 'General', base = null) => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} ${base ? `(approx ${base.str})` : ''} into exactly 3 practical comparisons.
    - Context Style: ${style} (STRICTLY adhere to this theme).
    - REFERENCE SIZES (USE THESE CONSTANTS):
      ${REFERENCE_SIZES.time}
    - MATH CHECK (CRITICAL):
      - 1. Identify the Reference Object size.
      - 2. MAGNITUDE CHECK: Is Input (${value} ${unit}) > Reference Object?
         - YES: Result MUST be "X times the [Object]".
         - NO: Result MUST be a fraction.
    - PHRASING RULES (STRICT):
      - DO NOT use scientific notation or tiny percentages.
      - If ratio < 0.01, use "1 in X" or "1/X".
      - DO NOT repeat the input value.
    - SCALE AWARENESS: Match the duration.
      - If COSMIC SCALE (millions/billions of years), compare to age of universe, evolution, or galactic orbits. DO NOT use "trillions of heartbeats".
      - If MICRO SCALE (nanoseconds), compare to light travel time or computer cycles.
    - IF style is 'Sports', use game durations, world records, or career lengths.
    - IF style is 'Pop Culture', use movie runtimes, song lengths, or TV show binges.
    - Be DIVERSE within the chosen style.
    - For very short times, express as "X of these make a [longer duration]" instead of tiny fractions.
    - Return ONLY a JSON array with this exact format: [{"description": "Since the Pyramids were built", "icon": "🏛️"}]. Use appropriate emojis for icons.`,

    currency: (value, currency, city, style = 'General') => `You are a helpful assistant that creates relatable purchasing power comparisons. For ${value} ${currency} in ${city}, suggest exactly 3 culturally relevant, practical items someone could buy. 
    - Context Style: ${style} (STRICTLY adhere to this theme).
    - PHRASING RULES (STRICT):
      - DO NOT repeat the input value.
      - Start directly with the item name.
    - IF style is 'Sports', suggest tickets, equipment, or stadium food.
    - IF style is 'Pop Culture', suggest movie tickets, merchandise, or streaming subscriptions.
    - Be DIVERSE within the chosen style.
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

    // Calculate base value for accuracy
    const baseValue = getBaseValue(type, value, unit);

    try {
        let result;
        if (provider === 'openai') {
            result = await callOpenAI(type, value, unit, city, style, apiKey, baseValue);
        } else if (provider === 'claude') {
            result = await callClaude(type, value, unit, city, style, apiKey, baseValue);
        } else if (provider === 'gemini') {
            result = await callGemini(type, value, unit, city, style, apiKey, baseValue);
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

const cleanLLMResponse = (text) => {
    // Remove markdown code blocks (json or generic)
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    // Remove any leading/trailing whitespace
    return cleaned.trim();
};

const callOpenAI = async (type, value, unit, city, style, apiKey, baseValue) => {
    const prompt = type === 'currency'
        ? PROMPTS[type](value, unit, city, style)
        : PROMPTS[type](value, unit, style, baseValue);

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
    const content = data.choices[0].message.content;

    // Clean and parse JSON response
    const parsed = JSON.parse(cleanLLMResponse(content));

    return { success: true, data: parsed };
};

const callClaude = async (type, value, unit, city, style, apiKey, baseValue) => {
    const prompt = type === 'currency'
        ? PROMPTS[type](value, unit, city, style)
        : PROMPTS[type](value, unit, style, baseValue);

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
    const content = data.content[0].text;

    // Clean and parse JSON response
    const parsed = JSON.parse(cleanLLMResponse(content));

    return { success: true, data: parsed };
};

const callGemini = async (type, value, unit, city, style, apiKey, baseValue) => {
    const prompt = type === 'currency'
        ? PROMPTS[type](value, unit, city, style)
        : PROMPTS[type](value, unit, style, baseValue);

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
    let content = data.candidates[0].content.parts[0].text;

    // Clean and parse JSON response
    const parsed = JSON.parse(cleanLLMResponse(content));

    return { success: true, data: parsed };
};

export const setLLMProvider = (provider) => {
    localStorage.setItem('contextify_llm_provider', provider);
};

export const getLLMProvider = () => {
    return localStorage.getItem('contextify_llm_provider') || 'openai';
};
