// Scroll each viewport in steps; at every step, find visible text boxes that intersect each other.
// Usage: node e2e/overlap.mjs [url] [outDir]   exits 1 when any overlap is found.
import { chromium } from 'playwright'
const url = process.argv[2] || 'http://localhost:8950/', out = process.argv[3] || '../docs/design/overlap'
const b = await chromium.launch(); let bad = 0
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(6000)
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  const seen = new Set()
  for (let y = 0, i = 0; y < H; y += Math.round(h * 0.6), i++) {
    await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(250)
    const hits = await p.evaluate(() => {
      const els = [...document.querySelectorAll('body *')].filter((e) => {
        if (e.closest('svg') && e.tagName !== 'text') return false
        const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
        if (!own) return false
        if (!e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
        const s = getComputedStyle(e); if (s.visibility === 'hidden' || +s.opacity === 0) return false
        const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight
      })
      const boxes = els.map((e) => {
        // tighten to the text itself
        const rg = document.createRange(); rg.selectNodeContents(e); const r = rg.getBoundingClientRect()
        return { e, r }
      })
      const name = (e) => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''} "${e.textContent.trim().slice(0, 30)}"`
      const res = []
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const A = boxes[i], B = boxes[j]; if (A.e.contains(B.e) || B.e.contains(A.e)) continue
        const ix = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), iy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top)
        if (ix > 2 && iy > 3) {
          // if one sits under an opaque sticky/fixed layer, the eye sees only the top one: check what is painted at the overlap center
          const cx = Math.max(A.r.left, B.r.left) + ix / 2, cy = Math.max(A.r.top, B.r.top) + iy / 2
          const top = document.elementFromPoint(cx, cy)
          const covered = top && !(A.e.contains(top) || top.contains(A.e)) !== !(B.e.contains(top) || top.contains(B.e)) && (getComputedStyle(top.closest('header,[class*=sticky],.topbar') || document.body).position.match(/sticky|fixed/))
          if (!covered) res.push(`${name(A.e)} x ${name(B.e)} (${ix.toFixed(0)}x${iy.toFixed(0)}px)`)
        }
      }
      return res
    })
    await p.screenshot({ path: `${out}/${w}-step${String(i).padStart(2, '0')}.png` })
    for (const x of hits) if (!seen.has(x)) { seen.add(x); bad++; console.log(`OVERLAP ${w}px @${y}: ${x}`) }
  }
  await p.close()
}
await b.close(); console.log(bad ? `FAIL ${bad} overlap(s)` : 'PASS no text overlap'); process.exit(bad ? 1 : 0)
