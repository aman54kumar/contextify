import React from 'react';
import '../styles/index.css';
import { Settings as SettingsIcon } from 'lucide-react';

const Layout = ({ children, onSettingsClick }) => {
  return (
    <div className="layout-container">
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-icon">🌍</span>
          <h1 className="logo-text">Contextify</h1>
        </div>
        <p className="tagline">The Relatable Unit Converter</p>
        <button className="settings-icon-btn" onClick={onSettingsClick} title="Settings">
          <SettingsIcon size={20} />
        </button>
      </header>

      <main className="app-content">
        {children}
      </main>

      <footer className="app-footer">
        <p>Designed for the curious mind. Powered by AI.</p>
      </footer>

      <style>{`
        .layout-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 2rem;
        }

        .app-header {
          text-align: center;
          margin-bottom: 1rem;
          position: relative;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tagline {
          color: var(--color-accent-primary);
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .settings-icon-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-secondary);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-accent-primary);
          transform: rotate(90deg);
        }

        .app-content {
          width: 100%;
          max-width: 600px;
          animation: fadeIn 0.8s ease-out;
        }

        .app-footer {
          margin-top: 2rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          opacity: 0.7;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .settings-icon-btn {
            position: static;
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
