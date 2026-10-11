import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tx } from '@/components/Tx'

// Transactions from the Playwright click-through on 11 Oct 2026 (e2e/flows.mjs, injected test wallet, vault 0xa33D...).
const E2E = {
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
    ['Retry after a missed price band; profit split when there is a profit', 'Simulated HyperCore on a local chain plus forge tests (a testnet settle so far only ran at a loss)'],
    ['Breach replay on the ruler', 'Simulated: animation only, timed with the measured median'],
    ['Mainnet, real money', 'Not deployed. Testnet USDC only'],
  ]
  return (
    <div className="judges">
      <p className="walk-cap">Recorded walkthrough, 11 Oct 2026: vault <Tx hash={E2E.vault} kind="address" />, driven in the browser with a test wallet.</p>
      <ol className="steps">
        <li><span className="step-n">1</span><span><strong className="step-h">Vault created.</strong> Open the factory <Tx hash={factory} kind="address" /> and a vault it created in our browser run, <Tx hash={E2E.vault} kind="address" /> (created in <Tx hash={E2E.create} />).</span></li>
        <li><span className="step-n">2</span><span><strong className="step-h">Order accepted, 20x refused.</strong> An allowed order sent by the vault contract: <Tx hash={E2E.trade} />. A 20x order never got that far: the contract simulation refused it (&ldquo;leverage above backer limit&rdquo;), so no transaction exists.</span></li>
        <li><span className="step-n">3</span><span><strong className="step-h">Breach closed.</strong> The backer moved the line above equity in <Tx hash={E2E.breach} />, and a flatten closed the position in <Tx hash={E2E.flatten} />. After the backer pressed Stop, the public keeper flattened in <Tx hash={E2E.keeper} />, 4.8 s after it saw the stop.</span></li>
        <li><span className="step-n">4</span><span><strong className="step-h">Gasless order, then payout.</strong> A gasless order: the trader signed it and a relayer submitted it through <code>tradeBySig</code> in <Tx hash={E2E.signed} />. Settle paid the principal back to the backer in <Tx hash={E2E.settle} />.</span></li>
      </ol>
      <Table className="sheet proof-sheet">
        <TableHeader><TableRow><TableHead className="w-[18rem]">Piece</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
        <TableBody>{real.map(([a, b]) => <TableRow key={a}><TableCell className="whitespace-normal">{a}</TableCell><TableCell className="whitespace-normal">{b}</TableCell></TableRow>)}</TableBody>
      </Table>
      <p className="note">Against <a href="https://github.com/namixai/colosseum-pools" target="_blank" rel="noreferrer">colosseum-pools</a>: there, an operator&rsquo;s API wallet signs every order and an operator watcher enforces stops. In BACKED there is no operator key at all. Only the vault contract can place an order, and anyone can close a vault that crosses its line.</p>
    </div>
  )
}
