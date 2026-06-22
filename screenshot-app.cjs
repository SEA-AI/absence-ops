const { chromium } = require('playwright');

const MOCK_LABELS = [
  { _id: 'l1', name: 'Engineering' }, { _id: 'l2', name: 'Meetings' },
  { _id: 'l3', name: 'Research' }, { _id: 'l4', name: 'Management' },
  { _id: 'l5', name: 'Design' }, { _id: 'l6', name: 'Customer Support' },
  { _id: 'l7', name: 'QA Testing' },
];
const W = (id, d, s, e, l, c) => ({ _id: id, type: 'work',
  start: `2026-${d}T${String(s).padStart(2,'0')}:00:00.000Z`,
  end: `2026-${d}T${String(e).padStart(2,'0')}:00:00.000Z`, labelIds: l||[], commentary: c||'' });
const B = (id, d, s, e) => ({ _id: id, type: 'break',
  start: `2026-${d}T${String(s).padStart(2,'0')}:00:00.000Z`,
  end: `2026-${d}T${String(e).padStart(2,'0')}:00:00.000Z`, labelIds: [], commentary: '' });

const EVENTS = [
  W('e1','06-01',8,12,['l1'],'Fix auth bug in API gateway'), B('b1','06-01',12,13),
  W('e2','06-01',13,17,['l1','l3'],'Implement bulk label operations'),
  W('e3','06-02',9,11,['l2'],'Sprint planning meeting'),
  W('e4','06-02',11,13,['l1'],'Code review + PR feedback'), B('b2','06-02',13,14),
  W('e5','06-02',14,18,['l1','l4'],'Architecture discussion'),
  W('e6','06-03',8,12,['l3'],'Research: ML model evaluation'), B('b3','06-03',12,13),
  W('e7','06-03',13,17,['l1'],'Data pipeline changes'),
  W('e8','06-04',9,12,['l2','l4'],'1:1s + team standup'),
  W('e9','06-04',13,17,['l1','l5'],'Frontend redesign'),
  W('e10','06-05',8,12,['l1'],'Hotfix deployment'), B('b4','06-05',12,13),
  W('e11','06-05',13,16,['l6'],'Customer onboarding calls'),
];
const MANY = [
  W('m1','06-10',8,17,['l1','l2','l3','l4','l5','l6','l7'],'Full-stack work session'),
  W('m2','06-11',9,12,['l1','l2','l3','l4'],'Multi-department collab'),
  W('m3','06-11',13,17,['l5','l6','l7'],'Design and QA marathon'),
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run(browser, { theme='DARK', events=EVENTS, viewport={width:1400,height:900}, auth=true, fn }) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.addInitScript(({ theme, auth }) => {
    localStorage.setItem('theme', theme);
    if (auth) localStorage.setItem('absence_auth', JSON.stringify({ token: 'mock' }));
  }, { theme, auth });
  await page.route('**/*', async route => {
    const url = route.request().url();
    if (url.includes('absence.io')) {
      const isLabels = url.includes('label');
      await route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: isLabels ? MOCK_LABELS : events }) });
    } else { await route.continue(); }
  });
  await page.goto('http://localhost:5173');
  await sleep(2000);
  if (fn) await fn(page);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });

  await run(browser, { auth:false, theme:'DARK', fn: async p => {
    await p.screenshot({ path:'screenshots/app-01-auth-dark.png' }); console.log('✓ auth-dark'); }});

  await run(browser, { theme:'DARK', fn: async p => {
    await p.screenshot({ path:'screenshots/app-02-dashboard-dark.png' }); console.log('✓ dash-dark'); }});

  await run(browser, { theme:'LIGHT', fn: async p => {
    await p.screenshot({ path:'screenshots/app-03-dashboard-light.png' }); console.log('✓ dash-light'); }});

  await run(browser, { theme:'NIGHT', fn: async p => {
    await p.screenshot({ path:'screenshots/app-04-dashboard-night.png' }); console.log('✓ dash-night'); }});

  await run(browser, { theme:'DARK', events:MANY, fn: async p => {
    await p.screenshot({ path:'screenshots/app-05-many-labels.png' }); console.log('✓ many-labels'); }});

  await run(browser, { theme:'DARK', fn: async p => {
    const cb = p.locator('tbody input[type="checkbox"]');
    await cb.nth(0).click(); await sleep(150);
    await cb.nth(1).click(); await sleep(150);
    await cb.nth(2).click(); await sleep(300);
    await p.screenshot({ path:'screenshots/app-06-batch-toolbox.png' }); console.log('✓ batch'); }});

  await run(browser, { theme:'DARK', fn: async p => {
    await p.locator('tbody button').first().click(); await sleep(300);
    await p.screenshot({ path:'screenshots/app-07-expanded.png' }); console.log('✓ expanded'); }});

  await run(browser, { theme:'DARK', viewport:{width:390,height:844}, fn: async p => {
    await p.screenshot({ path:'screenshots/app-08-mobile.png', fullPage:true }); console.log('✓ mobile'); }});

  await browser.close();
  console.log('\nDone.');
})();
