import React, { useState } from 'react';
import { Tag, CheckCircle2, AlertCircle, X, ChevronUp, Layers, Trash2 } from 'lucide-react';

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
    <div className={`batch-toolbox-wrapper ${!isExpanded ? 'collapsed' : ''}`}>
      <div className="batch-toolbox-island">
        {results ? (
          <div className="results-container">
            <div className="res-content">
              <div className="status-badge success">
                <CheckCircle2 size={18} />
                <span>{results.filter(r => r.status === 'success').length} Updated</span>
              </div>
              {results.some(r => r.status === 'error') && (
                <div className="status-badge error">
                  <AlertCircle size={18} />
                  <span>{results.filter(r => r.status === 'error').length} Failed</span>
                </div>
              )}
            </div>
            <button className="close-btn" onClick={() => onApply(null)}>
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="action-container">
            <div className="toolbox-info" onClick={() => setIsExpanded(!isExpanded)}>
              <div className="selection-pill">
                <Layers size={14} />
                <span>{selectedCount} Selected ({formatDuration(selectedTotalDuration)})</span>
              </div>
              {!isExpanded && <ChevronUp size={16} className="expand-icon" />}
            </div>

            {processing && bulkProgress && (
                <div className="progress-container">
                    <div className="progress-track">
                        <div
                            className="progress-fill-bar"
                            style={{ width: `${Math.round((bulkProgress.current / bulkProgress.total) * 100)}%` }}
                        />
                    </div>
                    <span className="progress-label">{bulkProgress.current}/{bulkProgress.total}</span>
                </div>
            )}

            {isExpanded && (
              <>
                <div className="divider" />
                <div className="control-group">
                  <div className="select-wrapper">
                    <Tag size={14} className="input-icon" />
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
                    className="primary-action"
                    onClick={() => onApply(selectedLabelId)}
                    disabled={!selectedLabelId || processing}
                  >
                    {processing ? (
                      <div className="loader" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                  <div className="divider" />
                  <button
                    className="danger-action"
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

      <style dangerouslySetInnerHTML={{
        __html: `
        .batch-toolbox-wrapper {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }
        /* elevated surface — depth from value, not shadow/blur */
        .batch-toolbox-island {
          min-width: 340px;
          padding: var(--space-s);
          border-radius: var(--radius-l);
          background: var(--surface-neutral-5);
        }
        .action-container {
          display: flex;
          align-items: center;
          gap: var(--space-m);
          padding: var(--space-xs);
        }
        .toolbox-info {
          display: flex;
          align-items: center;
          gap: var(--space-s);
          cursor: pointer;
          user-select: none;
        }
        /* selection count = active state → primary blue */
        .selection-pill {
          background: var(--surface-primary-3);
          color: #FFFFFF;
          padding: 8px 14px;
          border-radius: var(--radius-m);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--space-s);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }
        .divider {
          width: 1px;
          height: 24px;
          background: var(--surface-neutral-3);
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: var(--space-m);
          flex: 1;
        }
        .select-wrapper {
          position: relative;
          flex: 1;
          min-width: 150px;
        }
        .select-wrapper .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--content-neutral-1);
          pointer-events: none;
        }
        .select-wrapper select {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 36px;
          background: var(--surface-neutral-3);
          border: none;
          border-radius: var(--radius-m);
          color: var(--content-neutral-3);
          font-size: 13px;
          appearance: none;
        }
        .primary-action {
          background: var(--surface-primary-3);
          color: #FFFFFF;
          height: 40px;
          padding: 0 16px;
          border-radius: var(--radius-m);
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: filter var(--transition);
          white-space: nowrap;
          min-width: 72px;
        }
        .primary-action:hover:not(:disabled) { filter: brightness(1.12); }
        /* destructive = danger red */
        .danger-action {
          background: transparent;
          color: var(--content-danger-1);
          height: 40px;
          width: 40px;
          border-radius: var(--radius-m);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition), color var(--transition);
        }
        .danger-action:hover:not(:disabled) {
          background: var(--surface-danger-3);
          color: #FFFFFF;
        }
        .primary-action:disabled, .danger-action:disabled {
          opacity: var(--opacity-disabled);
          cursor: not-allowed;
        }

        /* Results View */
        .results-container {
          display: flex;
          align-items: center;
          gap: var(--space-l);
          padding: var(--space-xs) var(--space-m);
        }
        .res-content { display: flex; gap: var(--space-m); }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-m);
        }
        .status-badge.success {
          background: var(--surface-neutral-3);
          color: var(--content-neutral-2);
        }
        .status-badge.error {
          background: var(--surface-danger-3);
          color: #FFFFFF;
        }
        .close-btn {
          background: var(--surface-neutral-3);
          border: none;
          color: var(--content-neutral-2);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-m);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition), color var(--transition);
        }
        .close-btn:hover {
          background: var(--surface-neutral-4);
          color: var(--content-neutral-3);
        }

        .loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .progress-container {
          display: flex;
          align-items: center;
          gap: var(--space-s);
          flex: 1;
          min-width: 120px;
        }
        .progress-track {
          flex: 1;
          height: 8px;
          background: var(--surface-neutral-3);
          border-radius: var(--radius-s);
          overflow: hidden;
        }
        .progress-fill-bar {
          height: 100%;
          background: var(--surface-primary-3);
          border-radius: var(--radius-s);
          transition: width 0.4s ease-in-out;
          min-width: 4px;
        }
        .progress-label {
          font-size: 12px;
          color: var(--content-neutral-2);
          white-space: nowrap;
          font-weight: 600;
          min-width: 38px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
      `}} />
    </div>
  );
}
