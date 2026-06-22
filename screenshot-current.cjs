const { chromium } = require('playwright');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();

  // ── 1. Auth screen (dark mode via localStorage)
  await page.goto('http://localhost:5173');
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.className = 'dark-theme';
  });
  await page.goto('http://localhost:5173');
  await sleep(800);
  await page.screenshot({ path: 'screenshots/01-auth-dark.png', fullPage: false });

  // ── 2. Auth screen light
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.className = 'light-theme';
  });
  await page.reload();
  await sleep(800);
  await page.screenshot({ path: 'screenshots/02-auth-light.png', fullPage: false });

  // ── 3. Inject mock data to bypass login and show dashboard
  await page.evaluate(() => {
    const mockAuth = { token: 'mock-token', clientId: 'demo', userId: 'u1' };
    localStorage.setItem('absence_auth', JSON.stringify(mockAuth));
    localStorage.setItem('theme', 'dark');
    document.documentElement.className = 'dark-theme';
  });

  // Intercept API calls to return mock data
  await page.route('**/api/**', async route => {
    const url = route.request().url();
    if (url.includes('login') || url.includes('timespans') || url.includes('labels')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    } else {
      await route.continue();
    }
  });
  await page.route('**/*', async route => {
    const url = route.request().url();
    const method = route.request().method();
    if (method === 'POST' || (method === 'GET' && url.includes('absence.io'))) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    } else {
      await route.continue();
    }
  });

  await page.goto('http://localhost:5173');
  await sleep(1000);

  // Inject mock state into localStorage and trigger a custom event so we can see the dashboard
  await page.evaluate(() => {
    // Force the app to think it's authenticated by manipulating localStorage
    const mockAuth = { token: 'fake', clientId: 'demo' };
    localStorage.setItem('absence_auth', JSON.stringify(mockAuth));
  });
  await page.reload();
  await sleep(1500);
  await page.screenshot({ path: 'screenshots/03-dashboard-empty-dark.png', fullPage: false });

  // ── 4. Light mode dashboard
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.className = 'light-theme';
  });
  await page.reload();
  await sleep(1500);
  await page.screenshot({ path: 'screenshots/04-dashboard-empty-light.png', fullPage: false });

  await browser.close();
  console.log('Screenshots done');
})();
