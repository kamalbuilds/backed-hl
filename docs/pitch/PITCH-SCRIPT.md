# BACKED pitch script (Colosseum: what we are building, why us)

Spoken by Kamal, first person. Target 1:50, hard limit 2:00. About 290 words.

---

**What I'm building (0:00 to 1:00)**

Hi, I'm Kamal. I'm building BACKED, on Hyperliquid.

Here's the problem. Lots of people can trade but have no capital. Lots of people have capital and would back a good trader, but only if their money has rules. Today that trust runs through a person or a server. Prop firms sell challenges, and about 7 percent of challenge buyers ever get paid. Pool products hold an API key and promise to stop a losing trader. You are trusting whoever holds that key.

BACKED removes the key. A backer puts USDC into a vault contract on HyperEVM, and that contract owns its own Hyperliquid trading account. The trader can only trade through the contract. Every order is checked on chain first: allowed markets, total leverage at the oracle price, the loss line, a daily loss limit. A 20x order is simply refused. When equity crosses the backer's line, anyone can call flatten, the contract closes every position and pays the caller a small bounty. On testnet that took a median of about 2 seconds across five funded runs. The profit split is fixed in the code, and settle pays it.

**Why me (1:00 to 1:45)**

I think in failure cases. Before building the app, I ran a breach test on testnet to see if a contract could close a position fast enough. Then I had four independent reviews try to break it. They found real holes: losses you could realize and hide, a flatten that could freeze, and a backer who could change rules mid-trade. I fixed each one, with tests, and now the rules lock after the first trade.

[One or two true sentences about your background: what you have shipped before, or why trading and trust matter to you.]

**Close (1:45 to 2:00)**

Everything I claim has a transaction link on the live site, and where something is only simulated, it says so. The payout is code, and no key exists.
