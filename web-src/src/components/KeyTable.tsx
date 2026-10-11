import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function KeyTable() {
  const rows = [
    ['Place an order', 'The operator\u2019s API wallet signs it', 'Only the vault contract, after every rule passes'],
    ['Cut the trader\u2019s share', 'Whoever holds the keys', 'Nobody: the split is computed by settle() from flat equity'],
    ['Tighten the rules mid-trade', 'Whatever the operator\u2019s server enforces', 'Reverts on chain after the first order: the floor only loosens, the daily limit only grows'],
    ['Go over the leverage cap', 'Stopped if the operator\u2019s server checks it', 'Reverts on chain, stacked orders included'],
    ['Stop a losing trader', 'The operator\u2019s watcher, off chain', 'Anyone, on chain, paid a bounty'],
    ['Reopen after a stop', 'Up to the operator', 'Frozen until the backer rearms above the line'],
    ['If the operator disappears', 'Positions stay open', 'Nothing changes: there is no operator'],
  ]
  return (
    <Table className="sheet key-sheet">
      <TableHeader>
        <TableRow><TableHead className="w-[12rem]">Who can</TableHead><TableHead>Operator-run pool</TableHead><TableHead>BACKED</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(([a, b, c]) => (
          <TableRow key={a}><TableCell className="font-medium">{a}</TableCell><TableCell className="text-dim whitespace-normal"><span className="m-lbl">Operator pool: </span>{b}</TableCell><TableCell className="whitespace-normal"><span className="m-lbl">BACKED: </span>{c}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
