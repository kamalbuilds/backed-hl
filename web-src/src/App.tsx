import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Address } from 'viem'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { connect, hhmm, loadData, loadFills, medianRun, pub, readVault, short, vaultState, type Data, type Fill, type Vault, type WriteResult } from '@/lib/backed'
import { LossRuler } from '@/components/LossRuler'
import { RulesSheet } from '@/components/RulesSheet'
import { Incidents } from '@/components/Incidents'
import { Equity } from '@/components/Equity'
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

  return (
    <>
      <header className="mast">
        <div className="mast-in">
          <span className="word">BACKED</span>
          <span className="text-dim mast-meta">Vault <Tx hash={vault} kind="address" /> · HyperEVM testnet</span>
          <Button variant="outline" size="sm" onClick={() => connect().then(setMe).catch((e) => alert(e.message))}>{me ? short(me) : 'Connect wallet'}</Button>
        </div>
      </header>

      <main className="page">
        <div className="fold">
          <section className="lead" aria-labelledby="h1">
            <h1 id="h1">A trader uses your USDC. The contract holds the line.</h1>
            <p className="lede">Every order goes through the vault contract, which checks the backer&rsquo;s rules on chain.<span className="lede-short"> Below the loss line, anyone can close it.</span><span className="lede-more"> Cross the loss line and anyone can close the account. There is no operator key.</span></p>

            <div className="status" aria-live="polite">
              {!s ? <p className="state-line">Reading the vault from HyperEVM&hellip;</p> : replay === 'crossing' ? (
                <p className="state-line alarm">Replay: line crossed, flatten() on its way&hellip; <span className="state-sub">A replay of a recorded run, not the live vault.</span></p>
              ) : replay === 'flat' && med ? (
                <p className="state-line alarm">Replay: flat in {(med.ms / 1000).toFixed(2)} s. <span className="state-sub">Not the live vault. Median of {med.runs} live runs, breach to HyperCore fill. <Tx hash={med.tx} label="Fill tx" /></span></p>
              ) : (
                <p className={st!.alarm ? 'state-line alarm' : 'state-line'}>
                  {asOf || rpcDown ? `Last confirmed: ${st!.word.toLowerCase()}` : st!.word}{eq >= floor ? `, ${(eq - floor).toFixed(2)} USDC of room.` : `, ${(floor - eq).toFixed(2)} USDC past the line.`}{' '}
                  <span className="state-sub">
                    {`Equity ${eq.toFixed(2)} against the backer's line at ${floor.toFixed(2)}`}
                    {asOf ? `, read at ${hhmm(asOf)} (page snapshot).` : readAt ? `, read from the contract at ${hhmm(readAt)}.` : '.'}
                    {rpcDown && ' RPC not answering, retrying.'}
                  </span>
                </p>
              )}
            </div>
            {s && <LossRuler eq={shownEq} floor={floor} flash={replay !== 'idle'} />}
            <p className="hint">
              <Button type="button" variant="outline" size="sm" onClick={doReplay} disabled={replay !== 'idle'}>Replay a breach</Button>
              <span className="text-dim"> (key R).</span>
              {med && isRef && <span className="measured"> Measured on this vault: flat in {(med.ms / 1000).toFixed(2)} s, median of {med.runs} live runs. <Tx hash={med.tx} label="fill tx" /></span>}
            </p>
          </section>

          <aside className="desk" aria-label="Order ticket and backer controls">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="tabs">
                <TabsTrigger value="trader">Trader</TabsTrigger>
                <TabsTrigger value="backer">Backer</TabsTrigger>
              </TabsList>
              <TabsContent value="trader">{s ? <Ticket s={s} vault={vault} abi={data.abi.vault} onSent={onSent} /> : <p className="text-dim">Waiting for the vault&hellip;</p>}</TabsContent>
              <TabsContent value="backer"><Backer vault={vault} factory={data.config.factory} abi={data.abi} onVault={(v) => { setVault(v); setS(null); setFills([]); setFillsErr(false); setFillsLoaded(false) }} onSent={onSent} /></TabsContent>
            </Tabs>
          </aside>
        </div>

        <Separator className="rule" />
        <section className="sec" aria-labelledby="rules-h">
          <div className="sec-head"><h2 id="rules-h">Rules</h2><p className="text-dim">Set by the backer when the vault is created. Values come from the contract{readAt ? `, last read at ${hhmm(readAt)}` : asOf ? `, snapshot from ${hhmm(asOf)}` : ''}.</p></div>
          {s ? <RulesSheet s={s} proof={proof} /> : <p className="text-dim">Reading rules&hellip;</p>}
        </section>

        <Separator className="rule" />
        <section className="sec" aria-labelledby="inc-h">
          <div className="sec-head"><h2 id="inc-h">Incidents</h2><p className="text-dim">Every breach and refused order from the live testnet runs on the reference vault <Tx hash={ev.vault} kind="address" />, with its transaction.{!isRef && ' The vault loaded above is a different one, so none of this is its history.'}</p></div>
          <Incidents ev={ev} />
        </section>

        <Separator className="rule" />
        <section className="sec" aria-labelledby="eq-h">
          <div className="sec-head"><h2 id="eq-h">Equity</h2><p className="text-dim">Realized PnL from this vault&rsquo;s HyperCore fills, against the line.</p></div>
          {s && <Equity readAt={readAt ?? asOf} fills={fills} eq={eq} floor={floor} loaded={fillsLoaded} failed={fillsErr} bounties={bounties} />}
        </section>

        <Separator className="rule" />
        <section className="sec" aria-labelledby="key-h">
          <div className="sec-head"><h2 id="key-h">Who holds the key</h2><p className="text-dim">Compared with a pool where an operator signs the orders.</p></div>
          <KeyTable />
        </section>

        <Separator className="rule" />
        <section className="sec" aria-labelledby="v-h">
          <div className="sec-head"><h2 id="v-h">Vaults from the factory</h2><p className="text-dim">Factory <Tx hash={data.config.factory} kind="address" />. Load any vault to read its rules.</p></div>
          {vaults && vaults.length ? (
            <ul className="vaults">
              {vaults.map((v) => (
                <li key={v}><Tx hash={v} kind="address" label={v} />{v.toLowerCase() === vault.toLowerCase() ? <span className="text-dim"> loaded</span> : <button type="button" className="linkish" onClick={() => { setVault(v); setS(null); setFills([]); setFillsErr(false); setFillsLoaded(false) }}>Load</button>}</li>
              ))}
            </ul>
          ) : <p className="text-dim">{factoryErr ? 'The factory did not answer (testnet RPC). Reload to retry.' : vaults ? 'This factory has not created any vaults yet.' : 'Reading the factory\u2026'}</p>}
        </section>
      </main>
      <footer className="foot"><p>BACKED · Colosseum World&rsquo;s Fair, Hyperliquid track · contracts on HyperEVM testnet (chain 998) · figures come from the contract and the HyperCore API with their read time shown; the only animation not driven by chain data is the breach replay, which uses the measured median timing.</p></footer>
    </>
  )
}
