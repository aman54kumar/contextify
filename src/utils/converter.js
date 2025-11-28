import { LANDMARKS, WEIGHT_CONTEXTS, TEMPERATURE_CONTEXTS, TIME_CONTEXTS, CURRENCY_RATES, PURCHASING_POWER } from '../data/conversions';
import { selectRelevantContexts } from './contextSelector';

const getTopMatches = (value, contexts, count = 3) => {
    // Calculate difference for all contexts
    const withDiff = contexts.map(ctx => {
        const ratio = value / ctx.value;
        const diff = Math.abs(Math.log10(ratio));
        return { ...ctx, ratio, diff };
    });

    // Sort by difference (closest order of magnitude)
    withDiff.sort((a, b) => a.diff - b.diff);

    // Take top N
    return withDiff.slice(0, count).map(match => {
        const count = value / match.value;

        // If the count is very small (< 0.01) or very large (> 1000), invert the comparison
        const shouldInvert = count < 0.01 || count > 10000;

        if (shouldInvert) {
            const invertedCount = match.value / value;
            return {
                contextValue: invertedCount,
                contextUnit: match.name,
                icon: match.icon,
                description: match.description || `${formatNumber(invertedCount)} of these make ${match.name}`,
                sentence: `${formatNumber(invertedCount)} of these make ${match.name}.`,
                inverted: true
            };
        } else {
            return {
                contextValue: count,
                contextUnit: match.name,
                icon: match.icon,
                description: match.description || `About ${formatNumber(count)} ${match.name}`,
                sentence: `That's about ${formatNumber(count)} ${match.name}.`,
                inverted: false
            };
        }
    });
};

export const convertDistance = (value, unit) => {
    let valueInMeters = value;
    if (unit === 'km') valueInMeters = value * 1000;
    if (unit === 'ft') valueInMeters = value * 0.3048;
    if (unit === 'mi') valueInMeters = value * 1609.34;
    if (unit === 'cm') valueInMeters = value / 100;
    if (unit === 'ly') valueInMeters = value * 9.461e15;
    if (unit === 'pc') valueInMeters = value * 3.086e16;
    if (unit === 'au') valueInMeters = value * 1.496e11;
    if (unit === 'nm') valueInMeters = value * 1e-9;
    if (unit === 'angstrom') valueInMeters = value * 1e-10;

    const matches = getTopMatches(valueInMeters, LANDMARKS);

    return {
        originalValue: value,
        originalUnit: unit,
        matches: matches
    };
};

export const convertWeight = (value, unit) => {
    let valueInKg = value;
    if (unit === 'g') valueInKg = value / 1000;
    if (unit === 'lb') valueInKg = value * 0.453592;
    if (unit === 'oz') valueInKg = value * 0.0283495;
    if (unit === 'ton') valueInKg = value * 1000;
    if (unit === 'solar_mass') valueInKg = value * 1.989e30;
    if (unit === 'earth_mass') valueInKg = value * 5.972e24;
    if (unit === 'u') valueInKg = value * 1.66e-27;
    if (unit === 'electron_mass') valueInKg = value * 9.109e-31;

    const matches = getTopMatches(valueInKg, WEIGHT_CONTEXTS);

    return {
        originalValue: value,
        originalUnit: unit,
        matches: matches
    };
};

export const convertTemperature = (value, unit) => {
    let valueInCelsius = value;
    if (unit === 'f') valueInCelsius = (value - 32) * 5 / 9;
    if (unit === 'k') valueInCelsius = value - 273.15;
    if (unit === 'planck_temp') valueInCelsius = 1.417e32; // Approx
    if (unit === 'core_sun') valueInCelsius = 15000000;

    // For temperature, we still want the closest single match for the comparison logic
    const bestMatch = TEMPERATURE_CONTEXTS.reduce((prev, curr) => {
        const prevDiff = Math.abs(valueInCelsius - prev.value);
        const currDiff = Math.abs(valueInCelsius - curr.value);

        return currDiff < prevDiff ? curr : prev;
    });

    const difference = valueInCelsius - bestMatch.value;
    const diffText = difference > 0
        ? `${formatNumber(Math.abs(difference))}°C warmer than`
        : difference < 0
            ? `${formatNumber(Math.abs(difference))}°C cooler than`
            : 'exactly';

    return {
        originalValue: value,
        originalUnit: unit,
        contextName: bestMatch.name,
        contextValue: bestMatch.value,
        icon: bestMatch.icon,
        description: bestMatch.description,
        sentence: `That's ${diffText} ${bestMatch.name} (${bestMatch.description}).`
    };
};

export const convertTime = (value, unit) => {
    let valueInMinutes = value;
    if (unit === 's') valueInMinutes = value / 60;
    if (unit === 'h') valueInMinutes = value * 60;
    if (unit === 'd') valueInMinutes = value * 1440;
    if (unit === 'y') valueInMinutes = value * 525600;
    if (unit === 'millennium') valueInMinutes = value * 525600000;
    if (unit === 'galactic_year') valueInMinutes = value * 1.21e14; // Approx
    if (unit === 'ms') valueInMinutes = value / 60000;
    if (unit === 'us') valueInMinutes = value / 60000000;
    if (unit === 'ns') valueInMinutes = value / 60000000000;
    if (unit === 'planck_time') valueInMinutes = value * 5.39e-44 / 60; // Very small

    const matches = getTopMatches(valueInMinutes, TIME_CONTEXTS);

    return {
        originalValue: value,
        originalUnit: unit,
        matches: matches
    };
};

export const convertCurrency = (value, fromCurrency, targetCity) => {
    // 1. Convert to USD
    const rateToUSD = 1 / CURRENCY_RATES[fromCurrency];
    const valueInUSD = value * rateToUSD;

    // 2. Get Target City Data
    const cityData = PURCHASING_POWER[targetCity];
    if (!cityData) return null;

    // 3. Convert USD to Target Currency
    const targetRate = CURRENCY_RATES[cityData.currency];
    const valueInTargetCurrency = valueInUSD * targetRate;

    // 4. Calculate Purchasing Power for each item
    const allContexts = cityData.items.map(item => {
        const count = valueInTargetCurrency / item.cost;
        return {
            count: count,
            item: item.name,
            icon: item.icon,
            priority: item.priority,
            sentence: `${formatNumber(count)} ${item.name}`
        };
    });

    // 5. Select most relevant contexts using smart algorithm
    const selectedContexts = selectRelevantContexts(allContexts, 4);

    return {
        originalValue: value,
        originalCurrency: fromCurrency,
        targetCity: targetCity,
        contexts: selectedContexts
    };
};

const formatNumber = (num) => {
    // Handle very large numbers with human-readable format
    if (num >= 1e12) {
        const val = num / 1e12;
        return val % 1 === 0 ? `${val} trillion` : `${val.toFixed(1)} trillion`;
    }
    if (num >= 1e9) {
        const val = num / 1e9;
        return val % 1 === 0 ? `${val} billion` : `${val.toFixed(1)} billion`;
    }
    if (num >= 1e6) {
        const val = num / 1e6;
        return val % 1 === 0 ? `${val} million` : `${val.toFixed(1)} million`;
    }
    if (num >= 1000) {
        const val = num / 1000;
        return val % 1 === 0 ? `${val} thousand` : `${val.toFixed(1)} thousand`;
    }

    // Handle normal numbers
    if (num >= 100) return Math.round(num).toString();
    if (num >= 10) return num.toFixed(1);
    if (num >= 1) return num.toFixed(2);
    return num.toPrecision(2);
};
