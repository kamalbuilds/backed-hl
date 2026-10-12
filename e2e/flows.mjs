// E2E on live HyperEVM testnet: node e2e/flows.mjs [url]. Writes e2e/out/flows.json + screenshots.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { install, account, txs } from './wallet.mjs';
const URL0 = process.argv[2] || 'http://localhost:8950/';
const RESUME = process.env.RESUME_VAULT;
fs.mkdirSync('e2e/out', { recursive: true });
const log = []; const step = (name, ok, extra = {}) => { const e = { name, ok, at: new Date().toISOString(), ...extra }; log.push(e); console.log(ok ? 'PASS' : 'FAIL', name, JSON.stringify(extra)); fs.writeFileSync('e2e/out/flows.json', JSON.stringify(log, null, 1)); if (!ok && !process.env.SOFT) { console.log('ABORT'); process.exit(1); } };
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await install(page);
await page.goto(URL0, { waitUntil: 'load' }); await page.waitForTimeout(3000);
const shot = (n) => page.screenshot({ path: `e2e/out/${n}.png` });
// wait for a new verdict line in a panel; returns {text, tx}
async function outcome(panel, before, ms = 120000) {
  const loc = page.locator(`${panel} [data-k=out]`);
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const t = (await loc.textContent().catch(() => '')) || '';
    if (t !== before && /(confirmed|reverted|Not sent|refuses|rate limiting)/.test(t)) { const href = await loc.locator('a').first().getAttribute('href').catch(() => null); return { text: t.trim(), tx: href ? href.split('/').pop() : null }; }
    await page.waitForTimeout(800);
  }
  return { text: 'timeout', tx: null };
}
const last = async (panel) => (await page.locator(`${panel} [data-k=out]`).textContent().catch(() => '')) || '';
async function click(panel, name) { const before = await last(panel); await page.getByRole('button', { name, exact: true }).click(); return outcome(panel, before); }
const tab = (n) => page.getByRole('tab', { name: n }).click();
async function check(preset) { // click a preset and wait for a real contract verdict; re-trigger through RPC rate limits
  let t = '';
  for (let i = 0; i < 6; i++) {
    await page.getByRole('button', { name: 'Below oracle ($1)' }).click().catch(() => {}); await page.waitForTimeout(300);
    await page.getByRole('button', { name: preset }).click(); await page.waitForTimeout(1500);
    await page.waitForFunction(() => /accepts|refuses|rate limiting|did not answer/.test(document.querySelector('.ticket [data-k=check]')?.textContent || ''), null, { timeout: 40000 }).catch(() => {});
    t = (await page.locator('.ticket [data-k=check]').textContent().catch(() => '')) || '';
    if (!/rate limiting|did not answer/.test(t)) return t.trim();
    await page.waitForTimeout(12000);
  }
  return t.trim();
}

await page.getByRole('button', { name: 'Connect wallet' }).click(); await page.waitForTimeout(1000);
step('connect', (await page.getByRole('button', { name: /0x263F/ }).count()) > 0, { address: account.address });

// 1 create vault
let r;
if (!RESUME) {
await tab('Backer'); await page.fill('#c-trader', account.address); await page.fill('#c-floor', '2');
r = await click('.backer', 'Create vault'); step('create vault', /confirmed/.test(r.text), r);
await page.waitForTimeout(4000); const vault = new URL(page.url()).searchParams.get('vault'); step('new vault loaded', !!vault && !/661971/.test(vault), { vault });
execSync('cd ../.. && BACKED_KEYFILE=/Users/kamal/Desktop/solana/cwf/hyperliquid/.keys/backed-operator-2.json npx -y tsx scripts/bigblocks.ts false', { stdio: 'ignore' }); console.log('  big blocks off');
await shot('01-created');
// 2 send USDC + fund margin
await page.fill('#send', '11'); r = await click('.backer', 'Send USDC'); step('send 11 USDC to vault (CoreWriter spotSend)', /confirmed/.test(r.text), r);
await page.waitForTimeout(8000);
} else { await page.goto(URL0 + '?vault=' + RESUME, { waitUntil: 'load' }); await page.waitForTimeout(4000); await page.getByRole('button', { name: 'Connect wallet' }).click().catch(() => {}); await page.waitForTimeout(1000); await tab('Backer'); step('resumed vault', true, { vault: RESUME }); }
if (!process.env.FUNDED) { await page.fill('#fund', '10'); r = await click('.backer', 'Fund'); step('fundPerp 10 USDC', /confirmed/.test(r.text), r); }
await page.waitForTimeout(8000); await shot('02-funded');
// 3 allowed trade
await tab('Trader'); await page.waitForTimeout(6000);
if (!process.env.TRADED) {
const pre = await check('Within cap (2.5x)'); step('2.5x pre-check accepted', /accepts/.test(pre), { text: pre.trim() });
r = await click('.ticket', 'Send order'); step('allowed trade 2.5x ETH long', /confirmed/.test(r.text), r);
await page.waitForTimeout(6000); await shot('03-trade'); }
// 4 rejected 20x (contract simulation refuses; button reads Send anyway)
await tab('Trader'); await page.waitForTimeout(5000); const v20 = await check('Over cap (20x)'); step('20x refused by contract check', /refuses/.test(v20), { text: v20.trim() });
r = await click('.ticket', 'Send anyway, it will revert'); step('20x send blocked before gas', /Not sent/.test(r.text), r);
await shot('04-reject20x');
// 5 breach + flatten
// move the line above equity
if (!process.env.BREACHED) {
await tab('Backer'); await page.fill('#line', '-0.5'); r = await click('.backer', 'Move line'); const tBreach = Date.now(); step('move line above equity (breach)', /confirmed/.test(r.text), r);
await page.waitForTimeout(5000);
const flat = await click('.backer', 'Flatten (anyone)'); step('flatten (UI, keeper may race)', /confirmed|Not sent/.test(flat.text), { ...flat, msSinceBreachTx: Date.now() - tBreach });
await page.waitForTimeout(10000); await shot('05-flattened'); }
await tab('Backer'); await page.waitForTimeout(5000);
// 6 rearm then gasless signed order
if (!process.env.STOPPED) {
if (!process.env.LINED) { await page.fill('#line', '2'); r = await click('.backer', 'Move line'); step('line back to -2', /confirmed/.test(r.text), r); }
await page.waitForTimeout(4000); r = await click('.backer', 'Rearm'); step('rearm', /confirmed/.test(r.text), r);
await tab('Trader'); await page.waitForTimeout(4000); step('signed pre-check', /accepts/.test(await check('Within cap (2.5x)')));
r = await click('.ticket', 'Sign, then submit (you pay gas)'); step('signed order via tradeBySig', /confirmed/.test(r.text), r);
await page.waitForTimeout(6000); await shot('06-signed');
// 7 stop, flatten, settle (withdraw), sweep
await tab('Backer'); r = await click('.backer', 'Stop'); step('stop', /confirmed/.test(r.text), r);
await page.waitForTimeout(4000); r = await click('.backer', 'Flatten (anyone)'); step('flatten after stop (keeper may win)', /confirmed|Already flat|Not sent: flat/.test(r.text), r);
} else { await tab('Backer'); await page.waitForTimeout(5000); }
await page.waitForTimeout(15000); r = await click('.backer', 'Settle and withdraw'); step('settle and withdraw', /confirmed/.test(r.text), r);
await page.waitForTimeout(8000); await shot('07-settled');
process.env.SOFT = '1'; step('page errors', errs.length === 0, { errs });
fs.writeFileSync('e2e/out/txs.json', JSON.stringify(txs, null, 1)); await b.close();
