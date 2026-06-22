const { chromium } = require('playwright');
const fs = require('fs');

const MOCK_LABELS = [
  { _id: 'l1', name: 'Engineering', color: '#CB0D00' },
  { _id: 'l2', name: 'Meetings', color: '#0B1731' },
  { _id: 'l3', name: 'Research', color: '#06404C' },
  { _id: 'l4', name: 'Management', color: '#7B9194' },
  { _id: 'l5', name: 'Design', color: '#DFDED9' },
  { _id: 'l6', name: 'Customer Support', color: '#888' },
  { _id: 'l7', name: 'QA Testing', color: '#444' },
];

function makeWorkEvent(id, dateStr, startH, endH, labelIds, comment) {
  const base = `2026-${dateStr}`;
  return {
    _id: id, type: 'work',
    start: `${base}T${String(startH).padStart(2,'0')}:00:00.000Z`,
    end: `${base}T${String(endH).padStart(2,'0')}:00:00.000Z`,
    labelIds: labelIds || [],
    commentary: comment || ''
  };
}

function makeBreakEvent(id, dateStr, startH, endH) {
  const base = `2026-${dateStr}`;
  return {
    _id: id, type: 'break',
    start: `${base}T${String(startH).padStart(2,'0')}:00:00.000Z`,
    end: `${base}T${String(endH).padStart(2,'0')}:00:00.000Z`,
    labelIds: [], commentary: ''
  };
}

const MOCK_EVENTS_NORMAL = [
  makeWorkEvent('e1', '06-01', 8, 12, ['l1'], 'Fix authentication bug in API gateway'),
  makeBreakEvent('b1', '06-01', 12, 13),
  makeWorkEvent('e2', '06-01', 13, 17, ['l1', 'l3'], 'Implement new feature: bulk label operations'),
  makeWorkEvent('e3', '06-02', 9, 11, ['l2'], 'Sprint planning meeting'),
  makeWorkEvent('e4', '06-02', 11, 13, ['l1'], 'Code review + PR feedback'),
  makeBreakEvent('b2', '06-02', 13, 14),
  makeWorkEvent('e5', '06-02', 14, 18, ['l1', 'l4'], 'Architecture discussion and documentation'),
  makeWorkEvent('e6', '06-03', 8, 12, ['l3'], 'Research: new ML model evaluation'),
  makeBreakEvent('b3', '06-03', 12, 13),
  makeWorkEvent('e7', '06-03', 13, 17, ['l1'], 'Implement data pipeline changes'),
  makeWorkEvent('e8', '06-04', 9, 12, ['l2', 'l4'], '1:1 meetings + team standup'),
  makeWorkEvent('e9', '06-04', 13, 17, ['l1', 'l5'], 'Frontend redesign implementation'),
  makeWorkEvent('e10', '06-05', 8, 12, ['l1'], 'Hotfix deployment and monitoring'),
  makeBreakEvent('b4', '06-05', 12, 13),
  makeWorkEvent('e11', '06-05', 13, 16, ['l6'], 'Customer onboarding calls'),
];

// Scenario: MANY labels per row (overflow testing)
const MOCK_EVENTS_MANY_LABELS = [
  makeWorkEvent('m1', '06-10', 8, 17, ['l1','l2','l3','l4','l5','l6','l7'], 'Full-stack work session covering all areas'),
  makeWorkEvent('m2', '06-11', 9, 12, ['l1','l2','l3','l4'], 'Multiple department collaboration'),
  makeWorkEvent('m3', '06-11', 13, 17, ['l5','l6','l7'], 'Design and QA marathon'),
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function setupMockApp(page, events, labels, theme = 'dark') {
  await page.goto('http://localhost:5173');

  await page.addInitScript(({ events, labels, theme }) => {
    const mockAuth = { token: 'mock-token', clientId: 'demo' };
    localStorage.setItem('absence_auth', JSON.stringify(mockAuth));
    localStorage.setItem('theme', theme);
    window.__MOCK_EVENTS__ = events;
    window.__MOCK_LABELS__ = labels;
  }, { events, labels, theme });

  // Intercept API calls
  await page.route('**/*', async route => {
    const url = route.request().url();
    const method = route.request().method();
    if (url.includes('absence.io') || (method !== 'GET' && !url.includes('localhost'))) {
      const isLabels = url.includes('label');
      const data = isLabels ? (route.request().context()._browser ? labels : labels) : events;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: isLabels ? labels : events })
      });
    } else {
      await route.continue();
    }
  });

  await page.goto('http://localhost:5173');
  await sleep(2000);
}

(async () => {
  fs.mkdirSync('screenshots', { recursive: true });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ── Scenario 1: Normal dashboard (dark mode, populated)
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ events, labels }) => {
      localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
      window.__MOCK_EVENTS__ = events;
      window.__MOCK_LABELS__ = labels;
    }, { events: MOCK_EVENTS_NORMAL, labels: MOCK_LABELS });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('absence.io')) {
        const isLabels = url.includes('label');
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: isLabels ? MOCK_LABELS : MOCK_EVENTS_NORMAL }) });
      } else { await route.continue(); }
    });
    await page.goto('http://localhost:5173');
    await sleep(2000);
    await page.screenshot({ path: 'screenshots/05-dashboard-populated-dark.png' });
    await ctx.close();
    console.log('✓ 05-dashboard-populated-dark');
  }

  // ── Scenario 2: Light mode, populated
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(({ events, labels }) => {
      localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
      localStorage.setItem('theme', 'light');
    }, { events: MOCK_EVENTS_NORMAL, labels: MOCK_LABELS });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('absence.io')) {
        const isLabels = url.includes('label');
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: isLabels ? MOCK_LABELS : MOCK_EVENTS_NORMAL }) });
      } else { await route.continue(); }
    });
    await page.goto('http://localhost:5173');
    await sleep(2000);
    await page.screenshot({ path: 'screenshots/06-dashboard-populated-light.png' });
    await ctx.close();
    console.log('✓ 06-dashboard-populated-light');
  }

  // ── Scenario 3: Many labels per row (overflow testing)
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
    });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('absence.io')) {
        const isLabels = url.includes('label');
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: isLabels ? MOCK_LABELS : MOCK_EVENTS_MANY_LABELS }) });
      } else { await route.continue(); }
    });
    await page.goto('http://localhost:5173');
    await sleep(2000);
    await page.screenshot({ path: 'screenshots/07-many-labels-overflow.png' });
    await ctx.close();
    console.log('✓ 07-many-labels-overflow');
  }

  // ── Scenario 4: Batch toolbox visible (select items)
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
    });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('absence.io')) {
        const isLabels = url.includes('label');
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: isLabels ? MOCK_LABELS : MOCK_EVENTS_NORMAL }) });
      } else { await route.continue(); }
    });
    await page.goto('http://localhost:5173');
    await sleep(2000);
    // Click first 3 checkboxes
    const checkboxes = page.locator('td.checkbox-cell input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await sleep(300);
    await checkboxes.nth(1).click();
    await sleep(300);
    await checkboxes.nth(2).click();
    await sleep(500);
    await page.screenshot({ path: 'screenshots/08-batch-toolbox-visible.png' });
    await ctx.close();
    console.log('✓ 08-batch-toolbox-visible');
  }

  // ── Scenario 5: Detailed view mode
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
    });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('absence.io')) {
        const isLabels = url.includes('label');
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: isLabels ? MOCK_LABELS : MOCK_EVENTS_NORMAL }) });
      } else { await route.continue(); }
    });
    await page.goto('http://localhost:5173');
    await sleep(2000);
    // Switch to detailed view
    const detailBtn = page.locator('.view-btn').nth(1);
    await detailBtn.click();
    await sleep(500);
    await page.screenshot({ path: 'screenshots/09-detailed-view.png' });
    await ctx.close();
    console.log('✓ 09-detailed-view');
  }

  // ── Scenario 6: Mobile viewport
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
    });
    await page.route('**/*', async route => {
      const url = route.request().url();
      if (url.includes('absence.io')) {
        const isLabels = url.includes('label');
        await route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: isLabels ? MOCK_LABELS : MOCK_EVENTS_NORMAL }) });
      } else { await route.continue(); }
    });
    await page.goto('http://localhost:5173');
    await sleep(2000);
    await page.screenshot({ path: 'screenshots/10-mobile-view.png', fullPage: true });
    await ctx.close();
    console.log('✓ 10-mobile-view');
  }

  await browser.close();
  console.log('\nAll screenshots captured!');
})();
