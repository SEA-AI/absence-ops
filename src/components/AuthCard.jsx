import React, { useState } from 'react';
import { Key, Lock, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import styles from './AuthCard.module.css';
import logoWhite from '../assets/logo-white.svg';
import logoBlack from '../assets/logo-black.jpg';

export function AuthCard({ onLogin, loading }) {
  const { theme } = useTheme();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clientId && clientSecret) {
      onLogin({ clientId, clientSecret });
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <img
            src={theme === 'LIGHT' ? logoBlack : logoWhite}
            alt="SEA.AI"
            className={styles.seaLogoMark}
          />
          <div className={styles.authProductName}>Absence <strong>Ops</strong></div>
          <p className={styles.authSubtitle}>Connect with your OAuth credentials</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="clientId">CLIENT ID</label>
            <div className={styles.inputWrapper}>
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

          <div className={styles.formGroup}>
            <label htmlFor="clientSecret">CLIENT SECRET</label>
            <div className={styles.inputWrapper}>
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

          <button type="submit" className={styles.authSubmit} disabled={loading}>
            {loading ? 'Authenticating…' : 'Connect to API'}
          </button>
        </form>

        <div className={styles.authHelp}>
          <div className={styles.helpHeader}>
            <Info size={13} />
            <span>WHERE TO FIND YOUR CREDENTIALS</span>
          </div>
          <p>Go to your <a href="https://app.absence.io/" target="_blank" rel="noopener noreferrer">absence.io account</a> and follow these steps:</p>
          <ol className={styles.helpSteps}>
            <li>Click your <strong>User Icon</strong> (top-right)</li>
            <li>Select <strong>Show Profile</strong></li>
            <li>Go to <strong>Integrations → OAuth</strong></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
