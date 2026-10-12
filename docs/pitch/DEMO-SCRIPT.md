# BACKED demo script (shot by shot)

Target 2:50, hard limit 3:00. 1440x900 browser at https://backed-2v9.pages.dev (HyperEVM testnet, chain 998). Voice over by Kamal, first person. Script only; nothing here is recorded yet.

Before you record: open the site once and wait for the loss line to load, so the first shot shows live numbers and a green "Armed" chip, not a snapshot. If the chip says "RPC retrying", reload.

| # | Time | On screen | Action | Voice over |
|---|---|---|---|---|
| 1 | 0:00-0:15 | Top of the page: headline "Back a trader. The contract enforces your rules.", Testnet chip, Armed chip | Still frame, then move the cursor to the vault address pill | "This is BACKED. A backer funds a vault, a trader trades it, and this contract on HyperEVM enforces the backer's rules. No one holds a key to it." |
| 2 | 0:15-0:40 | Loss line card: the big room number, the ruler with the red backer's line and the flatten zone | Hover the ruler; point at the room bracket, then the metric cards | "The first thing you see is the one number that matters: how much room this vault has above the backer's loss line. Here, account value, PnL against capital, positions, and the leverage cap. Below the red line, anyone can close it." |
| 3 | 0:40-1:05 | Order desk, Trader tab | Click "Check an ETH long under the cap". Wait for four green Pass chips and the order summary | "Let's try a safe order. The desk sizes it to the room left under the cap. The contract simulates it as the trader: market allowed, leverage after the fill, loss line, not frozen." |
| 4 | 1:05-1:25 | Order summary box | Point at each line of the summary | "Before anything is signed, it says in plain words what happens: buy this much ETH, about this many dollars, exposure after the fill, and what a 1 percent move against the whole book would leave above the line. Nothing is sent until the wallet confirms." |
| 5 | 1:25-1:45 | Same desk | Click "Over cap (20x)". Leverage chip turns red, verdict "The contract refuses it: leverage above backer limit". Then click "Blocked market (SOL)" | "Now a bad one. 20x is refused by the contract, not by a server. A market the backer didn't allow is refused too. There is no other path, because no key exists that could send it another way." |
| 6 | 1:45-2:10 | Click "Replay a breach" on the loss line card | The PnL marker slides into the flatten zone and the card shows the alarm | "This replay shows what a breach looks like. It's the only animation on the page. When equity crosses the line, anyone can call flatten. The contract closes every position and pays the caller a small bounty." |
| 7 | 2:10-2:35 | Judge checkpoints, then "Verify on chain" tab with the 7 recorded steps open | Click the "Flatten below line" hash; the explorer opens in a new tab; come back | "This is real. On testnet: an allowed order filled, an over-cap order reverted, a flatten below the line. Breach to flat took a median of 2.05 seconds over five funded runs. Every step opens the explorer." |
| 8 | 2:35-2:50 | Scroll to "What no one can do", then "About BACKED", "Who holds the key" tab | Slow scroll, stop on the comparison | "Compared with an operator-run pool, nobody here can skip the rules, keep a losing trade open, or withhold the payout. The payout is code, and no key exists." |

## Honesty notes for the take
- Say "testnet" at least once (shot 1 chip, shot 7 voice over).
- The profit split on a profitable settle and the flatten retry after a missed price band are unit-tested and simulated only; do not claim them as live runs.
- The builder fee is planned, not built; do not show it as revenue.
- If the RPC is slow during the take, the desk shows "Unavailable" with a Retry button. Retry, or cut and re-shoot shot 3.
