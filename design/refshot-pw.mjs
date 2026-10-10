// refshot-pw.mjs URL OUT.png [W] [H] [--full]
// Playwright port of ui-craft scripts/refshot.py (bhn deepsurge hangs on this Mac). Same TOKENS_JS and junk refusal:
// waits for load, network idle, document.fonts.ready and a settle delay; exits 2 and writes nothing on error/challenge/blank pages.
import { chromium } from 'playwright';
import fs from 'node:fs';
const a = process.argv.slice(2).filter((x) => !x.startsWith('--')); const FULL = process.argv.includes('--full');
const [url, out] = a; const W = Number(a[2] || 1440), H = Number(a[3] || 900);
const BAD = ["can't be reached", "err_", "access denied", "just a moment", "verify you are human",             "attention required", "page not found", "404", "enable javascript", "cf-browser-verification", "dns_probe", "this site can't", "took too long to respond", "err_name_not_resolved"];
const TOKENS_JS = `
(() => {
  const pick = (el) => { if (!el) return null; const s = getComputedStyle(el); return {
    text: (el.innerText || el.value || '').trim().slice(0, 60), font: s.fontFamily, size: s.fontSize,
    weight: s.fontWeight, tracking: s.letterSpacing, leading: s.lineHeight, color: s.color,
    bg: s.backgroundColor, radius: s.borderRadius, padding: s.padding, border: s.border,
    transform: s.textTransform, features: s.fontFeatureSettings }; };
  const q = (sel) => pick([...document.querySelectorAll(sel)].find(e => e.offsetParent !== null && (e.innerText || '').trim()));
  const fonts = new Set(); document.fonts.forEach(f => { if (f.status === 'loaded') fonts.add(f.family.replace(/"/g, '')); });
  return { title: document.title, h1: q('h1'), h2: q('h2'), h3: q('h3'), body: pick(document.body),
    p: q('p'), a: q('a'), button: q('button, [role=button], a[class*=button], a[class*=btn]'),
    input: pick(document.querySelector('input')), loadedFonts: [...fonts],
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    bodyText: (document.body.innerText || '').slice(0, 400), textLen: (document.body.innerText || '').length,
    height: document.documentElement.scrollHeight };
})()
`;
const fail = (r) => { console.log(JSON.stringify({ ok: false, url, reason: r })); process.exit(2); };
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36' });
try { const r = await p.goto(url, { waitUntil: 'load', timeout: 45000 }); if (r && r.status() >= 400) { await b.close(); fail('http ' + r.status()); } } catch (e) { await b.close(); fail('load: ' + e.message.slice(0, 80)); }
await p.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
const t = await p.evaluate(TOKENS_JS);
const low = (t.title + ' ' + t.bodyText).toLowerCase(); const hit = BAD.find((x) => low.includes(x));
if (hit || t.textLen < 40) { await b.close(); fail(hit ? 'junk text: ' + hit : 'near-empty page'); }
const buf = await p.screenshot({ fullPage: FULL });
const lum = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 64, 64); const d = x.getImageData(0, 0, 64, 64).data; let s = 0, s2 = 0, n = d.length / 4; for (let i = 0; i < d.length; i += 4) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; s += l; s2 += l * l; } return Math.sqrt(s2 / n - (s / n) ** 2); }, buf.toString('base64'));
await b.close(); if (lum < 6) fail('blank frame (luma stddev ' + lum.toFixed(1) + ')');
fs.writeFileSync(out, buf); fs.writeFileSync(out.replace(/\.png$/, '.tokens.json'), JSON.stringify({ url, viewport: [W, H], capturedWith: 'refshot-pw (playwright port of refshot.py)', ...t }, null, 1));
console.log(JSON.stringify({ ok: true, url, out, luma_std: +lum.toFixed(1), fonts: t.loadedFonts.slice(0, 6) }));
