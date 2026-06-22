import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { absenceApi } from './api/absence';
import { AuthCard } from './components/AuthCard';
import { FilterBar } from './components/FilterBar';
import { EventTable } from './components/EventTable';
import { BatchToolbox } from './components/BatchToolbox';
import { StatsDashboard } from './components/StatsDashboard';
import { LogOut, Database, Sun, Moon, MoonStar, CalendarDays, List } from 'lucide-react';
import { useTheme, THEMES } from './context/ThemeContext';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  const getIcon = () => {
    if (theme === 'LIGHT') return <Sun size={18} />;
    if (theme === 'DARK') return <Moon size={18} />;
    return <MoonStar size={18} />;
  };

  return (
    <button
      className="secondary theme-toggle-btn"
      onClick={cycleTheme}
      title={`Theme: ${theme} (click to cycle)`}
    >
      {getIcon()}
    </button>
  );
}

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="discrete-view-toggle">
      <button
        className={`view-btn ${viewMode === 'daily' ? 'active' : ''}`}
        onClick={() => setViewMode('daily')}
        title="Daily Summary"
      >
        <CalendarDays size={18} />
      </button>
      <button
        className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
        onClick={() => setViewMode('detailed')}
        title="Detailed List"
      >
        <List size={18} />
      </button>
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('absence_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [labels, setLabels] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(null);

  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'detailed'

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const processedEvents = useMemo(() => {
    // 1. Calculate duration for all events
    const enhanced = events.map(e => ({
      ...e,
      calcDuration: e.end ? (new Date(e.end) - new Date(e.start)) / 1000 : 0
    }));

    if (viewMode === 'detailed') return enhanced;

    // 2. Group by date for Daily view
    const groups = enhanced.reduce((acc, event) => {
      const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = {
          _id: dateKey,
          isGroup: true,
          start: event.start,
          duration: 0,
          breakDuration: 0,
          labelIds: new Set(),
          commentary: 'Daily Summary',
          ids: [],
          items: []
        };
      }

      // Only sum 'work' types into the duration for the grant tracking
      if (event.type === 'work') {
        acc[dateKey].duration += event.calcDuration;
        acc[dateKey].ids.push(event._id);
        if (event.labelIds) event.labelIds.forEach(id => acc[dateKey].labelIds.add(id));
      } else {
        acc[dateKey].breakDuration += event.calcDuration;
      }

      acc[dateKey].items.push(event);
      return acc;
    }, {});

    return Object.values(groups).map(g => ({
      ...g,
      labelIds: Array.from(g.labelIds)
    })).sort((a, b) => new Date(b.start) - new Date(a.start));
  }, [events, viewMode]);

  const stats = useMemo(() => {
    const workEvents = events.filter(e => e.type === 'work');
    const totalDuration = workEvents.reduce((sum, e) => {
      const dur = e.end ? (new Date(e.end) - new Date(e.start)) / 1000 : 0;
      return sum + dur;
    }, 0);

    const labelMap = {};
    workEvents.forEach(e => {
      const dur = e.end ? (new Date(e.end) - new Date(e.start)) / 1000 : 0;
      if (e.labelIds && e.labelIds.length > 0) {
        e.labelIds.forEach(id => {
          labelMap[id] = (labelMap[id] || 0) + dur;
        });
      } else {
        labelMap['unlabeled'] = (labelMap['unlabeled'] || 0) + dur;
      }
    });

    const labelBreakdown = Object.entries(labelMap).map(([id, duration]) => ({
      id,
      duration,
      percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0
    })).sort((a, b) => b.duration - a.duration);

    const uniqueDays = new Set(events.map(e => format(new Date(e.start), 'yyyy-MM-dd'))).size;
    const dailyAverage = uniqueDays > 0 ? totalDuration / uniqueDays : 0;

    return {
      totalDuration,
      labelBreakdown,
      dailyAverage,
      uniqueDays
    };
  }, [events]);

  const selectedTotalDuration = useMemo(() => {
    return processedEvents
      .filter(e => selectedIds.includes(e._id))
      .reduce((sum, e) => sum + (e.duration || e.calcDuration || 0), 0);
  }, [processedEvents, selectedIds]);

  const fetchData = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const [timespansRes, labelsRes] = await Promise.all([
        absenceApi.queryTimespans(auth, {
          startDate: startOfDay(new Date(dateRange.start)).toISOString(),
          endDate: endOfDay(new Date(dateRange.end)).toISOString()
        }),
        absenceApi.listLabels(auth)
      ]);
      setEvents(timespansRes.data || []);
      setLabels(labelsRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [auth, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const authData = await absenceApi.login(credentials);
      setAuth(authData);
      localStorage.setItem('absence_auth', JSON.stringify(authData));
    } catch (err) {
      alert('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('absence_auth');
    setEvents([]);
  };

  const handleBatchApply = async (labelId) => {
    if (labelId === null) {
      setBulkResults(null);
      setSelectedIds([]);
      return;
    }

    // Flatten selected IDs if they are groups, and strictly filter for 'work' type
    const targetIds = processedEvents
      .filter(e => selectedIds.includes(e._id))
      .flatMap(e => e.isGroup ? e.ids : (e.type === 'work' ? [e._id] : []));

    if (targetIds.length === 0) return;

    setBulkProgress({ current: 0, total: targetIds.length });
    setProcessing(true);
    try {
      const results = await absenceApi.batchUpdateLabels(auth, targetIds, [labelId], (current, total) => {
          setBulkProgress({ current, total });
      });
      setBulkResults(results);
      setBulkProgress(null);
      await fetchData(); // Refresh table
    } catch (err) {
      alert('Batch update failed: ' + err.message);
    } finally {
      setProcessing(false);
      setBulkProgress(null);
    }
  };

  const handleBatchClear = async () => {
    // Flatten selected IDs if they are groups, and strictly filter for 'work' type
    const targetIds = processedEvents
      .filter(e => selectedIds.includes(e._id))
      .flatMap(e => e.isGroup ? e.ids : (e.type === 'work' ? [e._id] : []));

    if (targetIds.length === 0) return;

    if (!confirm(`Are you sure you want to clear labels from ${targetIds.length} items?`)) return;

    setBulkProgress({ current: 0, total: targetIds.length });
    setProcessing(true);
    try {
      const results = await absenceApi.batchUpdateLabels(auth, targetIds, [], (current, total) => {
          setBulkProgress({ current, total });
      });
      setBulkResults(results);
      setBulkProgress(null);
      await fetchData(); // Refresh table
    } catch (err) {
      alert('Batch clear failed: ' + err.message);
    } finally {
      setProcessing(false);
      setBulkProgress(null);
    }
  };

  if (!auth) {
    return <AuthCard onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard">
      <header className="sea-header">
        <div className="header-left">
          <div className="sea-brand">
            <span className="sea-mark">S E A . A I</span>
            <span className="sea-divider" />
            <span className="sea-product">Absence <strong>Ops</strong></span>
          </div>
        </div>
        <div className="header-right">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <ThemeToggle />
          <span className="pill pill--ok">
            <span className="pill-dot" />
            Connected
          </span>
          <button className="secondary logout-btn" onClick={handleLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      <main>
        <div className="main-controls">
          <FilterBar
            startDate={dateRange.start}
            endDate={dateRange.end}
            onDateChange={(start, end) => setDateRange({ start, end })}
            onRefresh={fetchData}
            loading={loading}
          />
        </div>

        <StatsDashboard stats={stats} labels={labels} />

        <EventTable
          events={processedEvents}
          selectedIds={selectedIds}
          onToggleSelect={setSelectedIds}
          labels={labels}
          viewMode={viewMode}
        />
      </main>

      <BatchToolbox
        selectedCount={selectedIds.length}
        selectedTotalDuration={selectedTotalDuration}
        labels={labels}
        onApply={handleBatchApply}
        onClear={handleBatchClear}
        processing={processing}
        results={bulkResults}
        bulkProgress={bulkProgress}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        .dashboard {
          max-width: 1600px;
          margin: 0 auto;
          padding: var(--space-l);
          display: flex;
          flex-direction: column;
          gap: var(--space-s);
          height: 100vh;
        }

        /* ── Header (flat panel) ── */
        .sea-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--space-l);
          height: 56px;
          background: var(--surface-neutral-3);
          border-radius: var(--radius-m);
        }
        .sea-brand { display: flex; align-items: center; gap: var(--space-m); }
        .sea-mark {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.24em;
          color: var(--content-neutral-3);
          text-transform: uppercase;
        }
        .sea-divider {
          width: 1px;
          height: 18px;
          background: var(--surface-neutral-5);
        }
        .sea-product {
          font-size: 1rem;
          font-weight: 400;
          color: var(--content-neutral-1);
          letter-spacing: 0.01em;
        }
        .sea-product strong { color: var(--content-neutral-3); font-weight: 600; }

        .header-right { display: flex; align-items: center; gap: var(--space-s); }
        .logout-btn { font-size: 0.85rem; }

        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-s);
          overflow: hidden;
        }
        .main-controls { flex-shrink: 0; }

        /* ── Theme toggle ── */
        .theme-toggle-btn {
          width: 40px;
          padding: 0 !important;
          color: var(--content-neutral-2) !important;
        }

        /* ── View toggle (segmented, blue = active) ── */
        .discrete-view-toggle {
          display: flex;
          background: var(--surface-neutral-4);
          padding: 3px;
          border-radius: var(--radius-m);
          gap: 3px;
        }
        .view-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-s);
          background: transparent;
          color: var(--content-neutral-1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .view-btn:hover:not(.active) {
          background: var(--surface-neutral-5);
          color: var(--content-neutral-2);
        }
        .view-btn.active {
          background: var(--surface-primary-3);
          color: #FFFFFF;
        }
      `}} />
    </div>
  );
}

export default App;
