import React from 'react';
import { Calendar, RefreshCw, ChevronRight } from 'lucide-react';
import { format, subDays, subYears, startOfMonth } from 'date-fns';
import styles from './FilterBar.module.css';

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
    <div className={styles.filterBar}>
      <div className={styles.rangePresets}>
        <button className="secondary sm" onClick={() => setQuickRange('today')}>Today</button>
        <button className="secondary sm" onClick={() => setQuickRange('7d')}>Last 7d</button>
        <button className="secondary sm" onClick={() => setQuickRange('30d')}>Last 30d</button>
        <button className="secondary sm" onClick={() => setQuickRange('90d')}>Last 90d</button>
        <button className="secondary sm" onClick={() => setQuickRange('year')}>Past Year</button>
        <button className="secondary sm" onClick={() => setQuickRange('month')}>This Month</button>
      </div>

      <div className={styles.dateInputs}>
        <div className={styles.inputGroup}>
          <Calendar size={14} className={styles.dateIcon} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
          />
        </div>
        <ChevronRight size={14} className={styles.arrow} />
        <div className={styles.inputGroup}>
          <Calendar size={14} className={styles.dateIcon} />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
          />
        </div>
      </div>

      <button className="primary" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={16} className={loading ? styles.spin : ''} />
        {loading ? 'Loading…' : 'Refresh'}
      </button>
    </div>
  );
}
