// ITEM 3 (needs test USDC on the operator's HyperCore spot): real-testnet funded re-test of V3.
//   node scripts/retest-funded.mjs fund 16      -> spotSend 16 USDC to the vault's HyperCore account (1 USDC goes to account creation)
//   node scripts/retest-funded.mjs all [runs=5] -> fundPerp, live stacked rejection, then N breach->flat runs timed with HyperCore userFills
// The keeper (scripts/keeper.mjs) may run alongside; this script also calls flatten itself and records whoever closed first.
import { account, V, dep, log, send, sim, pub, wallet, e8, sleep, info } from './common.mjs';
const { vault } = dep(); const [cmd, a1] = process.argv.slice(2);
const rd = (fn, args = []) => pub.readContract({ address: vault, abi: V.abi, functionName: fn, args });
const szi = async () => Number((await rd('position', [4])).szi);
if (cmd === 'fund') {
  const time = Date.now(), destination = vault, token = 'USDC:0xeb62eee3685fc4c43992febcd9e75443', amount = String(a1 || 16);
  const signature = await account.signTypedData({ domain: { name: 'HyperliquidSignTransaction', version: '1', chainId: 0x66eee, verifyingContract: '0x0000000000000000000000000000000000000000' },
    types: { 'HyperliquidTransaction:SpotSend': [{ name: 'hyperliquidChain', type: 'string' }, { name: 'destination', type: 'string' }, { name: 'token', type: 'string' }, { name: 'amount', type: 'string' }, { name: 'time', type: 'uint64' }] },
    primaryType: 'HyperliquidTransaction:SpotSend', message: { hyperliquidChain: 'Testnet', destination, token, amount, time: BigInt(time) } });
  const sig = { r: signature.slice(0, 66), s: '0x' + signature.slice(66, 130), v: parseInt(signature.slice(130, 132), 16) };
  const res = await fetch('https://api.hyperliquid-testnet.xyz/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: { type: 'spotSend', signatureChainId: '0x66eee', hyperliquidChain: 'Testnet', destination, token, amount, time }, nonce: time, signature: sig }) });
  log({ step: 'fund vault spot', amount, body: await res.text() });
} else if (cmd === 'all') {
  let sz = Number(process.env.BACKED_SZ || 0);
  if (!process.env.SKIP_SETUP) {
  const spot = (await info({ type: 'spotClearinghouseState', user: vault })).balances.find((b) => b.coin === 'USDC');
  const usd = Math.floor(Number(spot?.total || 0) * 1e6) - 100_000; if (usd < 11_000_000) throw new Error(`vault spot USDC ${spot?.total ?? 0} < 11: run "fund" first`);
  if (Number(await rd('capital')) === 0 || Number(await rd('equityPnl')) < -1_000_000) {
    // the unfunded rejection demo booked 14 USDC of capital; a fresh vault is cleaner — deploy one with scripts/deploy.mjs before funding
    log({ step: 'note', msg: 'capital already booked; equity floor relative to it' });
  }
  await send(vault, V.abi, 'fundPerp', [BigInt(usd)], `fundPerp ${usd / 1e6}`); await sleep(4000);
  await send(vault, V.abi, 'setFloor', [BigInt(Number(await rd('equityPnl')) - 2_000_000)], 'floor = equity - 2');
  const px = Number(await rd('oraclePx', [4])) / 100, cap = Number(await rd('capital')) / 1e6, r4 = (x) => Math.round(x * 1e4) / 1e4;
  sz = Math.max(0.0045, r4(2.5 * cap / px * 0.9)); // >= $10 min order
  await send(vault, V.abi, 'trade', [4, true, e8(Math.round(px * 1.02)), e8(sz), false], `open ${sz} ETH`);
  for (let k = 0; k < 20 && (await szi()) === 0; k++) await sleep(500);
  const extra = r4(1.0 * cap / px);
  log({ step: 'LIVE stacked sim', sim: await sim(vault, V.abi, 'trade', [4, true, e8(Math.round(px * 1.02)), e8(extra), false]) });
  await send(vault, V.abi, 'trade', [4, true, e8(Math.round(px * 1.02)), e8(extra), false], 'LIVE REJECT stacked order', 600_000n);
  await send(vault, V.abi, 'trade', [4, false, e8(Math.round(px * 0.98)), e8(sz), true], 'close (reduce-only)'); await sleep(4000);
  }
  const START = Number(process.env.BACKED_RUN_START || 0);
  for (let i = START; i < START + Number(a1 || 5); i++) {
    if (await rd('breached')) { await send(vault, V.abi, 'setFloor', [BigInt(Number(await rd('equityPnl')) - 2_000_000)], 'floor below equity'); await send(vault, V.abi, 'rearm', [], 'rearm'); }
    const p = Number(await rd('oraclePx', [4])) / 100;
    await send(vault, V.abi, 'trade', [4, true, e8(Math.round(p * 1.02)), e8(sz), false], `run ${i} open ${sz} ETH`);
    for (let k = 0; k < 20 && (await szi()) === 0; k++) await sleep(500);
    const fl = await send(vault, V.abi, 'setFloor', [BigInt(Number(await rd('equityPnl')) + 50_000)], `run ${i} floor -> equity+0.05 (breach line crossed)`);
    let tBreach = null; for (let k = 0; k < 40; k++) { if (Number(await rd('breachReason')) !== 0) { tBreach = Date.now(); break; } await sleep(250); }
    let f = null; try { f = await send(vault, V.abi, 'flatten', [], `run ${i} flatten (script)`); } catch (e) { log({ step: 'flatten by script failed (keeper may have closed first)', err: String(e).slice(0, 100) }); }
    let tFlat = null; for (let k = 0; k < 80; k++) { if ((await szi()) === 0) { tFlat = Date.now(); break; } await sleep(250); }
    const fills = await info({ type: 'userFills', user: vault }); const fill = fills.find((x) => x.time >= fl.blockTsMs && x.dir?.includes('Close'));
    log({ step: 'RESULT live V3', run: i, tBreach, breachBlockTsMs: fl.blockTsMs, fillTimeMs: fill?.time, breachToFillMs: fill && tBreach ? fill.time - tBreach : null, breachBlockToFillMs: fill ? fill.time - fl.blockTsMs : null, breachToObservedFlatMs: tFlat && tBreach ? tFlat - tBreach : null, flattenTx: f?.tx });
    await sleep(2000);
  }
  // LIVE retry: breach, then two flatten() calls back to back; the second is accepted because the vault is already breached
  if (await rd('breached')) { await send(vault, V.abi, 'setFloor', [BigInt(Number(await rd('equityPnl')) - 2_000_000)], 'floor below equity'); await send(vault, V.abi, 'rearm', [], 'rearm'); }
  { const p = Number(await rd('oraclePx', [4])) / 100;
    await send(vault, V.abi, 'trade', [4, true, e8(Math.round(p * 1.02)), e8(sz), false], 'retry: open');
    for (let k = 0; k < 20 && (await szi()) === 0; k++) await sleep(500);
    await send(vault, V.abi, 'setFloor', [BigInt(Number(await rd('equityPnl')) + 50_000)], 'retry: floor -> equity+0.05');
    const h1 = await wallet.writeContract({ address: vault, abi: V.abi, functionName: 'flatten', gas: 1_500_000n });
    let h2 = null; try { h2 = await wallet.writeContract({ address: vault, abi: V.abi, functionName: 'flatten', gas: 1_500_000n }); } catch (e) { log({ step: 'retry second send failed', err: String(e).slice(0, 120) }); }
    const r1 = await pub.waitForTransactionReceipt({ hash: h1 }); const r2 = h2 ? await pub.waitForTransactionReceipt({ hash: h2 }) : null;
    let tFlat = null; for (let k = 0; k < 80; k++) { if ((await szi()) === 0) { tFlat = Date.now(); break; } await sleep(250); }
    log({ step: 'RESULT live retry flatten', first: h1, firstStatus: r1.status, second: h2, secondStatus: r2?.status, flat: tFlat !== null, note: 'second call accepted while breached (retry path); a missed IOC band is only simulated' }); }
  // LIVE equity floor: flat account, realized fees/losses only; floor set just above equity -> reopening is refused
  { await sleep(3000); const eqp = Number(await rd('equityPnl')); await send(vault, V.abi, 'setFloor', [BigInt(eqp + 10_000)], `floor -> realized equityPnl ${eqp / 1e6} + 0.01 (no open position)`);
    const p = Number(await rd('oraclePx', [4])) / 100; const isFlatNow = await rd('isFlat');
    log({ step: 'LIVE equity floor sim', equityPnl: eqp, flat: isFlatNow, sim: await sim(vault, V.abi, 'trade', [4, true, e8(Math.round(p * 1.02)), e8(sz), false]) });
    await send(vault, V.abi, 'trade', [4, true, e8(Math.round(p * 1.02)), e8(sz), false], 'LIVE REJECT reopen after realized loss (equity floor)', 600_000n);
    await send(vault, V.abi, 'setFloor', [BigInt(eqp - 2_000_000)], 'floor restored'); }
}
