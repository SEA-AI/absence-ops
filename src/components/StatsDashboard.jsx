import React from 'react';
import { Clock } from 'lucide-react';

export function StatsDashboard({ stats, labels }) {
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const getLabelName = (id) => {
    if (id === 'unlabeled') return 'Unlabeled';
    const label = labels.find(l => l._id === id);
    return label ? label.name : id;
  };

  return (
    <div className="stats-dashboard animate-fade">
      <div className="stats-total">
        <Clock size={13} className="stat-icon-inline" />
        <span className="stat-label-text">TOTAL</span>
        <span className="stat-value-main">{formatDuration(stats.totalDuration)}</span>
        <span className="stat-days">{stats.uniqueDays}d</span>
      </div>

      {stats.labelBreakdown.length > 0 && (
        <div className="stats-label-strip">
          <div className="label-strip-inner">
            {stats.labelBreakdown.map((item) => (
              <div key={item.id} className="label-stat-item">
                <div className="label-stat-header">
                  <span className="label-stat-name" title={getLabelName(item.id)}>
                    {getLabelName(item.id)}
                  </span>
                  <span className="label-stat-dur">{formatDuration(item.duration)}</span>
                </div>
                <div className="label-stat-bar">
                  <div
                    className="label-stat-fill"
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.percentage.toFixed(1)}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .stats-dashboard {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 8px 16px;
          border-bottom: 1px solid var(--glass-border);
          flex-shrink: 0;
        }
        .stats-total {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .stat-icon-inline {
          color: var(--primary);
        }
        .stat-label-text {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary);
        }
        .stat-value-main {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          font-variant-numeric: tabular-nums;
        }
        .stat-days {
          font-size: 0.72rem;
          color: var(--muted);
          padding: 2px 6px;
          background: var(--glass-border);
          border-radius: 3px;
          font-weight: 600;
        }

        /* Label strip */
        .stats-label-strip {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          mask-image: linear-gradient(to right, black 88%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 88%, transparent 100%);
        }
        .label-strip-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 4px 0;
        }
        .label-strip-inner::-webkit-scrollbar { display: none; }

        .label-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 90px;
          max-width: 180px;
        }
        .label-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 6px;
        }
        .label-stat-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          font-size: 0.7rem;
        }
        .label-stat-dur {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .label-stat-bar {
          width: 100%;
          height: 2px;
          background: var(--glass-border);
          border-radius: 1px;
          overflow: hidden;
        }
        .label-stat-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 1px;
          min-width: 2px;
        }

        @media (max-width: 900px) {
          .stats-dashboard {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .stats-label-strip {
            width: 100%;
            mask-image: linear-gradient(to right, black 80%, transparent 100%);
          }
        }
      `}} />
    </div>
  );
}
