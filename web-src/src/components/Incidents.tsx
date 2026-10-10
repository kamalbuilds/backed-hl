import { useState } from 'react'
import type { Evidence } from '@/lib/backed'
import { Tx } from './Tx'

type Inc = { title: string; body: string; when: string; tx: string | null; breach: boolean; ms?: number }

// GitHub-status style incident log built from the live testnet evidence file.
export function buildIncidents(ev: Evidence): Inc[] {
  const out: Inc[] = []
  for (const g of ev.groups) {
    if (!/^V3/.test(g.title)) continue
    for (const i of g.items) {
      const ms = Number((i.label.match(/fill (\d+) ms/) || [])[1])
      if (ms) {
        const who = /keeper/.test(i.label) ? 'the public keeper' : 'a script standing in for any caller'
        const slow = ms > 10000 ? ' The tx waited about 51 s for a block: this run measures block inclusion, not the contract.' : ''
        out.push({ title: `Loss line crossed. Flat in ${(ms / 1000).toFixed(2)} s`, body: `flatten() called by ${who}.${slow}`, when: 'Oct 10, 2026', tx: i.tx, breach: true, ms })
      } else if (/revert|rejected/i.test(i.label)) {
        const what = i.label.replace(/^rejected:\s*/i, '').replace(/,?\s*reverted.*$/i, '').replace(/\s*\(equity floor\)/, '')
        if (out.some((o) => o.title.endsWith(what))) continue
        out.push({ title: 'Refused: ' + what, body: '', when: 'Oct 10, 2026', tx: i.tx, breach: false })
      }
    }
  }
  return out
}

export function Incidents({ ev }: { ev: Evidence }) {
  const [all, setAll] = useState(false)
  const list = buildIncidents(ev)
  const breaches = list.filter((x) => x.breach), refused = list.filter((x) => !x.breach)
  const ms = breaches.map((x) => x.ms!).sort((a, b) => a - b), med = ms[Math.floor(ms.length / 2)]
  const control = ev.groups.find((g) => /^Control/.test(g.title))
  return (
    <div className="incidents">
      <aside className="inc-sum" aria-label="Summary">
        <dl>
          <div><dt>Live breach runs recorded</dt><dd>{breaches.length}, each ending in a flatten fill</dd></div>
          <div><dt>Median, breach to fill</dt><dd>{(med / 1000).toFixed(2)} s</dd></div>
          <div><dt>Orders refused on chain</dt><dd>{refused.length}</dd></div>
        </dl>
        <p>All runs on Oct 10, 2026 against a vault funded with 20 test USDC. Times run from the breach to the HyperCore fill. Refused orders reverted in the contract, so nothing reached HyperCore.</p>
        {control && <p>Control: the same breach on an account run by a trusted API wallet was still open after 60 s in both runs, because nobody else may close it.</p>}
      </aside>
      <div>
        <h3 className="month">October 2026</h3>
        <ol className="rail">
          {breaches.concat(all ? refused : refused.slice(0, 3)).map((x, i) => (
            <li key={i} className={x.breach ? 'inc inc-breach' : 'inc'}>
              <p className="inc-title">{x.title}</p>
              <p className="inc-when">{x.body && <span className="inc-body">{x.body} </span>}{x.when} · <Tx hash={x.tx} /></p>
            </li>
          ))}
        </ol>
        {refused.length > 3 && <p className="more"><button type="button" className="linkish" aria-expanded={all} onClick={() => setAll(!all)}>{all ? 'Show fewer refused orders' : `Show all ${refused.length} refused orders`}</button></p>}
      </div>
    </div>
  )
}
