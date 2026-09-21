import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { absenceApi } from './api/absence';
import { AuthCard } from './components/AuthCard';
import { FilterBar } from './components/FilterBar';
import { EventTable } from './components/EventTable';
import { BatchToolbox } from './components/BatchToolbox';
import { StatsDashboard } from './components/StatsDashboard';
import { LogOut, Sun, Moon, MoonStar, CalendarDays, List } from 'lucide-react';
import { useTheme, THEMES } from './context/ThemeContext';
import styles from './App.module.css';
import { UNLABELED } from './constants';
import logoWhite from './assets/logo-white.svg';
import logoBlack from './assets/logo-black.jpg';

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
      className={`secondary ${styles.themeToggleBtn}`}
      onClick={cycleTheme}
      title={`Theme: ${theme} (click to cycle)`}
    >
      {getIcon()}
    </button>
  );
}

function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className={styles.discreteViewToggle}>
      <button
        className={`${styles.viewBtn} ${viewMode === 'daily' ? styles.active : ''}`}
        onClick={() => setViewMode('daily')}
        title="Daily Summary"
      >
        <CalendarDays size={18} />
      </button>
      <button
        className={`${styles.viewBtn} ${viewMode === 'detailed' ? styles.active : ''}`}
        onClick={() => setViewMode('detailed')}
        title="Detailed List"
      >
        <List size={18} />
      </button>
    </div>
  );
}

function App() {
  const { theme } = useTheme();
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

  const [viewMode, setViewMode] = useState('daily');
  const [labelFilter, setLabelFilter] = useState([]);

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const filteredEvents = useMemo(() => {
    if (labelFilter.length === 0) return events;
    const wanted = new Set(labelFilter);
    return events.filter(e => {
      if (e.type !== 'work') return false;
      const ids = e.labelIds || [];
      if (ids.length === 0) return wanted.has(UNLABELED);
      return ids.some(id => wanted.has(id));
    });
  }, [events, labelFilter]);

  const labelOptions = useMemo(() => {
    const counts = {};
    events.filter(e => e.type === 'work').forEach(e => {
      const ids = e.labelIds && e.labelIds.length > 0 ? e.labelIds : [UNLABELED];
      ids.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    });
    labelFilter.forEach(id => { counts[id] = counts[id] || 0; });

    const nameOf = (id) => {
      if (id === UNLABELED) return 'Unlabeled';
      const label = labels.find(l => l._id === id);
      return label ? label.name : id;
    };

    return Object.entries(counts)
      .map(([id, count]) => ({ id, count, name: nameOf(id) }))
      .sort((a, b) => {
        if (a.id === UNLABELED) return 1;
        if (b.id === UNLABELED) return -1;
        return b.count - a.count || a.name.localeCompare(b.name);
      });
  }, [events, labels, labelFilter]);

  const handleLabelFilterChange = useCallback((next) => {
    setLabelFilter(next);
    setSelectedIds([]);
  }, []);

  const processedEvents = useMemo(() => {
    const enhanced = filteredEvents.map(e => ({
      ...e,
      calcDuration: e.end ? (new Date(e.end) - new Date(e.start)) / 1000 : 0
    }));

    if (viewMode === 'detailed') return enhanced;

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
  }, [filteredEvents, viewMode]);

  const stats = useMemo(() => {
    const workEvents = filteredEvents.filter(e => e.type === 'work');
    const totalDuration = workEvents.reduce((sum, e) => {
      const dur = e.end ? (new Date(e.end) - new Date(e.start)) / 1000 : 0;
      return sum + dur;
    }, 0);

    const labelMap = {};
    workEvents.forEach(e => {
      const dur = e.end ? (new Date(e.end) - new Date(e.start)) / 1000 : 0;
      if (e.labelIds && e.labelIds.length > 0) {
        e.labelIds.forEach(id => { labelMap[id] = (labelMap[id] || 0) + dur; });
      } else {
        labelMap[UNLABELED] = (labelMap[UNLABELED] || 0) + dur;
      }
    });

    const labelBreakdown = Object.entries(labelMap).map(([id, duration]) => ({
      id,
      duration,
      percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0
    })).sort((a, b) => b.duration - a.duration);

    const uniqueDays = new Set(filteredEvents.map(e => format(new Date(e.start), 'yyyy-MM-dd'))).size;
    const dailyAverage = uniqueDays > 0 ? totalDuration / uniqueDays : 0;

    return { totalDuration, labelBreakdown, dailyAverage, uniqueDays };
  }, [filteredEvents]);

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
      await fetchData();
    } catch (err) {
      alert('Batch update failed: ' + err.message);
    } finally {
      setProcessing(false);
      setBulkProgress(null);
    }
  };

  const handleBatchClear = async () => {
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
      await fetchData();
    } catch (err) {
      alert('Batch clear failed: ' + err.message);
    } finally {
      setProcessing(false);
      setBulkProgress(null);
    }
  };

  if (!auth) {
    return <AuthCard onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.seaHeader}>
        <div className={styles.seaBrand}>
          <img
            src={theme === 'LIGHT' ? logoBlack : logoWhite}
            alt="SEA.AI"
            className={styles.seaLogo}
          />
          <span className={styles.seaDivider} />
          <span className={styles.seaProduct}>Absence <strong>Ops</strong></span>
        </div>
        <div className={styles.headerRight}>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <ThemeToggle />
          <span className="pill pill--ok">
            <span className="pill-dot" />
            Connected
          </span>
          <button className={`secondary ${styles.logoutBtn}`} onClick={handleLogout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.mainControls}>
          <FilterBar
            startDate={dateRange.start}
            endDate={dateRange.end}
            onDateChange={(start, end) => setDateRange({ start, end })}
            onRefresh={fetchData}
            loading={loading}
          />
        </div>

        <StatsDashboard
          stats={stats}
          labels={labels}
          filteredLabelCount={labelFilter.length}
          onClearLabelFilter={() => handleLabelFilterChange([])}
        />

        <EventTable
          events={processedEvents}
          selectedIds={selectedIds}
          onToggleSelect={setSelectedIds}
          labels={labels}
          viewMode={viewMode}
          labelOptions={labelOptions}
          labelFilter={labelFilter}
          onLabelFilterChange={handleLabelFilterChange}
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
    </div>
  );
}

export default App;
