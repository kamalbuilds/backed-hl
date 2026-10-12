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

export function Ticket({ s, vault, abi, onSent, readNote }: { s: Vault; vault: Address; abi: any; onSent: (r: WriteResult) => void; readNote?: string }) {
  const ethPos = s.pos.find((p) => p.m === 4)
  const ethPx = ethPos && ethPos.px > 0 ? pxOf(ethPos) : null
  const capUsd = s.cap > 0 ? s.cap / 1e6 : null
  const canPreset = ethPx != null && capUsd != null
  const [f, setF] = useState<Form>({ asset: 4, buy: true, sz: '', px: '', ro: false })
  const [checks, setChecks] = useState<Check[] | null>(null)
  const [retry, setRetry] = useState(0)
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null)
  const [out, setOut] = useState<WriteResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [levAfter, setLevAfter] = useState<number | null>(null)

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
    if (!(Number(f.sz) > 0)) { setChecks([]); setVerdict({ ok: false, text: 'Choose an example or enter a size to check the rules.' }); return }
    setChecks(null); setVerdict(null)
    const t = setTimeout(async () => {
      const slow = setTimeout(() => { if (live) { setChecks([]); setVerdict({ ok: false, text: 'The testnet RPC did not answer within 8 s. Your order is kept; press Retry check.' }) } }, 8000)
      let a: Awaited<ReturnType<typeof args>>
      try { a = await args() } catch { clearTimeout(slow); if (live) { setChecks([]); setVerdict({ ok: false, text: `No oracle price for ${MK[f.asset]} right now (it may not be listed on this vault), so the order did not reach the contract check. Enter a limit price to check it.` }) } return }
      const [asset, buy, , sz8, ro] = a
      const allowed = s.markets.includes(asset)
      let lev: number | null = null
      if (allowed) { try { lev = Number(await pub.readContract({ address: vault, abi, functionName: 'notionalAfter', args: [asset, buy, sz8] })) / s.cap } catch { lev = null } }
      setLevAfter(lev)
      const levOk = lev == null ? (allowed ? null : false) : lev <= s.maxLev || ro
      const room = (s.eq - s.floor) / 1e6
      const c: Check[] = [
        { k: 'Market', v: `${MK[asset] ?? asset} ${allowed ? 'is allowed' : 'is not on the list'}`, ok: allowed },
        { k: 'Leverage', v: lev == null ? (allowed ? 'RPC busy, retrying' : 'not checked') : `${lev.toFixed(2)}x after fill, cap ${s.maxLev}x`, ok: levOk },
        { k: 'Loss line', v: `${room.toFixed(2)} USDC of room`, ok: room >= 0 },
        { k: 'Frozen', v: s.breached ? 'yes, flattened' : 'no', ok: !s.breached },
      ]
      let v: { ok: boolean; text: string } = { ok: false, text: '' }
      for (let i = 0; i < 3; i++) { // only a real revert counts as a refusal; RPC hiccups retry, then say so
        try { await pub.simulateContract({ account: s.trader as Address, address: vault, abi, functionName: 'trade', args: a }); v = { ok: true, text: 'The contract accepts this order (simulated as the trader).' }; break }
        catch (e: any) {
          if (rpcLimited(e)) { v = { ok: false, text: 'The testnet RPC is rate limiting reads. Your order is kept; press Retry check.' }; await new Promise((r) => setTimeout(r, 2000 * (i + 1))); continue }
          v = { ok: false, text: 'The contract refuses it: ' + String(e.shortMessage || e.message).split('\n').pop()!.replace(/^.*reverted with the following reason:\s*/, '') }; break
        }
      }
      clearTimeout(slow)
      if (v.ok) c.forEach((x) => { if (x.ok === null) { x.ok = true; x.v = 'within cap (contract simulation passed)' } })
      if (live) { setChecks(c); setVerdict(v) }
    }, 250)
    return () => { live = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, s, vault, retry])

  const empty = !(Number(f.sz) > 0)
  const unavailable = verdict != null && /rate limiting|did not answer|No oracle price/.test(verdict.text)
  const phase: 'checking' | 'ok' | 'no' | 'unknown' = empty ? 'idle' as 'unknown' : !verdict ? 'checking' : verdict.ok ? 'ok' : unavailable ? 'unknown' : 'no'
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
    if (k === 'ok') {
      // size the allowed example to the headroom left under the cap, counting the vault's open exposure
      pub.readContract({ address: vault, abi, functionName: 'notionalAfter', args: [4, true, 0n] }).then((n) => {
        const cur = Number(n) / 1e6, room = s.maxLev * capUsd - cur
        const usd = Math.min(2.5 * capUsd, 0.8 * room)
        if (usd > 0) setF({ ...P.ok, sz: (usd / ethPx).toFixed(4) })
      }).catch(() => {})
    }
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
        {!canPreset && <span className="text-dim">Presets need the live ETH price and vault capital, which have not loaded.</span>}
        <button type="button" className="pre-main" aria-label="Within cap (2.5x)" disabled={!canPreset} onClick={() => preset('ok')}><span className="pre-txt">Check an ETH long under the cap<span className="pre-sub">Sized to the room left under {s.maxLev}x, counting open positions. No wallet needed.</span></span><span className="pre-go" aria-hidden="true">&rarr;</span></button>
        <div className="pre-row"><span className="pre-lbl">Or test a refusal</span>
          <button type="button" disabled={!canPreset} onClick={() => preset('lev')}>Over cap (20x)</button>
          <button type="button" disabled={!canPreset} onClick={() => preset('fake')}>Below oracle ($1)</button>
          <button type="button" disabled={!canPreset} onClick={() => preset('sol')}>Blocked market (SOL)</button>
        </div>
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

      <div className="gate" aria-live="polite">
        <div className="gate-head"><span>Contract checks</span><span className="gate-sub">{empty ? 'run when you set a size' : checks === null ? 'asking the contract\u2026' : 'simulated as the trader'}</span></div>
        {empty ? <p className="gate-idle">Choose an example or enter a size.</p> : <ul>
          {(checks && checks.length ? checks : (['Market', 'Leverage', 'Loss line', 'Frozen'] as const).map((k) => ({ k, v: checks ? 'no answer' : 'checking', ok: null as boolean | null }))).map((c) => (
            <li key={c.k}><span className="gate-k">{c.k}</span><span className="gate-v">{c.v}</span><span className={`chip chip-${c.ok === null ? 'neutral' : c.ok ? 'success' : 'danger'}`}><span className="dot" />{c.ok === null ? (phase === 'unknown' ? 'Unavailable' : 'Checking') : c.ok ? 'Pass' : 'Fail'}</span></li>
          ))}
        </ul>}
      </div>
      {readNote && <p className="verdict text-dim">{readNote}</p>}
      {verdict && !empty && <p data-k="check" className={empty ? 'verdict text-dim' : verdict.ok ? 'verdict' : 'verdict verdict-no'}>{verdict.text} {unavailable && <button type="button" className="linkish" onClick={() => setRetry((n) => n + 1)}>Retry check</button>}</p>}
      {!empty && (() => {
        const q = s.pos.find((p) => p.m === f.asset), px = Number(f.px) || (q && q.px > 0 ? pxOf(q) : null)
        if (!px) return null
        const sz = Number(f.sz), notional = sz * px, total = levAfter != null && capUsd != null ? levAfter * capUsd : notional, move = total * 0.01, room = (s.eq - s.floor) / 1e6, after = room - move
        return (
          <div className="confirm" data-k="summary">
            <div className="confirm-head"><span>Order summary</span><span className={`chip chip-${phase === 'ok' ? 'success' : phase === 'no' ? 'danger' : 'warn'}`}><span className="dot" />{phase === 'ok' ? 'Simulation passed' : phase === 'no' ? 'Contract will refuse' : phase === 'unknown' ? 'Unavailable' : 'Simulating'}</span></div>
            <p className="confirm-plain">{f.buy ? 'Buy' : 'Sell'} <b className="mono">{sz} {MK[f.asset]}</b> (about <b className="mono">${notional.toFixed(2)}</b>) {f.px ? <>at up to <b className="mono">${Number(f.px).toLocaleString('en-US')}</b></> : 'at the oracle price, within 2%'}{f.ro ? ', reduce only' : ''}.</p>
            <dl className="confirm-grid">
              <div><dt>Exposure after fill</dt><dd className={`mono ${levAfter != null && levAfter > s.maxLev ? 'neg' : ''}`}>{levAfter != null ? `${levAfter.toFixed(2)}x of ${s.maxLev}x` : '\u2013'}</dd></div>
              <div><dt>If prices move 1% against the whole book (${total.toFixed(2)})</dt><dd className="mono neg">{'\u2212'}${move.toFixed(2)}</dd></div>
              <div><dt>Room to the loss line after that</dt><dd className={`mono ${after < 0 ? 'neg' : after < room * 0.5 ? 'warnc' : 'pos'}`}>{after.toFixed(2)} USDC</dd></div>
            </dl>
            <p className="confirm-foot">Nothing is sent until you confirm in your wallet. Below the line, anyone can close the position.</p>
          </div>
        )
      })()}

      <div className="actions">
        <Button type="submit" variant={phase === 'ok' || phase === 'checking' || empty ? 'default' : 'ghost'} className={!empty && (phase === 'no' || phase === 'unknown') ? 'test-action' : undefined} disabled={busy || phase === 'checking' || empty}>{busy ? 'Waiting for the wallet\u2026' : phase === 'checking' ? 'Checking\u2026' : phase === 'ok' ? 'Send order' : phase === 'no' ? 'Test: send it and watch it revert' : empty ? 'Send order' : 'Test: send without a check'}</Button>
      </div>
      <div className="alt-path"><span className="text-dim">Or sign it and let any relayer submit:</span>
        <Button type="button" variant="ghost" size="sm" className={phase === 'no' || phase === 'unknown' ? 'test-action' : undefined} disabled={busy || phase === 'checking' || empty} onClick={sign}>{phase === 'no' || phase === 'unknown' ? 'Test: sign it anyway' : 'Sign, then submit (you pay gas)'}</Button>
      </div>
      {busy && <p className="txstate" data-k="pending"><span className="chip chip-warn"><span className="dot" />Pending</span>Confirm in your wallet, then wait for the block.</p>}
      {out && !busy && <p data-k="out" className="txstate"><span className={`chip chip-${out.ok ? 'success' : 'danger'}`}><span className="dot" />{out.ok ? 'Confirmed' : 'Failed'}</span><span>{out.text} {out.tx && <Tx hash={out.tx} />}</span></p>}
    </form>
  )
}
