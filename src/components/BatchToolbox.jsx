import React, { useState } from 'react';
import { Tag, CheckCircle2, AlertCircle, X, ChevronUp, Layers } from 'lucide-react';

export function BatchToolbox({ selectedCount, selectedTotalDuration, labels, onApply, processing, results }) {
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
      <div className="glass batch-toolbox-island animate-pop">
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
                      'Apply to Selection'
                    )}
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
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .batch-toolbox-island {
          min-width: 320px;
          padding: 8px;
          border-radius: 24px;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
        }
        .action-container {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px;
        }
        .toolbox-info {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }
        .selection-pill {
          background: var(--primary);
          color: white;
          padding: 8px 16px;
          border-radius: 18px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s;
        }
        .selection-pill:hover {
          transform: scale(1.02);
        }
        .divider {
          width: 1px;
          height: 24px;
          background: var(--glass-border);
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        .select-wrapper {
          position: relative;
          flex: 1;
          min-width: 180px;
        }
        .select-wrapper .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
        }
        .select-wrapper select {
          width: 100%;
          padding: 8px 12px 8px 36px;
          background: var(--bg-navy);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          color: var(--text-primary);
          font-size: 13px;
          appearance: none;
        }
        .primary-action {
          background: var(--text-primary);
          color: var(--bg-main);
          padding: 8px 20px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .primary-action:hover:not(:disabled) {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
        .primary-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Results View */
        .results-container {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 4px 12px;
        }
        .res-content {
          display: flex;
          gap: 12px;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 12px;
        }
        .status-badge.success {
          background: rgba(34, 227, 146, 0.1);
          color: var(--accent);
        }
        .status-badge.error {
          background: rgba(233, 80, 80, 0.1);
          color: var(--danger);
        }
        .close-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: var(--glass-border);
          color: var(--text-primary);
        }

        .close-btn:hover {
          background: var(--glass-border);
          color: var(--text-primary);
        }

        .animate-pop {
          animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        
        .loader {
          width: 16px;
          height: 16px;
          border: 2px solid var(--text-secondary);
          border-top-color: var(--bg-main);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
