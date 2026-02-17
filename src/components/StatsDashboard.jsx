import React from 'react';
import { BarChart3, Clock, PieChart, TrendingUp } from 'lucide-react';

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
      <div className="stats-top">
        <div className="stat-card">
          <div className="stat-icon"><Clock size={12} /></div>
          <span className="stat-label-mini">Total</span>
          <div className="stat-value">{formatDuration(stats.totalDuration)}</div>
          <div className="stat-sub">{stats.uniqueDays}d</div>
        </div>
      </div>

      <div className="stats-labels">
        <div className="labels-grid">
          {stats.labelBreakdown.map((item) => (
            <div key={item.id} className="label-stat-row">
              <div className="label-info">
                <span className="label-name" title={getLabelName(item.id)}>{getLabelName(item.id)}</span>
                <span className="label-duration">{formatDuration(item.duration)}</span>
              </div>
              <div className="progress-mini">
                <div
                  className="progress-fill"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .stats-dashboard {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 8px 16px;
          margin-bottom: 8px;
          background: transparent;
          border-bottom: 1px solid var(--glass-border);
          border-radius: 0;
        }
        .stats-top {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
        }
        .stat-icon {
          width: 20px;
          height: 20px;
          background: var(--glass-border);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .stat-icon svg {
          width: 10px;
          height: 10px;
        }
        .stat-label-mini {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
          margin-right: 2px;
        }
        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .stat-sub {
          font-size: 0.65rem;
          color: var(--text-secondary);
          opacity: 0.6;
          margin-left: 2px;
        }

        .stats-labels {
          flex: 1;
          min-width: 0;
          position: relative;
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
        .labels-grid {
          display: flex;
          align-items: center;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 4px 0;
        }
        .labels-grid::-webkit-scrollbar { display: none; }

        .label-stat-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 100px;
          max-width: 280px;
        }
        .label-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }
        .label-name {
          color: var(--text-secondary);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .label-duration {
          color: var(--text-primary);
          font-weight: 600;
          white-space: nowrap;
          font-size: 0.8rem;
        }
        .progress-mini {
          width: 100%;
          height: 3px;
          background: var(--glass-border);
          border-radius: 1.5px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 1px;
        }
        .no-stats {
          display: none;
        }

        @media (max-width: 900px) {
          .stats-dashboard {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 8px 16px;
          }
          .stats-labels {
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
