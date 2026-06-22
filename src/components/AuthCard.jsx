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
      <div className="auth-card animate-fade">
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
          background: #0B1731;
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(123, 145, 148, 0.15);
          border-radius: var(--radius-lg);
          padding: 40px 36px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .sea-logo-mark {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.28em;
          color: #CB0D00;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .auth-product-name {
          font-size: 1.6rem;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }
        .auth-product-name strong {
          color: #FFFFFF;
          font-weight: 700;
        }
        .auth-subtitle {
          color: #7B9194;
          font-size: 0.85rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #CB0D00;
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
          color: #7B9194;
          pointer-events: none;
        }
        .input-wrapper input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          background: rgba(11, 23, 49, 0.6);
          border: 1px solid rgba(123, 145, 148, 0.2);
          border-radius: var(--radius-sm);
          color: #FFFFFF;
          font-size: 0.9rem;
          font-family: inherit;
        }
        .input-wrapper input::placeholder {
          color: rgba(123, 145, 148, 0.5);
        }
        .input-wrapper input:focus {
          outline: none;
          border-color: #CB0D00;
          box-shadow: 0 0 0 3px rgba(203, 13, 0, 0.12);
        }
        .auth-submit {
          margin-top: 4px;
          width: 100%;
          padding: 12px;
          background: #CB0D00;
          color: #FFFFFF;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: filter 0.2s, transform 0.2s;
          font-family: inherit;
          justify-content: center;
          display: flex;
          align-items: center;
        }
        .auth-submit:hover:not(:disabled) {
          filter: brightness(1.15);
          transform: translateY(-1px);
        }
        .auth-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-help {
          margin-top: 28px;
          padding: 16px;
          background: rgba(6, 64, 76, 0.2);
          border-radius: var(--radius-md);
          border: 1px solid rgba(6, 64, 76, 0.3);
        }
        .help-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7B9194;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .auth-help p {
          color: #7B9194;
          font-size: 0.83rem;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .auth-help a {
          color: #CB0D00;
          text-decoration: none;
          font-weight: 600;
        }
        .auth-help a:hover { text-decoration: underline; }
        .help-steps {
          margin: 8px 0 4px;
          padding-left: 18px;
          color: #7B9194;
          font-size: 0.83rem;
          line-height: 1.7;
        }
        .help-steps li strong { color: rgba(255,255,255,0.75); }
      `}} />
    </div>
  );
}
