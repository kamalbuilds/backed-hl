// Open every tx link the site shows (#/tx/<hash>) on a deployed URL and require the RPC receipt page to render Success/Reverted.
// node e2e/receipts.mjs https://backed-2v9.pages.dev/ [extra hashes...]
import fs from 'node:fs';
import { chromium } from 'playwright';
const base = process.argv[2] || 'https://backed-2v9.pages.dev/';
const d = JSON.parse(fs.readFileSync(new URL('../public/data.json', import.meta.url)));
const src = fs.readFileSync(new URL('../src/components/Judges.tsx', import.meta.url), 'utf8');
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const hs0 = [...new Set([...d.evidence.groups.flatMap((g) => g.items.map((i) => i.tx)).filter(Boolean), ...(src.match(/0x[0-9a-f]{64}/g) || []), ...process.argv.slice(3)])];
const hs = only || hs0;
const b = await chromium.launch(); const p = await b.newPage(); let bad = 0;
for (const h of hs) {
  let st = 'timeout';
  for (let a = 0; a < 6 && !/Success|Reverted/.test(st); a++) {
    if (a) await p.waitForTimeout(6000); await p.goto(base + '#/tx/' + h); await p.reload();
    try { await p.waitForSelector('text=/^(Success|Reverted|Not found|RPC error)$/', { timeout: 20000 }); st = (await p.locator('.chip').first().innerText()).trim(); } catch {}
  }
  if (!/Success|Reverted/.test(st)) bad++; console.log(st.padEnd(9), base + '#/tx/' + h);
}
await b.close(); console.log(`${hs.length - bad}/${hs.length} receipt pages resolved`); process.exit(bad ? 1 : 0);
