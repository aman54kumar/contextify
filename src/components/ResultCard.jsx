import React from 'react';
import { Sparkles, Loader, Zap, RefreshCw } from 'lucide-react';

const ResultCard = ({ result, type, loading, onRegenerate }) => {
  if (loading) {
    return (
      <div className="result-card glass-panel">
        <div className="loading-state">
          <Loader className="spinner" size={40} />
          <p>Generating contextual comparison...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isLLM = result.type === 'llm';
  const data = result.data;

  return (
    <div className="result-card glass-panel">
      <div className="result-header">
        <div className="header-left">
          {isLLM ? <Zap className="result-icon-ai" size={20} /> : <Sparkles className="result-icon-sparkle" size={20} />}
          <span className="result-label">{isLLM ? 'AI-Powered Context' : 'In Context'}</span>
        </div>
        <div className="header-right">
          {isLLM && result.fromCache && <span className="cache-badge">Cached</span>}
          {isLLM && (
            <button className="regenerate-btn" onClick={onRegenerate} title="Regenerate">
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>

      {isLLM ? (
        <LLMResult data={data} mode={result.mode} />
      ) : (
        <StaticResult data={data} mode={result.mode} />
      )}

      <style>{`
        .result-card {
          margin-top: 2rem;
          padding: 1.5rem;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          color: var(--color-text-secondary);
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--color-accent-primary);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-left {
          color: var(--color-accent-primary);
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .result-icon-sparkle {
          color: var(--color-accent-secondary);
        }

        .result-icon-ai {
          color: #fbbf24;
        }

        .cache-badge {
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .regenerate-btn {
          background: transparent;
          color: var(--color-text-secondary);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .regenerate-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
          transform: rotate(180deg);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const LLMResult = ({ data, mode }) => {
  if (mode === 'temperature') {
    return (
      <div className="llm-result">
        <div className="llm-icon">{data.icon}</div>
        <div className="llm-content">
          <h3 className="llm-title">{data.description}</h3>
          {data.comparison && <p className="llm-comparison">{data.comparison}</p>}
        </div>
        <style>{`
          .llm-result {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }

          .llm-icon {
            font-size: 4rem;
            filter: drop-shadow(0 0 20px var(--color-accent-glow));
          }

          .llm-content {
            flex: 1;
          }

          .llm-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-text-primary);
            margin-bottom: 0.5rem;
          }

          .llm-comparison {
            font-size: 1rem;
            color: var(--color-text-secondary);
          }
        `}</style>
      </div>
    );
  }

  if (mode === 'currency') {
    return (
      <div className="llm-currency-grid">
        {data.map((item, idx) => (
          <div key={idx} className="llm-currency-item">
            <div className="item-icon">{item.icon}</div>
            <div className="item-details">
              <span className="item-quantity">{item.quantity}</span>
              <span className="item-name">{item.item}</span>
            </div>
          </div>
        ))}
        <style>{`
          .llm-currency-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 1rem;
          }

          .llm-currency-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            border-radius: var(--radius-md);
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.2s;
          }

          .llm-currency-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.1);
          }

          .item-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }

          .item-details {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .item-quantity {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--color-accent-primary);
          }

          .item-name {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
          }
        `}</style>
      </div>
    );
  }

  // Distance, Weight, Time
  return (
    <div className="llm-list">
      {data.map((item, idx) => (
        <div key={idx} className="llm-list-item">
          <span className="list-icon">{item.icon}</span>
          <span className="list-description">{item.description}</span>
        </div>
      ))}
      <style>{`
        .llm-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .llm-list-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }

        .llm-list-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .list-icon {
          font-size: 2rem;
          filter: drop-shadow(0 0 10px var(--color-accent-glow));
        }

        .list-description {
          font-size: 1.125rem;
          color: var(--color-text-primary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

const StaticResult = ({ data, mode }) => {
  if (mode === 'temperature') {
    return (
      <div className="result-content">
        <div className="temp-comparison">
          <div className="visual-icon">{data.icon}</div>
          <div className="temp-details">
            <h3 className="temp-name">{data.contextName}</h3>
            <p className="temp-description">{data.description}</p>
            <p className="context-sentence">{data.sentence}</p>
          </div>
        </div>
        <style>{`
          .result-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .temp-comparison {
            display: flex;
            align-items: center;
            gap: 2rem;
            width: 100%;
          }

          .visual-icon {
            font-size: 4rem;
            filter: drop-shadow(0 0 20px var(--color-accent-glow));
            animation: float 3s ease-in-out infinite;
          }

          .temp-details {
            flex: 1;
            text-align: left;
          }

          .temp-name {
            font-size: 2rem;
            font-weight: 700;
            color: var(--color-accent-primary);
            margin-bottom: 0.5rem;
          }

          .temp-description {
            font-size: 1rem;
            color: var(--color-text-secondary);
            margin-bottom: 0.75rem;
          }

          .context-sentence {
            font-size: 1.125rem;
            color: var(--color-text-primary);
            font-weight: 500;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  if (mode === 'currency') {
    return (
      <div className="result-content currency-grid">
        {data.contexts.map((ctx, idx) => (
          <div key={idx} className="currency-item">
            <div className="item-icon">{ctx.icon}</div>
            <div className="item-details">
              <span className="item-count">{formatDisplay(ctx.count)}</span>
              <span className="item-name">{ctx.item}</span>
            </div>
          </div>
        ))}
        <p className="context-sentence-currency">
          In {data.targetCity}, that's what you get.
        </p>
        <style>{`
          .result-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .currency-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 1rem;
            width: 100%;
          }

          .currency-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            border-radius: var(--radius-md);
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.2s;
          }

          .currency-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.1);
          }

          .item-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .item-details {
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .item-count {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-accent-primary);
          }

          .item-name {
            font-size: 0.875rem;
            color: var(--color-text-secondary);
          }

          .context-sentence-currency {
            grid-column: 1 / -1;
            margin-top: 1rem;
            font-size: 1rem;
            color: var(--color-text-secondary);
            font-style: italic;
          }
        `}</style>
      </div>
    );
  }

  // Distance, Weight, Time
  if (data.matches) {
    return (
      <div className="llm-list">
        {data.matches.map((item, idx) => (
          <div key={idx} className="llm-list-item">
            <span className="list-icon">{item.icon}</span>
            <span className="list-description">{item.description}</span>
          </div>
        ))}
        <style>{`
          .llm-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            width: 100%;
          }

          .llm-list-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: var(--radius-md);
            transition: all 0.2s;
          }

          .llm-list-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(4px);
          }

          .list-icon {
            font-size: 2rem;
            filter: drop-shadow(0 0 10px var(--color-accent-glow));
          }

          .list-description {
            font-size: 1.125rem;
            color: var(--color-text-primary);
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  // Fallback for Temperature or single result (legacy)
  return (
    <div className="result-content">
      <div className="main-stat">
        <span className="stat-value">{formatDisplay(data.contextValue)}</span>
        <span className="stat-unit">{data.contextUnit}</span>
      </div>
      <div className="visual-icon">{data.icon}</div>
      <p className="context-sentence">{data.sentence}</p>
      <style>{`
        .result-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .main-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(to bottom, #fff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-unit {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          margin-top: 0.25rem;
        }

        .visual-icon {
          font-size: 4rem;
          margin: 1rem 0;
          filter: drop-shadow(0 0 20px var(--color-accent-glow));
          animation: float 3s ease-in-out infinite;
        }

        .context-sentence {
          font-size: 1.125rem;
          color: var(--color-text-primary);
          font-weight: 500;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

const formatDisplay = (num) => {
  if (num >= 100) return Math.round(num);
  if (num >= 10) return num.toFixed(1);
  return num.toFixed(2);
};

export default ResultCard;
