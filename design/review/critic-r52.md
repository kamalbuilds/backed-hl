This is a real terminal redesign, but it is not at a ship-unchanged 9. The remaining weaknesses are mobile task access, unused space, and explanation of the stopped account.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | Desktop separates risk, order entry and records clearly, but seven equally weighted metrics dilute the loss line’s priority. |
| typography | 8.3 | Crisp tabular numerals and aligned columns fit the brief, although small chart annotations and secondary labels demand effort. |
| color | 8.4 | Restrained violet actions, green capacity, red losses and amber warnings communicate distinct roles consistently. |
| layout_spacing | 7.1 | Hairline panes replace the card stack successfully, but the stopped desktop leaves a large vacant lower-left area and mobile Activity has a conspicuous gray spacer. |
| distinctiveness | 8.0 | The loss ruler, contract checks and receipt rows make this recognizably BACKED within a credible terminal structure. |
| data_honesty | 8.0 | Read timestamps, historical-vault attribution and the realized/account PnL gap are visible, but the gap’s meaning remains buried and cached fills lack a warning in their own table. |
| mobile | 6.9 | Trade/Risk/Activity now switch actual workspaces, but repeated metrics delay each task and cross-workspace links can target hidden content. |

Top five fixes:

1. **Make receipt navigation reveal its destination.** [App.tsx:107](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:107): `go()` changes `gridTab` without selecting Activity, so “All 10 steps” and “Breach to flat” target a hidden grid on mobile; switch workspace before scrolling.
2. **Compact the mobile summary.** [App.tsx:134](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:134): keep status, loss-line room and account value immediately visible; expand the remaining metrics on demand so Activity records appear within the first screen.
3. **Remove layout stretch that creates vacant regions.** [index.css:937](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:937): content-size the empty desktop grid and define explicit mobile workspace rows/backgrounds, eliminating Activity’s gray band without adding filler.
4. **Explain the stopped chart beside the gap.** [Equity.tsx:109](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:109): surface the reconciliation sentence when material; explain that fill-derived realized PnL does not reconcile to account PnL, without inventing a cause or presenting the loss line as a guaranteed loss ceiling.
5. **Label cached fills where traders read them.** [Grids.tsx:68](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Grids.tsx:68): show refresh failure even when rows exist, with the last successful fetch time; currently populated rows suppress the failure message.

**Design Score: B**  
**AI Slop Score: A**: the structure serves trading and contract verification; remaining issues are execution quality.

Skipped live browser, wallet and RPC checks; interaction findings are source-based, and populated-grid craft remains unverified.
SCORES avg=7.8 min=6.9