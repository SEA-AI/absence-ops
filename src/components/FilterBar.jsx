import React from 'react';
import { Calendar, RefreshCw, ChevronRight } from 'lucide-react';
import { format, subDays, subYears, startOfMonth } from 'date-fns';

export function FilterBar({ startDate, endDate, onDateChange, onRefresh, loading }) {
  const setQuickRange = (range) => {
    const end = new Date();
    let start;
    if (range === 'today') start = new Date();
    else if (range === '7d') start = subDays(end, 7);
    else if (range === '30d') start = subDays(end, 30);
    else if (range === '90d') start = subDays(end, 90);
    else if (range === 'year') start = subYears(end, 1);
    else if (range === 'month') start = startOfMonth(end);
    onDateChange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  };

  return (
    <div className="filter-bar glass">
      <div className="range-presets">
        <button className="secondary sm" onClick={() => setQuickRange('today')}>Today</button>
        <button className="secondary sm" onClick={() => setQuickRange('7d')}>Last 7d</button>
        <button className="secondary sm" onClick={() => setQuickRange('30d')}>Last 30d</button>
        <button className="secondary sm" onClick={() => setQuickRange('90d')}>Last 90d</button>
        <button className="secondary sm" onClick={() => setQuickRange('year')}>Past Year</button>
        <button className="secondary sm" onClick={() => setQuickRange('month')}>This Month</button>
      </div>

      <div className="date-inputs">
        <div className="input-group">
          <Calendar size={14} className="date-icon" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
          />
        </div>
        <ChevronRight size={14} className="arrow" />
        <div className="input-group">
          <Calendar size={14} className="date-icon" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
          />
        </div>
      </div>

      <button className="primary" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={16} className={loading ? 'spin' : ''} />
        {loading ? 'Loading…' : 'Refresh'}
      </button>

      <style dangerouslySetInnerHTML={{
        __html: `
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px var(--spacing-md);
          border-radius: var(--radius-md);
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }
        .range-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .date-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .date-icon {
          position: absolute;
          left: 10px;
          color: var(--muted);
          pointer-events: none;
          z-index: 1;
        }
        .input-group input[type="date"] {
          padding: 7px 10px 7px 30px;
          font-size: 0.88rem;
          cursor: pointer;
          background: var(--bg-secondary, var(--glass-bg));
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: inherit;
          letter-spacing: 0.01em;
        }
        .input-group input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .arrow {
          color: var(--muted);
          flex-shrink: 0;
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .range-presets { justify-content: center; }
          .date-inputs { justify-content: center; }
          .filter-bar > button { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
}
