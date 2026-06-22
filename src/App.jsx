import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { absenceApi } from './api/absence';
import { AuthCard } from './components/AuthCard';
import { FilterBar } from './components/FilterBar';
import { EventTable } from './components/EventTable';
import { BatchToolbox } from './components/BatchToolbox';
import { StatsDashboard } from './components/StatsDashboard';
import { LogOut, LayoutDashboard, Database, Sun, Moon, Laptop, CalendarDays, List } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getIcon = () => {
    if (theme === 'light') return <Sun size={18} />;
    if (theme === 'dark') return <Moon size={18} />;
    return <Laptop size={18} />;
  };

  return (
    <button
      className="secondary theme-toggle-btn"
      onClick={cycleTheme}
      title={`Theme: ${theme}`}
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
          <div className="api-status">
            <Database size={14} />
            Connected
          </div>
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
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100vh;
        }

        /* ── SEA.AI Header ── */
        .sea-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px var(--spacing-md);
          background: #0B1731;
          border-radius: var(--radius-md);
          border: none;
        }
        .sea-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sea-mark {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          color: #CB0D00;
          text-transform: uppercase;
        }
        .sea-divider {
          width: 1px;
          height: 18px;
          background: rgba(123, 145, 148, 0.3);
        }
        .sea-product {
          font-size: 1rem;
          font-weight: 400;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.02em;
        }
        .sea-product strong {
          color: #FFFFFF;
          font-weight: 700;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .api-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #7B9194;
          background: rgba(6, 64, 76, 0.35);
          padding: 5px 12px;
          border-radius: 20px;
          border: 1px solid rgba(123, 145, 148, 0.2);
        }
        .logout-btn {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.7) !important;
          font-size: 0.82rem;
        }
        .logout-btn:hover:not(:disabled) {
          background: rgba(203, 13, 0, 0.15) !important;
          border-color: rgba(203, 13, 0, 0.3) !important;
          color: #CB0D00 !important;
        }

        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
        }
        .main-controls {
          flex-shrink: 0;
        }
        .theme-toggle-btn {
          padding: 7px !important;
          border-radius: 8px !important;
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.6) !important;
        }
        .theme-toggle-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.12) !important;
          color: rgba(255,255,255,0.9) !important;
        }
        .discrete-view-toggle {
          display: flex;
          background: rgba(255,255,255,0.06);
          padding: 3px;
          border-radius: 8px;
          gap: 2px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .view-btn {
          padding: 5px 7px;
          border-radius: 5px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .view-btn:hover:not(.active) {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
        }
        .view-btn.active {
          background: #CB0D00;
          color: #FFFFFF;
        }
      `}} />
    </div>
  );
}

export default App;
