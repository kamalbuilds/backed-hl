// shared viem setup for BACKED V3 scripts (HyperEVM TESTNET 998 only; testnet demo-operator key, never printed)
import fs from 'node:fs';
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
export const ROOT = new URL('..', import.meta.url).pathname;
export const RPC = process.env.BACKED_RPC || 'https://rpc.hyperliquid-testnet.xyz/evm';
export const account = privateKeyToAccount(process.env.BACKED_PK || JSON.parse(fs.readFileSync(process.env.BACKED_KEYFILE || '/Users/kamal/Desktop/solana/cwf/hyperliquid/.keys/demo-operator.json', 'utf8'))[0].private_key);
export const chain = defineChain({ id: 998, name: 'HyperEVM Testnet', nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } });
const transport = http(RPC, { retryCount: 8, retryDelay: 1500 });
export const wallet = createWalletClient({ account, chain, transport });
export const pub = createPublicClient({ chain, transport, pollingInterval: 500 });
if ((await pub.getChainId()) !== 998) throw new Error('not chain 998');
export const art = (n) => JSON.parse(fs.readFileSync(`${ROOT}out/${n.startsWith("Sim") ? "SimCore" : n}.sol/${n}.json`, 'utf8'));
export const V = art('BackedVaultV3'), F = art('BackedFactory');
export const DEP = ROOT + (process.env.BACKED_DEP || 'deployment.json');
export const dep = () => JSON.parse(fs.readFileSync(DEP, 'utf8'));
export const LOG = ROOT + (process.env.BACKED_LOG || 'evidence/testnet-v3-runs.jsonl');
export const log = (o) => { const l = JSON.stringify({ t: Date.now(), net: process.env.BACKED_NET || 'testnet', ...o }, (k, v) => typeof v === 'bigint' ? v.toString() : v); console.log(l); fs.appendFileSync(LOG, l + '\n'); };
export const e8 = (x) => BigInt(Math.round(x * 1e8));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const info = (b) => fetch('https://api.hyperliquid-testnet.xyz/info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then((r) => r.json());
export async function send(address, abi, fn, args, label, gas = 1_500_000n) {
  const hash = await wallet.writeContract({ address, abi, functionName: fn, args, gas });
  const r = await pub.waitForTransactionReceipt({ hash, timeout: 180_000 });
  const blk = await pub.getBlock({ blockNumber: r.blockNumber });
  const o = { step: label, tx: hash, status: r.status, block: r.blockNumber, blockTsMs: Number(blk.timestamp) * 1000 }; log(o); return o;
}
export async function sim(address, abi, fn, args, from = account.address) {
  try { await pub.simulateContract({ account: from, address, abi, functionName: fn, args }); return 'ok'; } catch (e) { return (e.shortMessage ?? e.message).split('\n').pop(); }
}
