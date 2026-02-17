import React from 'react';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfMonth } from 'date-fns';

export function FilterBar({ startDate, endDate, onDateChange, onRefresh, loading }) {
  const setQuickRange = (range) => {
    const end = new Date();
    let start;
    if (range === 'today') start = new Date();
    else if (range === '7d') start = subDays(end, 7);
    else if (range === '30d') start = subDays(end, 30);
    else if (range === '90d') start = subDays(end, 90);
    else if (range === 'year') start = subYears(end, 1);
    else if (range === 'month') {
      start = startOfMonth(end);
    }
    onDateChange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
  };

  return (
    <div className="filter-bar glass">
      <div className="range-presets">
        <button className="secondary sm" onClick={() => setQuickRange('today')}>Today</button>
        <button className="secondary sm" onClick={() => setQuickRange('7d')}>Last 7d</button>
        <button className="secondary sm" onClick={() => setQuickRange('30d')}>Last 30d</button>
        <button className="secondary sm" onClick={() => setQuickRange('90d')}>Last 90d</button>
        <button className="secondary sm" onClick={() => setQuickRange('year')}>Last Year</button>
        <button className="secondary sm" onClick={() => setQuickRange('month')}>This Month</button>
      </div>

      <div className="date-inputs">
        <div className="input-group">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
          />
        </div>
        <ChevronRight size={16} className="arrow" />
        <div className="input-group">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
          />
        </div>
      </div>

      <button className="primary" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={18} className={loading ? 'spin' : ''} />
        {loading ? 'Fetching...' : 'Refresh'}
      </button>

      <style dangerouslySetInnerHTML={{
        __html: `
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          gap: var(--spacing-md);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
        }
        .range-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .date-inputs {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-group input[type="date"] {
          padding: 8px 12px;
          font-size: 0.9rem;
          cursor: pointer;
          background: var(--bg-navy);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }
        /* Style the calendar picker icon if supported */
        .input-group input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
        /* Custom calendar icon using before if needed, but let's just make the input look clean */
        .input-group::before {
          content: '📅';
          position: absolute;
          right: 12px;
          font-size: 14px;
          pointer-events: none;
          opacity: 0.7;
        }
        .arrow {
          color: var(--text-secondary);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1000px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .range-presets {
            justify-content: center;
          }
          .date-inputs {
            justify-content: center;
          }
        }
      `}} />
    </div>
  );
}
