// read-only UI smoke: presets reach the contract check, tabs switch, no console errors
import { chromium } from 'playwright'
const url = process.argv[2] || 'http://localhost:8950/'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(5000)
const out = {}
for (const name of ['Within cap (2.5x)', 'Over cap (20x)', 'Blocked market (SOL)']) {
  await p.getByRole('button', { name: 'Below oracle ($1)', exact: true }).click(); await p.waitForTimeout(300)
  await p.getByRole('button', { name, exact: true }).click(); await p.waitForTimeout(600)
  await p.waitForFunction(() => /accepts|refuses|rate limiting|did not answer|No oracle/.test(document.querySelector('.ticket [data-k=check]')?.textContent || '') && !document.querySelector('.gate')?.textContent?.includes('Checking'), null, { timeout: 40000 }).catch(() => {})
  if (name.startsWith('Within')) out.signBtn = await p.getByRole('button', { name: 'Sign, then submit (you pay gas)' }).count()
  out[name] = ((await p.locator('.ticket [data-k=check]').textContent().catch(() => '')) || '').slice(0, 90)
  out[name + ' chips'] = await p.locator('.gate .chip').allTextContents()
}
await p.getByRole('tab', { name: 'Backer' }).click(); out.backerTab = await p.locator('[role=tabpanel]').first().textContent().then((t) => t.slice(0, 60))
await p.getByRole('tab', { name: 'Incidents' }).click(); out.incidents = await p.locator('#incidents').count()
out.errors = errs
console.log(JSON.stringify(out, null, 1)); await b.close()
