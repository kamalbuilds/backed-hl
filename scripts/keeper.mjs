// BACKED public keeper: watches every vault from the factory, calls permissionless flatten() on a breach,
// retries until flat, and logs breach->flat latency. Anyone can run this; it holds no trading key (only gas).
// env: BACKED_KEEPER_INTERVAL_MS (1000), BACKED_RETRY_MS (8000), BACKED_ONCE=1 for a single pass
import fs from 'node:fs';
import { V, F, dep, log, ROOT, pub, wallet, sleep } from './common.mjs';
const { factory } = dep();
const INTERVAL = Number(process.env.BACKED_KEEPER_INTERVAL_MS || 1000), RETRY = Number(process.env.BACKED_RETRY_MS || 8000);
const STATUS = ROOT + (process.env.BACKED_STATUS || 'keeper-status.json');
const st = {}; // vault -> { firstSeenMs, lastFlattenMs, flattenTxs[] }
const rd = (address, functionName, args = []) => pub.readContract({ address, abi: V.abi, functionName, args });
async function pass() {
  const vaults = await pub.readContract({ address: factory, abi: F.abi, functionName: 'all' });
  const rows = [];
  for (const v of vaults) {
    try {
      const [breached, settled, reason, flat, eq, floor] = await Promise.all([rd(v, 'breached'), rd(v, 'settled'), rd(v, 'breachReason'), rd(v, 'isFlat'), rd(v, 'equityPnl'), rd(v, 'floorPnl')]);
      const s = (st[v] ??= { flattenTxs: [] });
      const due = !settled && !flat && (breached || Number(reason) !== 0);
      if (due) {
        s.firstSeenMs ??= Date.now();
        if (!s.lastFlattenMs || Date.now() - s.lastFlattenMs > RETRY) {
          s.lastFlattenMs = Date.now();
          try {
            const hash = await wallet.writeContract({ address: v, abi: V.abi, functionName: 'flatten', gas: 1_500_000n });
            s.flattenTxs.push(hash);
            const r = await pub.waitForTransactionReceipt({ hash, timeout: 60_000 });
            log({ step: 'keeper flatten', vault: v, reason: Number(reason), attempt: s.flattenTxs.length, tx: hash, status: r.status, block: r.blockNumber, sinceSeenMs: Date.now() - s.firstSeenMs });
          } catch (e) { log({ step: 'keeper flatten error', vault: v, err: (e.shortMessage ?? e.message).split('\n')[0] }); }
        }
      } else if (s.firstSeenMs && flat) {
        log({ step: 'RESULT keeper', vault: v, breachSeenMs: s.firstSeenMs, flatSeenMs: Date.now(), breachToFlatObservedMs: Date.now() - s.firstSeenMs, attempts: s.flattenTxs.length, txs: s.flattenTxs });
        st[v] = { flattenTxs: [] };
      }
      rows.push({ vault: v, breached, settled, flat, reason: Number(reason), equityPnl: Number(eq), floor: Number(floor) });
    } catch (e) { rows.push({ vault: v, error: (e.shortMessage ?? e.message).split('\n')[0] }); }
  }
  fs.writeFileSync(STATUS, JSON.stringify({ updated: Date.now(), factory, rows }, null, 1));
}
do { try { await pass(); } catch (e) { console.error(e.message); } if (process.env.BACKED_ONCE) break; await sleep(INTERVAL); } while (true);
