// reproducible V3 rejections: records capital (fundPerp), then 20x, fake-$1-limit, disallowed market on-chain reverts + within-cap sim
import { V, dep, log, send, sim, pub, e8 } from './common.mjs';
const { vault } = dep();
const cap = Number(await pub.readContract({ address: vault, abi: V.abi, functionName: 'capital' }));
if (cap === 0) await send(vault, V.abi, 'fundPerp', [14_000_000n], 'fundPerp 14 (bookkeeping only if contract holds no USDC)');
// unfunded vault: equity reads 0, so widen the floor (backer) so the LEVERAGE rule is what rejects; funded runs keep -2
const eqp = Number(await pub.readContract({ address: vault, abi: V.abi, functionName: 'equityPnl' }));
const fl = Number(await pub.readContract({ address: vault, abi: V.abi, functionName: 'floorPnl' }));
if (eqp < fl) await send(vault, V.abi, 'setFloor', [BigInt(eqp - 1_000_000)], 'setFloor below equity (unfunded vault: isolate leverage rule)');
const capital = Number(await pub.readContract({ address: vault, abi: V.abi, functionName: 'capital' })) / 1e6;
const px = Number(await pub.readContract({ address: vault, abi: V.abi, functionName: 'oraclePx', args: [4] })) / 100;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const cases = [['20x ETH long', 4, Math.round(px * 1.02), r4(20 * capital / px)], ['fake $1 limit 5x ETH', 4, 1, r4(5 * capital / px)], ['disallowed market SOL(5)', 5, 150, 0.1], ['within cap 2.5x ETH', 4, Math.round(px * 1.02), r4(2.5 * capital / px)]];
for (const [label, a, lim, sz] of cases) {
  const s = await sim(vault, V.abi, 'trade', [a, true, e8(lim), e8(sz), false]); log({ step: 'sim ' + label, oracle: px, capital, sz, sim: s });
  if (s !== 'ok') await send(vault, V.abi, 'trade', [a, true, e8(lim), e8(sz), false], 'REJECT on-chain ' + label, 500_000n);
}
