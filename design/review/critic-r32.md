**This is a credible product console, but below studio-ready.** The loss ruler gives BACKED a useful visual identity; the weakest area is mobile, where compression removes purpose and network context.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | Desktop leads clearly with remaining room and the loss boundary, but “Backer vault” plus a default Trader tab leaves the intended first action ambiguous. |
| typography | 8.1 | Geist and Geist Mono separate interface text from amounts effectively, although mobile chart labels collide and supporting text becomes uniformly small. |
| color | 8.2 | Restrained surfaces and semantic red make risk legible, but lavender spreads across branding, code, chart, brackets and step numbers while the disconnected primary action stays gray. |
| layout_spacing | 7.7 | The desktop instrument, metric strip and order desk align convincingly, while mobile spends nearly its entire first viewport on status before exposing an action. |
| distinctiveness | 7.2 | The graduated loss ruler expresses this product’s mechanism, but the rounded dark cards, segmented controls and purple square remain interchangeable SaaS chrome. |
| data_honesty | 7.6 | Snapshot timestamps, RPC warnings, realized-versus-account discrepancies and transaction links are unusually explicit, but mobile hides testnet context and idle checks misleadingly read “Pending.” |
| mobile | 6.7 | Cards and form fields fit 390px without visible page overflow, but purpose disappears, chart dates overlap, and replay plus evidence tabs fall below comfortable touch-target height. |

Top five fixes:

1. **High, mobile context:** [index.css:539](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:539) hides the purpose sentence, and [index.css:394](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:394) hides the network. Keep a short mechanism sentence and a visible “Testnet” label near the title. Neither requires restoring the old prose hero.

2. **High, chart readability:** [Equity.tsx:41](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:41) prints two full date/time labels into a narrow plot. At mobile widths, use short dates at opposite edges and place time details beneath the chart. Explicitly distinguish the lavender realized-PnL trace from the white account-PnL marker.

3. **Medium, first action:** [App.tsx:106](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:106) renders disconnected “Connect wallet” as secondary despite the binding primary-action contract. Make it primary before connection, then transfer emphasis to the eligible desk action; give “Within cap” clearer prominence as the first trial.

4. **Medium, judge scan path:** [App.tsx:167](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:167) places all proof after the console, particularly far down mobile. Link the existing “Breach to flat” metric directly to its recorded evidence, and provide a compact proof jump beside replay. Judges should reach the signature claim’s evidence without traversing the whole order form.

5. **Medium, state and touch clarity:** [Ticket.tsx:137](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:137) labels unstarted checks “Pending”; use “Not checked,” reserving waiting language for active requests. Increase mobile replay and evidence tabs to at least 44px at [App.tsx:125](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:125) and [index.css:425](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:425).

**Design Score: B.** Starting categories at A, the high findings penalize responsive design and chart typography; medium findings reduce hierarchy, interaction states and content clarity.

**AI Slop Score: B.** Two medium deductions: interchangeable dark SaaS chrome and residual explanatory prose in the proof area. The ruler and transaction walkthrough carry genuine product specificity.

Reviewed supplied screenshots and source only; no files edited or live interactions checked.
Risk: explorer results, wallet flows and current chain state remain unverified.

SCORES avg=7.6 min=6.7
