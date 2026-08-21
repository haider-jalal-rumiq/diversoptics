import { createRequire } from 'node:module';
const require = createRequire('/home/clawd/.openclaw/skills/playwright-browser-automation/qa_capture.js');
const { chromium } = require('playwright');

const BASE = 'https://velmont.apps.mdxpreview.xyz';
const OUT = '/home/clawd/.openclaw/workspace-rex/tmp/velmont-pub/shots';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
page.on('console', () => {});

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });
// hero intro settle
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/01-hero.png` });

// discover scroll targets: full page height + section anchors
const sections = await page.evaluate(() => {
  const ids = ['collections', 'atelier', 'crafted', 'campaign'];
  const out = [];
  for (const id of ids) {
    const el = document.getElementById(id) || document.querySelector(`[data-section="${id}"]`);
    if (el) out.push({ id, top: el.getBoundingClientRect().top + window.scrollY });
  }
  out.push({ id: 'footer', top: document.body.scrollHeight });
  return { sections: out, height: document.body.scrollHeight, vh: window.innerHeight };
});
console.log(JSON.stringify(sections));

let idx = 2;
for (const s of sections.sections) {
  const target = s.id === 'footer' ? s.top : Math.max(0, s.top);
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target);
  await page.waitForTimeout(1500); // let on-scroll reveals play
  await page.screenshot({ path: `${OUT}/${String(idx).padStart(2, '0')}-${s.id}.png` });
  idx++;
}

await ctx.close();
await browser.close();
console.log('done');
