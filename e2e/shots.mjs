// node e2e/shots.mjs <url> <outdir> <prefix>
import { chromium } from 'playwright';
const [url, out, pre] = process.argv.slice(2);
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) for (const [name, q] of [['live', ''], ['stopped', '?vault=0x622Ef31120de6191f4067a73e15256a5F5e8d0B2']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto(url + q); await p.waitForTimeout(9000);
  await p.screenshot({ path: `${out}/${pre}-${name}-${w}.png`, fullPage: true }); await p.close();
}
{ const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.goto(url); await p.waitForTimeout(9000);
  for (const w of ['Risk', 'Activity']) { await p.getByRole('button', { name: w, exact: true }).click(); await p.waitForTimeout(800); await p.screenshot({ path: `${out}/${pre}-live-390-${w.toLowerCase()}.png`, fullPage: true }); } await p.close(); }
await b.close();
