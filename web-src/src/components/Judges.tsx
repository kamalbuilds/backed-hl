import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tx } from '@/components/Tx'

// Transactions from the live rule-lock run on 11 Oct 2026 (scripts/live-lock-flow.mjs, evidence/lock-live-flow.jsonl).
export const E2E = {
  vault: '0x622Ef31120de6191f4067a73e15256a5F5e8d0B2',
  create: '0xa77498e27c31453b866b168f2b5953c42d92cc58c3d78b9be566e60bd2f0a2a7',
  fund: '0x9b710f50016ead0493ef344969ce586aff056a5cddd116e24c0c69e2d480a8d0',
  trade: '0x46577abb928956a4b74b1096ba1ef80c0136003bec83996a5f510aaa8c3dff08',
  floor: '0x356ea6833e337cf8bd73d8244ed6044b8d5fd5776832951bf396acf4f21b142d',
  floorAbove: '0x37eb34e3a70f8ae666257f5895f294b474b82f3c7109932c86ab3c810dc34ef0',
  daily: '0x7f789ba4c3e65cdd513dea11ad7c0e10bf46ecada56d554edfee10e16c76d5fd',
  capital: '0x548b5021b9eadafbc2d4a5d10e08eb24e54e3fa6887b832d85c0b00ba04866b6',
  stop: '0xa6e606d236b759a9cac8f74b922267248c8595ea4d85ffc3fc99752045cdd484',
  flatten: '0x4d3be672cf33909b15bcca42e00d533a4c1c03660c89349a34707bdb88635ff4',
  settle: '0xd0d0b23477a4669109ec3abc4df38d57c9d8c2a5729b9d08303eb4dbf6f9e30c',
}

export function Judges({ factory }: { factory: string }) {
  const real = [
    ['Rule checks, leverage cap, frozen state, settle split', 'Real: HyperEVM testnet contracts, 39 forge tests'],
    ['Rules lock after the first order', 'Real: four backer transactions reverted on the vault above, each with its reason; every lock guard mutation-checked'],
    ['Orders, fills, flatten closes', 'Real: HyperCore testnet fills you can query by vault address'],
    ['Public keeper and breach-to-flat timing', 'Real: measured on testnet, five funded runs plus this click-through'],
    ['Daily loss limit, flatten bounty, sweep', 'Real: daily breach on the reference vault on 11 Oct, flat in about 2 s by the keeper; 0.1 USDC bounty paid to the flattener; leftover USDC swept to the backer'],
    ['Retry after a missed price band; profit split when there is a profit', 'Simulated HyperCore on a local chain plus forge tests'],
    ['Breach replay on the ruler', 'Simulated: animation only, timed with the measured median'],
  ]
  return (
    <div className="judges">
      <p className="walk-cap">Recorded walkthrough, 11 Oct 2026: vault <Tx hash={E2E.vault} kind="address" />, from factory <Tx hash={factory} kind="address" />. The backer and the trader are different wallets.</p>
      <details className="proof-more"><summary>All 10 recorded steps</summary>
      <ol className="runlog">
        <li><span className="step-n">1</span><span className="run-what"><strong>Vault created</strong><span>by the factory, trader on a separate wallet</span></span><span className="run-tx"><Tx hash={E2E.create} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="step-n">2</span><span className="run-what"><strong>Margin funded</strong><span>15.9 USDC moved to the vault\u2019s HyperCore margin</span></span><span className="run-tx"><Tx hash={E2E.fund} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="step-n">3</span><span className="run-what"><strong>First order placed</strong><span>sent by the vault contract to HyperCore; the rules lock here</span></span><span className="run-tx"><Tx hash={E2E.trade} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="step-n">4</span><span className="run-what"><strong>20x order refused</strong><span>&ldquo;leverage above backer limit&rdquo;, never sent</span></span><span className="run-tx"><span className="text-dim">no tx by design</span></span><span className="chip chip-danger"><span className="dot" />Refused</span></li>
        <li><span className="step-n">5</span><span className="run-what"><strong>Backer tightens the floor</strong><span>&ldquo;floor tightened&rdquo;, rules unchanged</span></span><span className="run-tx"><Tx hash={E2E.floor} /></span><span className="chip chip-danger"><span className="dot" />Reverted</span></li>
        <li><span className="step-n">6</span><span className="run-what"><strong>Backer sets a floor above principal</strong><span>&ldquo;floor above principal&rdquo;</span></span><span className="run-tx"><Tx hash={E2E.floorAbove} /></span><span className="chip chip-danger"><span className="dot" />Reverted</span></li>
        <li><span className="step-n">7</span><span className="run-what"><strong>Backer tightens the daily limit</strong><span>&ldquo;daily tightened&rdquo;</span></span><span className="run-tx"><Tx hash={E2E.daily} /></span><span className="chip chip-danger"><span className="dot" />Reverted</span></li>
        <li><span className="step-n">8</span><span className="run-what"><strong>Backer changes the capital</strong><span>&ldquo;rules locked&rdquo;</span></span><span className="run-tx"><Tx hash={E2E.capital} /></span><span className="chip chip-danger"><span className="dot" />Reverted</span></li>
        <li><span className="step-n">9</span><span className="run-what"><strong>Backer exit: stop, then flatten</strong><span>stop halts new orders, anyone flattens</span></span><span className="run-tx"><Tx hash={E2E.stop} /> <Tx hash={E2E.flatten} /></span><span className="chip chip-success"><span className="dot" />Flat</span></li>
        <li><span className="step-n">10</span><span className="run-what"><strong>Settled from flat equity</strong><span>15.82 USDC to the backer; the trader share is 20% of profit</span></span><span className="run-tx"><Tx hash={E2E.settle} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
      </ol>
      </details>
      <details className="proof-more">
        <summary>Real vs simulated, piece by piece</summary>
        <Table className="sheet proof-sheet">
          <TableHeader><TableRow><TableHead className="w-[18rem]">Piece</TableHead><TableHead className="w-[8rem]">Status</TableHead><TableHead>Evidence</TableHead></TableRow></TableHeader>
          <TableBody>{real.map(([a, b]) => { const k = /^Real/.test(b) ? 'success' : /^Simulated/.test(b) ? 'warn' : 'neutral'; const w = k === 'success' ? 'Real' : k === 'warn' ? 'Simulated' : 'Not deployed'; return <TableRow key={a}><TableCell className="whitespace-normal">{a}</TableCell><TableCell><span className={`chip chip-${k}`}><span className="dot" />{w}</span></TableCell><TableCell className="whitespace-normal">{b.replace(/^(Real|Simulated|Not deployed)[:.]?\s*/, '')}</TableCell></TableRow> })}</TableBody>
        </Table>
      </details>
    </div>
  )
}

export function Checkpoints({ onAll, revertTx }: { onAll: () => void; revertTx?: string }) {
  return (
    <section className="card checkpoints m-cp" aria-labelledby="cp-h">
      <div className="card-head"><div><h2 id="cp-h">Judge checkpoints</h2><p className="card-sub">Recorded 11 Oct on the vault above.</p></div></div>
      <ul>
        <li><span className="cp-k">Allowed order</span><Tx hash={E2E.trade} /><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="cp-k">Over-cap order reverted</span>{revertTx ? <Tx hash={revertTx} /> : <span className="text-dim mono">see Incidents</span>}<span className="chip chip-danger"><span className="dot" />Reverted</span></li>
        <li><span className="cp-k">Flatten after stop</span><Tx hash={E2E.flatten} /><span className="chip chip-success"><span className="dot" />Flat</span></li>
      </ul>
      <a className="cp-all" href="#judges" onClick={onAll}>All 10 steps and the real vs simulated table</a>
    </section>
  )
}

export const PoolsNote = () => (
<p className="note">Against <a href="https://github.com/namixai/colosseum-pools" target="_blank" rel="noreferrer">colosseum-pools</a>: its README states the pool gateway holds the agent keys and signs each order. In BACKED no key is held anywhere. Only the vault contract places an order, and anyone can close a vault that crosses its line.</p>
)
