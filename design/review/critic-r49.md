This meets the terminal brief structurally, but falls short of studio-ready craft. The remaining weaknesses are workspace access, chart clarity, and state-specific order entry.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | Desktop exposes risk and execution together, but mobile places positions, fills and receipts beneath the entire ticket and both visualizations. |
| typography | 8.0 | Tabular numerals and restrained weights suit trading; crowded chart annotations and tiny secondary units weaken scanning. |
| color | 8.6 | Green, red and amber communicate permission, loss and caution consistently, with restrained purple for selection. |
| layout_spacing | 7.4 | Hairline zoning replaces the card stack successfully, but desktop retains a large vacant positions pane while mobile spreads the workspace across a long scroll. |
| distinctiveness | 8.2 | The loss ruler, enforced-rule strip and refusal checks give the familiar terminal structure a specific BACKED identity. |
| data_honesty | 8.0 | Snapshot status, zero frozen capacity and the realized/account gap are explicit, but mobile removes the account marker’s read time and leaves its temporal relationship ambiguous. |
| mobile | 7.0 | Fields and consequences remain readable, but hidden navigation, undisclosed tab overflow and buried account activity make mobile feel like a reordered desktop page. |

Top five fixes:

1. **High: give mobile direct access to account activity.** [index.css:905](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:905), [App.tsx:188](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:188): add a compact Trade / Risk / Activity switch or anchored navigation near the top; show an overflow cue for the remaining activity tabs.

2. **High: separate the latest account read from the historical chart.** [Equity.tsx:87](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:87): label the right-side marker “Latest contract read” with its timestamp at every width, visibly outside the historical time axis; the stopped mobile view otherwise juxtaposes −15.90 with a chart ending at 00:14 without showing the later read time.

3. **Medium: make stopped-vault order entry read as a refusal demonstration.** [Ticket.tsx:113](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:113): replace “Check an ETH long under the cap” and its sizing promise with “Check why this vault refuses orders”; make “Trade the live vault” the primary action.

4. **Medium: reclaim the empty desktop grid.** [index.css:908](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:908): bound the empty positions pane’s height instead of stretching it to fill the ticket; expose the existing two or three fills in a compact adjacent activity region, preserving the honest flat state.

5. **Medium: finish the empty-state scroll separation.** [Grids.tsx:33](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Grids.tsx:33), [Grids.tsx:64](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Grids.tsx:64): both messages remain inside `.grid-wrap`; move them outside so horizontal table scrolling cannot carry the explanation away.

**Design Score: B.** Professional structure with consequential hierarchy and responsive gaps.

**AI Slop Score: A.** No substantial template-pattern deduction under the new brief; the remaining issues concern craft and usability.

Skipped live click-through and wallet signing; screenshots and source cannot establish runtime behavior.
SCORES avg=7.9 min=7.0