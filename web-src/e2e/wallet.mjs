// Injected test wallet for Playwright: window.ethereum -> Node, signed by a local viem account (testnet key file, never logged).
import fs from 'node:fs';
import { createWalletClient, createPublicClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
export const chain = defineChain({ id: 998, name: 'HyperEVM Testnet', nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.hyperliquid-testnet.xyz/evm'] } } });
const key = JSON.parse(fs.readFileSync(process.env.BACKED_KEYFILE || '/Users/kamal/Desktop/solana/cwf/hyperliquid/.keys/backed-operator-2.json', 'utf8'))[0].private_key;
export const account = privateKeyToAccount(key.startsWith('0x') ? key : '0x' + key);
const transport = http(undefined, { retryCount: 4, retryDelay: 1500 });
export const pub = createPublicClient({ chain, transport });
export const wc = createWalletClient({ chain, transport, account });
export const txs = [];
export async function handle(method, params = []) {
  switch (method) {
    case 'eth_requestAccounts': case 'eth_accounts': return [account.address];
    case 'eth_chainId': return '0x3e6';
    case 'wallet_switchEthereumChain': case 'wallet_addEthereumChain': return null;
    case 'eth_sendTransaction': {
      const t = params[0];
      let hash; for (let i = 0; ; i++) { try { hash = await wc.sendTransaction({ to: t.to, data: t.data, value: t.value ? BigInt(t.value) : 0n, gas: t.gas ? BigInt(t.gas) : undefined }); break; } catch (e) { console.log('  wallet send error', (e.shortMessage || e.message).slice(0, 160)); if (i > 3 || /revert/i.test(e.message)) throw e; await new Promise((r) => setTimeout(r, 3000)); } }
      txs.push({ at: Date.now(), hash }); console.log('  tx', hash); return hash;
    }
    case 'eth_signTypedData_v4': { const d = JSON.parse(params[1]); const { EIP712Domain, ...types } = d.types; return account.signTypedData({ domain: d.domain, types, primaryType: d.primaryType, message: d.message }); }
    default: return pub.request({ method, params });
  }
}
export async function install(page) {
  await page.exposeFunction('__pwRpc', async (m, p) => { try { return { r: await handle(m, p) } } catch (e) { return { e: String(e.shortMessage || e.message).slice(0, 300) } } });
  await page.addInitScript(() => {
    window.ethereum = { isMetaMask: false, request: async ({ method, params }) => { const o = await window.__pwRpc(method, params || []); if (o.e) throw new Error(o.e); return o.r; }, on() {}, removeListener() {} };
  });
  page.on('dialog', (d) => d.accept());
}
