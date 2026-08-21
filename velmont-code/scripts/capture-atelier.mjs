import { createRequire } from 'node:module';
const require = createRequire('/home/clawd/.openclaw/skills/playwright-browser-automation/qa_capture.js');
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.goto('https://velmont.apps.mdxpreview.xyz', { waitUntil: 'networkidle', timeout: 60_000 });
// warm pass to load everything
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); }
});
// find first atelier image position + size
const pos = await page.evaluate(() => {
  const el = document.getElementById('atelier');
  const img = el.querySelector('img');
  const r = img.getBoundingClientRect();
  return { top: r.top + window.scrollY, h: r.height, src: img.src.split('/').pop() };
});
console.log(JSON.stringify(pos));
// position so the image block is nicely framed: align its top near 15% of viewport
const y = Math.max(0, pos.top - 160);
await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
await page.waitForTimeout(2500);
await page.screenshot({ path: '/home/clawd/.openclaw/workspace-rex/tmp/velmont-pub/shots/03-atelier.png' });
await browser.close();
console.log('done');
