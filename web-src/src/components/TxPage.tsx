import { useCallback, useEffect, useState } from 'react'
import { decodeEventLog } from 'viem'
import { Button } from '@/components/ui/button'
import { loadData, pub } from '@/lib/backed'

type Log = { address: string; topics: `0x${string}`[]; data: `0x${string}` }
type Rcpt = { status: string; blockNumber: string; from: string; to: string | null; gasUsed: string; logs: Log[]; contractAddress?: string | null }
type Result = { rcpt: Rcpt; tx: { from: string; to: string | null } | null; time: number | null; lines: string[] }
type View = { s: 'loading' } | { s: 'missing' } | { s: 'error'; msg: string } | { s: 'ok'; r: Result }

const rpc = <T,>(method: string, params: unknown[]) => pub.request({ method, params } as never) as Promise<T>
const IST = { timeZone: 'Asia/Kolkata', hour12: false, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' } as const

function decode(l: Log, abis: unknown[]): string {
  for (const abi of abis) {
    try {
      const d = decodeEventLog({ abi: abi as never, data: l.data, topics: l.topics as [`0x${string}`] }) as { eventName: string; args?: unknown }
      const a = d.args && !Array.isArray(d.args) ? Object.entries(d.args as Record<string, unknown>).map(([k, v]) => `${k}=${typeof v === 'bigint' ? v.toString() : String(v)}`).join(', ') : ''
      return `${d.eventName}(${a})`
    } catch { /* try the next ABI */ }
  }
  if (l.address.toLowerCase() === '0x3333333333333333333333333333333333333333') return 'CoreWriter RawAction: HyperCore action sent by the contract'
  return 'Unrecognised event, topic0 ' + (l.topics[0] ?? '0x').slice(0, 10)
}

const Addr = ({ a }: { a: string | null }) => a
  ? <a className="tx" href={`https://app.hyperliquid-testnet.xyz/explorer/address/${a}`} target="_blank" rel="noopener" title="HyperCore activity">{a}</a>
  : <span className="text-dim">none</span>

export function TxPage({ hash }: { hash: string }) {
  const [v, setV] = useState<View>({ s: 'loading' })
  const load = useCallback(async () => {
    setV({ s: 'loading' })
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) { setV({ s: 'missing' }); return }
    try {
      const [rcpt, tx] = await Promise.all([rpc<Rcpt | null>('eth_getTransactionReceipt', [hash]), rpc<{ from: string; to: string | null } | null>('eth_getTransactionByHash', [hash])])
      if (!rcpt) { setV({ s: 'missing' }); return }
      const blk = await rpc<{ timestamp: string } | null>('eth_getBlockByNumber', [rcpt.blockNumber, false])
      const d = await loadData().catch(() => null)
      const abis = d ? [d.abi.vault, d.abi.factory] : []
      setV({ s: 'ok', r: { rcpt, tx, time: blk ? Number(BigInt(blk.timestamp)) : null, lines: rcpt.logs.map((l) => decode(l, abis)) } })
    } catch (e) { setV({ s: 'error', msg: String((e as { shortMessage?: string })?.shortMessage ?? e).slice(0, 200) }) }
  }, [hash])
  useEffect(() => { load() }, [load])
  useEffect(() => { document.title = 'BACKED: transaction ' + hash.slice(0, 10) }, [hash])

  return (
    <main className="console">
      <section className="card" aria-labelledby="h-tx">
        <div className="card-head">
          <div><h2 id="h-tx">Transaction</h2><p className="card-sub mono" style={{ wordBreak: 'break-all' }}>{hash}</p></div>
          {v.s === 'ok' && <span className={`chip chip-${v.r.rcpt.status === '0x1' ? 'success' : 'danger'}`}><span className="dot" />{v.r.rcpt.status === '0x1' ? 'Success' : 'Reverted'}</span>}
          {v.s === 'loading' && <span className="chip chip-warn"><span className="dot" />Reading the RPC</span>}
          {v.s === 'missing' && <span className="chip chip-neutral"><span className="dot" />Not found</span>}
          {v.s === 'error' && <span className="chip chip-danger"><span className="dot" />RPC error</span>}
        </div>
        {v.s === 'loading' && <p className="state-line" role="status">Reading the transaction from the testnet RPC&hellip;</p>}
        {v.s === 'missing' && <p className="state-line" role="status">The testnet RPC has no receipt for this hash. It may be pending, on another network, or mistyped.</p>}
        {v.s === 'error' && <div role="alert"><p className="state-line alarm">The public RPC did not answer: {v.msg}</p><Button variant="secondary" size="sm" onClick={load}>Retry</Button></div>}
        {v.s === 'ok' && (() => {
          const { rcpt, tx, time, lines } = v.r
          const from = tx?.from ?? rcpt.from
          const to = tx?.to ?? rcpt.to ?? rcpt.contractAddress ?? null
          return (
            <>
              <table className="sheet"><tbody>
                <tr><th scope="row">Block</th><td className="mono">{BigInt(rcpt.blockNumber).toString()}</td></tr>
                <tr><th scope="row">Block time</th><td className="mono">{time ? new Date(time * 1000).toLocaleString('en-GB', IST) + ' IST' : 'unavailable'}</td></tr>
                <tr><th scope="row">From</th><td className="mono" style={{ wordBreak: 'break-all' }}><Addr a={from} /></td></tr>
                <tr><th scope="row">To</th><td className="mono" style={{ wordBreak: 'break-all' }}><Addr a={to} /></td></tr>
                <tr><th scope="row">Gas used</th><td className="mono">{BigInt(rcpt.gasUsed).toString()}</td></tr>
                <tr><th scope="row">Logs</th><td className="mono">{rcpt.logs.length}</td></tr>
              </tbody></table>
              {lines.length > 0 && <ul aria-label="Decoded logs" className="mono" style={{ fontSize: 13, margin: '16px 0 0', paddingLeft: 18, wordBreak: 'break-all' }}>{lines.map((t, i) => <li key={i}>{t}</li>)}</ul>}
              <details style={{ marginTop: 16 }}><summary>Raw receipt</summary><pre className="mono" style={{ fontSize: 12, overflow: 'auto', maxHeight: 360 }}>{JSON.stringify(rcpt, null, 2)}</pre></details>
            </>
          )
        })()}
        <p className="card-sub" style={{ marginTop: 16 }}>Read live from the HyperEVM testnet RPC (rpc.hyperliquid-testnet.xyz/evm, chain 998). HyperCore actions a vault sends appear on the vault&rsquo;s HyperCore activity page. <a className="tx" href="./">Back to the console</a></p>
      </section>
    </main>
  )
}
