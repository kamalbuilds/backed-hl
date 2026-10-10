import { EXPLORER, short } from '@/lib/backed'

export function Tx({ hash, label, kind = 'tx' }: { hash?: string | null; label?: string; kind?: 'tx' | 'address' }) {
  if (!hash) return <span className="text-dim">no tx</span>
  return (
    <a className="tx" href={`${EXPLORER}/${kind}/${hash}`} target="_blank" rel="noopener">
      {label ?? (kind === 'tx' ? hash.slice(0, 8) + '\u2026' + hash.slice(-4) : short(hash))}
    </a>
  )
}
