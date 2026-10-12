import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { connect, hhmm, sgn, loadData, loadFills, medianRun, pub, readVault, short, vaultState, type Data, type Fill, type Vault, type WriteResult } from '@/lib/backed'
import { LossRuler } from '@/components/LossRuler'
import { RulesSheet } from '@/components/RulesSheet'
import { Incidents } from '@/components/Incidents'
import { Equity } from '@/components/Equity'
import { Judges, Checkpoints, PoolsNote } from '@/components/Judges'
import { Business } from '@/components/Business'
import { KeyTable } from '@/components/KeyTable'
import { Ticket } from '@/components/Ticket'
import { Backer } from '@/components/Backer'
import { Tx } from '@/components/Tx'

export default function App() {
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [vault, setVault] = useState<Address | null>(null)
  const [s, setS] = useState<Vault | null>(null)
  const [asOf, setAsOf] = useState<number | null>(null)
  const [rpcDown, setRpcDown] = useState(false)
  const [readAt, setReadAt] = useState<number | null>(null)
  const [fillsErr, setFillsErr] = useState(false)
  const [fills, setFills] = useState<Fill[]>([])
  const [bounties, setBounties] = useState(0)
  const [fillsLoaded, setFillsLoaded] = useState(false)
  const [me, setMe] = useState<string | null>(null)
  const [replay, setReplay] = useState<'idle' | 'crossing' | 'flat'>('idle')
  const [evTab, setEvTab] = useState('verify')
  const [acct, setAcct] = useState(false)
  const [aboutTab, setAboutTab] = useState('key')
  const [tab, setTab] = useState(() => (new URLSearchParams(location.search).get('tab') === 'backer' ? 'backer' : 'trader'))
  useEffect(() => {
    if (!vault) return
    const u = new URL(location.href); u.searchParams.set('vault', vault); if (tab === 'backer') u.searchParams.set('tab', 'backer'); else u.searchParams.delete('tab')
    history.replaceState(null, '', u)
  }, [vault, tab])
  const [vaults, setVaults] = useState<Address[] | null>(null)
  const [factoryErr, setFactoryErr] = useState(false)

  useEffect(() => {
    loadData().then((d) => {
      const q = new URLSearchParams(location.search).get('vault')
      const v = (q && /^0x[0-9a-fA-F]{40}$/.test(q) ? q : d.config.liveVault) as Address
      setData(d); setVault(v)
      if (d.snapshot && d.snapshot.vault.toLowerCase() === v.toLowerCase()) { setS(d.snapshot); setAsOf(d.snapshot.at) }
    }).catch((e) => setErr(String(e.message)))
  }, [])

  const refresh = useCallback(async () => {
    if (!data || !vault) return
    try { setS(await readVault(data.abi.vault, vault)); setAsOf(null); setReadAt(Date.now()); setRpcDown(false) } catch { setRpcDown(true) }
  }, [data, vault])
  const refreshFills = useCallback(async () => {
    if (!vault) return
    try { const r = await loadFills(vault); setFills(r.fills); setBounties(r.bounties); setFillsErr(false) } catch { setFillsErr(true) }
    setFillsLoaded(true)
  }, [vault])

  useEffect(() => {
    if (!data || !vault) return
    refresh(); refreshFills()
    pub.readContract({ address: data.config.factory, abi: data.abi.factory, functionName: 'all' }).then((a) => { setVaults((a as Address[]).slice().reverse()); setFactoryErr(false) }).catch(() => setFactoryErr(true))
    const a = setInterval(refresh, 8000), b = setInterval(refreshFills, 60000)
    return () => { clearInterval(a); clearInterval(b) }
  }, [data, vault, refresh, refreshFills])

  const med = useMemo(() => (data ? medianRun(data.evidence) : null), [data])
  const doReplay = useCallback(() => {
    if (!med || replay !== 'idle') return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    setReplay('crossing')
    setTimeout(() => { setReplay('flat'); setTimeout(() => setReplay('idle'), 7000) }, reduce ? 0 : med.ms)
  }, [med, replay])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey && !/INPUT|SELECT|TEXTAREA/.test((document.activeElement as HTMLElement)?.tagName)) doReplay() }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [doReplay])

  const onSent = (r: WriteResult) => { if (r.tx) refresh() }

  if (err) return <main className="page"><p className="state-line">Could not load the vault data file ({err}). Reload the page.</p></main>
  if (!data || !vault) return <main className="page"><p className="state-line">Loading the vault&hellip;</p></main>

  const ev = data.evidence
  const find = (re: RegExp) => ev.groups.flatMap((g) => g.items).find((i) => re.test(i.label))?.tx
  const isRef = vault.toLowerCase() === ev.vault.toLowerCase()
  const proof = !isRef ? {} : { market: find(/SOL|market/i), stacked: find(/stacked/i), floor: find(/equity floor/i), flatten: med?.tx, frozen: find(/reopen/i) }
  const eq = s ? s.eq / 1e6 : 0, floor = s ? s.floor / 1e6 : 0
  const st = s ? vaultState(s) : null
  const shownEq = replay === 'crossing' ? floor - 0.05 : eq

  const shownRoom = shownEq - floor
  const chip = !st ? null : s!.settled ? 'neutral' : st.alarm ? 'danger' : 'success'
  const chipWord = (!st ? 'Reading' : s!.settled ? 'Settled' : s!.breached ? 'Frozen' : s!.reason ? 'Below line' : 'Armed') + (st && (rpcDown || asOf) ? ' at' : '')
  const loadVault = (v: Address) => { setVault(v); setS(null); setFills([]); setFillsErr(false); setFillsLoaded(false) }

  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <span className="word"><span className="word-mark" aria-hidden="true"><i /></span>BACKED</span>
          <span className="pill mono" title={vault}>{short(vault)}</span>
          <span className="chip chip-info"><span className="dot" />HyperEVM testnet</span>
          <nav className="topnav" aria-label="Sections"><a href="#judges" onClick={() => setEvTab('verify')}>Verify on chain</a><a href="#judges" onClick={() => setEvTab('rules')}>Rules</a><a href="#business" onClick={() => setAboutTab('business')}>Business</a></nav>
          <Button size="sm" variant={me ? 'secondary' : 'default'} className="topbar-cta" onClick={() => connect().then(setMe).catch((e) => alert(e.message))}>{me ? short(me) : 'Connect wallet'}</Button>
        </div>
      </header>

      <main className="console">
        <section className="hero" aria-labelledby="h1">
          <div>
            <div className="hero-top">
              <h1 id="h1">The payout is code. No key exists.</h1>
              <span className="chip chip-info net-m"><span className="dot" />Testnet</span>
              {chip && <span className={`chip chip-${chip === 'success' && (rpcDown || asOf) ? 'warn' : chip}`}><span className="dot" />{chipWord}{rpcDown ? `${readAt ? ` ${hhmm(readAt)}` : asOf ? ` ${hhmm(asOf)}` : ''} · RPC retrying` : asOf ? ` ${hhmm(asOf)} · snapshot` : readAt ? ` · live ${hhmm(readAt)}` : ''}</span>}
            </div>
            <p className="hero-sub-m">The payout is code and no key exists: the contract checks every order and pays the trader&rsquo;s share.</p>
            <p className="hero-sub">No gateway, no API wallet, a payout nobody can deny. A trader trades your USDC, every order goes through this contract, the profit split is fixed in its code, and below the loss line anyone can close the book.</p>
          </div>
        </section>


        <div className="layout">
          <div className="col-main">
        <section className="card m-first instrument" aria-labelledby="line-h">
              <div className="card-head"><div><h2 id="line-h">Loss line</h2><p className="card-sub">PnL against the backer&rsquo;s line, read from the contract.</p></div>{replay !== 'idle' ? <span className="chip chip-warn"><span className="dot" />Replay</span> : <span className="head-acts"><a className="proof-jump" href="#judges" onClick={() => setEvTab('verify')}>Verify recorded run</a><Button type="button" variant="ghost" size="sm" className="replay-btn" onClick={doReplay}>Replay a breach</Button></span>}</div>
              {s && <div className="line-hero"><span className={`line-big mono ${shownRoom < 0 ? 'neg' : ''}${asOf || rpcDown ? ' is-stale' : ''}`}>{Math.abs(shownRoom).toFixed(2)}</span>{(asOf || rpcDown) && (readAt || asOf) ? <span className="chip chip-warn big-stale"><span className="dot" />{asOf ? 'Snapshot' : 'Stale'} {hhmm((readAt ?? asOf)!)}</span> : null}<span className="line-cap">USDC {shownRoom >= 0 ? 'of room above the line' : 'past the line, anyone can flatten'}{replay !== 'idle' && ' (replay)'}<br /><span className="line-cap-sub">PnL {sgn(shownEq)} · line {floor.toFixed(2)} · then <code>flatten()</code> by anyone{(asOf || rpcDown) && (readAt || asOf) ? <span className="stale"> · last confirmed {hhmm((readAt ?? asOf)!)}</span> : null}</span></span></div>}
              {(asOf || rpcDown) && (readAt || asOf) ? <p className="stale-m">Last confirmed {hhmm((readAt ?? asOf)!)}</p> : null}
              <p className="cap-m">Below the red line, anyone can close the positions.</p>
              {s && <LossRuler eq={shownEq} floor={floor} flash={replay !== 'idle'} />}
              <button type="button" className="acct-toggle" aria-expanded={acct} onClick={() => setAcct(!acct)}>{acct ? 'Hide account details' : 'Account details'}</button>
              <div className={`metrics${acct ? ' open' : ''}`} aria-label="Vault summary">
          <div className="metric"><span className="metric-label">Account value</span><span className="metric-value mono">{s ? ((s.cap + s.eq) / 1e6).toFixed(2) : '\u2013'}</span><span className="metric-sub">USDC · capital {s ? (s.cap / 1e6).toFixed(2) : '\u2013'}</span></div>
          <div className="metric"><span className="metric-label">PnL vs capital{s && s.cap > 0 ? <span className={`metric-pct ${eq < 0 ? 'neg' : 'pos'}`}> {eq >= 0 ? '+' : '\u2212'}{Math.abs((eq / (s.cap / 1e6)) * 100).toFixed(2)}%</span> : null}</span><span className={`metric-value mono ${eq < 0 ? 'neg' : 'pos'}`}>{s ? sgn(eq) : '\u2013'}</span><span className="metric-sub">USDC{readAt ? ` · read ${hhmm(readAt)}` : asOf ? ` · snapshot ${hhmm(asOf)}` : ''}</span></div>
          <div className="metric"><span className="metric-label">Positions</span><span className="metric-value mono">{s ? s.pos.filter((p) => p.szi).length : '\u2013'}</span><span className="metric-sub">{s ? (s.pos.some((p) => p.szi) ? s.pos.filter((p) => p.szi).map((p) => ({ 4: 'ETH', 3: 'BTC', 5: 'SOL' } as Record<number, string>)[p.m] ?? p.m).join(' · ') : 'flat on HyperCore') : ''}</span></div>
          <div className="metric"><span className="metric-label">Leverage cap</span><span className="metric-value mono">{s ? `${s.maxLev}x` : '\u2013'}</span><span className="metric-sub">{s ? s.markets.map((m) => ({ 4: 'ETH', 3: 'BTC', 5: 'SOL' } as Record<number, string>)[m] ?? m).join(' · ') : ''} at oracle price</span></div>
          <a className="metric metric-link" href="#judges" onClick={() => setEvTab('incidents')} aria-label="Breach to flat, see the recorded runs"><span className="metric-label">Breach to flat <span className="metric-go">proof</span></span><span className="metric-value mono">{med ? `${(med.ms / 1000).toFixed(2)}s` : '\u2013'}</span><span className="metric-sub">testnet, median of {med?.runs ?? 5} runs</span></a>
              </div>
              <div className="status" aria-live="polite">
                {!s ? (rpcDown ? <p className="state-line">Could not read this vault (testnet RPC). <Button type="button" variant="ghost" size="sm" onClick={() => location.reload()}>Retry</Button></p> : <p className="state-line">Reading the vault from HyperEVM&hellip;</p>) : replay === 'crossing' ? (
                  <p className="state-line alarm">Replay: line crossed, flatten() on its way&hellip; <span className="state-sub">A recorded run, not the live vault.</span></p>
                ) : replay === 'flat' && med ? (
                  <p className="state-line alarm">Replay: flat in {(med.ms / 1000).toFixed(2)} s. <span className="state-sub">Median of {med.runs} live runs. <Tx hash={med.tx} label="Fill tx" /></span></p>
                ) : st!.alarm ? (
                  <p className={st!.alarm ? 'state-line alarm' : 'state-line'}>{asOf || rpcDown ? `Last confirmed: ${st!.word.toLowerCase()}` : st!.word}.</p>
                ) : null}
              </div>
            </section>


            <Checkpoints onAll={() => setEvTab('verify')} revertTx={find(/stacked/i) ?? undefined} />
            <section className="card" aria-labelledby="eq-h">
              <div className="card-head"><div><h2 id="eq-h">Realized PnL</h2><p className="card-sub">{fills.length ? `${fills.length} HyperCore fills on this vault, ${new Date(fills[0].time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} to ${new Date(fills[fills.length - 1].time).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} IST, after fees.` : 'Realized PnL from this vault\u2019s HyperCore fills.'}</p></div>{fillsErr && <span className="chip chip-warn"><span className="dot" />Fills refresh failed, showing cached</span>}</div>
              {s && <Equity readAt={readAt ?? asOf} fills={fills} eq={eq} floor={floor} loaded={fillsLoaded} failed={fillsErr} bounties={bounties} />}
            </section>
          </div>

          <aside className="col-side" id="ticket" aria-label="Order desk">
            <section className="card desk">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="tabs">
                  <TabsTrigger value="trader">Trader</TabsTrigger>
                  <TabsTrigger value="backer">Backer</TabsTrigger>
                </TabsList>
                <TabsContent value="trader">{s ? <Ticket s={s} vault={vault} abi={data.abi.vault} onSent={onSent} readNote={asOf ? `Rules as of the snapshot at ${hhmm(asOf)}; the verdict is a fresh simulation.` : rpcDown && readAt ? `Rules last read at ${hhmm(readAt)}; RPC not answering.` : undefined} /> : <p className="text-dim">Waiting for the vault&hellip;</p>}</TabsContent>
                <TabsContent value="backer"><Backer vault={vault} factory={data.config.factory} abi={data.abi} onVault={loadVault} onSent={onSent} /></TabsContent>
              </Tabs>
            </section>
            <section className="card guarantees" aria-labelledby="g-h">
              <div className="card-head"><div><h2 id="g-h">What no one can do</h2><p className="card-sub">Enforced by the vault contract, not an operator.</p></div><span className="chip chip-info"><span className="dot" />No operator key</span></div>
              <ul>
                <li><span className="g-k">Skip the rules</span><span>Only the vault contract can place an order, and it checks market, leverage and the loss line first.</span></li>
                <li><span className="g-k">Keep a losing trade open</span><span>Below the line, anyone can call <code>flatten()</code> and is paid a bounty for it.</span></li>
                <li><span className="g-k">Withhold the payout</span><span>The profit split is fixed at creation and paid by <code>settle()</code>.</span></li>
              </ul>
              <a className="cp-all" href="#business" onClick={() => setAboutTab('key')}>Full comparison with an operator-run pool</a>
            </section>
          </aside>
        </div>

        <section className="card evidence" aria-labelledby="ev-h" id="judges">
          <div className="card-head"><div><h2 id="ev-h">Recorded contract walkthrough</h2><p className="card-sub">Run end to end on 11 Oct, backer and trader on separate wallets. Every hash opens the explorer.</p></div><span className="chip chip-info"><span className="dot" />Recorded 11 Oct 2026</span></div>
          <Tabs value={evTab} onValueChange={setEvTab}>
            <TabsList className="seg">
              <TabsTrigger value="verify">Verify on chain</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            <TabsContent value="verify" id="verify"><Judges factory={data.config.factory} /></TabsContent>
            <TabsContent value="incidents" id="incidents"><p className="card-sub tab-sub">Breaches and refused orders on the reference vault <Tx hash={ev.vault} kind="address" />.{!isRef && ' Not the vault loaded above.'}</p><Incidents ev={ev} /></TabsContent>
            <TabsContent value="rules" id="rules"><p className="card-sub tab-sub">Set at creation, enforced on every order{readAt ? `; read ${hhmm(readAt)}` : ''}.</p>{s ? <RulesSheet s={s} proof={proof} /> : <p className="text-dim">Reading rules&hellip;</p>}</TabsContent>
          </Tabs>
        </section>
        <section className="card card-quiet about" aria-labelledby="about-h" id="business">
          <div className="card-head"><div><h2 id="about-h">About BACKED</h2><p className="card-sub">How it compares, who pays, and every vault the factory made.</p></div></div>
          <Tabs value={aboutTab} onValueChange={setAboutTab}>
            <TabsList className="seg">
              <TabsTrigger value="key">Who holds the key</TabsTrigger>
              <TabsTrigger value="business">Business model</TabsTrigger>
              <TabsTrigger value="vaults">Vaults</TabsTrigger>
            </TabsList>
            <TabsContent value="key" id="key-h"><KeyTable /><PoolsNote /></TabsContent>
            <TabsContent value="business"><Business /></TabsContent>
            <TabsContent value="vaults"><p className="card-sub tab-sub">Factory <Tx hash={data.config.factory} kind="address" />.</p>
              {vaults && vaults.length ? (
                <ul className="vaults">
                  {vaults.map((v) => (
                    <li key={v}><span className="mono">{short(v)}</span>{v.toLowerCase() === vault.toLowerCase() ? <span className="chip chip-success"><span className="dot" />Loaded</span> : <Button type="button" variant="ghost" size="sm" onClick={() => loadVault(v)}>Load</Button>}</li>
                  ))}
                </ul>
              ) : <p className="text-dim">{factoryErr ? 'The factory did not answer (testnet RPC). Reload to retry.' : vaults ? 'No vaults yet.' : 'Reading the factory\u2026'}</p>}
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <footer className="foot">BACKED · Colosseum World&rsquo;s Fair, Hyperliquid track · HyperEVM testnet (chain 998) · the breach replay is the only animation not driven by chain data.</footer>
    </>
  )
}
