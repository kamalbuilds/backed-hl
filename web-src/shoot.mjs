// shoot.mjs URL OUTPREFIX : viewport shots at 1440x900 and 390x844 + full-page versions, reports console errors and horizontal overflow
import { chromium } from 'playwright';
const [url, out] = process.argv.slice(2);
const b = await chromium.launch(); const errs = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => errs.push(w + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(w + ' console ' + m.text().slice(0, 120)));
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(5000);
  await p.screenshot({ path: `${out}-${w}.png` }); await p.screenshot({ path: `${out}-${w}-full.png`, fullPage: true });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const fonts = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight));
  console.log(JSON.stringify({ w, overflowX: ov, fonts: [...new Set(fonts)] }));
  await p.close();
}
console.log('errors', JSON.stringify(errs)); await b.close();
