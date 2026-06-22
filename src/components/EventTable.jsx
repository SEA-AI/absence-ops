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
      <div className="empty-state">
        <Clock size={40} strokeWidth={1.5} />
        <p>No time-tracked events for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
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
          border-radius: var(--radius-m);
          background: var(--surface-neutral-3);
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
          background: var(--surface-neutral-3);
          padding: 12px 16px;
          color: var(--content-neutral-1);
          font-weight: 500;
          text-transform: uppercase;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
          z-index: 10;
          white-space: nowrap;
        }
        td {
          padding: 12px 16px;
          background: var(--surface-neutral-4);
          transition: background var(--transition);
          vertical-align: middle;
        }
        /* row gap via shell showing through (flat dividers) */
        tbody tr { box-shadow: 0 1px 0 0 var(--surface-neutral-3); }
        tr:hover td { background: var(--surface-neutral-5); }
        tr.selected td {
          background: color-mix(in srgb, var(--surface-primary-3) 22%, var(--surface-neutral-4));
        }
        tr.selected td:first-child {
          box-shadow: inset 3px 0 0 0 var(--surface-primary-3);
        }
        .checkbox-col, .checkbox-cell { width: 48px; text-align: center; }

        .date-main { display: flex; align-items: center; gap: var(--space-s); }
        .expand-toggle {
          background: transparent;
          color: var(--content-neutral-1);
          border: none;
          padding: 2px;
          cursor: pointer;
          display: flex;
          transition: transform var(--transition);
        }
        .expand-toggle.open { transform: rotate(90deg); }
        .main-date { font-weight: 600; color: var(--content-neutral-3); }
        .time-sub {
          font-size: 0.75rem;
          color: var(--content-neutral-1);
          margin-top: 2px;
          padding-left: 24px;
          font-variant-numeric: tabular-nums;
        }
        .duration-cell { min-width: 110px; }
        .duration-box {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: var(--radius-s);
          font-size: 0.78rem;
          font-weight: 600;
          background: var(--surface-neutral-5);
          color: var(--content-neutral-2);
          font-variant-numeric: tabular-nums;
        }
        .duration-box.break {
          background: transparent;
          color: var(--content-neutral-1);
        }
        .duration-box.mini {
          font-size: 0.72rem;
          padding: 2px 8px;
          font-weight: 500;
        }

        /* Timeline — work = primary blue (the tracked data), break = neutral */
        .timeline-col { min-width: 140px; }
        .mini-timeline {
          height: 6px;
          background: var(--surface-neutral-5);
          border-radius: var(--radius-xs);
          display: flex;
          overflow: hidden;
          width: 120px;
        }
        .timeline-chunk { height: 100%; }
        .timeline-chunk.work { background: var(--surface-primary-3); }
        .timeline-chunk.break { background: var(--content-neutral-1); opacity: 0.5; }

        /* Sub-rows — recessed surface */
        .sub-row td {
          padding: 8px 16px;
          background: var(--surface-neutral-3);
          color: var(--content-neutral-2);
          font-size: 0.85rem;
        }
        .sub-time {
          padding-left: 48px !important;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }
        tr.break td { color: var(--content-neutral-1); }

        .labels-list { display: flex; flex-wrap: wrap; gap: var(--space-xs); align-items: center; }
        .label-tag {
          background: var(--surface-neutral-5);
          padding: 2px 8px;
          border-radius: var(--radius-s);
          font-size: 0.72rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--content-neutral-2);
          white-space: nowrap;
          max-width: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .label-tag svg { color: var(--content-neutral-1); flex-shrink: 0; }
        .label-tag.mini { font-size: 0.66rem; max-width: 110px; }
        /* overflow = neutral "more" affordance, NOT red (red = error) */
        .label-overflow {
          background: var(--surface-neutral-5);
          color: var(--content-neutral-1);
          padding: 2px 7px;
          border-radius: var(--radius-s);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: default;
          white-space: nowrap;
        }
        .no-labels {
          color: var(--content-neutral-1);
          font-size: 0.75rem;
        }
        .notes-cell { color: var(--content-neutral-2); font-size: 0.85rem; }
        .notes-cell.mini { font-size: 0.78rem; color: var(--content-neutral-1); }
        .group-meta { color: var(--content-neutral-1); font-size: 0.8rem; }
        .group-meta.clickable { cursor: pointer; }
        .group-meta.clickable:hover { color: var(--content-neutral-3); }
        .commentary {
          max-width: 280px;
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
          gap: var(--space-l);
          color: var(--content-neutral-1);
          border-radius: var(--radius-m);
          background: var(--surface-neutral-3);
        }
      `}} />
    </div>
  );
}
