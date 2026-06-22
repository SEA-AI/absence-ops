import React, { useState } from 'react';
import { Key, Lock, Info } from 'lucide-react';

export function AuthCard({ onLogin, loading }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clientId && clientSecret) {
      onLogin({ clientId, clientSecret });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="sea-logo-mark">S E A . A I</div>
          <div className="auth-product-name">Absence <strong>Ops</strong></div>
          <p className="auth-subtitle">Connect with your OAuth credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="clientId">CLIENT ID</label>
            <div className="input-wrapper">
              <Key size={15} />
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter Client ID"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="clientSecret">CLIENT SECRET</label>
            <div className="input-wrapper">
              <Lock size={15} />
              <input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter Client Secret"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Authenticating…' : 'Connect to API'}
          </button>
        </form>

        <div className="auth-help">
          <div className="help-header">
            <Info size={13} />
            <span>WHERE TO FIND YOUR CREDENTIALS</span>
          </div>
          <p>Go to your <a href="https://app.absence.io/" target="_blank" rel="noopener noreferrer">absence.io account</a> and follow these steps:</p>
          <ol className="help-steps">
            <li>Click your <strong>User Icon</strong> (top-right)</li>
            <li>Select <strong>Show Profile</strong></li>
            <li>Go to <strong>Integrations → OAuth</strong></li>
          </ol>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--surface-neutral-1);
          padding: var(--space-2xl);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--surface-neutral-3);
          border-radius: var(--radius-l);
          padding: var(--space-4xl) var(--space-3xl);
        }
        .auth-header {
          text-align: center;
          margin-bottom: var(--space-3xl);
        }
        .sea-logo-mark {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.26em;
          color: var(--content-neutral-3);
          text-transform: uppercase;
          margin-bottom: var(--space-m);
        }
        .auth-product-name {
          font-size: 1.6rem;
          font-weight: 400;
          color: var(--content-neutral-1);
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }
        .auth-product-name strong { color: var(--content-neutral-3); font-weight: 600; }
        .auth-subtitle { color: var(--content-neutral-1); font-size: 0.88rem; }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: var(--content-neutral-1);
          text-transform: uppercase;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-wrapper svg {
          position: absolute;
          left: 13px;
          color: var(--content-neutral-1);
          pointer-events: none;
          z-index: 1;
        }
        .input-wrapper input {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 40px;
          background: var(--surface-neutral-4);
          border: none;
          border-radius: var(--radius-s);
          color: var(--content-neutral-3);
          font-size: 0.9rem;
          font-family: inherit;
        }
        .input-wrapper input::placeholder { color: var(--content-neutral-1); }
        .input-wrapper input:focus {
          outline: 2px solid var(--accent-primary-2);
          outline-offset: -1px;
        }
        .auth-submit {
          margin-top: var(--space-xs);
          width: 100%;
          height: 48px;
          background: var(--surface-primary-3);
          color: #FFFFFF;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          border: none;
          border-radius: var(--radius-m);
          cursor: pointer;
          transition: filter var(--transition);
          font-family: inherit;
          justify-content: center;
          display: flex;
          align-items: center;
        }
        .auth-submit:hover:not(:disabled) { filter: brightness(1.12); }
        .auth-submit:disabled { opacity: var(--opacity-disabled); cursor: not-allowed; }
        .auth-help {
          margin-top: var(--space-2xl);
          padding: var(--space-l);
          background: var(--surface-neutral-4);
          border-radius: var(--radius-m);
        }
        .help-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--content-neutral-1);
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: var(--space-s);
        }
        .auth-help p {
          color: var(--content-neutral-2);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: var(--space-s);
        }
        .auth-help a {
          color: var(--accent-primary-2);
          text-decoration: none;
          font-weight: 600;
        }
        .auth-help a:hover { text-decoration: underline; }
        .help-steps {
          margin: var(--space-s) 0 var(--space-xs);
          padding-left: 18px;
          color: var(--content-neutral-2);
          font-size: 0.85rem;
          line-height: 1.7;
        }
        .help-steps li strong { color: var(--content-neutral-3); }
      `}} />
    </div>
  );
}
