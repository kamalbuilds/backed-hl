// Chain + data layer. Reads HyperEVM testnet and the HyperCore info API directly; writes go through the user's wallet.
import { createPublicClient, createWalletClient, custom, http, defineChain, type Address, type WalletClient } from 'viem'

export const chain = defineChain({
  id: 998, name: 'HyperEVM Testnet', nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] } },
  blockExplorers: { default: { name: 'purrsec', url: 'https://testnet.purrsec.com' } },
})
export const EXPLORER = chain.blockExplorers.default.url
// one JSON-RPC batch per tick: the public testnet RPC rate limits per request
export const pub = createPublicClient({ chain, transport: http(undefined, { batch: { wait: 20 }, retryCount: 2, retryDelay: 800 }) })
export const rpcLimited = (e: unknown) => /limit|429|rate|fetch|timed? ?out|HTTP request failed/i.test(String((e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || e))
const INFO = 'https://api.hyperliquid-testnet.xyz/info'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Evidence = { factory: string; vault: string; groups: { title: string; kind: string; items: { label: string; tx: string | null }[] }[] }
export type Data = { abi: { vault: any; factory: any }; evidence: Evidence; config: { factory: Address; liveVault: Address }; snapshot?: Vault & { at: number; vault: string } }
export type Pos = { m: number; szi: number; px: number }
export type Vault = { backer: string; trader: string; maxLev: number; cap: number; floor: number; breached: boolean; settled: boolean; reason: number; eq: number; markets: number[]; pos: Pos[]; dl: number; bo: number; sh: number }
export type Fill = { time: number; coin: string; px: string; sz: string; dir: string; closedPnl: string; fee: string; hash: string }

export const MK: Record<number, string> = { 4: 'ETH', 3: 'BTC', 5: 'SOL' }
export const SZD: Record<number, number> = { 4: 4, 3: 5, 5: 2 }
export const pxOf = (p: Pos) => p.px / 10 ** (6 - (SZD[p.m] ?? 2))
export const usd = (x: number) => (x / 1e6).toFixed(2)
export const sgn = (x: number) => (x >= 0 ? '+' : '\u2212') + Math.abs(x).toFixed(2)
export const short = (a: string) => a.slice(0, 6) + '\u2026' + a.slice(-4)
const TZ = { timeZone: 'Asia/Kolkata', hour12: false } as const
export const hhmm = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { ...TZ, hour: '2-digit', minute: '2-digit' }) + ' IST'

export async function loadData(): Promise<Data> {
  const r = await fetch('./data.json')
  if (!r.ok) throw new Error('data.json ' + r.status)
  return r.json()
}

export async function readVault(abi: any, vault: Address): Promise<Vault> {
  const rd = (functionName: string, args: unknown[] = []) => pub.readContract({ address: vault, abi, functionName, args }) as Promise<any>
  const keys = ['backer', 'trader', 'maxLev', 'capital', 'floorPnl', 'breached', 'settled', 'breachReason', 'equityPnl', 'marketCount', 'dailyLossUsd6', 'bountyUsd6', 'traderShareBps']
  const [backer, trader, maxLev, cap, floor, breached, settled, reason, eq, n, dl, bo, sh] = await Promise.all(keys.map((k) => rd(k)))
  const markets: number[] = await Promise.all([...Array(Number(n)).keys()].map(async (i) => Number(await rd('markets', [i]))))
  const pos = await Promise.all(markets.map(async (m) => ({ m, szi: Number((await rd('position', [m])).szi), px: Number(await rd('oraclePx', [m])) })))
  return { backer, trader, maxLev: Number(maxLev), cap: Number(cap), floor: Number(floor), breached, settled, reason: Number(reason), eq: Number(eq), markets, pos, dl: Number(dl), bo: Number(bo), sh: Number(sh) }
}

async function info(body: object) {
  const r = await fetch(INFO, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) throw new Error('info ' + r.status)
  return r.json()
}
export async function loadFills(vault: string): Promise<{ fills: Fill[]; bounties: number }> {
  const [fills, ledger] = await Promise.all([info({ type: 'userFills', user: vault }), info({ type: 'userNonFundingLedgerUpdates', user: vault, startTime: 0 }).catch(() => [])])
  const bounties = (ledger as any[]).filter((u) => u.delta?.type === 'spotTransfer' && u.delta.user?.toLowerCase() === vault.toLowerCase()).length
  return { fills: (fills as Fill[]).sort((a, b) => a.time - b.time), bounties }
}

export function vaultState(s: Vault): { word: string; alarm: boolean } {
  if (s.settled) return { word: 'Settled', alarm: false }
  if (s.breached && s.pos.some((p) => p.szi)) return { word: 'Closing', alarm: true }
  if (s.breached) return { word: 'Flattened and frozen', alarm: true }
  if (s.reason) return { word: 'Below the line, anyone can flatten', alarm: true }
  return { word: 'Trading', alarm: false }
}

// median live breach-to-flat run from the evidence file (V3, funded)
export function medianRun(ev: Evidence) {
  const rows = ev.groups[0].items.map((i) => ({ ...i, ms: Number((i.label.match(/fill (\d+) ms/) || [])[1]) })).filter((r) => r.ms).sort((a, b) => a.ms - b.ms)
  return { ...rows[Math.floor(rows.length / 2)], runs: rows.length }
}

let wallet: WalletClient | null = null
let me: Address | null = null
type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> }
export async function connect(): Promise<Address> {
  const eth = (window as unknown as { ethereum?: Eth }).ethereum
  if (!eth) throw new Error('No browser wallet found. Install Rabby or MetaMask to send.')
  try { await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x3e6' }] }) } catch {
    await eth.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x3e6', chainName: 'HyperEVM Testnet', nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 }, rpcUrls: ['https://rpc.hyperliquid-testnet.xyz/evm'], blockExplorerUrls: [EXPLORER] }] })
  }
  wallet = createWalletClient({ chain, transport: custom(eth) })
  ;[me] = await wallet.requestAddresses()
  return me
}
export const account = () => me

export type WriteResult = { ok: boolean; text: string; tx?: string }
export async function write(address: Address, abi: any, functionName: string, args: unknown[], gas = 1_500_000n): Promise<WriteResult> {
  try {
    if (!wallet || !me) await connect()
    await pub.simulateContract({ account: me!, address, abi, functionName, args })
    const hash = await wallet!.writeContract({ account: me!, chain, address, abi, functionName, args, gas })
    const r = await pub.waitForTransactionReceipt({ hash })
    return { ok: r.status === 'success', text: `${functionName} ${r.status === 'success' ? 'confirmed' : 'reverted'}`, tx: hash }
  } catch (e: any) {
    return { ok: false, text: 'Not sent: ' + String(e.shortMessage || e.message).split('\n').pop() }
  }
}
export async function signOrder(vault: Address, o: { asset: number; isBuy: boolean; limitPx8: bigint; sz8: bigint; reduceOnly: boolean }) {
  if (!wallet || !me) await connect()
  const order = { ...o, nonce: BigInt(Date.now()), deadline: BigInt(Math.floor(Date.now() / 1000) + 300) }
  const sig = await wallet!.signTypedData({
    account: me!, domain: { name: 'BACKED', version: '3', chainId: 998, verifyingContract: vault }, primaryType: 'Order',
    types: { Order: [{ name: 'asset', type: 'uint32' }, { name: 'isBuy', type: 'bool' }, { name: 'limitPx8', type: 'uint64' }, { name: 'sz8', type: 'uint64' }, { name: 'reduceOnly', type: 'bool' }, { name: 'nonce', type: 'uint256' }, { name: 'deadline', type: 'uint256' }] },
    message: order,
  })
  return { order, v: parseInt(sig.slice(130, 132), 16), r: sig.slice(0, 66) as `0x${string}`, s: ('0x' + sig.slice(66, 130)) as `0x${string}` }
}
