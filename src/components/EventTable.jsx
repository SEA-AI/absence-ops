import React from 'react';
import { format } from 'date-fns';
import { Clock, Tag as TagIcon, ChevronRight } from 'lucide-react';
import styles from './EventTable.module.css';

const MAX_VISIBLE_LABELS = 3;

export function EventTable({ events, selectedIds, onToggleSelect, labels, viewMode }) {
  const [expandedRows, setExpandedRows] = React.useState([]);

  const getLabelName = (id) => {
    const label = labels.find(l => l._id === id);
    return label ? label.name : id;
  };

  const renderLabels = (labelIds) => {
    if (!labelIds || labelIds.length === 0) {
      return <span className={styles.noLabels}>None</span>;
    }
    const visible = labelIds.slice(0, MAX_VISIBLE_LABELS);
    const overflow = labelIds.length - MAX_VISIBLE_LABELS;
    const overflowNames = labelIds.slice(MAX_VISIBLE_LABELS).map(getLabelName).join(', ');
    return (
      <>
        {visible.map(id => (
          <span key={id} className={styles.labelTag} title={getLabelName(id)}>
            <TagIcon size={9} />
            {getLabelName(id)}
          </span>
        ))}
        {overflow > 0 && (
          <span className={styles.labelOverflow} title={overflowNames}>+{overflow}</span>
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
      <div className={styles.emptyState}>
        <Clock size={40} strokeWidth={1.5} />
        <p>No time-tracked events for the selected period.</p>
      </div>
    );
  }

  const rowClass = (event) => [
    selectedIds.includes(event._id) ? styles.selected : '',
    event.type === 'break' ? styles.break : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th className={styles.checkboxCol}>
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
                className={rowClass(event)}
                onClick={(e) => handleSelect(e, event._id, index)}
              >
                <td className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(event._id)}
                    readOnly
                    onClick={(e) => handleSelect(e, event._id, index)}
                  />
                </td>
                <td>
                  <div className={styles.dateMain}>
                    {event.isGroup && (
                      <button
                        className={`${styles.expandToggle} ${expandedRows.includes(event._id) ? styles.open : ''}`}
                        onClick={(e) => toggleExpand(e, event._id)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                    <span className={styles.mainDate}>
                      {format(new Date(event.start), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {viewMode === 'detailed' && (
                    <span className={styles.timeSub}>
                      {format(new Date(event.start), 'HH:mm')} -{' '}
                      {event.end ? format(new Date(event.end), 'HH:mm') : 'Active'}
                    </span>
                  )}
                </td>
                <td className={styles.durationCell}>
                  <div className={`${styles.durationBox} ${event.type === 'break' ? styles.break : ''}`}>
                    {formatDuration(event.duration || event.calcDuration)}
                  </div>
                </td>
                {viewMode === 'daily' && (
                  <td className={styles.timelineCol}>
                    <div className={styles.miniTimeline}>
                      {event.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className={`${styles.timelineChunk} ${item.type === 'work' ? styles.work : styles.break}`}
                          style={{ flex: item.calcDuration }}
                          title={`${item.type}: ${formatDuration(item.calcDuration)}`}
                        />
                      ))}
                    </div>
                  </td>
                )}
                <td>
                  <div className={styles.labelsList}>
                    {renderLabels(event.labelIds)}
                  </div>
                </td>
                <td className={styles.notesCell}>
                  {event.isGroup ? (
                    <span
                      className={`${styles.groupMeta} ${styles.clickable}`}
                      onClick={(e) => toggleExpand(e, event._id)}
                    >
                      {event.ids.length} work periods
                    </span>
                  ) : (
                    <span className={styles.commentary}>{event.commentary || '-'}</span>
                  )}
                </td>
              </tr>
              {event.isGroup && expandedRows.includes(event._id) && event.items.map(item => (
                <tr
                  key={item._id}
                  className={`${styles.subRow} ${item.type === 'break' ? styles.break : ''}`}
                >
                  <td />
                  <td className={styles.subTime}>
                    {format(new Date(item.start), 'HH:mm')} -{' '}
                    {item.end ? format(new Date(item.end), 'HH:mm') : 'Active'}
                  </td>
                  <td>
                    <div className={`${styles.durationBox} ${item.type === 'break' ? styles.break : ''} ${styles.mini}`}>
                      {formatDuration(item.calcDuration)}
                    </div>
                  </td>
                  <td />
                  <td>
                    <div className={styles.labelsList}>
                      {item.labelIds?.map(id => (
                        <span key={id} className={`${styles.labelTag} ${styles.mini}`}>
                          {getLabelName(id)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={`${styles.notesCell} ${styles.mini}`}>
                    {item.commentary}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
