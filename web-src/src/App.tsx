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
import { Positions, Fills } from '@/components/Grids'

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
  const [gridTab, setGridTab] = useState('positions')
  const [statsOpen, setStatsOpen] = useState(false)
  const [mws, setMws] = useState<'trade' | 'risk' | 'activity'>('trade')
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
      const snap = [d.snapshot, d.snapshotStopped].find((x) => x && x.vault.toLowerCase() === v.toLowerCase())
      if (snap) { setS(snap); setAsOf(snap.at) }
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

  const live = vault.toLowerCase() === data.config.liveVault.toLowerCase()
  const stopped = !!data.config.stoppedVault && vault.toLowerCase() === data.config.stoppedVault.toLowerCase()
  const cap = s ? s.cap / 1e6 : 0
  const openN = s ? s.pos.filter((p) => p.szi).length : 0
  const roomPct = s && cap > 0 ? Math.max(0, Math.min(100, (shownRoom / Math.abs(floor || 1)) * 100)) : 0
  const frozen = !!s && (s.breached || s.settled)
  const go = (t: string) => { setGridTab(t); setMws('activity'); document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const stale = (asOf || rpcDown) && (readAt || asOf)

  return (
    <div className="term">
      <header className="tbar">
        <span className="word"><span className="word-mark" aria-hidden="true"><i /></span>BACKED</span>
        <div className="vsel" role="group" aria-label="Vault">
          {data.config.stoppedVault ? <>
            <a className={`vsel-o${live ? ' on' : ''}`} href="./" aria-current={live ? 'page' : undefined}>Live vault</a>
            <a className={`vsel-o${stopped ? ' on' : ''}`} href={`?vault=${data.config.stoppedVault}`} aria-current={stopped ? 'page' : undefined}>Stopped vault</a>
          </> : null}
          <span className="vsel-addr mono" title={vault}><Tx hash={vault} kind="address" label={short(vault)} /></span>
        </div>
        <span className="net"><span className="dot" /><span className="hide-s">HyperEVM </span>testnet<span className="hide-s"> · 998</span></span>
        <nav className="tnav" aria-label="Sections"><a href="#grid" onClick={() => go('receipts')}>Receipts</a><a href="#grid" onClick={() => go('rules')}>Rules</a><a href="#grid" onClick={() => go('key')}>vs. operator pools</a></nav>
        <Button size="sm" variant={me ? 'secondary' : 'default'} className="tbar-cta" onClick={() => connect().then(setMe).catch((e) => alert(e.message))}>{me ? short(me) : 'Connect wallet'}</Button>
      </header>

      <div className="truths" role="note" aria-label="What the contract guarantees">
        <span className="truth"><b>Rules enforced on chain</b> market, leverage and loss line are checked inside <code>trade()</code></span>
        <span className="truth"><b>No operator key</b> only the vault contract can place an order</span>
        <span className="truth"><b>Anyone can flatten</b> below the line, for a {s ? (s.bo / 1e6).toFixed(2) : '0.10'} USDC bounty{proof.flatten ? <> · <Tx hash={proof.flatten} label="receipt" /></> : null}</span>
        {stopped && <span className="truth warn-t"><b>Stopped example</b> crossed its line on 11 Oct, flattened, frozen: new orders revert. <a className="tx" href="./">Open the live vault</a></span>}
      </div>

      <nav className="mnav" aria-label="Workspace">{(['trade', 'risk', 'activity'] as const).map((w) => <button key={w} type="button" aria-pressed={mws === w} onClick={() => { setMws(w); if (w === 'activity') setGridTab('positions'); scrollTo({ top: 0 }) }}>{w === 'trade' ? 'Trade' : w === 'risk' ? 'Risk' : 'Activity'}</button>)}</nav>
      <section className={`stats${statsOpen ? ' open' : ''}`} aria-label="Vault status">
        <div className="stat stat-status">
          <span className="k">Status</span>
          {chip ? <span className={`chip chip-${chip === 'success' && stale ? 'warn' : chip}`}><span className="dot" />{chipWord.replace(/ at$/, '')}</span> : <span className="v">&ndash;</span>}
          <span className="s">{rpcDown ? `last confirmed ${hhmm((readAt ?? asOf ?? Date.now()))} · retrying` : asOf ? `snapshot ${hhmm(asOf)} · live read pending` : readAt ? `live · read ${hhmm(readAt)}` : 'reading'}</span>
        </div>
        <div className="stat"><span className="k">{frozen ? 'Distance to loss line' : 'Room to loss line'}</span><span className={`v ${shownRoom < 0 ? 'neg' : shownRoom < Math.abs(floor) * 0.3 ? 'warn' : 'pos'}`}>{s ? sgn(shownRoom) : '\u2013'}<small> USDC</small></span><span className="s">{!s ? '' : s.settled ? 'crossed; flattened and settled' : s.breached ? 'crossed; flattened, orders revert' : shownRoom >= 0 ? `${roomPct.toFixed(0)}% of the line left` : 'past the line: anyone can flatten()'}</span></div>
        <div className="stat"><span className="k">Account value</span><span className="v">{s ? ((s.cap + s.eq) / 1e6).toFixed(2) : '\u2013'}<small> USDC</small></span><span className="s">of {s ? cap.toFixed(2) : '\u2013'} backer capital</span></div>
        <div className="stat"><span className="k">PnL</span><span className={`v ${eq < 0 ? 'neg' : eq > 0 ? 'pos' : ''}`}>{s ? sgn(eq) : '\u2013'}<small> {s && cap > 0 ? `${eq >= 0 ? '+' : '\u2212'}${Math.abs((eq / cap) * 100).toFixed(2)}%` : ''}</small></span><span className="s">trader gets {s ? (s.sh / 100).toFixed(0) : '\u2013'}% of profit</span></div>
        <div className="stat"><span className="k">Loss line</span><span className="v neg">{s ? floor.toFixed(2) : '\u2013'}<small> USDC</small></span><span className="s">{s && cap > 0 ? `${Math.abs((floor / cap) * 100).toFixed(1)}% of capital, then frozen` : ''}</span></div>
        {frozen ? <div className="stat"><span className="k">New-order capacity</span><span className="v neg">0<small> USDC</small></span><span className="s">orders revert; configured cap {s!.maxLev}x</span></div>
          : <div className="stat"><span className="k">Leverage cap</span><span className="v">{s ? `${s.maxLev}x` : '\u2013'}</span><span className="s">{s ? `max ${(s.maxLev * cap).toFixed(2)} USDC notional` : ''}</span></div>}
        <button type="button" className="stat stat-btn" onClick={() => go('incidents')}><span className="k">Breach to flat</span><span className="v">{med ? `${(med.ms / 1000).toFixed(2)}s` : '\u2013'}</span><span className="s">median of {med?.runs ?? 5} live testnet runs</span></button>
        <button type="button" className="stats-more" aria-expanded={statsOpen} onClick={() => setStatsOpen(!statsOpen)}>{statsOpen ? 'Fewer metrics' : 'PnL, loss line, leverage, breach-to-flat'}</button>
      </section>

      <div className="tgrid" data-mws={mws}>
        <section className="pane pane-chart" id="risk" aria-labelledby="line-h">
          <div className="pane-h">
            <h2 id="line-h">Loss line</h2>
            <span className="pane-sub">PnL vs the backer&rsquo;s line, read from the contract{stale ? ` · last confirmed ${hhmm((readAt ?? asOf)!)}` : ''}</span>
            {replay !== 'idle' ? <span className="chip chip-warn"><span className="dot" />Replay of a recorded run</span> : <Button type="button" variant="ghost" size="sm" className="replay-btn" onClick={doReplay}>Replay a breach</Button>}
          </div>
          <div className="risk">
          <div className="risk-ruler">{s && <LossRuler eq={shownEq} floor={floor} flash={replay !== 'idle'} />}
            <div className="risk-proof"><h3 className="rp-h">Recorded 11 Oct on vault <Tx hash="0x622Ef31120de6191f4067a73e15256a5F5e8d0B2" kind="address" /> (now the stopped example)</h3><Checkpoints onAll={() => go('receipts')} revertTx={find(/stacked/i) ?? undefined} /></div>
          <div className="status" aria-live="polite">
            {!s ? (rpcDown ? <p className="state-line alarm">The public testnet RPC did not answer for this vault. Fills, receipts and rules below still load. <Button type="button" variant="ghost" size="sm" onClick={() => location.reload()}>Retry</Button></p> : <p className="state-line">Reading the vault from HyperEVM&hellip;</p>)
              : replay === 'crossing' ? <p className="state-line alarm">Replay: line crossed, flatten() on its way&hellip; <span className="state-sub">A recorded run, not the live vault.</span></p>
              : replay === 'flat' && med ? <p className="state-line alarm">Replay: flat in {(med.ms / 1000).toFixed(2)} s. <span className="state-sub">Median of {med.runs} live runs. <Tx hash={med.tx} label="Fill tx" /></span></p>
              : st!.alarm ? <p className="state-line alarm">{stale ? `Last confirmed: ${st!.word.toLowerCase()}` : st!.word}.</p> : null}
          </div>
          </div>
          {s && <div className="risk-eq"><div className="pane-h pane-h2"><h3>Realized PnL</h3><span className="pane-sub">{fills.length ? `${fills.length} HyperCore fills, after fees` : 'from this vault\u2019s HyperCore fills'}</span>{fillsErr && <span className="chip chip-warn"><span className="dot" />Fills refresh failed, cached</span>}</div>
          <Equity readAt={readAt ?? asOf} fills={fills} eq={eq} floor={floor} loaded={fillsLoaded} failed={fillsErr} bounties={bounties} /></div>}
          </div>
        </section>

        <aside className="pane pane-ticket" id="ticket" aria-label="Order entry">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="ttabs">
              <TabsTrigger value="trader">Trade</TabsTrigger>
              <TabsTrigger value="backer">Back a trader</TabsTrigger>
            </TabsList>
            <TabsContent value="trader">{frozen && <p className="frozen-note" role="note"><b>{s!.settled ? 'Settled vault' : 'Frozen vault'}:</b> it crossed its loss line and was flattened, so every new order reverts on chain. The checks below still simulate, so you can see the refusal. </p>}{frozen && <a className="go-live" href="./">Trade the live vault &rarr;</a>}{s ? <Ticket s={s} vault={vault} abi={data.abi.vault} onSent={onSent} readNote={asOf ? `Rules as of the snapshot at ${hhmm(asOf)}; each check re-simulates on chain when you run it.` : rpcDown && readAt ? `Rules last read at ${hhmm(readAt)}; RPC not answering.` : undefined} /> : <p className="grid-empty">{rpcDown ? 'Order entry needs the vault\u2019s rules from the RPC, which is not answering. It retries every 8 s.' : 'Reading the vault\u2019s rules\u2026'}</p>}</TabsContent>
            <TabsContent value="backer"><Backer vault={vault} factory={data.config.factory} abi={data.abi} onVault={loadVault} onSent={onSent} /></TabsContent>
          </Tabs>
          <dl className="acct" aria-label="Account">
            <div><dt>Backer</dt><dd className="mono">{s ? <Tx hash={s.backer} kind="address" /> : '\u2013'}</dd></div>
            <div><dt>Trader</dt><dd className="mono">{s ? <Tx hash={s.trader} kind="address" /> : '\u2013'}</dd></div>
            <div><dt>Daily loss limit</dt><dd className="mono">{s ? (s.dl ? `${(s.dl / 1e6).toFixed(2)} USDC` : 'off') : '\u2013'}</dd></div>
            <div><dt>Flatten bounty</dt><dd className="mono">{s ? `${(s.bo / 1e6).toFixed(2)} USDC` : '\u2013'}</dd></div>
            <div><dt>Factory</dt><dd className="mono"><Tx hash={data.config.factory} kind="address" /></dd></div>
          </dl>
        </aside>

        <section className="pane pane-grid" id="grid" aria-label="Positions, fills and receipts">
          <Tabs value={gridTab} onValueChange={setGridTab}>
            <TabsList className="gtabs">
              <TabsTrigger value="positions">Positions{s ? ` (${openN})` : ''}</TabsTrigger>
              <TabsTrigger value="fills">Fills{fillsLoaded ? ` (${fills.length})` : ''}</TabsTrigger>
              <TabsTrigger value="rules">Contract rules</TabsTrigger>
              <TabsTrigger value="receipts">On-chain receipts</TabsTrigger>
              <TabsTrigger value="incidents">Breaches &amp; refusals</TabsTrigger>
              <TabsTrigger value="key">vs. operator pools</TabsTrigger>
              <TabsTrigger value="vaults">Vaults{vaults ? ` (${vaults.length})` : ''}</TabsTrigger>
            </TabsList>
            <TabsContent value="positions">{s ? <Positions s={s} /> : <p className="grid-empty">Reading positions&hellip;</p>}</TabsContent>
            <TabsContent value="fills"><Fills fills={fills} loaded={fillsLoaded} failed={fillsErr} /></TabsContent>
            <TabsContent value="rules"><p className="grid-note">Set at creation, enforced on every order{readAt ? `; read ${hhmm(readAt)}` : ''}.</p>{s ? <RulesSheet s={s} proof={proof} /> : <p className="grid-empty">Reading rules&hellip;</p>}</TabsContent>
            <TabsContent value="receipts"><p className="grid-note">Recorded end to end on 11 Oct with backer and trader on separate wallets. Each hash opens a receipt read live from the testnet RPC.</p><Checkpoints onAll={() => setGridTab('receipts')} revertTx={find(/stacked/i) ?? undefined} /><Judges factory={data.config.factory} /></TabsContent>
            <TabsContent value="incidents"><p className="grid-note">Breaches and refused orders on the reference vault <Tx hash={ev.vault} kind="address" />.{!isRef && ' Not the vault loaded above.'}</p><Incidents ev={ev} /></TabsContent>
            <TabsContent value="key"><KeyTable /><PoolsNote /><Business /></TabsContent>
            <TabsContent value="vaults"><p className="grid-note">Every vault the factory <Tx hash={data.config.factory} kind="address" /> created.</p>
              {vaults && vaults.length ? (
                <table className="dgrid"><thead><tr><th>Vault</th><th>Role</th><th></th></tr></thead><tbody>
                  {vaults.map((v) => (
                    <tr key={v}><td className="mono"><Tx hash={v} kind="address" /></td><td>{v.toLowerCase() === data.config.liveVault.toLowerCase() ? 'Live demo' : v.toLowerCase() === data.config.stoppedVault?.toLowerCase() ? 'Stopped example' : 'Factory vault'}</td><td className="r">{v.toLowerCase() === vault.toLowerCase() ? <span className="chip chip-success"><span className="dot" />Loaded</span> : <Button type="button" variant="ghost" size="sm" onClick={() => loadVault(v)}>Load</Button>}</td></tr>
                  ))}
                </tbody></table>
              ) : <p className="grid-empty">{factoryErr ? 'The factory did not answer (testnet RPC). Reload to retry.' : vaults ? 'No vaults yet.' : 'Reading the factory\u2026'}</p>}
            </TabsContent>
          </Tabs>
        </section>
      </div>
      <footer className="foot">BACKED · Colosseum World&rsquo;s Fair, Hyperliquid track · HyperEVM testnet (chain 998) · the breach replay is the only animation not driven by chain data.</footer>
    </div>
  )
}
