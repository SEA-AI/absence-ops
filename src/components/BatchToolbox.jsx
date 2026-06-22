import React, { useState } from 'react';
import { Tag, CheckCircle2, AlertCircle, X, ChevronUp, Layers, Trash2 } from 'lucide-react';
import styles from './BatchToolbox.module.css';

export function BatchToolbox({ selectedCount, selectedTotalDuration, labels, onApply, onClear, processing, results, bulkProgress }) {
  const [selectedLabelId, setSelectedLabelId] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (selectedCount === 0 && !results) return null;

  return (
    <div className={styles.batchToolboxWrapper}>
      <div className={styles.batchToolboxIsland}>
        {results ? (
          <div className={styles.resultsContainer}>
            <div className={styles.resContent}>
              <div className={`${styles.statusBadge} ${styles.success}`}>
                <CheckCircle2 size={18} />
                <span>{results.filter(r => r.status === 'success').length} Updated</span>
              </div>
              {results.some(r => r.status === 'error') && (
                <div className={`${styles.statusBadge} ${styles.error}`}>
                  <AlertCircle size={18} />
                  <span>{results.filter(r => r.status === 'error').length} Failed</span>
                </div>
              )}
            </div>
            <button className={styles.closeBtn} onClick={() => onApply(null)}>
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className={styles.actionContainer}>
            <div className={styles.toolboxInfo} onClick={() => setIsExpanded(!isExpanded)}>
              <div className={styles.selectionPill}>
                <Layers size={14} />
                <span>{selectedCount} Selected ({formatDuration(selectedTotalDuration)})</span>
              </div>
              {!isExpanded && <ChevronUp size={16} />}
            </div>

            {processing && bulkProgress && (
              <div className={styles.progressContainer}>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFillBar}
                    style={{ width: `${Math.round((bulkProgress.current / bulkProgress.total) * 100)}%` }}
                  />
                </div>
                <span className={styles.progressLabel}>{bulkProgress.current}/{bulkProgress.total}</span>
              </div>
            )}

            {isExpanded && (
              <>
                <div className={styles.divider} />
                <div className={styles.controlGroup}>
                  <div className={styles.selectWrapper}>
                    <Tag size={14} className={styles.inputIcon} />
                    <select
                      value={selectedLabelId}
                      onChange={(e) => setSelectedLabelId(e.target.value)}
                      disabled={processing}
                    >
                      <option value="">Assign Label...</option>
                      {labels.map(L => (
                        <option key={L._id} value={L._id}>{L.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    className={styles.primaryAction}
                    onClick={() => onApply(selectedLabelId)}
                    disabled={!selectedLabelId || processing}
                  >
                    {processing ? <div className={styles.loader} /> : 'Apply'}
                  </button>
                  <div className={styles.divider} />
                  <button
                    className={styles.dangerAction}
                    onClick={onClear}
                    disabled={processing || selectedCount === 0}
                    title="Clear all labels"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
