import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MK, SZD, pub, pxOf, rpcLimited, signOrder, write, type Vault, type WriteResult } from '@/lib/backed'
import { Tx } from './Tx'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Form = { asset: number; buy: boolean; sz: string; px: string; ro: boolean }
type Check = { k: string; v: string; ok: boolean | null }

export function Ticket({ s, vault, abi, onSent }: { s: Vault; vault: Address; abi: any; onSent: (r: WriteResult) => void }) {
  const ethPos = s.pos.find((p) => p.m === 4)
  const ethPx = ethPos && ethPos.px > 0 ? pxOf(ethPos) : null
  const capUsd = s.cap > 0 ? s.cap / 1e6 : null
  const canPreset = ethPx != null && capUsd != null
  const [f, setF] = useState<Form>({ asset: 4, buy: true, sz: canPreset ? (2.5 * capUsd! / ethPx!).toFixed(4) : '', px: '', ro: false })
  const [checks, setChecks] = useState<Check[] | null>(null)
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null)
  const [out, setOut] = useState<WriteResult | null>(null)
  const [busy, setBusy] = useState(false)

  const args = async (): Promise<[number, boolean, bigint, bigint, boolean]> => {
    const d = SZD[f.asset] ?? 2
    let px = Number(f.px)
    if (!px) {
      const p = s.pos.find((q) => q.m === f.asset)
      const o = p ? null : await pub.readContract({ address: vault, abi, functionName: 'oraclePx', args: [f.asset] }).catch(() => null)
      if (!p && o == null) throw new Error('PRICE')
      const raw = p ? pxOf(p) : Number(o) / 10 ** (6 - d)
      px = Math.round(raw * (f.buy ? 1.02 : 0.98))
    }
    return [f.asset, f.buy, BigInt(Math.round(px * 1e8)), BigInt(Math.round(Number(f.sz || 0) * 1e8)), f.ro]
  }

  useEffect(() => {
    let live = true
    setChecks(null); setVerdict(null)
    const t = setTimeout(async () => {
      const slow = setTimeout(() => { if (live) { setChecks([]); setVerdict({ ok: false, text: 'The testnet RPC did not answer within 8 s. Edit the order to check again.' }) } }, 8000)
      let a: Awaited<ReturnType<typeof args>>
      try { a = await args() } catch { clearTimeout(slow); if (live) { setChecks([]); setVerdict({ ok: false, text: `No oracle price for ${MK[f.asset]} right now (it may not be listed on this vault), so the order did not reach the contract check. Enter a limit price to check it.` }) } return }
      const [asset, buy, , sz8, ro] = a
      const allowed = s.markets.includes(asset)
      let lev: number | null = null
      if (allowed) { try { lev = Number(await pub.readContract({ address: vault, abi, functionName: 'notionalAfter', args: [asset, buy, sz8] })) / s.cap } catch { lev = null } }
      const levOk = lev == null ? (allowed ? null : false) : lev <= s.maxLev || ro
      const room = (s.eq - s.floor) / 1e6
      const c: Check[] = [
        { k: 'Market', v: `${MK[asset] ?? asset} ${allowed ? 'is allowed' : 'is not on the list'}`, ok: allowed },
        { k: 'Leverage', v: lev == null ? (allowed ? 'RPC busy, retrying' : 'not checked') : `${lev.toFixed(2)}x after fill, cap ${s.maxLev}x`, ok: levOk },
        { k: 'Loss line', v: `${room.toFixed(2)} USDC of room`, ok: room >= 0 },
        { k: 'Frozen', v: s.breached ? 'yes, flattened' : 'no', ok: !s.breached },
      ]
      let v: { ok: boolean; text: string }
      try { await pub.simulateContract({ account: s.trader as Address, address: vault, abi, functionName: 'trade', args: a }); v = { ok: true, text: 'The contract accepts this order (simulated as the trader).' } }
      catch (e: any) { v = rpcLimited(e) ? { ok: false, text: 'The testnet RPC is rate limiting reads. The check reruns when you edit the order.' } : { ok: false, text: 'The contract refuses it: ' + String(e.shortMessage || e.message).split('\n').pop()!.replace(/^.*reverted with the following reason:\s*/, '') } }
      clearTimeout(slow)
      if (v.ok) c.forEach((x) => { if (x.ok === null) { x.ok = true; x.v = 'within cap (contract simulation passed)' } })
      if (live) { setChecks(c); setVerdict(v) }
    }, 250)
    return () => { live = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, s, vault])

  const unavailable = verdict != null && /rate limiting|did not answer|No oracle price/.test(verdict.text)
  const phase: 'checking' | 'ok' | 'no' | 'unknown' = !verdict ? 'checking' : verdict.ok ? 'ok' : unavailable ? 'unknown' : 'no'
  const preset = (k: string) => {
    if (!canPreset) return
    const capUsd = s.cap / 1e6, ethPx = pxOf(ethPos!)
    const P: Record<string, Form> = {
      ok: { asset: 4, buy: true, sz: (2.5 * capUsd / ethPx).toFixed(4), px: '', ro: false },
      lev: { asset: 4, buy: true, sz: (20 * capUsd / ethPx).toFixed(4), px: '', ro: false },
      fake: { asset: 4, buy: true, sz: (5 * capUsd / ethPx).toFixed(4), px: '1', ro: false },
      sol: { asset: 5, buy: true, sz: '0.10', px: '150', ro: false },
    }
    setF(P[k]); setOut(null)
  }
  const send = async () => { setBusy(true); const r = await write(vault, abi, 'trade', await args()); setOut(r); onSent(r); setBusy(false) }
  const sign = async () => {
    setBusy(true)
    try {
      const [asset, isBuy, limitPx8, sz8, reduceOnly] = await args()
      const g = await signOrder(vault, { asset, isBuy, limitPx8, sz8, reduceOnly })
      const r = await write(vault, abi, 'tradeBySig', [g.order, g.v, g.r, g.s]); setOut(r); onSent(r)
    } catch (e: any) { setOut({ ok: false, text: String(e.shortMessage || e.message) }) }
    setBusy(false)
  }

  return (
    <form className="ticket" onSubmit={(e) => { e.preventDefault(); send() }}>
      <div className="presets" aria-label="Try an order">
        <span className="text-dim">{canPreset ? 'Try' : 'Presets need the live ETH price and vault capital, which have not loaded.'}</span>
        <button type="button" disabled={!canPreset} onClick={() => preset('ok')}>2.5x long</button>
        <button type="button" disabled={!canPreset} onClick={() => preset('lev')}>20x long</button>
        <button type="button" disabled={!canPreset} onClick={() => preset('fake')}>$1 limit</button>
        <button type="button" disabled={!canPreset} onClick={() => preset('sol')}>SOL</button>
      </div>
      <div className="fields">
        <div className="field">
          <Label htmlFor="asset">Market</Label>
          <select id="asset" className="select" value={f.asset} onChange={(e) => setF({ ...f, asset: Number(e.target.value) })}>
            <option value={4}>ETH</option><option value={3}>BTC</option><option value={5}>SOL</option>
          </select>
        </div>
        <fieldset className="field">
          <legend className="lbl-legend">Side</legend>
          <div className="seg" role="radiogroup">
            <button type="button" role="radio" aria-checked={f.buy} onClick={() => setF({ ...f, buy: true })}>Long</button>
            <button type="button" role="radio" aria-checked={!f.buy} onClick={() => setF({ ...f, buy: false })}>Short</button>
          </div>
        </fieldset>
        <div className="field">
          <Label htmlFor="sz">Size <span className="text-dim">{MK[f.asset]}</span></Label>
          <Input id="sz" inputMode="decimal" value={f.sz} onChange={(e) => setF({ ...f, sz: e.target.value })} />
        </div>
        <div className="field">
          <Label htmlFor="px">Limit price <span className="text-dim">USD</span></Label>
          <Input id="px" inputMode="decimal" placeholder="oracle ±2%" value={f.px} onChange={(e) => setF({ ...f, px: e.target.value })} />
        </div>
      </div>
      <label className="check"><input type="checkbox" checked={f.ro} onChange={(e) => setF({ ...f, ro: e.target.checked })} /> Reduce only</label>

      <table className="checks" aria-live="polite">
        <tbody>
          {checks && checks.length ? checks.map((c) => (
            <tr key={c.k}><th scope="row">{c.k}</th><td>{c.v}</td><td className={c.ok === null ? 'wait' : c.ok ? 'pass' : 'fail'}>{c.ok === null ? 'wait' : c.ok ? 'pass' : 'fail'}</td></tr>
          )) : checks ? <tr><td colSpan={3} className="text-dim">No answer from the contract.</td></tr> : <tr><td colSpan={3} className="text-dim">Asking the contract&hellip;</td></tr>}
        </tbody>
      </table>
      {verdict && <p className={verdict.ok ? 'verdict' : 'verdict verdict-no'}>{verdict.text}</p>}
      {f.asset === 4 && Number(f.sz) > 0 && capUsd != null && (Number(f.px) || ethPx) && <p className="verdict text-dim">Notional about {(Number(f.sz) * (Number(f.px) || ethPx!)).toFixed(2)} USD against {capUsd!.toFixed(2)} USDC capital. The signature path lets any relayer submit; here your wallet submits it.</p>}

      <div className="actions">
        <Button type="submit" disabled={busy || phase === 'checking'}>{busy ? 'Waiting for the wallet\u2026' : phase === 'checking' ? 'Checking\u2026' : phase === 'ok' ? 'Send order' : phase === 'no' ? 'Send anyway, it will revert' : 'Send unchecked'}</Button>
        <Button type="button" variant="outline" disabled={busy || phase === 'checking'} onClick={sign}>Sign, then submit (you pay gas)</Button>
      </div>
      {out && <p className={out.ok ? 'verdict' : 'verdict verdict-no'}>{out.text} {out.tx && <Tx hash={out.tx} />}</p>}
    </form>
  )
}
