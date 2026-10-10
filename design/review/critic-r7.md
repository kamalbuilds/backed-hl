This has a coherent design point of view, but I would not ship it unchanged. The loss ruler makes the contract’s boundary tangible; the weakest parts are recovery from failed reads and the mobile path to action.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.3 | Desktop establishes contract protection quickly, but mobile spends almost the entire first viewport explaining it before exposing the ticket. |
| typography | 8.0 | Familjen Grotesk and Public Sans provide a restrained, identifiable hierarchy with tabular numerals, although chart annotations become cramped at 390px. |
| color | 8.8 | Warm paper, bone ink and vermilion follow the binding system closely, with the accent consistently identifying the loss boundary and breach events. |
| layout_spacing | 7.6 | Desktop alignment and section rhythm are systematic, but mobile stacks introduction, status, ruler and proof into an excessively long preamble. |
| distinctiveness | 8.3 | The controls sheet, loss ruler and incident record express a specific product thesis without reproducing either negative reference’s visual formula. |
| data_honesty | 6.8 | Snapshot timestamps, replay labels and the 50.56-second outlier establish credibility, but silent price fallbacks and conflated factory states undermine it. |
| mobile | 6.5 | Tables meaningfully reflow and major controls receive 44px targets, but the ticket begins around y=769 and the equity annotation lacks sufficient right-edge clearance. |

Top five fixes, ordered by impact:

1. **High, interaction/performance: make checking terminate reliably.** [Ticket.tsx:33](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:33) clears the verdict whenever `s` changes, while vault refresh and the checking timeout both run at eight seconds. Preserve checks across unchanged snapshots, terminate timed-out requests, and expose a direct **Retry check** action. The screenshot’s disabled “Checking…” state currently dominates the usable product.

2. **High, data honesty: remove undisclosed price substitutions.** [Ticket.tsx:14](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:14) supplies a fallback ETH price, and line 27 substitutes an oracle value after a failed read. Show **Price unavailable** and require an explicit limit price when the oracle cannot answer; do not let an invented quote feed the displayed notional or order arguments.

3. **High, hierarchy/layout/mobile: shorten the path to the ticket.** [index.css:210](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:210) stacks the entire lead before the desk. Keep the headline, compact status and ruler together, move the measured-run paragraph beneath the ticket, and reduce mobile gaps. Market and side controls should appear in the initial 390px viewport.

4. **Medium, responsive typography: give the chart annotation its own space.** [Equity.tsx:39](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:39) centers a timestamp plus equity value only 32px from the mobile SVG’s right edge. Split time and value into two lines and right-align them within the plotting bounds.

5. **Medium, content/state clarity: distinguish an empty factory from a failed read.** [App.tsx:60](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:60) converts failure to `[]`, and line 175 interprets both outcomes as “did not answer.” Keep separate states for loading, zero vaults and RPC failure, with an inline retry for failure.

**Design Score: B.** Category deductions concentrate in hierarchy, interaction states, responsive layout and performance feel; smaller deductions affect annotation typography and state copy.

**AI Slop Score: A.** No confirmed high or medium slop finding: the restrained styling is supported by product-specific structure and evidence.

Skipped live click-through and proof-destination checks; these scores assess the supplied captures and source, not verified transaction behavior.
SCORES avg=7.6 min=6.5
CRITIC_DONE 0
