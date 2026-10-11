import { pub } from './wallet.mjs';
import fs from 'node:fs';
import { decodeEventLog } from 'viem';
const d = JSON.parse(fs.readFileSync('public/data.json'));
for (const h of ['0xde09fdff27bd02628d8a4b8fffc456a3726d299fcfdf3809876a34628e068004','0x41ad0151a379f1577ac09fad27a87add80f41b7c0980533fd7f3c778ac17d943','0xd764ed6fb754d3eed9179cb5001bc1f827accb6074ae36a2c0fc7131fe549271']) {
  const r = await pub.getTransactionReceipt({ hash: h });
  console.log(h.slice(0,10), r.status, r.from, r.logs.map((l) => { try { const e = decodeEventLog({ abi: d.abi.vault, data: l.data, topics: l.topics }); return e.eventName + JSON.stringify(e.args, (k, v) => typeof v === 'bigint' ? v.toString() : v) } catch { return 'raw:' + l.address.slice(0,8) } }).join(' | '));
}
for (const V of ['0x661971C1183088D6290395F4dE15Be9858DeF049']) for (const f of ['backer','trader','breached','settled','isFlat','capital','accountValue','floorPnl','dailyLossUsd6','bountyUsd6','maxLev','traderShareBps']) { try { console.log(f, String(await pub.readContract({ address: V, abi: d.abi.vault, functionName: f }))) } catch (e) { console.log(f, 'n/a') } }
console.log(d.abi.vault.filter(x=>x.type==='function'&&x.stateMutability==='view').map(x=>x.name).join(' '));
