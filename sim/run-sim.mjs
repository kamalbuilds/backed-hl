// FORK-SIMULATED end-to-end run (labelled net:"fork-sim"): local anvil (chain id 998; fork was rate-limited by the public RPC) (chain 998, 1 s blocks) with
// SimCore etched at CoreWriter/0x807/0x813/0x80F. Exercises funded paths without test USDC. NOT real HyperCore fills.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const ROOT = new URL('..', import.meta.url).pathname, PORT = 8547, RPC = `http://127.0.0.1:${PORT}`;
const anvil = spawn('anvil', ['--chain-id', '998', '--block-time', '1', '--port', String(PORT), '--gas-limit', '30000000', '--silent'], { stdio: 'ignore' });
process.on('exit', () => anvil.kill());
await new Promise((r) => setTimeout(r, 2500));
Object.assign(process.env, { BACKED_RPC: RPC, BACKED_PK: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', BACKED_NET: 'fork-sim', BACKED_DEP: 'sim/deployment.json', BACKED_LOG: 'evidence/sim-runs.jsonl', BACKED_STATUS: 'sim/keeper-status.json' });
process.env.BACKED_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const C = await import('../scripts/common.mjs');
const { pub, wallet, account, V, F, log, send, sim, e8, sleep, art } = C;
const rpc = (method, params) => fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }).then((r) => r.json());
const A = { cw: '0x3333333333333333333333333333333333333333', ora: '0x0000000000000000000000000000000000000807', pos: '0x0000000000000000000000000000000000000813', mar: '0x000000000000000000000000000000000000080F' };
const code = (n) => art(n).deployedBytecode.object;
for (const [k, n] of [['cw', 'SimCoreWriter'], ['ora', 'SimOracle'], ['pos', 'SimPos'], ['mar', 'SimMargin']]) await rpc('anvil_setCode', [A[k], code(n)]);
const SO = art('SimOracle').abi, SC = art('SimCoreWriter').abi;
const realEth = 249470n; // ETH raw oracle (1e2), taken from the live testnet oracle at the time of writing
await send(A.ora, SO, 'set', [4, realEth], 'sim oracle ETH 2494.70'); await send(A.ora, SO, 'set', [3, 1000000n], 'sim oracle BTC 100000');
await send(A.cw, SC, 'setSzDec', [4, 4], 'sim szDec ETH'); await send(A.cw, SC, 'setSzDec', [3, 5], 'sim szDec BTC');
// deploy
const h = await wallet.deployContract({ abi: F.abi, bytecode: F.bytecode.object, gas: 8_000_000n }); const factory = (await pub.waitForTransactionReceipt({ hash: h })).contractAddress;
await send(factory, F.abi, 'create', [account.address, [4, 3], [4, 5], 3n, -2_000_000n, 1_000_000n, 2000, 100_000n], 'create vault', 6_000_000n);
const vault = (await pub.readContract({ address: factory, abi: F.abi, functionName: 'all' }))[0];
fs.writeFileSync(ROOT + 'sim/deployment.json', JSON.stringify({ factory, vault, net: 'fork-sim' }, null, 2)); log({ step: 'sim deploy', factory, vault });
const rd = (fn, args = []) => pub.readContract({ address: vault, abi: V.abi, functionName: fn, args });
const state = async (label) => log({ step: 'state ' + label, szi: Number((await rd('position', [4])).szi), equityPnl: Number(await rd('equityPnl')), floor: Number(await rd('floorPnl')), breached: await rd('breached'), reason: Number(await rd('breachReason')) });
const T = (isBuy, px, sz, ro = false) => send(vault, V.abi, 'trade', [4, isBuy, e8(px), e8(sz), ro], `trade ETH ${isBuy ? 'buy' : 'sell'} ${sz} @${px}${ro ? ' RO' : ''}`, 800_000n);
const setPx = (raw, why) => send(A.ora, SO, 'set', [4, BigInt(raw)], `sim oracle ETH -> ${raw / 100} (${why})`);
await send(vault, V.abi, 'fundPerp', [14_000_000n], 'fundPerp 14 (sim cash)'); await state('funded');
// keeper as a child process against the fork
const keeper = spawn('node', [ROOT + 'scripts/keeper.mjs'], { env: { ...process.env, BACKED_RETRY_MS: '3000' }, stdio: ['ignore', 'pipe', 'inherit'] });
keeper.stdout.on('data', (d) => process.stdout.write('[keeper] ' + d)); process.on('exit', () => keeper.kill());
const P = Number(realEth) / 100;
// 1) stacked-order rejection
await T(true, Math.round(P * 1.02), 0.014); await state('after 2.5x open');
log({ step: 'SCENARIO stacked', sim: await sim(vault, V.abi, 'trade', [4, true, e8(Math.round(P * 1.02)), e8(0.003), false]) });
await send(vault, V.abi, 'trade', [4, true, e8(Math.round(P * 1.02)), e8(0.003), false], 'REJECT stacked +0.003 ETH (2.5x + 0.54x > 3x)', 800_000n);
await T(false, Math.round(P * 0.98), 0.014, true); await state('closed');
// 2) equity floor counts realized loss: open, price -6%, close (realize), try reopen
await send(vault, V.abi, 'setFloor', [-1_000_000n], 'floor -1 USDC');
await T(true, Math.round(P * 1.02), 0.014); await setPx(Math.round(Number(realEth) * 0.94), 'down 6%');
await T(false, Math.round(P * 0.9), 0.014, true); await state('loss realized, flat');
log({ step: 'SCENARIO realized-loss reopen', sim: await sim(vault, V.abi, 'trade', [4, true, e8(Math.round(P)), e8(0.004), false]) });
await send(vault, V.abi, 'trade', [4, true, e8(Math.round(P)), e8(0.004), false], 'REJECT reopen after realized loss (in breach)', 800_000n);
// reset for next scenarios
await setPx(Number(realEth), 'restore'); await send(vault, V.abi, 'setFloor', [-5_000_000n], 'floor -5'); await send(vault, V.abi, 'setDailyLoss', [0n], 'daily loss off (isolate floor runs)'); await state('reset');
// 3) retry flatten after a missed close, 4) latency runs
async function breachRun(label, miss) {
  await setPx(Number(realEth), 'restore');
  const eq = Number(await rd('equityPnl')); await send(vault, V.abi, 'setFloor', [BigInt(eq - 1_000_000)], 'floor = equity - 1');
  if (await rd('breached')) await send(vault, V.abi, 'rearm', [], 'rearm'); await T(true, Math.round(P * 1.02), 0.014);
  const opened = Number((await rd('position', [4])).szi); if (opened === 0) throw new Error(label + ': open did not fill');
  log({ step: label + ' opened', szi: opened });
  if (miss) await send(A.cw, SC, 'setMissNext', [vault, 1n], 'sim: drop next close order (missed band)');
  const r = await setPx(Math.round(Number(realEth) * 0.96), 'down 4% -> crosses floor'); const tBreach = r.blockTsMs;
  let tFlat = null; for (let k = 0; k < 160; k++) { if (Number((await rd('position', [4])).szi) === 0) { tFlat = Date.now(); break; } await sleep(250); }
  const blk = await pub.getBlock(); log({ step: 'RESULT ' + label, breachBlockTsMs: tBreach, flatObservedMs: tFlat, breachToFlatMs: tFlat ? tFlat - tBreach : null, missInjected: miss });
  await setPx(Number(realEth), 'restore'); await sleep(1500);
}
await breachRun('retry-flatten', true);
for (let i = 0; i < 5; i++) await breachRun('latency run ' + i, false);
// 5) settle with profit split: rearm, open, price +8%, backer stop -> keeper flattens -> settle
await send(vault, V.abi, 'setFloor', [BigInt(Number(await rd('equityPnl')) - 3_000_000)], 'floor = equity - 3');
if (await rd('breached')) await send(vault, V.abi, 'rearm', [], 'rearm'); await T(true, Math.round(P * 1.02), 0.014);
if (Number((await rd('position', [4])).szi) === 0) throw new Error('settle scenario: open did not fill');
await setPx(Math.round(Number(realEth) * 1.08), 'up 8%'); await state('in profit'); await send(vault, V.abi, 'stop', [], 'backer stop');
for (let k = 0; k < 60 && Number((await rd('position', [4])).szi) !== 0; k++) await sleep(500);
await state('stopped+flat'); const s = await send(vault, V.abi, 'settle', [], 'settle (20% profit share to trader)', 800_000n);
const lg = (await pub.getTransactionReceipt({ hash: s.tx })).logs.length; log({ step: 'SCENARIO settle', logs: lg });
keeper.kill(); anvil.kill(); process.exit(0);
