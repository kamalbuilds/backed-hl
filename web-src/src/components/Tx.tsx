import { EXPLORER, short } from '@/lib/backed'

export function Tx({ hash, label, kind = 'tx' }: { hash?: string | null; label?: string; kind?: 'tx' | 'address' }) {
  if (!hash) return <span className="text-dim">no tx</span>
  const text = label ?? (kind === 'tx' ? hash.slice(0, 8) + '…' + hash.slice(-4) : short(hash))
  return kind === 'tx'
    ? <a className="tx" href={`#/tx/${hash}`} title={hash}>{text}</a>
    : <a className="tx" href={`${EXPLORER}/address/${hash}`} target="_blank" rel="noopener" title={`${hash} (HyperCore activity)`}>{text}</a>
}
