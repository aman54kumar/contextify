import { getApiKey } from './apiKeyManager';
import { getCacheKey, getCachedResult, setCachedResult } from './cacheService';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const OPENAI_MODEL = 'gpt-4o-mini'; // Change this to add/switch models

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
    - Atom: 1e-10 meters
    - Virus: 1e-7 meters
    - Grain of Sand: 0.002 meters (2mm)
    - Football Field: 100 meters
    - Eiffel Tower: 300 meters
    - Mt. Everest: 8,848 meters
    - Marathon: 42,195 meters
    - Earth Diameter: 12,742 km (1.27e7 meters)
    - Moon Distance: 384,400 km (3.84e8 meters)
    - Sun Diameter: 1.4 million km (1.4e9 meters)
    - AU (Earth-Sun): 150 million km (1.5e11 meters)
    - Light Year: 9.46 trillion km (9.46e15 meters)
    - Milky Way Diameter: 100,000 light years (9.5e20 meters)
    - Observable Universe: 93 billion light years (8.8e26 meters)
    `,
    weight: `
    - Electron: 9.1e-31 kg
    - Proton: 1.67e-27 kg
    - Grain of Sand: 1e-6 kg (1mg)
    - Apple: 0.2 kg
    - Human: 70 kg
    - Car: 2,000 kg (2 tons)
    - Elephant: 5,000 kg (5 tons)
    - Blue Whale: 150,000 kg (150 tons)
    - Boeing 747: 400,000 kg (400 tons)
    - Great Pyramid: 6 billion kg (6 million tons)
    - Earth Mass: 5.97 x 10^24 kg
    - Sun Mass: 1.989 x 10^30 kg
    - Milky Way Mass: 3 x 10^42 kg
    `,
    time: `
    - Nanosecond: 1e-9 seconds
    - Blink of an Eye: 0.3 seconds
    - Movie: 2 hours (7,200 seconds)
    - Day: 24 hours (86,400 seconds)
    - Month: 30 days (2.6e6 seconds)
    - Year: 365 days (3.15e7 seconds)
    - Decade: 10 years (3.15e8 seconds)
    - Human Lifespan: 80 years (2.5e9 seconds)
    - Recorded History: 5,000 years (1.58e11 seconds)
    - Ice Age Duration: 100,000 years (3e12 seconds)
    - Age of Earth: 4.5 billion years (1.4e17 seconds)
    - Age of Universe: 13.8 billion years (4.35e17 seconds)
    `,
    temperature: `
    - Absolute Zero: -273.15°C
    - Liquid Nitrogen: -196°C
    - Freezing Point: 0°C
    - Room Temperature: 20°C
    - Human Body: 37°C
    - Boiling Water: 100°C
    - Pizza Oven: 400°C
    - Lava: 1,200°C
    - Sun Surface: 5,500°C
    - Lightning Bolt: 30,000°C
    - Sun Core: 15 million°C (1.5e7°C)
    `
};

// Prompt templates for different measurement types
const PROMPTS = {
    distance: (value, unit, style = 'General', base = null) => `You are a helpful assistant that creates relatable comparisons. Convert ${value} ${unit} ${base ? `(approx ${base.str})` : ''} into exactly 3 creative, practical, and easy-to-visualize comparisons.
    - Context Style: ${style} (STRICTLY adhere to this theme).
    - REFERENCE SIZES (CALIBRATION ANCHORS):
      ${REFERENCE_SIZES.distance}
      (Use these to calibrate scale. You MAY use these OR choose other entities that better fit the '${style}' style.)
    - MATH CHECK (CRITICAL):
      - 1. Identify the Reference Object size (from the list or your internal knowledge).
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
    - REFERENCE SIZES (CALIBRATION ANCHORS):
      ${REFERENCE_SIZES.weight}
      (Use these to calibrate scale. You MAY use these OR choose other entities that better fit the '${style}' style.)
    - MATH CHECK (CRITICAL):
      - 1. Identify the Reference Object size (from the list or your internal knowledge).
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
    - REFERENCE SIZES (CALIBRATION ANCHORS):
      ${REFERENCE_SIZES.temperature}
      (Use these to calibrate scale. You MAY use these OR choose other entities that better fit the '${style}' style.)
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
    - REFERENCE SIZES (CALIBRATION ANCHORS):
      ${REFERENCE_SIZES.time}
      (Use these to calibrate scale. You MAY use these OR choose other entities that better fit the '${style}' style.)
    - MATH CHECK (CRITICAL):
      - 1. Identify the Reference Object size (from the list or your internal knowledge).
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

    currency: (value, currency, city, style = 'General') => `You are a helpful assistant that creates purchasing power comparisons. For ${value} ${currency} in ${city}, calculate how many of each predefined item category someone could buy.

PREDEFINED ITEM CATEGORIES (choose 3 from this list):

GENERAL CATEGORIES:
- "movie tickets"
- "restaurant meals at a local eatery"
- "months of groceries for one person"
- "budget smartphones"
- "premium smartphones"
- "monthly transit passes"
- "pairs of running shoes"
- "pairs of jeans"

SPORTS CATEGORIES (use these if style is 'Sports'):
- "monthly gym memberships"
- "pairs of running shoes"
- "sports jerseys"
- "yoga classes"
- "swimming pool day passes"
- "cricket bats"
- "footballs (soccer balls)"
- "sports event tickets"

POP CULTURE CATEGORIES (use these if style is 'Pop Culture'):
- "movie tickets"
- "streaming service subscriptions (monthly)"
- "concert tickets at a local venue"
- "video games"
- "comic books"
- "band t-shirts"

SCIENCE CATEGORIES (use these if style is 'Science'):
- "science textbooks"
- "lab equipment sets for students"
- "science museum annual passes"
- "telescope accessories"
- "microscope slides sets"
- "chemistry experiment kits"
- "planetarium tickets"
- "science magazine subscriptions (annual)"

NATURE CATEGORIES (use these if style is 'Nature'):
- "national park entry passes"
- "hiking boots"
- "camping gear items"
- "binoculars for birdwatching"
- "plant seeds packets"
- "gardening tool sets"
- "nature photography books"
- "wildlife sanctuary visits"

CALCULATION EXAMPLE:
If ${value} ${currency} = 10,000 INR in Mumbai, and movie tickets cost 250 INR each:
Quantity = 10,000 / 250 = 40 movie tickets

INSTRUCTIONS:
1. Convert ${value} ${currency} to local currency of ${city}.
2. For each item you pick, estimate its typical price in ${city}.
3. Calculate: quantity = (total amount in local currency) / (price per item)
4. Round to a whole number.
5. IF style is 'Sports', ONLY pick from SPORTS CATEGORIES.
6. IF style is 'Pop Culture', ONLY pick from POP CULTURE CATEGORIES.
7. IF style is 'Science', ONLY pick from SCIENCE CATEGORIES.
8. IF style is 'Nature', ONLY pick from NATURE CATEGORIES.
9. IF style is 'General', pick from GENERAL CATEGORIES.
10. Pick 3 different categories.
11. DO NOT make up new categories.

- Return ONLY a JSON array with this exact format: [{"item": "Movie tickets", "quantity": "40", "icon": "🎬", "category": "Experience"}]. Use appropriate emojis and categories (Food/Experience/Good).`
};

export const generateContext = async (type, value, unit, city = null, style = 'General') => {
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
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant that creates relatable unit conversions. Always respond with valid JSON only, no additional text.' },
                { role: 'user', content: prompt }
            ],
            max_completion_tokens: 2000
        })
    });

    if (!response.ok) {
        const text = await response.text();
        try {
            const error = JSON.parse(text);
            throw new Error(error.error?.message || 'OpenAI API error');
        } catch (e) {
            throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${text.substring(0, 100)}`);
        }
    }

    let data;
    try {
        const text = await response.text();
        data = JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid JSON response from OpenAI API');
    }

    const content = data.choices[0].message.content;

    // Clean and parse JSON response
    try {
        const parsed = JSON.parse(cleanLLMResponse(content));
        return { success: true, data: parsed };
    } catch (e) {
        throw new Error(`Failed to parse LLM response: ${e.message}. Raw content: ${content}`);
    }
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
