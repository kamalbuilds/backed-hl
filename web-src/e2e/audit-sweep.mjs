import { pub, wc } from './wallet.mjs';
import fs from 'node:fs';
import { encodeAbiParameters, encodePacked } from 'viem';
const d = JSON.parse(fs.readFileSync('public/data.json')); const abi = d.abi.vault;
const REF = '0x661971C1183088D6290395F4dE15Be9858DeF049', E2E = '0xa33D732D142BE60946a5F0Ae1a36E88185A78A5B';
const w = async (address, abiX, fn, args = []) => { const h = await wc.writeContract({ address, abi: abiX, functionName: fn, args, gas: 1_500_000n }); const r = await pub.waitForTransactionReceipt({ hash: h }); console.log(fn, r.status, h); return h; };
const spot = async (u) => (await (await fetch('https://api.hyperliquid-testnet.xyz/info', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'spotClearinghouseState', user: u }) })).json()).balances.find((b) => b.coin === 'USDC')?.total ?? '0';
// restore reference vault
await w(REF, abi, 'setDailyLoss', [0n]); await w(REF, abi, 'rearm');
// sweep test
const CW = [{ type: 'function', name: 'sendRawAction', stateMutability: 'nonpayable', inputs: [{ name: 'data', type: 'bytes' }], outputs: [] }];
console.log('vault spot before', await spot(E2E));
await w('0x3333333333333333333333333333333333333333', CW, 'sendRawAction', [encodePacked(['uint8', 'uint24', 'bytes'], [1, 6, encodeAbiParameters([{ type: 'address' }, { type: 'uint64' }, { type: 'uint64' }], [E2E, 0n, 100000000n])])]);
await new Promise((r) => setTimeout(r, 8000)); const b = await spot(E2E); console.log('vault spot after send', b);
await w(E2E, abi, 'sweep', [BigInt(Math.round(Number(b) * 1e8))]);
await new Promise((r) => setTimeout(r, 8000)); console.log('vault spot after sweep', await spot(E2E));
