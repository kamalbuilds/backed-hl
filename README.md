# BACKED: fund a trader on Hyperliquid, the contract holds the key

Live: https://backed-2v9.pages.dev (mirror https://kamalbuilds.github.io/backed-hl/) · Hyperliquid testnet, HyperEVM chain 998 · Code: https://github.com/kamalbuilds/backed-hl

A backer puts USDC into a HyperEVM vault contract that owns its own HyperCore trading account. A trader trades it, but only through the contract: every order is checked on chain against the backer's rules before the contract sends it to HyperCore. When equity crosses the backer's loss line, anyone can call `flatten()` and the contract closes every position, paying the caller a small bounty. There is no operator key, no API wallet and no server in the trust path.

## For judges (about 60 seconds)

1. Open the live site. "Verify on chain" in the header jumps to the walkthrough. Every step is an explorer link.
2. On the ticket, press "Over cap (20x)". The contract simulation refuses it ("leverage above backer limit"). Nothing is sent, because no key exists that could send it another way.
3. Check the recorded run on vault `0xa33D732D142BE60946a5F0Ae1a36E88185A78A5B` (11 Oct 2026, browser + test wallet):

| Step | Transaction |
|---|---|
| Create vault (factory) | `0x48461a5b7961c078cc6d8d4153312797b5a6bc509b9626aea0143c37dae5ebde` |
| Send 11 USDC to the vault from the site (CoreWriter spotSend) | `0x1a866d3a1748a673becd9533039d0755b70cb2bb31fbf3c3e7884a9f78bd2547` |
| Move 10 USDC to trading margin | `0xb80d1bbd3ea0ad7861e02c89f4fc89bbec9bdaed1204a2595f125993c56871d3` |
| Allowed 2.5x ETH long (fill 0.01 @ 2499.9) | `0x09d764ed60ba64ceb904d81a0ca61b8fe03aff530d66f92f8d33475b51fae961` |
| 20x order | refused in simulation, no tx |
| Loss line moved above equity (breach) | `0x31166ddcf02968a7e1620989239ce512644809ef1daf91ca624c6400ec2fbc2e` |
| Flatten (close fill @ 2501.4, 0.1 USDC bounty to caller) | `0xde09fdff27bd02628d8a4b8fffc456a3726d299fcfdf3809876a34628e068004` |
| Rearm | `0x5dc721196866762df65cbd57d81e0b2844cdfb2d4a01e97cedb38c3aaa127ab3` |
| Gasless signed order via `tradeBySig` | `0xeeefd331871dafb456f0cc80653a269a92bd1e93063a0c7f6ddaf0b9fbb5008d` |
| Stop, then the public keeper flattened 4.8 s later | `0xf20bbd88…1582`, keeper `0x41ad0151a379f1577ac09fad27a87add80f41b7c0980533fd7f3c778ac17d943` |
| Settle: 9.869193 USDC back to the backer | `0xd764ed6fb754d3eed9179cb5001bc1f827accb6074ae36a2c0fc7131fe549271` |
| Sweep leftover 2.0 USDC to the backer | `0x469df5484f74fd02ac94f4029a312c75fb723292a73f565ddbeaeae03680c6a5` |

Check fills yourself: `curl -s -XPOST https://api.hyperliquid-testnet.xyz/info -H 'content-type: application/json' -d '{"type":"userFills","user":"0xa33D732D142BE60946a5F0Ae1a36E88185A78A5B"}'`

## Feature status (audited 11 Oct 2026)

| Feature | Status | Evidence |
|---|---|---|
| Factory creates a vault in one call | Works, testnet | factory `0x1bc11362defc312593930ce937285b149B341a30`, create tx above |
| Fund a vault from the site (spot send + margin) | Works, testnet | txs above |
| Allowed-market list (SOL refused on an ETH/BTC vault) | Works, testnet | `evidence/testnet-v3-runs.jsonl` |
| Aggregate leverage cap at the oracle price (20x refused, fake $1 limit refused, stacked 2.5x + 1x refused) | Works, testnet | `evidence/testnet-v3-runs.jsonl`, stacked `0x043e5268…` (reverted) |
| Equity loss floor counts realized losses (rearm and reopen refused while below) | Works, testnet | `0xf59917d7…`, `0x1f822114…` |
| Daily loss limit | Works, testnet | reference vault `0x6619…F049`: checkpoint `0x3f413957…`, limit `0x7bcbe9ca…`, breach flagged 10:13:10 IST, keeper flatten `0x7e6b2c60ad8d06b597703ea04abf28f8d3cc1894cf9c83f022f7156d6b11f4df`, flat by 10:13:13 |
| Permissionless `flatten()` with one-time bounty | Works, testnet | `0xde09fdff…8004`, 0.1 USDC spotTransfer to the caller in the vault's HyperCore ledger |
| Public keeper watches every factory vault | Works, testnet | `scripts/keeper.mjs`, `evidence/keeper-testnet.jsonl`; flattens after a stop and after a daily breach above |
| Breach-to-flat latency | Works, testnet | 5 funded runs: 1768 / 1206 / 50558* / 2053 / 2357 ms, median 2.05 s (`evidence/testnet-live-runs.jsonl`) |
| Frozen after a breach until rearm | Works, testnet | 20x after breach refused with "frozen"; rearm tx above |
| `tradeBySig` gasless orders, any relayer | Works, testnet | `0xeeefd331…008d` (relayed by the same wallet in this run) |
| Settle returns principal | Works, testnet | `0xd764ed6f…9271` |
| Settle profit split when there is a profit | Unit + simulated only | `test/BackedVaultV3.t.sol`, `evidence/sim-runs.jsonl` (testnet settle so far ran at a loss, so the trader share was 0) |
| Flatten retry after a missed IOC price band | Unit + simulated only | `src/sim/SimCore.sol`, `evidence/sim-runs.jsonl` (a band miss cannot be forced on demand on testnet) |
| Sweep leftover USDC to the backer | Works, testnet | `0x469df548…a6c5` |
| Builder fee revenue | Not built | planned, see Business model |
| Mainnet | Not deployed | testnet USDC only |

\*Run 2: the flatten tx waited about 51 s for block inclusion; one fill, first attempt.

## Architecture

```
backer / trader wallet ──► BackedVaultV3 (HyperEVM) ──CoreWriter 0x3333…──► HyperCore account owned by the vault
        │                     │  reads precompiles: oracle px 0x807, positions, accountValue 0x80F
        │                     ├─ trade / tradeBySig: market list, aggregate oracle leverage, floor, daily limit, frozen
        │                     ├─ flatten (anyone): reduce-only IOC closes, retryable until flat, one-time bounty
        │                     └─ settle / sweep: profit split, principal to backer
BackedFactory ── create() ──► new vault          keeper.mjs (anyone can run) ── polls every vault ──► flatten()
web/app (React, viem in the browser): reads chain + HyperCore info API directly, writes via the user's wallet
```

- `src/BackedVaultV3.sol`, `src/BackedFactory.sol`: contracts. `src/sim/SimCore.sol`: simulated HyperCore for local runs.
- `test/`: 27 forge tests (rules, floor bypass, frozen open position, retry flatten, bounty, settle, `tradeBySig`).
- `scripts/`: deploy, create vault, keeper, live re-test, evidence builder, big-blocks toggle.
- `sim/run-sim.mjs`: scenarios against the simulated HyperCore.
- `web-src/`: the site source (`index.html`, `assets/` at the root are its build). `web-src/e2e/`: Playwright wallet click-through (`flows.mjs`, injected test wallet in `wallet.mjs`) and the audit scripts used above.
- `evidence/`: raw JSONL logs behind every claim.

## Setup

```bash
npm i && forge test                                   # 27 tests
cd web-src && npm i && npm run dev                    # site at http://localhost:5173
BACKED_LOG=evidence/keeper-testnet.jsonl node scripts/keeper.mjs        # run a public keeper
BACKED_KEYFILE=<testnet key json> node scripts/create-vault.mjs          # new vault (enable big blocks first:
node --experimental-strip-types scripts/bigblocks.ts true                #  factory create is about 3.9M gas)
node sim/run-sim.mjs                                  # simulated-HyperCore scenarios
cd web-src && node e2e/flows.mjs http://localhost:8950/   # browser wallet click-through (testnet funds needed)
```

## Business model

- Traders pay nothing up front and keep the profit share the backer sets; the contract pays it at settle.
- Backers pay a builder fee on orders the vault sends. Hyperliquid caps builder fees at 0.1% on perps (Hyperliquid docs, builder codes). Planned, not in the contract yet.
- Keepers earn the flatten bounty, paid by the vault being closed. Live today.
- Market: retail prop firms made about $585M in 2025, mostly challenge fees, and about 7% of challenge buyers are ever paid (Track360). Hyperliquid did about $206B of perp volume in the last 30 days (DefiLlama, read 11 Oct 2026). At a 0.02% fee, $10M a month through BACKED vaults is $2,000 a month; that is arithmetic, not a forecast.
- Versus colosseum-pools (same track): there, an operator's API wallet signs every order and an operator watcher enforces stops. BACKED has no operator key.

## Built before vs during the hackathon

- Before: nothing product-specific. General Hyperliquid knowledge and our agent tooling.
- During (Oct 2026): V1 spike (breach test, latency vs a trusted API wallet); V2 and V2.1 fixes from four independent reviews (aggregate oracle leverage, equity floor that counts realized losses, retryable flatten); V3 + factory + public keeper; simulated HyperCore; the funded live re-test; the site, its design rounds, and the browser wallet click-through and audit on 11 Oct.

## Known limits

Testnet only and a thin book. The keeper we run is permissionless but it is ours; anyone can run another. The builder fee is not implemented. Live runs used one wallet as both backer and trader (`0x263F74859F6c932Db0B4F11165580AE58984D8cc`).
