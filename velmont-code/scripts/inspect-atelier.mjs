import { createRequire } from 'node:module';
const require = createRequire('/home/clawd/.openclaw/skills/playwright-browser-automation/qa_capture.js');
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await page.goto('https://velmont.apps.mdxpreview.xyz', { waitUntil: 'networkidle', timeout: 60_000 });
const info = await page.evaluate(() => {
  const el = document.getElementById('atelier');
  if (!el) return 'no atelier el';
  const kids = [...el.querySelectorAll('*')].slice(0, 40).map(n => ({
    tag: n.tagName, cls: (n.className || '').toString().slice(0, 60),
    bg: getComputedStyle(n).backgroundImage.slice(0, 80),
    src: n.src || n.currentSrc || null,
  })).filter(k => k.bg !== 'none' || k.src || ['IMG','VIDEO','CANVAS','PICTURE','SOURCE'].includes(k.tag));
  return { rect: el.getBoundingClientRect().height, kids };
});
console.log(JSON.stringify(info, null, 1).slice(0, 3000));
await browser.close();
