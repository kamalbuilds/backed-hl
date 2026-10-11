// create a vault on the deployed factory (msg.sender = backer; wallet needs big blocks: scripts/bigblocks.ts true)
// env BACKED_OUT (deployment-live.json). args: trader? (defaults to backer)
import fs from 'node:fs';
import { account, F, ROOT, log, send, pub } from './common.mjs';
const factory = JSON.parse(fs.readFileSync(ROOT + 'deployment.json', 'utf8')).factory;
const trader = process.argv[2] || account.address;
await send(factory, F.abi, 'create', [trader, [4, 3], [4, 5], 3n, -2_000_000n, 0n, 2000, 100_000n], 'create live vault ETH+BTC 3x floor-2 share20% bounty0.1', 5_000_000n);
const all = await pub.readContract({ address: factory, abi: F.abi, functionName: 'all' }); const vault = all[all.length - 1];
fs.writeFileSync(ROOT + (process.env.BACKED_OUT || 'deployment-live.json'), JSON.stringify({ factory, vault, backer: account.address, trader }, null, 2)); log({ step: 'live vault', vault, backer: account.address });
