// Signature: the backer's loss line on a ruler in USDC, with live equity against it.
import { sgn } from '@/lib/backed'

export function LossRuler({ eq, floor, flash }: { eq: number; floor: number; flash: boolean }) {
  const lo = Math.floor(Math.min(floor, eq) - 1), hi = Math.ceil(Math.max(1, eq + 0.5))
  const pct = (x: number) => ((x - lo) / (hi - lo)) * 100
  const step = hi - lo > 6 ? 1 : 0.5
  const ticks: number[] = []
  for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100)
  const below = eq < floor
  return (
    <figure
      className={`ruler${flash ? ' ruler-flash' : ''}${below ? ' ruler-below' : ''}`}
      role="meter" aria-label="Equity against the backer's loss line, USDC"
      aria-valuemin={lo} aria-valuemax={hi} aria-valuenow={Number(eq.toFixed(2))}
    >
      <div className="ruler-track">
        <div className="ruler-dead" style={{ width: `${pct(floor)}%` }} />
        <div className="ruler-line" style={{ left: `${pct(floor)}%` }}>
          <span className="ruler-line-label">backer&rsquo;s line {sgn(floor)}</span>
        </div>
        <div className="ruler-zero" style={{ left: `${pct(0)}%` }} />
        <div className="ruler-eq-slide" style={{ transform: `translateX(${pct(eq)}%)` }}>
          <div className="ruler-eq"><span className="ruler-eq-label">equity {sgn(eq)}</span></div>
        </div>
        <div className="ruler-flash-layer" />
      </div>
      <div className="ruler-ticks" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t} style={{ left: `${pct(t)}%` }} className={Number.isInteger(t) ? 'major' : ''}>
            {Number.isInteger(t) ? (t === 0 ? '0' : sgn(t).replace('.00', '')) : ''}
          </span>
        ))}
      </div>
      <figcaption className="ruler-cap">PnL in USDC, 0 is the starting capital. Left of the red line, anyone can flatten.</figcaption>
    </figure>
  )
}
