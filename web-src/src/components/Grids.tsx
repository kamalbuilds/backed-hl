import { EXPLORER, MK, SZD, sgn, type Fill, type Vault } from '@/lib/backed'

const TZ = { timeZone: 'Asia/Kolkata', hour12: false } as const
const when = (ms: number) => new Date(ms).toLocaleString('en-GB', { ...TZ, day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
export const pxOf = (m: number, raw: number) => raw / 10 ** (6 - (SZD[m] ?? 4))

// Open positions read from the vault contract (HyperCore precompile), with the consequence of each against the cap.
export function Positions({ s }: { s: Vault }) {
  const cap = s.cap / 1e6
  const rows = s.pos.filter((p) => p.szi)
  const total = rows.reduce((a, p) => a + Math.abs(p.szi / 10 ** (SZD[p.m] ?? 4)) * pxOf(p.m, p.px), 0)
  return (
    <>
    <div className="grid-wrap">
      <table className="dgrid">
        <thead><tr><th>Market</th><th>Side</th><th className="r">Size</th><th className="r">Oracle px</th><th className="r">Notional</th><th className="r">Leverage used</th><th className="r">Room under cap</th></tr></thead>
        <tbody>
          {rows.length === 0 ? null : rows.map((p) => {
            const sz = p.szi / 10 ** (SZD[p.m] ?? 4), px = pxOf(p.m, p.px), ntl = Math.abs(sz) * px, lev = cap > 0 ? ntl / cap : 0
            return (
              <tr key={p.m}>
                <td className="strong">{MK[p.m] ?? p.m}-USD</td>
                <td className={sz > 0 ? 'pos' : 'neg'}>{sz > 0 ? 'Long' : 'Short'}</td>
                <td className="r">{Math.abs(sz)}</td>
                <td className="r">{px.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                <td className="r">{ntl.toFixed(2)}</td>
                <td className="r">{lev.toFixed(2)}x</td>
                <td className={`r ${s.maxLev * cap - total < cap * 0.25 ? 'warn' : ''}`}>{(s.maxLev * cap - total).toFixed(2)} USDC</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
      {rows.length === 0 && <p className="grid-empty">{s.breached || s.settled ? `Flat on HyperCore. This vault crossed its loss line and is ${s.settled ? 'settled' : 'frozen'}: new orders revert.` : <>Flat on HyperCore. The vault can open up to {(s.maxLev * cap).toFixed(2)} USDC notional ({s.maxLev}x of {cap.toFixed(2)} capital) in {s.markets.map((m) => MK[m] ?? m).join(' or ')}.</>}</p>}
    </>
  )
}

// HyperCore fills for this vault (public info API), each linked to its receipt.
export function Fills({ fills, loaded, failed }: { fills: Fill[]; loaded: boolean; failed: boolean }) {
  const rows = fills.slice().reverse().slice(0, 50)
  return (
    <>
    {failed && rows.length > 0 && <p className="grid-note warn">Fills refresh failed; showing the last successful read. It retries every minute.</p>}
    <div className="grid-wrap">
      <table className="dgrid">
        <thead><tr><th>Time (IST)</th><th>Market</th><th>Direction</th><th className="r">Price</th><th className="r">Size</th><th className="r">Fee</th><th className="r">Closed PnL</th><th>L1 hash</th></tr></thead>
        <tbody>
          {!loaded || rows.length === 0 ? null
            : rows.map((f, i) => {
              const pnl = Number(f.closedPnl)
              return (
                <tr key={f.hash + i}>
                  <td>{when(f.time)}</td>
                  <td className="strong">{f.coin}</td>
                  <td className={/Long|Buy/i.test(f.dir) && !/Close/i.test(f.dir) ? 'pos' : /Close/i.test(f.dir) ? '' : 'neg'}>{f.dir}</td>
                  <td className="r">{Number(f.px).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                  <td className="r">{f.sz}</td>
                  <td className="r">{Number(f.fee).toFixed(4)}</td>
                  <td className={`r ${pnl > 0 ? 'pos' : pnl < 0 ? 'neg' : ''}`}>{pnl ? sgn(pnl) : '0.00'}</td>
                  <td>{/^0x0+$/.test(f.hash) ? <span className="text-dim">HyperCore</span> : <a className="tx" href={`${EXPLORER}/tx/${f.hash}`} target="_blank" rel="noopener" title={f.hash}>{f.hash.slice(0, 8)}&hellip;</a>}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
      {!loaded ? <p className="grid-empty">Reading fills from the HyperCore info API&hellip;</p> : rows.length === 0 ? <p className="grid-empty">{failed ? 'The info API did not answer. It retries every minute.' : 'No fills on this vault yet. The first accepted order appears here within a second.'}</p> : null}
    </>
  )
}
