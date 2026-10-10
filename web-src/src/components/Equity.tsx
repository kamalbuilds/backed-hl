import { useEffect, useRef, useState } from 'react'
import { hhmm, sgn, type Fill } from '@/lib/backed'

// Stepped realized PnL from HyperCore fills (no fill under the line), the backer's line, and live equity at the right edge.
export function Equity({ readAt, fills, eq, floor, loaded, failed, bounties }: { readAt: number | null; fills: Fill[]; eq: number; floor: number; loaded: boolean; failed: boolean; bounties: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(800)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); return () => ro.disconnect()
  }, [])
  if (!loaded) return <div ref={ref} className="chart-state">Reading fills from HyperCore&hellip;</div>
  if (!fills.length && failed) return <div ref={ref} className="chart-state">The HyperCore info API did not answer, so the fills are unknown, not empty. Retrying every 60 s.</div>
  if (!fills.length) return <div ref={ref} className="chart-state">No fills on this vault yet. The line appears after the first trade.</div>
  const H = 240, L = W < 560 ? 40 : 48, R = W < 560 ? 76 : 120, T = 16, B = 26
  let cum = 0
  const pts = fills.map((f) => { cum += Number(f.closedPnl) - Number(f.fee); return { t: f.time, v: cum } })
  const t0 = pts[0].t - 30000, t1 = pts[pts.length - 1].t + 30000
  pts.unshift({ t: t0, v: 0 }); pts.push({ t: t1, v: cum })
  const vs = pts.map((p) => p.v).concat([floor, 0, eq]); const lo = Math.min(...vs) - 0.3, hi = Math.max(...vs) + 0.3
  const x = (t: number) => L + ((t - t0) / (t1 - t0)) * (W - L - R)
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B)
  const d = pts.map((p, i) => (i ? `H${x(p.t).toFixed(1)}V${y(p.v).toFixed(1)}` : `M${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`)).join('')
  const nx = W - 8 - R / 2
  const gap = eq - cum
  return (
    <div ref={ref}>
      <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Realized PnL over ${fills.length} fills, ending ${sgn(cum)} USDC; live equity ${sgn(eq)}`}>
        {[lo, (lo + hi) / 2, hi].map((v) => (
          <g key={v} className="grid"><line x1={L} x2={W - 8} y1={y(v)} y2={y(v)} /><text x={L - 8} y={y(v) + 4} textAnchor="end">{v.toFixed(2)}</text></g>
        ))}
        <line className="zero" x1={L} x2={W - 8} y1={y(0)} y2={y(0)} />
        <text className="lbl" x={L + 6} y={y(0) - 6}>capital</text>
        <line className="floor" x1={L} x2={W - 8} y1={y(floor)} y2={y(floor)} />
        <text className="lbl lbl-alarm" x={L + 6} y={y(floor) - 6}>backer&rsquo;s line {sgn(floor)}</text>
        <path className="step" d={d} />
        <line className="zero" x1={x(t1)} x2={x(t1)} y1={T} y2={H - B} strokeDasharray="2 4" />
        <rect className="now" x={nx - 3} y={y(eq) - 3} width={6} height={6} />
        <text className="lbl lbl-ink" x={nx} y={y(eq) - 10} textAnchor="middle">{readAt ? `read ${hhmm(readAt).replace(' IST', '')}` : 'last read'} {sgn(eq)}</text>
        <text className="lbl" x={L} y={H - 6}>{hhmm(t0)}</text>
        <text className="lbl" x={x(t1)} y={H - 6} textAnchor="end">{hhmm(t1)}</text>
      </svg>
      <p className="note">
        {fills.length} HyperCore fills, realized PnL after fees.{failed && ' The latest refresh failed; showing the last fills received.'}
        {Math.abs(gap) > 0.05 && ` Live equity is ${Math.abs(gap).toFixed(2)} USDC under realized PnL: ${bounties} flatten bount${bounties === 1 ? 'y was' : 'ies were'} paid out of the vault, plus funding.`}
      </p>
    </div>
  )
}
