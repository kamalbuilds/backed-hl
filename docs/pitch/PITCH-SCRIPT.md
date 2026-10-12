# BACKED pitch script (Colosseum: what we are building, why us)

Spoken by Kamal, first person. Target 1:55, hard limit 2:00. About 300 spoken words.

---

**What I'm building (0:00 to 1:00)**

Hi, I'm Kamal. I'm building BACKED, on Hyperliquid.

Lots of people can trade but have no capital. Others would back a good trader, but only if their money has rules. Today that trust runs through someone's server. Prop firms sell challenges, and about 7 percent of buyers ever get paid. Pool products hold an API key and promise to stop a losing trader.

BACKED removes the key. A backer puts USDC into a vault contract on HyperEVM, and that contract owns its own Hyperliquid trading account. The trader can only trade through the contract. Every order is checked on chain first: allowed markets, total leverage at the oracle price, the loss line, a daily loss limit. A 20x order is simply refused. When equity crosses the backer's line, anyone can call flatten, the contract closes every position and pays the caller a small bounty. The profit split is fixed in the code, and settle pays it.

**Why me (1:00 to 1:45)**

I think in failure cases. Before building the app, I ran a breach test on testnet to see if a contract could close a position fast enough. Then I had four independent reviews try to break it. They found real holes: losses you could realize and hide, a flatten that could freeze, and a backer who could change rules mid-trade. I fixed each one, with tests, and now the rules lock after the first trade.

I also measured it instead of promising it. Across five funded breaches on testnet, the time from crossing the line to fully flat had a median of 2.05 seconds. And on October 11 a plain flatten call closed a real position and paid the caller a 0.1 USDC bounty. That transaction is linked below.

**Close (1:45 to 2:00)**

Every claim has a transaction link on the live site, and anything simulated says so. The payout is code, and no key exists.

---

## Sources
- Breach-to-flat latency, 5 funded testnet runs (1768 / 1206 / 50558* / 2053 / 2357 ms, median 2.05 s; *one flatten waited about 51 s for block inclusion): `evidence/testnet-live-runs.jsonl`, README "Feature status"
- Permissionless flatten with 0.1 USDC bounty, 11 Oct 2026: https://testnet.purrsec.com/tx/0xde09fdff27bd02628d8a4b8fffc456a3726d299fcfdf3809876a34628e068004
- Keeper flatten after a daily-loss breach (flat about 3 s after the flag): https://testnet.purrsec.com/tx/0x7e6b2c60ad8d06b597703ea04abf28f8d3cc1894cf9c83f022f7156d6b11f4df
- Four independent reviews and the fixes: `evidence/spikes/`, README "Built before vs during"; rule lock after the first trade: commit `e6e4894`, `test/BackedVaultV3.t.sol`
- 7% of prop challenge buyers paid: Track360, cited in README "Business model"
- Live app: https://backed-2v9.pages.dev · Code: https://github.com/kamalbuilds/backed-hl
