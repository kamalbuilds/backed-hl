import { useEffect, useRef, useState } from 'react'
import { hhmm, sgn, type Fill } from '@/lib/backed'
const TZ = { timeZone: 'Asia/Kolkata' } as const
const dm = (ms: number) => new Date(ms).toLocaleString('en-GB', { ...TZ, day: 'numeric', month: 'short' })
const tm = (ms: number, sec = false) => new Date(ms).toLocaleTimeString('en-GB', { ...TZ, hour: '2-digit', minute: '2-digit', ...(sec ? { second: '2-digit' } : {}) })
const dmt = (ms: number) => `${dm(ms)}, ${tm(ms)} IST`

// nice tick values for the PnL axis
function ticks(lo: number, hi: number, n = 5) {
  const raw = (hi - lo) / n, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Math.round(v * 1e6) / 1e6)
  return out
}

// Stepped realized PnL from HyperCore fills, the backer's line, and the account PnL at the last contract read.
export function Equity({ readAt, fills, eq, floor, loaded, failed, bounties }: { readAt: number | null; fills: Fill[]; eq: number; floor: number; loaded: boolean; failed: boolean; bounties: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(800)
  const [hov, setHov] = useState<number | null>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect()
  }, [loaded, fills.length > 0])
  if (!loaded) return <div ref={ref} className="chart-wrap"><p className="chart-state">Reading fills from HyperCore&hellip;</p></div>
  if (!fills.length && failed) return <div ref={ref} className="chart-wrap"><p className="chart-state">The HyperCore info API did not answer, so the fills are unknown, not empty. Retrying every 60 s.</p></div>
  if (!fills.length) return <div ref={ref} className="chart-wrap"><p className="chart-state">No fills on this vault yet. The line appears after the first trade.</p></div>

  const narrow = W < 560
  const H = narrow ? 220 : 260, L = 56, R = narrow ? 76 : 120, T = 20, B = 34
  let cum = 0
  const pts = fills.map((f) => { const p = Number(f.closedPnl) - Number(f.fee); cum += p; return { t: f.time, v: cum, f, p } })
  const t0 = pts[0].t - 30000, t1 = pts[pts.length - 1].t + 30000
  const vs = pts.map((p) => p.v).concat([floor, 0, eq]); const lo = Math.min(...vs) - 0.25, hi = Math.max(...vs) + 0.25
  const x = (t: number) => L + ((t - t0) / (t1 - t0)) * (W - L - R)
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B)
  const path = [{ t: t0, v: 0 }, ...pts, { t: t1, v: cum }]
  const d = path.map((p, i) => (i ? `H${x(p.t).toFixed(1)}V${y(p.v).toFixed(1)}` : `M${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`)).join('')
  const area = `${d}H${x(t1).toFixed(1)}V${y(0).toFixed(1)}H${x(t0).toFixed(1)}Z`
  const yt = ticks(lo, hi, narrow ? 4 : 5)
  const xt = Array.from({ length: narrow ? 3 : 5 }, (_, i) => t0 + ((t1 - t0) * i) / ((narrow ? 3 : 5) - 1))
  const multiDay = dm(t0) !== dm(t1)
  const low = pts.reduce((a, b) => (b.v < a.v ? b : a))
  const worst = pts.reduce((a, b) => (b.p < a.p ? b : a))
  const nx = W - R + 22
  const lowEnd = x(low.t) > W - R - 90
  const gap = eq - cum
  const h = hov != null ? pts[hov] : null

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * W
    if (px < L || px > W - R) { setHov(null); return }
    let best = 0; pts.forEach((p, i) => { if (Math.abs(x(p.t) - px) < Math.abs(x(pts[best].t) - px)) best = i }); setHov(best)
  }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHov((i) => Math.min(pts.length - 1, (i ?? -1) + 1))
    else if (e.key === 'ArrowLeft') setHov((i) => Math.max(0, (i ?? pts.length) - 1))
    else if (e.key === 'Escape') setHov(null)
  }

  return (
    <div ref={ref} className="chart-wrap">
      <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" tabIndex={0} onPointerMove={onMove} onPointerLeave={() => setHov(null)} onKeyDown={onKey}
        aria-label={`Realized PnL over ${fills.length} fills, ending ${sgn(cum)} USDC; account PnL ${sgn(eq)} at ${readAt ? hhmm(readAt) : 'the last read'}. Use left and right arrows to step through fills.`}>
        {yt.map((v) => (
          <g key={v} className="gridline"><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} /><text className="ax" x={L - 10} y={y(v) + 4} textAnchor="end">{v.toFixed(2)}</text></g>
        ))}
        {xt.map((t, i) => (
          <g key={t} className="gridline gridline-x"><line x1={x(t)} x2={x(t)} y1={T} y2={H - B} /><text className="ax" x={x(t)} y={H - B + 18} textAnchor={i === 0 ? 'start' : i === xt.length - 1 ? 'end' : 'middle'}>{multiDay ? `${dm(t)} ${tm(t)}` : tm(t, t1 - t0 < 2 * 3600e3)}</text></g>
        ))}
        <line className="axis" x1={L} x2={L} y1={T} y2={H - B} />
        <line className="axis" x1={L} x2={W - R} y1={H - B} y2={H - B} />
        <text className="ax ax-title" x={12} y={T - 6}>USDC</text>
        <path className="area" d={area} />
        <line className="zero" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />
        <text className="lbl" x={L + 8} y={y(0) - 7}>starting capital, PnL 0</text>
        <line className="floor" x1={L} x2={W - 8} y1={y(floor)} y2={y(floor)} />
        <text className="lbl lbl-alarm" x={L + 8} y={y(floor) - 7}>backer&rsquo;s line {sgn(floor)}</text>
        <path className="step" d={d} />
        {pts.map((p, i) => <circle key={i} className="fill-dot" cx={x(p.t)} cy={y(p.v)} r={2} />)}
        <g className="anno"><circle cx={x(low.t)} cy={y(low.v)} r={4} /><text x={lowEnd ? x(low.t) - 10 : x(low.t)} y={lowEnd ? y(low.v) + 18 : y(low.v) + 20} textAnchor={lowEnd ? 'end' : 'middle'}>low {sgn(low.v)}</text></g>
        {worst.p < -0.05 && worst !== low && <g className="anno anno-loss"><circle cx={x(worst.t)} cy={y(worst.v)} r={4} /><text x={x(worst.t)} y={y(worst.v) - 10} textAnchor="middle">worst fill {sgn(worst.p)}</text></g>}
        <line className="readline" x1={W - R + 8} x2={W - R + 8} y1={T} y2={H - B} />
        {Math.abs(gap) > 0.05 && <line className="gapline" x1={nx} x2={nx} y1={y(cum)} y2={y(eq)} />}
        <circle className="now" cx={nx} cy={y(eq)} r={5} />
        <text className="lbl lbl-ink" x={nx + 10} y={y(eq) + (y(eq) > y(cum) ? 18 : -10)}>{sgn(eq)}</text>
        {!narrow && <text className="ax" x={nx + 10} y={y(eq) + (y(eq) > y(cum) ? 34 : -26)}>read {readAt ? tm(readAt) : ''}</text>}
        {!narrow && Math.abs(gap) > 0.05 && Math.abs(y(cum) - y(eq)) > 30 && <text className="gaptext" x={nx + 10} y={(y(cum) + y(eq)) / 2 + 4}>gap {sgn(gap)}</text>}
        {h && <g className="cross"><line x1={x(h.t)} x2={x(h.t)} y1={T} y2={H - B} /><circle cx={x(h.t)} cy={y(h.v)} r={5} /></g>}
      </svg>
      {h && (
        <div className="tip" role="status" style={{ left: Math.min(Math.max(x(h.t), 90), W - 90), top: Math.max(y(h.v) - 84, 0) }}>
          <span className="tip-t">{dmt(h.t)}</span>
          <span className="tip-r"><span>{h.f.coin} {h.f.dir}</span><span className="mono">{h.f.sz} @ {Number(h.f.px).toLocaleString('en-US')}</span></span>
          <span className="tip-r"><span>Fill PnL</span><span className={`mono ${h.p < 0 ? 'neg' : 'pos'}`}>{sgn(h.p)}</span></span>
          <span className="tip-r"><span>Realized total</span><span className="mono">{sgn(h.v)}</span></span>
        </div>
      )}
      <div className="legend">
        <span><i className="lg-step" />Realized PnL from fills</span>
        <span><i className="lg-now" />Account PnL at the last contract read{Math.abs(gap) > 0.05 ? ` (gap ${sgn(gap)} vs realized)` : ''}</span>
        <span><i className="lg-floor" />Backer&rsquo;s line</span>
        <span className="lg-range">{dmt(t0)} to {dmt(t1)}</span>
      </div>
      <details className="recon"><summary>Reconciliation notes</summary><p className="note">
        {fills.length} HyperCore fills, realized PnL after fees.{failed && ' The latest refresh failed; showing the last fills received.'}
        {Math.abs(gap) > 0.05 && ` Measured gap: account PnL at the last read is ${Math.abs(gap).toFixed(2)} USDC ${gap < 0 ? 'under' : 'above'} realized PnL.`}{bounties > 0 && ` Separately, the vault made ${bounties} outgoing spot transfer${bounties === 1 ? '' : 's'} (bounties or payouts; not attributed here).`}
      </p></details>
    </div>
  )
}
