This has a coherent point of view, but it is not studio-ready. The ruler is memorable; the broken proof layout undermines the page where judges most need clarity.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.0 | The headline explains the mechanism immediately, but verification sits several sections down and mobile’s first viewport barely reaches the ticket. |
| typography | 7.6 | Familjen Grotesk, Public Sans and tabular numerals work well together, but narrow text stacks in “For judges” destroy the reading rhythm. |
| color | 8.7 | Warm paper, bone ink and vermilion form a disciplined palette, with the accent consistently identifying the loss boundary and breaches. |
| layout_spacing | 6.0 | The desktop fold and incident rail align convincingly, but the judges list fragments into grid cells and the final sections lose the earlier separation rhythm. |
| distinctiveness | 8.0 | The controls-sheet structure and loss ruler establish an identity beyond both negative references, although the lower page increasingly resembles documentation. |
| data_honesty | 8.1 | Snapshot timestamps, RPC failures, simulated replay labels and transaction links expose provenance, but “Equity −0.92” misnames a delta from capital. |
| mobile | 5.8 | The headline, ruler and controls adapt intentionally without visible outer overflow, but the long scroll and compressed judges table make evidence difficult to read. |

Top five fixes, in priority order:

1. **High: repair the judges list’s grid children.** At [Judges.tsx:27](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:27), each list item mixes a number, bare text and multiple links; [index.css:265](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:265) places those fragments into alternating columns. Wrap everything after the number in one content element, producing exactly two grid children per item.

2. **High: give the mobile proof table its own layout.** [index.css:243](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:243) applies `1fr auto` to every sheet, including the two-column judges table at [Judges.tsx:32](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:32). Stack each capability above its status at 390px; the capability currently becomes a tall, cramped label strip.

3. **High: make verification reachable from the masthead.** [App.tsx:95](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:95) offers no section navigation despite the document’s length. Add a compact “Verify on chain” anchor to the existing `#judges` section, keeping it accessible in the mobile masthead.

4. **Medium: label the ruler’s quantity accurately.** [App.tsx:118](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:118) calls `equityPnl` “Equity”; [Equity.tsx:33](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:33) labels zero “capital.” Use “PnL versus capital” and “starting capital baseline” consistently so a negative reading cannot imply a negative account balance.

5. **Medium: make RPC failure an actionable state.** [Ticket.tsx:41](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:41) tells users to edit their order to retry. Provide “Retry check” when unavailable, preserve the entered order, and show the last confirmed read separately from the pending check.

**Design Score: B.** Category penalties: hierarchy −1, typography −½, layout −1, responsive −1, interaction states −½ and content quality −½; other categories receive no deduction.

**AI Slop Score: A.** No material template-pattern finding: the structure, typography and accent serve this product’s mechanism.

No files edited; live interactions and linked chain evidence were not checked, so runtime correctness remains unverified.
SCORES avg=7.3 min=5.8
CRITIC_DONE 0
