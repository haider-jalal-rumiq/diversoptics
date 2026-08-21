import { createRequire } from 'node:module';
const require = createRequire('/home/clawd/.openclaw/skills/playwright-browser-automation/qa_capture.js');
const { chromium } = require('playwright');

const BASE = 'https://velmont.apps.mdxpreview.xyz';
const OUT = '/home/clawd/.openclaw/workspace-rex/tmp/velmont-pub/shots';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60_000 });

// full slow pass: trigger every lazy image + reveal
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
});
// wait until every img is fully decoded
await page.evaluate(async () => {
  await Promise.all([...document.images].map(img =>
    img.complete && img.naturalWidth > 0 ? null : img.decode().catch(() => null)
  ));
});
await page.waitForTimeout(1000);

// atelier: back to its top, let reveal replay, shoot
const atelierTop = await page.evaluate(() => {
  const el = document.getElementById('atelier');
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
});
await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), atelierTop);
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/03-atelier.png` });

// footer: absolute bottom, long settle for column reveals
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/06-footer.png` });

await ctx.close();
await browser.close();
console.log('done');
