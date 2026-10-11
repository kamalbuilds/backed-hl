# BACKED: 2 minute pitch

Live: https://backed-2v9.pages.dev (mirror: https://kamalbuilds.github.io/backed-hl/)

## The problem (20 s)

Retail prop firms made about $585M in 2025, mostly from challenge fees, and about 7% of the people who pay ever get a payout (Track360). The trader pays to prove themselves. The firm holds the money and the key. On Hyperliquid, the pools that fund traders today still run an operator: a server and an API wallet that place the orders and decide when to stop a losing trader. If that operator is slow, wrong, or gone, the backer's money is exposed.

## What BACKED is (30 s)

BACKED is a vault on HyperEVM that a backer funds and a trader trades. The vault contract is the only thing that can place an order on HyperCore. Every order goes through the contract, and the contract checks the backer's rules first: which markets, the most leverage, the loss line, a daily loss limit. A 20x order on a 3x vault does not get sent. It reverts.

When equity crosses the loss line, anyone can call flatten and close every position. The caller earns a small bounty from the vault. Nobody needs our server. We run a public keeper, but if it stops, any bot or any person can do the same job.

## Proof (40 s)

All of this is on HyperEVM testnet with real HyperCore fills.

- Five funded breach runs. Median time from breach to flat position: 2.05 seconds. Four of five were under 2.4 seconds.
- A browser click-through with a test wallet: create a vault, fund it, an allowed trade, a refused 20x, a breach and flatten, a gasless signed order sent by a relayer, then settle, which paid the backer back. Every step has a transaction on the site under "For judges".
- 27 forge tests, including the two bugs a reviewer found: a trader realizing losses to dodge the line, and a vault frozen with a position still open. Both are fixed and tested.

## Business (20 s)

Traders pay nothing up front. They keep the profit share the backer sets, and the contract pays it at settle. Backers pay a builder fee on orders the vault sends. Hyperliquid allows up to 0.1% on perps; we plan far less. Hyperliquid did about $206B in perp volume over the last 30 days (DefiLlama). At a 0.02% fee, $10M a month through BACKED vaults is $2,000 a month. That is arithmetic, not a forecast. The fee is planned and not in the contract yet.

## Ask (10 s)

BACKED turns "trust the operator" into "read the contract". Fund a trader on Hyperliquid without giving anyone a key.
