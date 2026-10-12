import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(5000)
console.log(await p.evaluate(() => { const re=/^(filled|sealed|lapsed|pending|active|failed|settled|refundable|open|closed|expired|confirmed)\b/i
 return [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&!e.children.length&&re.test((e.textContent||'').trim())&&(e.textContent||'').trim().length<=40}).map(e=>e.tagName+'.'+e.className+': '+e.textContent.trim()) }))
await b.close()
