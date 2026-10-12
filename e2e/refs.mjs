import { chromium } from 'playwright';
const out = process.argv[2]; const b = await chromium.launch();
for (const [n, u] of [['hyperliquid', 'https://app.hyperliquid-testnet.xyz/trade/ETH'], ['lighter', 'https://app.lighter.xyz/trade/ETH']]) for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); try { await p.goto(u, { timeout: 45000 }); await p.waitForTimeout(8000); await p.screenshot({ path: `${out}/ref-${n}-${w}.png` }); } catch (e) { console.log(n, w, String(e).slice(0, 80)); } await p.close();
}
await b.close();
