import { useState } from 'react'
import type { Address } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { account, pub, sendSpotUsdc, spotUsdc, write, type WriteResult } from '@/lib/backed'
import { Tx } from './Tx'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function Backer({ vault, factory, abi, onVault, onSent }: { vault: Address; factory: Address; abi: { vault: any; factory: any }; onVault: (v: Address) => void; onSent: (r: WriteResult) => void }) {
  const [c, setC] = useState({ trader: '', markets: 'ethbtc', lev: '3', floor: '2', daily: '0', share: '20', bounty: '0.1' })
  const [amt, setAmt] = useState({ send: '11', fund: '10', line: '2', sweep: '0' })
  const [spot, setSpot] = useState<number | null>(null)
  const readSpot = () => spotUsdc(vault).then(setSpot)
  useEffect(() => { readSpot() }, [vault])
  const flattenNow = async () => { // a keeper may land first; say so instead of a bare revert
    const r = await run(write(vault, abi.vault, 'flatten', []))
    if (!r.ok) { const flat = await pub.readContract({ address: vault, abi: abi.vault, functionName: 'isFlat' }).catch(() => null); if (flat === true) setOut({ ok: true, text: 'Already flat: another caller (usually the public keeper) flattened first.', tx: r.tx }) }
  }
  const [out, setOut] = useState<WriteResult | null>(null)
  const run = async (p: Promise<WriteResult>) => { setOut({ ok: true, text: 'Checking against the contract\u2026' }); const r = await p; setOut(r); onSent(r); setTimeout(readSpot, 3000); return r }
  const create = async () => {
    const both = c.markets === 'ethbtc'
    const r = await run(write(factory, abi.factory, 'create', [c.trader || account() || '0x0000000000000000000000000000000000000000', both ? [4, 3] : [4], both ? [4, 5] : [4], BigInt(c.lev), BigInt(-Math.round(Number(c.floor) * 1e6)), BigInt(Math.round(Number(c.daily) * 1e6)), Math.round(Number(c.share) * 100), BigInt(Math.round(Number(c.bounty) * 1e6))], 5_000_000n))
    if (r.ok) { const all = (await pub.readContract({ address: factory, abi: abi.factory, functionName: 'all' })) as Address[]; onVault(all[all.length - 1]) }
  }
  const F = (k: keyof typeof c, label: string, suffix?: string) => (
    <div className="field"><Label htmlFor={'c-' + k}>{label}{suffix && <span className="text-dim"> {suffix}</span>}</Label><Input id={'c-' + k} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} /></div>
  )
  return (
    <div className="backer">
      <section aria-labelledby="ctl-h">
        <h2 id="ctl-h" className="h3">This vault</h2>
        <p className="text-dim note">Vault spot USDC on HyperCore: {spot == null ? 'not readable' : spot.toFixed(2)}. Step 1 sends USDC from your HyperCore account (1 USDC goes to activating a new account), step 2 moves it into the vault&rsquo;s trading margin.</p>
        <div className="fields">
          <div className="field"><Label htmlFor="send">1. Send to vault <span className="text-dim">USDC</span></Label><Input id="send" inputMode="decimal" value={amt.send} onChange={(e) => setAmt({ ...amt, send: e.target.value })} /></div>
          <Button type="button" variant="outline" className="self-end" onClick={() => run(sendSpotUsdc(vault, Number(amt.send)))}>Send USDC</Button>
          <div className="field"><Label htmlFor="fund">2. Fund margin <span className="text-dim">USDC</span></Label><Input id="fund" inputMode="decimal" value={amt.fund} onChange={(e) => setAmt({ ...amt, fund: e.target.value })} /></div>
          <Button type="button" variant="outline" className="self-end" onClick={() => run(write(vault, abi.vault, 'fundPerp', [BigInt(Math.round(Number(amt.fund) * 1e6))]))}>Fund</Button>
          <div className="field"><Label htmlFor="line">New loss line <span className="text-dim">USDC below capital</span></Label><Input id="line" inputMode="decimal" value={amt.line} onChange={(e) => setAmt({ ...amt, line: e.target.value })} /></div>
          <Button type="button" variant="outline" className="self-end" onClick={() => run(write(vault, abi.vault, 'setFloor', [BigInt(-Math.round(Number(amt.line) * 1e6))]))}>Loosen line</Button>
        </div>
        <div className="actions">
          <Button type="button" variant="outline" onClick={() => confirm('Close every position in this vault now? This only works below the line.') && flattenNow()}>Flatten (anyone)</Button>
          <Button type="button" variant="outline" onClick={() => confirm('Stop this vault? It closes positions and freezes trading until you rearm.') && run(write(vault, abi.vault, 'stop', []))}>Stop</Button>
          <Button type="button" variant="outline" onClick={() => confirm('Settle and withdraw? Principal goes to the backer, the profit share to the trader.') && run(write(vault, abi.vault, 'settle', []))}>Settle and withdraw</Button>
          <Button type="button" variant="outline" onClick={() => run(write(vault, abi.vault, 'rearm', []))}>Rearm</Button>
          <Button type="button" variant="outline" onClick={() => run(write(vault, abi.vault, 'sweep', [BigInt(Math.round((spot ?? 0) * 1e8))]))}>Sweep leftover to backer</Button>
        </div>
      </section>
      <section aria-labelledby="new-h">
        <h2 id="new-h" className="h3">Back a new trader</h2>
        <div className="fields">
          {F('trader', 'Trader address')}
          <div className="field"><Label htmlFor="c-m">Markets</Label><select id="c-m" className="select" value={c.markets} onChange={(e) => setC({ ...c, markets: e.target.value })}><option value="ethbtc">ETH, BTC</option><option value="eth">ETH</option></select></div>
          {F('lev', 'Max leverage', 'x')}
          {F('floor', 'Loss line', 'USDC')}
          {F('daily', 'Daily loss', 'USDC, 0 off')}
          {F('share', 'Trader share', '% of profit')}
          {F('bounty', 'Flatten bounty', 'USDC')}
        </div>
        <Button type="button" onClick={create}>Create vault</Button>
      </section>
      {out && <p data-k="out" className={out.ok ? 'verdict' : 'verdict verdict-no'} aria-live="polite">{out.text} {out.tx && <Tx hash={out.tx} />}</p>}
    </div>
  )
}
