import React from 'react';
import { Clock } from 'lucide-react';
import styles from './StatsDashboard.module.css';

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
    <div className={styles.statsDashboard}>
      <div className={styles.statsTotal}>
        <Clock size={13} className={styles.statIconInline} />
        <span className={styles.statLabelText}>TOTAL</span>
        <span className={styles.statValueMain}>{formatDuration(stats.totalDuration)}</span>
        <span className={styles.statDays}>{stats.uniqueDays}d</span>
      </div>

      {stats.labelBreakdown.length > 0 && (
        <div className={styles.statsLabelStrip}>
          <div className={styles.labelStripInner}>
            {stats.labelBreakdown.map((item) => (
              <div key={item.id} className={styles.labelStatItem}>
                <div className={styles.labelStatHeader}>
                  <span className={styles.labelStatName} title={getLabelName(item.id)}>
                    {getLabelName(item.id)}
                  </span>
                  <span className={styles.labelStatDur}>{formatDuration(item.duration)}</span>
                </div>
                <div className={styles.labelStatBar}>
                  <div
                    className={styles.labelStatFill}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.percentage.toFixed(1)}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
