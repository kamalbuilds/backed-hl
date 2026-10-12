import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(process.argv[2] || 'http://localhost:8950/', { waitUntil: 'load' }); await p.waitForTimeout(6000)
const svg = p.locator('svg.chart'); await svg.scrollIntoViewIfNeeded(); const bb = await svg.boundingBox()
await p.mouse.move(bb.x + bb.width * 0.35, bb.y + bb.height / 2); await p.waitForTimeout(400)
console.log('tip:', (await p.locator('.tip').textContent().catch(() => 'NONE')))
await p.locator('.chart-wrap').screenshot({ path: '../docs/design/r46-chart-hover.png' }); await b.close()
