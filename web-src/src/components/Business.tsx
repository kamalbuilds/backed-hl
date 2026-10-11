import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const src = (href: string, label: string) => <a href={href} target="_blank" rel="noreferrer">{label}</a>

export function Business() {
  const rows: [string, string, string][] = [
    ['Backers', 'Capital owners who want to fund traders without handing over a key: desks, DAOs, individuals.', 'A builder fee on each order the vault sends. Hyperliquid caps it at 0.1% on perps. Planned, not in the contract yet.'],
    ['Traders', 'People who can trade but lack capital. No challenge fee to start.', 'Nothing up front. They keep the profit share the backer sets (the contract enforces it at settle).'],
    ['Keepers', 'Anyone who runs a bot.', 'Paid, not paying: the flatten bounty comes out of the vault being closed. Live in the contract today.'],
  ]
  return (
    <div className="biz">
      <Table className="sheet">
        <TableHeader><TableRow><TableHead className="w-[9rem]">Who</TableHead><TableHead>Who they are</TableHead><TableHead>What they pay</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map(([a, b, c]) => <TableRow key={a}><TableCell className="font-medium">{a}</TableCell><TableCell className="text-dim whitespace-normal">{b}</TableCell><TableCell className="whitespace-normal">{c}</TableCell></TableRow>)}</TableBody>
      </Table>
      <details className="econ"><summary>Market size and the fee arithmetic</summary>
      <dl className="facts">
        <div><dt>Retail prop firm revenue, 2025</dt><dd>about $585M, mostly challenge fees; about 7% of buyers ever get a payout ({src('https://track360.io/blog/prop-trading-industry-statistics-2026', 'Track360')})</dd></div>
        <div><dt>Hyperliquid perp volume, last 30 days</dt><dd>about $206B ({src('https://defillama.com/protocol/hyperliquid-perps', 'DefiLlama')}, read 11 Oct 2026)</dd></div>
        <div><dt>Example</dt><dd>At a 0.02% builder fee, $10M of monthly volume through BACKED vaults earns $2,000 a month. That is arithmetic, not a forecast.</dd></div>
      </dl>
      </details>
    </div>
  )
}
