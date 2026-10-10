import { pub, account } from './wallet.mjs';
import fs from 'node:fs';
const d = JSON.parse(fs.readFileSync('public/data.json'));
console.log('HYPE', Number(await pub.getBalance({ address: account.address })) / 1e18);
const args = [account.address, [4, 3], [4, 5], 3n, -2000000n, 0n, 2000, 100000n];
try { await pub.simulateContract({ account: account.address, address: d.config.factory, abi: d.abi.factory, functionName: 'create', args }); console.log('sim ok'); } catch (e) { console.log('sim ERR', (e.shortMessage || e.message).slice(0, 300)); }
try { console.log('est', await pub.estimateContractGas({ account: account.address, address: d.config.factory, abi: d.abi.factory, functionName: 'create', args })); } catch (e) { console.log('est ERR', (e.shortMessage || e.message).slice(0, 300)); }
const r = await fetch('https://api.hyperliquid-testnet.xyz/info', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'userEvmBigBlocks' , user: account.address }) }).then(r=>r.text()).catch(e=>String(e)); console.log('bigblocks', r.slice(0,100));
