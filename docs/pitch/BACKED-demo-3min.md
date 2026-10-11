# BACKED: 3 minute demo script

Recorded at 1440x900 against https://backed-2v9.pages.dev. Files: demo.mp4 and demo.webm in this folder. No mainnet, no spend: the recording only reads the chain and simulates orders. The live transactions it points to come from the browser click-through on 11 Oct 2026.

| Time | On screen | Say |
|---|---|---|
| 0:00 | Top of the page, the ruler | "This is a BACKED vault on HyperEVM testnet. The ruler is the backer's money: zero is starting capital, the orange line is where the backer said stop." |
| 0:20 | Status line under the headline | "The status line is read from the contract, with its read time. If the RPC is down, it says so instead of guessing." |
| 0:35 | Trader tab, press Within cap (2.5x) | "A trader enters an order. Before anything is sent, the page asks the contract to simulate it as the trader. 2.5x on an allowed market: the contract accepts." |
| 0:55 | Press Over cap (20x) | "Now Over cap, a 20x order. The contract refuses: leverage above backer limit. There is no button that gets around this, because there is no operator key. The vault is the only thing that can place an order." |
| 1:15 | Press Blocked market (SOL) | "SOL is not on this backer's list, so that is refused too." |
| 1:25 | Press Replay a breach | "This replay is the one animated thing on the page and it is labeled. It uses our measured median: 2.05 seconds from breach to a flat position on testnet." |
| 1:45 | Scroll to Rules | "Every rule here is a contract value, with the test or transaction that proves it." |
| 2:00 | Scroll to Incidents | "Every real breach and refused order from our live runs, with the transaction." |
| 2:15 | Scroll to For judges | "For judges: four steps, each a link to the explorer. Create, an allowed trade, a breach and flatten, the public keeper closing in 4.8 seconds after a stop, a gasless signed order, and settle paying the backer." |
| 2:35 | Scroll to Business model | "Traders pay nothing up front. Backers pay a small builder fee per order, planned, not yet in the contract. Sources are linked." |
| 2:50 | Who holds the key table | "Compared with an operator-run pool, BACKED has no operator to trust. Fund a trader without giving anyone a key." |
