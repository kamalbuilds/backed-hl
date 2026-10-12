import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto('http://localhost:8950/', { waitUntil: 'load' }); await p.waitForTimeout(6000)
await p.getByRole('button', { name: 'Within cap (2.5x)', exact: true }).click(); await p.waitForTimeout(9000)
console.log(await p.locator('[data-k=summary]').innerText()); await p.locator('.ticket').screenshot({ path: '../docs/design/r46-order-summary.png' }); await b.close()
