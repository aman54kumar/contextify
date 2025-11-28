import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Check, Loader, Trash2 } from 'lucide-react';
import { saveApiKeys, getApiKey, clearApiKeys, validateApiKey } from '../services/apiKeyManager';
import { setLLMProvider, getLLMProvider } from '../services/llmService';
import { clearCache } from '../services/cacheService';

const Settings = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentProvider = getLLMProvider();
    setProvider(currentProvider);
    const key = getApiKey(currentProvider);
    if (key) {
      setApiKey(key);
    }
  }, []);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setLLMProvider(newProvider);
    const key = getApiKey(newProvider);
    setApiKey(key || '');
    setSaved(false);
    setError('');
  };

  const handleSave = () => {
    setError('');
    setSaved(false);

    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!validateApiKey(provider, apiKey)) {
      setError(`Invalid ${provider === 'openai' ? 'OpenAI' : provider === 'claude' ? 'Claude' : 'Gemini'} API key format`);
      return;
    }

    const success = saveApiKeys(provider, apiKey);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Failed to save API key');
    }
  };

  const handleClearCache = () => {
    clearCache();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearKeys = () => {
    clearApiKeys();
    setApiKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel glass-panel">
        <div className="settings-header">
          <div className="header-title">
            <SettingsIcon size={24} />
            <h2>Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label>LLM Provider</label>
            <p className="setting-description">
              Choose which AI service to use for generating contextual comparisons
            </p>
            <div className="provider-buttons">
              <button
                className={`provider-btn ${provider === 'openai' ? 'active' : ''}`}
                onClick={() => handleProviderChange('openai')}
              >
                OpenAI (GPT-4o-mini)
              </button>
              <button
                className={`provider-btn ${provider === 'claude' ? 'active' : ''}`}
                onClick={() => handleProviderChange('claude')}
              >
                Claude (Haiku 3.5)
              </button>
              <button
                className={`provider-btn ${provider === 'gemini' ? 'active' : ''}`}
                onClick={() => handleProviderChange('gemini')}
              >
                Gemini (Flash Free)
              </button>
              <button
                className={`provider-btn ${provider === 'static' ? 'active' : ''}`}
                onClick={() => handleProviderChange('static')}
              >
                Static (No AI)
              </button>
            </div>
          </div>

          {provider !== 'static' && (
            <div className="setting-group">
              <label>API Key</label>
              <p className="setting-description">
                {import.meta.env.VITE_GEMINI_API_KEY && provider === 'gemini'
                  ? '✓ Using environment variable (default key configured)'
                  : 'Your API key is stored locally in your browser and never sent to our servers'}
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  import.meta.env.VITE_GEMINI_API_KEY && provider === 'gemini'
                    ? 'Using default key (enter your own to override)'
                    : `Enter your ${provider === 'openai' ? 'OpenAI' : provider === 'claude' ? 'Claude' : 'Gemini'} API key`
                }
                className="api-key-input"
              />
              <button className="save-btn" onClick={handleSave}>
                {saved ? <Check size={16} /> : 'Save API Key'}
              </button>
              {error && <p className="error-message">{error}</p>}
              {saved && !error && <p className="success-message">API key saved successfully!</p>}
            </div>
          )}

          <div className="setting-group">
            <label>Cache Management</label>
            <p className="setting-description">
              Clear cached AI responses to free up space or get fresh results
            </p>
            <button className="clear-btn" onClick={handleClearCache}>
              <Trash2 size={16} /> Clear Cache
            </button>
          </div>

          <div className="setting-group">
            <label>Privacy</label>
            <p className="setting-description">
              Remove all stored API keys from your browser
            </p>
            <button className="clear-btn danger" onClick={handleClearKeys}>
              <Trash2 size={16} /> Clear All API Keys
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .settings-panel {
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h2 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--color-text-primary);
        }

        .close-btn {
          background: transparent;
          color: var(--color-text-secondary);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
        }

        .settings-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .setting-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .setting-description {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .provider-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .provider-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-weight: 600;
          transition: all 0.3s;
        }

        .provider-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
        }

        .provider-btn.active {
          background: var(--color-accent-primary);
          border-color: var(--color-accent-primary);
          color: #0f172a;
        }

        .api-key-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.875rem;
          font-family: monospace;
        }

        .api-key-input:focus {
          border-color: var(--color-accent-primary);
        }

        .save-btn, .clear-btn {
          padding: 0.75rem 1.5rem;
          background: var(--color-accent-primary);
          color: #0f172a;
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .save-btn:hover {
          background: var(--color-accent-secondary);
        }

        .clear-btn {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
        }

        .clear-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .clear-btn.danger {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .clear-btn.danger:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        .error-message {
          color: #fca5a5;
          font-size: 0.875rem;
          margin: 0;
        }

        .success-message {
          color: #86efac;
          font-size: 0.875rem;
          margin: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Settings;
