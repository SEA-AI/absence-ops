import React from 'react';
import { format } from 'date-fns';
import { Clock, Tag as TagIcon, ChevronRight } from 'lucide-react';

const MAX_VISIBLE_LABELS = 3;

export function EventTable({ events, selectedIds, onToggleSelect, labels, viewMode }) {
  const [expandedRows, setExpandedRows] = React.useState([]);

  const getLabelName = (id) => {
    const label = labels.find(l => l._id === id);
    return label ? label.name : id;
  };

  const renderLabels = (labelIds) => {
    if (!labelIds || labelIds.length === 0) {
      return <span className="no-labels">None</span>;
    }
    const visible = labelIds.slice(0, MAX_VISIBLE_LABELS);
    const overflow = labelIds.length - MAX_VISIBLE_LABELS;
    const overflowNames = labelIds.slice(MAX_VISIBLE_LABELS).map(getLabelName).join(', ');
    return (
      <>
        {visible.map(id => (
          <span key={id} className="label-tag" title={getLabelName(id)}>
            <TagIcon size={9} />
            {getLabelName(id)}
          </span>
        ))}
        {overflow > 0 && (
          <span className="label-overflow" title={overflowNames}>+{overflow}</span>
        )}
      </>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const [lastSelectedIndex, setLastSelectedIndex] = React.useState(null);

  const handleSelect = (e, id, index) => {
    e.stopPropagation();

    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = events.slice(start, end + 1).map(ev => ev._id);

      const newSelection = Array.from(new Set([...selectedIds, ...rangeIds]));
      onToggleSelect(newSelection);
    } else {
      if (selectedIds.includes(id)) {
        onToggleSelect(selectedIds.filter(idx => idx !== id));
      } else {
        onToggleSelect([...selectedIds, id]);
      }
    }
    setLastSelectedIndex(index);
  };

  if (events.length === 0) {
    return (
      <div className="empty-state glass">
        <Clock size={48} />
        <p>No time tracked events found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="table-container glass animate-fade">
      <table>
        <thead>
          <tr>
            <th className="checkbox-col">
              <input
                type="checkbox"
                checked={selectedIds.length === events.length && events.length > 0}
                onChange={() => {
                  if (selectedIds.length === events.length) onToggleSelect([]);
                  else onToggleSelect(events.map(e => e._id));
                }}
              />
            </th>
            <th>{viewMode === 'daily' ? 'Date' : 'Time'}</th>
            <th>Work Duration</th>
            {viewMode === 'daily' && <th>Distribution</th>}
            <th>Labels</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <React.Fragment key={event._id}>
              <tr
                className={`${selectedIds.includes(event._id) ? 'selected' : ''} ${event.type || ''} ${event.isGroup ? 'group-row' : ''}`}
                onClick={(e) => handleSelect(e, event._id, index)}
              >
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(event._id)}
                    readOnly
                    onClick={(e) => handleSelect(e, event._id, index)}
                  />
                </td>
                <td>
                  <div className="date-cell">
                    <div className="date-main">
                      {event.isGroup && (
                        <button
                          className={`expand-toggle ${expandedRows.includes(event._id) ? 'open' : ''}`}
                          onClick={(e) => toggleExpand(e, event._id)}
                        >
                          <ChevronRight size={16} />
                        </button>
                      )}
                      <span className="main-date">
                        {format(new Date(event.start), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {viewMode === 'detailed' && (
                      <span className="time-sub">
                        {format(new Date(event.start), 'HH:mm')} - {event.end ? format(new Date(event.end), 'HH:mm') : 'Active'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="duration-cell">
                  <div className="duration-box work">
                    {formatDuration(event.duration || event.calcDuration)}
                  </div>
                </td>
                {viewMode === 'daily' && (
                  <td className="timeline-col">
                    <div className="mini-timeline">
                      {event.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className={`timeline-chunk ${item.type}`}
                          style={{ flex: item.calcDuration }}
                          title={`${item.type}: ${formatDuration(item.calcDuration)}`}
                        />
                      ))}
                    </div>
                  </td>
                )}
                <td>
                  <div className="labels-list">
                    {renderLabels(event.labelIds)}
                  </div>
                </td>
                <td className="notes-cell">
                  {event.isGroup ? (
                    <span
                      className="group-meta clickable"
                      onClick={(e) => toggleExpand(e, event._id)}
                    >
                      {event.ids.length} work periods
                    </span>
                  ) : (
                    <span className="commentary">{event.commentary || '-'}</span>
                  )}
                </td>
              </tr>
              {/* Expanded sub-items */}
              {event.isGroup && expandedRows.includes(event._id) && event.items.map(item => (
                <tr key={item._id} className={`sub-row ${item.type}`}>
                  <td />
                  <td className="sub-time">
                    {format(new Date(item.start), 'HH:mm')} - {item.end ? format(new Date(item.end), 'HH:mm') : 'Active'}
                  </td>
                  <td>
                    <div className={`duration-box ${item.type} mini`}>
                      {formatDuration(item.calcDuration)}
                    </div>
                  </td>
                  <td />
                  <td>
                    <div className="labels-list">
                      {item.labelIds?.map(id => (
                        <span key={id} className="label-tag mini">
                          {getLabelName(id)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="notes-cell mini">
                    {item.commentary}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <style dangerouslySetInnerHTML={{
        __html: `
        .table-container {
          flex: 1;
          overflow: auto;
          margin-top: var(--spacing-sm);
          border-radius: var(--radius-md);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }
        th {
          position: sticky;
          top: 0;
          background: var(--sea-blue, #0B1731);
          padding: 12px 16px;
          color: var(--sea-grey, #7B9194);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.07em;
          z-index: 10;
          white-space: nowrap;
        }
        .light-theme th {
          background: var(--bg-secondary, #ffffff);
          border-bottom: 2px solid var(--sea-red, #CB0D00);
        }
        td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--glass-border);
          transition: background 0.15s;
          vertical-align: middle;
        }
        tr:hover td {
          background: var(--primary-dim);
        }
        tr.selected td {
          background: var(--primary-dim);
          border-left: 2px solid var(--primary);
        }
        tr.selected td:first-child {
          padding-left: 14px;
        }
        .checkbox-col {
          width: 50px;
          text-align: center;
        }
        .date-main {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .expand-toggle {
          background: transparent;
          color: var(--text-secondary);
          border: none;
          padding: 2px;
          cursor: pointer;
          display: flex;
          transition: transform 0.2s;
        }
        .expand-toggle.open {
          transform: rotate(90deg);
        }
        .main-date {
          font-weight: 600;
          color: var(--text-primary);
        }
        .time-sub {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
          padding-left: 24px;
        }
        .duration-cell {
          min-width: 120px;
        }
        .duration-box {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .duration-box.work {
          background: var(--secondary-dim);
          color: var(--sea-grey, #7B9194);
          border: 1px solid rgba(6, 64, 76, 0.25);
          font-variant-numeric: tabular-nums;
        }
        .duration-box.break {
          background: var(--primary-dim);
          color: var(--muted);
          border: 1px solid rgba(203, 13, 0, 0.15);
        }
        .duration-box.mini {
          font-size: 0.7rem;
          padding: 2px 8px;
          font-weight: 500;
        }
        
        /* Timeline */
        .timeline-col {
          min-width: 150px;
        }
        .mini-timeline {
          height: 6px;
          background: var(--glass-border);
          border-radius: 3px;
          display: flex;
          overflow: hidden;
          width: 120px;
        }
        .timeline-chunk {
          height: 100%;
        }
        .timeline-chunk.work {
          background: var(--secondary, #06404C);
        }
        .timeline-chunk.break {
          background: var(--primary, #CB0D00);
          opacity: 0.4;
        }

        /* Sub-rows */
        .sub-row {
          background: rgba(0,0,0,0.05);
          font-size: 0.85rem;
        }
        .sub-row td {
          padding: 8px 16px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--glass-border);
        }
        .sub-time {
          padding-left: 48px !important;
          font-family: inherit;
          font-weight: 500;
        }

        tr.break td {
          opacity: 0.6;
        }
        .labels-list {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .label-tag {
          background: var(--secondary-dim);
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 0.72rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          color: var(--muted);
          border: 1px solid rgba(6, 64, 76, 0.2);
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .label-tag.mini {
          border: none;
          background: var(--secondary-dim);
          font-size: 0.65rem;
          max-width: 100px;
        }
        .label-overflow {
          background: var(--primary-dim);
          color: var(--primary);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 700;
          border: 1px solid rgba(203, 13, 0, 0.2);
          cursor: default;
          white-space: nowrap;
        }
        .no-labels {
          color: var(--muted);
          font-style: italic;
          font-size: 0.75rem;
          opacity: 0.6;
        }
        .notes-cell {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .notes-cell.mini {
          font-size: 0.75rem;
          font-style: italic;
        }
        .group-meta {
           color: var(--text-secondary);
           font-size: 0.8rem;
           opacity: 0.7;
        }
        .group-meta.clickable {
          cursor: pointer;
        }
        .group-meta.clickable:hover {
          color: var(--primary);
          opacity: 1;
          text-decoration: underline;
        }
        .commentary {
           max-width: 250px;
           display: block;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
        }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          margin-top: 20px;
        }
      `}} />
    </div>
  );
}
