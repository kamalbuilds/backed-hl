import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tx } from '@/components/Tx'

// Transactions from the Playwright click-through on 11 Oct 2026 (e2e/flows.mjs, injected test wallet, vault 0xa33D...).
export const E2E = {
  vault: '0xa33D732D142BE60946a5F0Ae1a36E88185A78A5B',
  create: '0x48461a5b7961c078cc6d8d4153312797b5a6bc509b9626aea0143c37dae5ebde',
  trade: '0x09d764ed60ba64ceb904d81a0ca61b8fe03aff530d66f92f8d33475b51fae961',
  breach: '0x31166ddcf02968a7e1620989239ce512644809ef1daf91ca624c6400ec2fbc2e',
  flatten: '0xde09fdff27bd02628d8a4b8fffc456a3726d299fcfdf3809876a34628e068004',
  signed: '0xeeefd331871dafb456f0cc80653a269a92bd1e93063a0c7f6ddaf0b9fbb5008d',
  keeper: '0x41ad0151a379f1577ac09fad27a87add80f41b7c0980533fd7f3c778ac17d943',
  settle: '0xd764ed6fb754d3eed9179cb5001bc1f827accb6074ae36a2c0fc7131fe549271',
}

export function Judges({ factory }: { factory: string }) {
  const real = [
    ['Rule checks, leverage cap, frozen state, settle split', 'Real: HyperEVM testnet contracts, 27 forge tests'],
    ['Orders, fills, flatten closes', 'Real: HyperCore testnet fills you can query by vault address'],
    ['Public keeper and breach-to-flat timing', 'Real: measured on testnet, five funded runs plus this click-through'],
    ['Daily loss limit, flatten bounty, sweep', 'Real: daily breach on the reference vault on 11 Oct, flat in about 2 s by the keeper; 0.1 USDC bounty paid to the flattener; leftover USDC swept to the backer'],
    ['Retry after a missed price band; profit split when there is a profit', 'Simulated HyperCore on a local chain plus forge tests'],
    ['Breach replay on the ruler', 'Simulated: animation only, timed with the measured median'],
  ]
  return (
    <div className="judges">
      <p className="walk-cap">Recorded walkthrough, 11 Oct 2026: vault <Tx hash={E2E.vault} kind="address" />, from factory <Tx hash={factory} kind="address" />, driven in the browser with a test wallet.</p>
      <details className="proof-more"><summary>All 7 recorded steps</summary>
      <ol className="runlog">
        <li><span className="step-n">1</span><span className="run-what"><strong>Vault created</strong><span>by the factory, from a browser wallet</span></span><span className="run-tx"><Tx hash={E2E.create} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="step-n">2</span><span className="run-what"><strong>Allowed order placed</strong><span>sent by the vault contract to HyperCore</span></span><span className="run-tx"><Tx hash={E2E.trade} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="step-n">3</span><span className="run-what"><strong>20x order refused</strong><span>&ldquo;leverage above backer limit&rdquo;, never sent</span></span><span className="run-tx text-dim">no tx by design</span><span className="chip chip-danger"><span className="dot" />Refused</span></li>
        <li><span className="step-n">4</span><span className="run-what"><strong>Line crossed, flattened</strong><span>backer moved the line, then flatten() closed it</span></span><span className="run-tx"><Tx hash={E2E.breach} /> <Tx hash={E2E.flatten} /></span><span className="chip chip-success"><span className="dot" />Flat</span></li>
        <li><span className="step-n">5</span><span className="run-what"><strong>Keeper flattened after Stop</strong><span>public keeper, 4.8 s after it saw the stop</span></span><span className="run-tx"><Tx hash={E2E.keeper} /></span><span className="chip chip-success"><span className="dot" />Flat</span></li>
        <li><span className="step-n">6</span><span className="run-what"><strong>Gasless signed order</strong><span>trader signed, a relayer sent tradeBySig</span></span><span className="run-tx"><Tx hash={E2E.signed} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="step-n">7</span><span className="run-what"><strong>Paid out to the backer</strong><span>principal paid back</span></span><span className="run-tx"><Tx hash={E2E.settle} /></span><span className="chip chip-success"><span className="dot" />Mined</span></li>
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
      <div className="card-head"><div><h2 id="cp-h">Judge checkpoints</h2><p className="card-sub">Recorded 11 Oct on a reference vault.</p></div></div>
      <ul>
        <li><span className="cp-k">Allowed order</span><Tx hash={E2E.trade} /><span className="chip chip-success"><span className="dot" />Mined</span></li>
        <li><span className="cp-k">Over-cap order reverted</span>{revertTx ? <Tx hash={revertTx} /> : <span className="text-dim mono">see Incidents</span>}<span className="chip chip-danger"><span className="dot" />Reverted</span></li>
        <li><span className="cp-k">Flatten below line</span><Tx hash={E2E.flatten} /><span className="chip chip-success"><span className="dot" />Flat</span></li>
      </ul>
      <a className="cp-all" href="#judges" onClick={onAll}>All 7 steps and the real vs simulated table</a>
    </section>
  )
}

export const PoolsNote = () => (
<p className="note">Against <a href="https://github.com/namixai/colosseum-pools" target="_blank" rel="noreferrer">colosseum-pools</a>: its README states the pool gateway holds the agent keys and signs each order. In BACKED no key is held anywhere. Only the vault contract places an order, and anyone can close a vault that crosses its line.</p>
)
