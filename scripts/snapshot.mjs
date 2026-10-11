// read the live vault once and write app/snapshot.json so the page paints real on-chain state before its own RPC calls return
import fs from 'node:fs';
import { pub, V, ROOT } from './common.mjs';
const { vault } = JSON.parse(fs.readFileSync(ROOT + 'deployment-live.json', 'utf8'));
const rd = (f, a = []) => pub.readContract({ address: vault, abi: V.abi, functionName: f, args: a });
const keys = ['backer', 'trader', 'maxLev', 'capital', 'floorPnl', 'breached', 'settled', 'breachReason', 'equityPnl', 'marketCount', 'dailyLossUsd6', 'bountyUsd6', 'traderShareBps'];
const v = {}; for (const k of keys) v[k] = await rd(k);
const markets = []; for (let i = 0; i < Number(v.marketCount); i++) markets.push(Number(await rd('markets', [i])));
const pos = []; for (const m of markets) pos.push({ m, szi: Number((await rd('position', [m])).szi), px: Number(await rd('oraclePx', [m])) });
const s = { vault, at: Date.now(), backer: v.backer, trader: v.trader, maxLev: Number(v.maxLev), cap: Number(v.capital), floor: Number(v.floorPnl), breached: v.breached, settled: v.settled, reason: Number(v.breachReason), eq: Number(v.equityPnl), markets, pos, dl: Number(v.dailyLossUsd6), bo: Number(v.bountyUsd6), sh: Number(v.traderShareBps) };
fs.writeFileSync(ROOT + 'app/snapshot.json', JSON.stringify(s)); console.log('snapshot', new Date(s.at).toISOString(), s.eq, s.floor);
