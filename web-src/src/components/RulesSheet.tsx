import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MK, SZD, sgn, usd, type Vault } from '@/lib/backed'
import { Tx } from './Tx'

// Stripe-style parameter sheet: each rule is a parameter, its live value, what happens, and the proof it bites.
export function RulesSheet({ s, proof }: { s: Vault; proof: Record<string, string | null | undefined> }) {
  const open = s.pos.filter((p) => p.szi).map((p) => `${MK[p.m]} ${(p.szi / 10 ** SZD[p.m]).toFixed(SZD[p.m])}`).join(', ')
  const rows: [string, string, string, string | null | undefined, string?][] = [
    ['allowed_markets', s.markets.map((m) => MK[m] ?? m).join(', '), 'Orders on any other market revert.', proof.market],
    ['max_leverage', `${s.maxLev}x of ${usd(s.cap)} USDC`, 'All positions together, at the oracle price, after the fill. Stacked orders count.', proof.stacked],
    ['loss_line', `${sgn(s.floor / 1e6)} USDC`, 'Account value minus capital. Realized losses count, so closing and reopening does not reset it.', proof.floor],
    ['daily_loss', s.dl ? `${usd(s.dl)} USDC` : 'off', "Measured from the day's first equity reading.", undefined],
    ['flatten', `anyone, ${usd(s.bo)} USDC bounty`, 'Below the line, any address can close every position. Retried until flat.', proof.flatten, 'flatten fill'],
    ['after_breach', 'frozen', 'New orders revert until the backer rearms, and rearm reverts while still below the line.', proof.frozen],
    ['settle', `trader keeps ${s.sh / 100}% of profit`, 'Backer gets principal first. No operator signs anything.', undefined],
  ]
  return (
    <Table className="sheet">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[11rem]">Parameter</TableHead>
          <TableHead className="w-[12rem]">Value now</TableHead>
          <TableHead>What the contract does</TableHead>
          <TableHead className="w-[7rem] text-right">Proof</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([k, v, d, tx, kind]) => (
          <TableRow key={k}>
            <TableCell><span className="param-name">{k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}</span><code className="param param-id">{k}</code></TableCell>
            <TableCell className="num">{v}</TableCell>
            <TableCell className="text-dim whitespace-normal">{d}</TableCell>
            <TableCell className="text-right">{tx ? <Tx hash={tx} label={kind ?? 'rejected order'} /> : <a className="tx" href="https://github.com/kamalbuilds/backed-hl/blob/main/contracts/test/BackedVaultV3.t.sol" target="_blank" rel="noopener">forge test</a>}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell><code className="param">positions</code></TableCell>
          <TableCell className="num">{open || 'flat'}</TableCell>
          <TableCell className="text-dim whitespace-normal">Read from the HyperCore position precompile.</TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  )
}
