// Live test of the daily-loss rule on the reference vault: checkpoint, tiny daily limit, wait for the breach and the public keeper's flatten.
import { pub, wc } from './wallet.mjs';
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('public/data.json')); const V = '0x661971C1183088D6290395F4dE15Be9858DeF049'; const abi = d.abi.vault;
const rd = (f) => pub.readContract({ address: V, abi, functionName: f });
const tx = async (fn, args = []) => { const h = await wc.writeContract({ address: V, abi, functionName: fn, args, gas: 1_500_000n }); const r = await pub.waitForTransactionReceipt({ hash: h }); console.log(new Date().toISOString(), fn, r.status, h); return h; };
const out = { started: new Date().toISOString() };
out.checkpoint = await tx('checkpoint');
console.log('dayStart', String(await rd('dayStartEquity')), 'eq', String(await rd('accountValue')));
out.setDaily = await tx('setDailyLoss', [1n]);
const t0 = Date.now();
while (Date.now() - t0 < 15 * 60e3) {
  const [reason, flat, br] = await Promise.all([rd('breachReason'), rd('isFlat'), rd('breached')]).catch(() => [null]);
  if (reason !== null) { if (reason !== 0 && !out.breachSeen) { out.breachSeen = new Date().toISOString(); out.reason = reason; console.log('breach reason', reason); } if (flat) { out.flatSeen = new Date().toISOString(); out.breached = br; break; } }
  await new Promise((r) => setTimeout(r, 2000));
}
fs.writeFileSync('e2e/out/audit-daily.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
