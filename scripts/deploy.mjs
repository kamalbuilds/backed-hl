// deploy factory (needs big blocks on testnet: evmUserModify usingBigBlocks) and create one ETH+BTC vault with backer=trader=operator
import fs from 'node:fs';
import { getAddress } from 'viem';
import { account, wallet, pub, V, F, DEP, log, send } from './common.mjs';
const h = await wallet.deployContract({ abi: F.abi, bytecode: F.bytecode.object, args: [], gas: 6_000_000n });
const r = await pub.waitForTransactionReceipt({ hash: h, timeout: 300_000 }); const factory = getAddress(r.contractAddress);
log({ step: 'factory deploy', factory, tx: h, status: r.status, gasUsed: r.gasUsed });
const trader = process.env.BACKED_TRADER || account.address;
await send(factory, F.abi, 'create', [trader, [4, 3], [4, 5], 3n, -2_000_000n, 1_000_000n, 2000, 100_000n], 'create vault ETH+BTC 3x floor-2 daily-1 share20% bounty0.1', 5_000_000n);
const vaults = await pub.readContract({ address: factory, abi: F.abi, functionName: 'all' }); const vault = vaults[vaults.length - 1];
fs.writeFileSync(DEP, JSON.stringify({ factory, vault, backer: account.address, trader, tx: h }, null, 2)); log({ step: 'vault', vault });
