import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, MapPin, DollarSign, Ruler, Weight, Thermometer, Clock } from 'lucide-react';
import ResultCard from './ResultCard';
import { convertDistance, convertCurrency, convertWeight, convertTemperature, convertTime } from '../utils/converter';
import { generateContext, getLLMProvider } from '../services/llmService';
import { getApiKey } from '../services/apiKeyManager';
import { getCacheKey } from '../services/cacheService';
import { PURCHASING_POWER, CURRENCY_RATES } from '../data/conversions';
import { DISTANCE_UNITS, WEIGHT_UNITS, TEMPERATURE_UNITS, TIME_UNITS } from '../data/units';

const Converter = ({ onOpenSettings }) => {
    const [mode, setMode] = useState('distance');
    const [inputValue, setInputValue] = useState('');
    const [inputUnit, setInputUnit] = useState('m');
    const [currency, setCurrency] = useState('USD');
    const [targetCity, setTargetCity] = useState('Bangkok');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [useLLM, setUseLLM] = useState(false);

    const [contextStyle, setContextStyle] = useState('General');

    // Check if LLM is available
    useEffect(() => {
        const provider = getLLMProvider();
        const hasKey = provider !== 'static' && getApiKey(provider);
        setUseLLM(!!hasKey);
    }, []);

    useEffect(() => {
        handleConvert();
    }, [inputValue, inputUnit, currency, targetCity, mode, contextStyle]);

    const handleConvert = async () => {
        if (!inputValue || isNaN(inputValue)) {
            setResult(null);
            return;
        }

        const val = parseFloat(inputValue);
        setError(null);
        setLoading(true);

        try {
            // Always try LLM first
            const llmResult = await generateContext(
                mode,
                val,
                mode === 'currency' ? currency : inputUnit,
                mode === 'currency' ? targetCity : null,
                contextStyle
            );

            if (llmResult.success) {
                setResult({
                    type: 'llm',
                    data: llmResult.data,
                    fromCache: llmResult.fromCache,
                    mode: mode
                });
            } else {
                // Only use static as fallback on error
                const staticResult = getStaticResult(mode, val);
                setResult(staticResult);
                setError(llmResult.error || 'LLM unavailable, using static data');
            }
        } catch (err) {
            console.error('LLM error:', err);
            const staticResult = getStaticResult(mode, val);
            setResult(staticResult);
            setError('LLM error, using static data');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!inputValue || isNaN(inputValue)) return;

        const val = parseFloat(inputValue);

        // Clear the specific cache entry to force a fresh API call
        // Use getCacheKey to ensure we match the key used by llmService
        const baseKey = getCacheKey(
            mode,
            val,
            mode === 'currency' ? currency : inputUnit,
            mode === 'currency' ? targetCity : null
        );
        const fullKey = baseKey + `_${contextStyle}`;

        localStorage.removeItem(fullKey);

        // Force a new conversion
        setLoading(true);
        setError(null);

        try {
            const llmResult = await generateContext(
                mode,
                val,
                mode === 'currency' ? currency : inputUnit,
                mode === 'currency' ? targetCity : null,
                contextStyle
            );

            if (llmResult.success) {
                setResult({
                    type: 'llm',
                    data: llmResult.data,
                    fromCache: false,
                    mode: mode
                });

                // Scroll to result after a short delay to ensure render
                setTimeout(() => {
                    const resultElement = document.querySelector('.result-card');
                    if (resultElement) {
                        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            } else {
                const staticResult = getStaticResult(mode, val);
                setResult(staticResult);
                setError(llmResult.error || 'LLM unavailable, using static data');
            }
        } catch (err) {
            console.error('LLM error:', err);
            const staticResult = getStaticResult(mode, val);
            setResult(staticResult);
            setError('LLM error, using static data');
        } finally {
            setLoading(false);
        }
    };

    const getStaticResult = (mode, val) => {
        if (mode === 'distance') {
            return { type: 'static', data: convertDistance(val, inputUnit), mode };
        } else if (mode === 'currency') {
            return { type: 'static', data: convertCurrency(val, currency, targetCity), mode };
        } else if (mode === 'weight') {
            return { type: 'static', data: convertWeight(val, inputUnit), mode };
        } else if (mode === 'temperature') {
            return { type: 'static', data: convertTemperature(val, inputUnit), mode };
        } else if (mode === 'time') {
            return { type: 'static', data: convertTime(val, inputUnit), mode };
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setInputValue('');
        setResult(null);
        setError(null);

        // Set default units for each mode
        if (newMode === 'distance') setInputUnit('m');
        else if (newMode === 'weight') setInputUnit('kg');
        else if (newMode === 'temperature') setInputUnit('c');
        else if (newMode === 'time') setInputUnit('min');
    };

    return (
        <div className="converter-container">
            {/* Mode Switcher */}
            <div className="mode-switcher glass-panel">
                <button
                    className={`mode-btn ${mode === 'distance' ? 'active' : ''}`}
                    onClick={() => handleModeChange('distance')}
                >
                    <Ruler size={18} /> Distance
                </button>
                <button
                    className={`mode-btn ${mode === 'weight' ? 'active' : ''}`}
                    onClick={() => handleModeChange('weight')}
                >
                    <Weight size={18} /> Weight
                </button>
                <button
                    className={`mode-btn ${mode === 'temperature' ? 'active' : ''}`}
                    onClick={() => handleModeChange('temperature')}
                >
                    <Thermometer size={18} /> Temp
                </button>
                <button
                    className={`mode-btn ${mode === 'time' ? 'active' : ''}`}
                    onClick={() => handleModeChange('time')}
                >
                    <Clock size={18} /> Time
                </button>
                <button
                    className={`mode-btn ${mode === 'currency' ? 'active' : ''}`}
                    onClick={() => handleModeChange('currency')}
                >
                    <DollarSign size={18} /> Currency
                </button>
            </div>

            {/* Input Section */}
            <div className="input-section glass-panel">
                <div className="input-group">
                    <label>Amount</label>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter value..."
                        className="main-input"
                    />
                </div>

                {mode === 'distance' && (
                    <div className="input-group">
                        <label>Unit</label>
                        <select
                            value={inputUnit}
                            onChange={(e) => setInputUnit(e.target.value)}
                            className="unit-select"
                        >
                            {DISTANCE_UNITS.map(category => (
                                <optgroup key={category.category} label={category.category}>
                                    {category.units.map(unit => (
                                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'weight' && (
                    <div className="input-group">
                        <label>Unit</label>
                        <select
                            value={inputUnit}
                            onChange={(e) => setInputUnit(e.target.value)}
                            className="unit-select"
                        >
                            {WEIGHT_UNITS.map(category => (
                                <optgroup key={category.category} label={category.category}>
                                    {category.units.map(unit => (
                                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'temperature' && (
                    <div className="input-group">
                        <label>Unit</label>
                        <select
                            value={inputUnit}
                            onChange={(e) => setInputUnit(e.target.value)}
                            className="unit-select"
                        >
                            {TEMPERATURE_UNITS.map(category => (
                                <optgroup key={category.category} label={category.category}>
                                    {category.units.map(unit => (
                                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'time' && (
                    <div className="input-group">
                        <label>Unit</label>
                        <select
                            value={inputUnit}
                            onChange={(e) => setInputUnit(e.target.value)}
                            className="unit-select"
                        >
                            {TIME_UNITS.map(category => (
                                <optgroup key={category.category} label={category.category}>
                                    {category.units.map(unit => (
                                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                )}

                {mode === 'currency' && (
                    <>
                        <div className="input-group">
                            <label>Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="unit-select"
                            >
                                {Object.keys(CURRENCY_RATES).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group full-width">
                            <label>Compare with (City)</label>
                            <div className="select-wrapper">
                                <MapPin size={16} className="select-icon" />
                                <select
                                    value={targetCity}
                                    onChange={(e) => setTargetCity(e.target.value)}
                                    className="unit-select with-icon"
                                >
                                    {Object.keys(PURCHASING_POWER).map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* Context Style Selector (Only when LLM is enabled) */}
                {useLLM && (
                    <div className="input-group full-width">
                        <label>Context Style</label>
                        <div className="style-selector">
                            {['General', 'Sports', 'Pop Culture', 'Nature', 'Science'].map(style => (
                                <button
                                    key={style}
                                    className={`style-btn ${contextStyle === style ? 'active' : ''}`}
                                    onClick={() => setContextStyle(style)}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enable AI Button */}
                {!useLLM && (
                    <div className="input-group full-width">
                        <button onClick={onOpenSettings} className="enable-ai-btn">
                            <span className="ai-sparkle">✨</span> Enable AI Contexts
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                </div>
            )}

            <ResultCard
                result={result}
                type={mode}
                loading={loading}
                onRegenerate={handleRegenerate}
            />

            <style>{`
        .style-selector {
            display: flex;
            gap: 0.75rem;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            justify-content: flex-start;
            margin-top: 0.25rem;
            padding-bottom: 0.5rem;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .style-selector::-webkit-scrollbar {
            height: 4px;
        }

        .style-selector::-webkit-scrollbar-track {
            background: transparent;
        }

        .style-selector::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
        }

        .style-btn {
            padding: 0.625rem 1.25rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: var(--radius-full);
            color: var(--color-text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .style-btn:hover {
            background: rgba(255, 255, 255, 0.12);
            color: var(--color-text-primary);
            border-color: rgba(255, 255, 255, 0.25);
            transform: translateY(-1px);
        }

        .style-btn.active {
            background: var(--color-accent-primary);
            color: #0f172a;
            border-color: var(--color-accent-primary);
            font-weight: 600;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }

        .converter-container {
            width: 100%;
        }

        .mode-switcher {
            display: flex;
            padding: 0.5rem;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }

        .mode-btn {
            flex: 1;
            min-width: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border-radius: var(--radius-sm);
            background: transparent;
            color: var(--color-text-secondary);
            font-weight: 600;
            transition: all 0.3s ease;
            font-size: 0.875rem;
        }

        .mode-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--color-text-primary);
        }

        .mode-btn.active {
            background: var(--color-accent-primary);
            color: #0f172a;
            box-shadow: 0 0 15px var(--color-accent-glow);
        }

        .input-section {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1rem;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .input-group.full-width {
            grid-column: 1 / -1;
        }

        label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-text-secondary);
            font-weight: 600;
        }

        .main-input, .unit-select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-md);
            color: var(--color-text-primary);
            font-size: 1rem;
            transition: border-color 0.3s;
        }

        .main-input:focus, .unit-select:focus {
            border-color: var(--color-accent-primary);
        }

        .select-wrapper {
            position: relative;
        }

        .select-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-text-secondary);
            pointer-events: none;
        }

        .unit-select.with-icon {
            padding-left: 2.5rem;
        }

        .enable-ai-btn {
            width: 100%;
            padding: 0.75rem;
            background: rgba(56, 189, 248, 0.1);
            border: 1px dashed var(--color-accent-primary);
            border-radius: var(--radius-md);
            color: var(--color-accent-primary);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .enable-ai-btn:hover {
            background: rgba(56, 189, 248, 0.2);
            transform: translateY(-2px);
        }

        .error-banner {
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: var(--radius-md);
            color: #fca5a5;
            font-size: 0.875rem;
            text-align: center;
        }

        @media (max-width: 640px) {
            .input-section {
                grid-template-columns: 1fr;
            }

            .mode-switcher {
                flex-direction: column;
            }

            .mode-btn {
                width: 100%;
            }
        }
      `}</style>
        </div>
    );
};

export default Converter;
