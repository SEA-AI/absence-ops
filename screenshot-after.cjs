const { chromium } = require('playwright');

const MOCK_LABELS = [
  { _id: 'l1', name: 'Engineering' },
  { _id: 'l2', name: 'Meetings' },
  { _id: 'l3', name: 'Research' },
  { _id: 'l4', name: 'Management' },
  { _id: 'l5', name: 'Design' },
  { _id: 'l6', name: 'Customer Support' },
  { _id: 'l7', name: 'QA Testing' },
];

function makeWork(id, dateStr, startH, endH, labelIds, comment) {
  const base = `2026-${dateStr}`;
  return { _id: id, type: 'work',
    start: `${base}T${String(startH).padStart(2,'0')}:00:00.000Z`,
    end:   `${base}T${String(endH).padStart(2,'0')}:00:00.000Z`,
    labelIds: labelIds || [], commentary: comment || '' };
}
function makeBreak(id, dateStr, startH, endH) {
  const base = `2026-${dateStr}`;
  return { _id: id, type: 'break',
    start: `${base}T${String(startH).padStart(2,'0')}:00:00.000Z`,
    end:   `${base}T${String(endH).padStart(2,'0')}:00:00.000Z`,
    labelIds: [], commentary: '' };
}

const EVENTS_NORMAL = [
  makeWork('e1', '06-01', 8, 12, ['l1'], 'Fix auth bug in API gateway'),
  makeBreak('b1', '06-01', 12, 13),
  makeWork('e2', '06-01', 13, 17, ['l1','l3'], 'Implement bulk label operations'),
  makeWork('e3', '06-02', 9, 11, ['l2'], 'Sprint planning meeting'),
  makeWork('e4', '06-02', 11, 13, ['l1'], 'Code review + PR feedback'),
  makeBreak('b2', '06-02', 13, 14),
  makeWork('e5', '06-02', 14, 18, ['l1','l4'], 'Architecture discussion'),
  makeWork('e6', '06-03', 8, 12, ['l3'], 'Research: ML model evaluation'),
  makeBreak('b3', '06-03', 12, 13),
  makeWork('e7', '06-03', 13, 17, ['l1'], 'Data pipeline changes'),
  makeWork('e8', '06-04', 9, 12, ['l2','l4'], '1:1s + team standup'),
  makeWork('e9', '06-04', 13, 17, ['l1','l5'], 'Frontend redesign'),
  makeWork('e10', '06-05', 8, 12, ['l1'], 'Hotfix deployment'),
  makeBreak('b4', '06-05', 12, 13),
  makeWork('e11', '06-05', 13, 16, ['l6'], 'Customer onboarding calls'),
];

const EVENTS_MANY_LABELS = [
  makeWork('m1', '06-10', 8, 17, ['l1','l2','l3','l4','l5','l6','l7'], 'Full-stack work session'),
  makeWork('m2', '06-11', 9, 12, ['l1','l2','l3','l4'], 'Multi-department collab'),
  makeWork('m3', '06-11', 13, 17, ['l5','l6','l7'], 'Design and QA marathon'),
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function withMockData(browser, events, labels, fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(({ events, labels }) => {
    localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
    localStorage.setItem('theme', 'dark');
  }, { events, labels });
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.includes('absence.io')) {
      const isLabels = url.includes('label');
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: isLabels ? labels : events }) });
    } else { await route.continue(); }
  });
  await page.goto('http://localhost:5173');
  await sleep(2000);
  await fn(page);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  // ── Auth screen (dark)
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => { localStorage.setItem('theme', 'dark'); });
    await page.goto('http://localhost:5173');
    await sleep(1500);
    await page.screenshot({ path: 'screenshots/after-01-auth-dark.png' });
    await ctx.close();
    console.log('✓ after-01-auth-dark');
  }

  // ── Auth screen (light)
  {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => { localStorage.setItem('theme', 'light'); });
    await page.goto('http://localhost:5173');
    await sleep(1500);
    await page.screenshot({ path: 'screenshots/after-02-auth-light.png' });
    await ctx.close();
    console.log('✓ after-02-auth-light');
  }

  // ── Dashboard dark (daily view, populated)
  await withMockData(browser, EVENTS_NORMAL, MOCK_LABELS, async (page) => {
    await page.screenshot({ path: 'screenshots/after-03-dashboard-dark.png' });
    console.log('✓ after-03-dashboard-dark');
  });

  // ── Dashboard light
  await withMockData(browser, EVENTS_NORMAL, MOCK_LABELS, async (page) => {
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
      document.documentElement.className = 'light-theme';
    });
    await sleep(400);
    await page.screenshot({ path: 'screenshots/after-04-dashboard-light.png' });
    console.log('✓ after-04-dashboard-light');
  });

  // ── Many labels (overflow)
  await withMockData(browser, EVENTS_MANY_LABELS, MOCK_LABELS, async (page) => {
    await page.screenshot({ path: 'screenshots/after-05-many-labels.png' });
    console.log('✓ after-05-many-labels');
  });

  // ── Batch toolbox selected + progress bar
  await withMockData(browser, EVENTS_NORMAL, MOCK_LABELS, async (page) => {
    const checkboxes = page.locator('td.checkbox-cell input[type="checkbox"]');
    await checkboxes.nth(0).click(); await sleep(200);
    await checkboxes.nth(1).click(); await sleep(200);
    await checkboxes.nth(2).click(); await sleep(300);
    await page.screenshot({ path: 'screenshots/after-06-batch-toolbox.png' });
    console.log('✓ after-06-batch-toolbox');
  });

  // ── Detailed view
  await withMockData(browser, EVENTS_NORMAL, MOCK_LABELS, async (page) => {
    await page.locator('.view-btn').nth(1).click();
    await sleep(400);
    await page.screenshot({ path: 'screenshots/after-07-detailed-view.png' });
    console.log('✓ after-07-detailed-view');
  });

  // ── Expanded row (daily view)
  await withMockData(browser, EVENTS_NORMAL, MOCK_LABELS, async (page) => {
    const expandBtn = page.locator('.expand-toggle').first();
    await expandBtn.click();
    await sleep(300);
    await page.screenshot({ path: 'screenshots/after-08-expanded-row.png' });
    console.log('✓ after-08-expanded-row');
  });

  // ── Mobile viewport
  await withMockData(browser, EVENTS_NORMAL, MOCK_LABELS, async (page) => {
    await page.screenshot({ path: 'screenshots/after-09-mobile.png', fullPage: true });
    console.log('✓ after-09-mobile');
  }, { viewport: { width: 390, height: 844 } });

  // ── Empty state
  await withMockData(browser, [], MOCK_LABELS, async (page) => {
    await page.screenshot({ path: 'screenshots/after-10-empty-state.png' });
    console.log('✓ after-10-empty-state');
  });

  await browser.close();
  console.log('\nAll after-screenshots captured!');
})();
