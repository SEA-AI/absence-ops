import React from 'react';
import { createPortal } from 'react-dom';
import { ListFilter, Search, X, Check } from 'lucide-react';
import styles from './LabelFilter.module.css';

const PANEL_WIDTH = 260;

export function LabelFilter({ options, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [coords, setCoords] = React.useState(null);
  const anchorRef = React.useRef(null);
  const panelRef = React.useRef(null);

  const active = value.length > 0;

  const place = React.useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.right - PANEL_WIDTH, window.innerWidth - PANEL_WIDTH - 8));
    setCoords({ top: r.bottom + 6, left });
  }, []);

  React.useEffect(() => {
    if (!open) return;
    place();
    const close = (e) => {
      if (panelRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id]);
  };

  const visible = options.filter(o => o.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <span className={styles.wrap}>
      <button
        ref={anchorRef}
        type="button"
        className={`${styles.trigger} ${active ? styles.active : ''}`}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title={active ? `Filtering by ${value.length} label${value.length > 1 ? 's' : ''}` : 'Filter by label'}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ListFilter size={13} />
        {active && <span className={styles.badge}>{value.length}</span>}
      </button>

      {open && coords && createPortal(
        <div
          ref={panelRef}
          className={styles.panel}
          style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.searchRow}>
            <Search size={13} className={styles.searchIcon} />
            <input
              className={styles.search}
              type="text"
              placeholder="Search labels…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.list} role="listbox" aria-multiselectable="true">
            {visible.length === 0 && <div className={styles.empty}>No matching labels</div>}
            {visible.map(o => {
              const checked = value.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  className={`${styles.option} ${checked ? styles.checked : ''}`}
                  onClick={() => toggle(o.id)}
                >
                  <span className={styles.box}>{checked && <Check size={11} strokeWidth={3} />}</span>
                  <span className={styles.name} title={o.name}>{o.name}</span>
                  <span className={styles.count}>{o.count}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.footer}>
            <span className={styles.summary}>
              {active ? `${value.length} selected` : 'Showing all labels'}
            </span>
            <button
              type="button"
              className={styles.clear}
              onClick={() => onChange([])}
              disabled={!active}
            >
              <X size={12} />
              Clear
            </button>
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}
