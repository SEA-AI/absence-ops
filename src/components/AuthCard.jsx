import React, { useState } from 'react';
import { Key, Lock, Terminal, Info } from 'lucide-react';

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
      <div className="glass auth-card animate-fade">
        <div className="auth-header">
          <Terminal size={32} className="logo-icon" />
          <h2>Absence Batch</h2>
          <p>Login with your OAuth Credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client ID</label>
            <div className="input-wrapper">
              <Key size={18} />
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter Client ID"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Client Secret</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Enter Client Secret"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="primary full-width" disabled={loading}>
            {loading ? 'Authenticating...' : 'Connect to API'}
          </button>
        </form>

        <div className="auth-help">
          <div className="help-header">
            <Info size={14} />
            <span>Find your credentials</span>
          </div>
          <p>Go to your <a href="https://app.absence.io/" target="_blank" rel="noopener noreferrer">absence.io account</a> and follow these steps:</p>
          <ol className="help-steps">
            <li>Click your <strong>User Icon</strong> (top-right)</li>
            <li>Select <strong>Show Profile</strong></li>
            <li>Go to <strong>Integrations</strong> → <strong>OAuth</strong></li>
          </ol>
          <p>Copy the <strong>Client Id</strong> and <strong>Client Secret</strong> from that page and paste them above.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-main);
          padding: 24px;
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: var(--spacing-lg);
          border-radius: var(--radius-lg);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          color: var(--primary);
          margin-bottom: 16px;
        }
        .auth-header h2 {
          font-size: 1.5rem;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .auth-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-wrapper svg {
          position: absolute;
          left: 14px;
          color: var(--text-secondary);
        }
        .input-wrapper input {
          width: 100%;
          padding-left: 44px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          border-radius: var(--radius-sm);
        }
        .full-width {
          width: 100%;
          justify-content: center;
          padding: 1rem;
          margin-top: 10px;
        }
        .auth-help {
          margin-top: 32px;
          padding: 16px;
          background: var(--glass-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
        }
        .help-header {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .auth-help p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .auth-help a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }
        .auth-help a:hover {
          text-decoration: underline;
        }
        .help-steps {
          margin: 12px 0;
          padding-left: 20px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.6;
        }
        .help-steps li {
          margin-bottom: 4px;
        }
        .help-steps li strong {
          color: var(--text-primary);
        }
      `}} />
    </div>
  );
}
