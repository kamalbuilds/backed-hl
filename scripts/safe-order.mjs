// Safe order on the fresh demo vault: trader opens ~1x ETH long (inside 3x cap), confirms the fill, then closes reduce-only.
//   BACKED_DEP=deployment-demo2.json BACKED_TRADER_KEYFILE=<trader key json> node scripts/safe-order.mjs
import fs from 'node:fs';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { chain, RPC, V, dep, log, pub, e8, sleep } from './common.mjs';
const { vault } = dep();
const tk = privateKeyToAccount(JSON.parse(fs.readFileSync(process.env.BACKED_TRADER_KEYFILE, 'utf8'))[0].private_key);
const w = createWalletClient({ account: tk, chain, transport: http(RPC, { retryCount: 8, retryDelay: 1500 }) });
const rd = (fn, args = []) => pub.readContract({ address: vault, abi: V.abi, functionName: fn, args });
const szi = async () => Number((await rd('position', [4])).szi);
async function tr(isBuy, sz, ro, label) {
  const p = Number(await rd('oraclePx', [4])) / 100;
  const hash = await w.writeContract({ address: vault, abi: V.abi, functionName: 'trade', args: [4, isBuy, e8(Math.round(p * (isBuy ? 1.02 : 0.98))), e8(sz), ro], gas: 1_500_000n });
  const r = await pub.waitForTransactionReceipt({ hash, timeout: 180_000 }); log({ step: label, vault, tx: hash, status: r.status, px: p }); return r;
}
const cap = Number(await rd('capital')) / 1e6, px = Number(await rd('oraclePx', [4])) / 100;
const sz = Math.max(0.0045, Math.round((1.0 * cap / px) * 1e4) / 1e4);
log({ step: 'pre safe order', vault, breached: await rd('breached'), capital: cap, px, sz });
await tr(true, sz, false, `safe order: ${sz} ETH long (~1x, cap 3x) accepted`);
for (let k = 0; k < 30 && (await szi()) === 0; k++) await sleep(500);
const open = await szi(); log({ step: 'position after safe order', vault, szi: open, breached: await rd('breached') });
if (open !== 0) { await tr(false, Math.abs(open) / 1e4, true, 'close safe order reduce-only'); for (let k = 0; k < 30 && (await szi()) !== 0; k++) await sleep(500); }
log({ step: 'after close', vault, szi: await szi(), breached: await rd('breached'), equityPnl: String(await rd('equityPnl')) });
