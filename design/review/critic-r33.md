The ruler gives BACKED a recognizable product idea. The surrounding interface is competent, but the mobile scan path and freshness language keep it below studio-ready.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | **1.08** establishes the focal point immediately, but “Backer vault” and the mobile introduction do not explain who funds whom within three seconds. |
| typography | 8.0 | Geist and Geist Mono give amounts and prose distinct roles, though supporting labels cluster at 12–14px and the mobile chart clips negative axis labels. |
| color | 8.2 | The restrained canvas, lavender and semantic red work well, but lavender also decorates step numbers, code and an untouched preset, weakening its meaning. |
| layout_spacing | 7.6 | The desktop 8:4 grid and integrated metric strip feel deliberate, while the desk’s nested containers and long mobile stack make secondary material too expensive to scan. |
| distinctiveness | 7.1 | The graduated loss ruler expresses the contract’s mechanism, but the remaining rounded panels and segmented controls could belong to many dark SaaS consoles. |
| data_honesty | 7.3 | Snapshot timestamps, unchecked states and transaction links are explicit, but “Live account PnL” labels snapshot data and the untouched first preset looks selected. |
| mobile | 7.0 | The metric grid and reordered desk fit 390px without visible page overflow, but chart labels lose signs and evidence sits several screens below the opening view. |

Top five fixes, in priority order:

1. **High, data honesty: attach freshness to the headline amount.** At [App.tsx:128](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:128), show “Last confirmed at 18:46 IST” beside the room value whenever the data is cached or RPC reads fail; at [Equity.tsx:45](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:45), replace unconditional “Live” with the actual freshness state. An amber chip above the card does not adequately qualify its largest number.

2. **High, mobile typography: preserve negative chart labels.** [Equity.tsx:17](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:17) reserves only 40px on mobile, while end-aligned labels sit another 8px inward at line 32. Reserve enough width for the full signed value; the supplied mobile image makes negative ticks appear positive.

3. **Medium, hierarchy/mobile: make proof a named first-screen destination.** At [App.tsx:127](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:127), replace the subdued “Proof” link with “Verify recorded run” and give it clear secondary-action treatment. Keep the full evidence below, but make the judge’s route obvious before the order form and chart.

4. **Medium, interaction/color: remove the false preset selection.** [index.css:553](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:553) permanently highlights “Within cap” despite empty size fields and unchecked rules. Keep examples neutral until chosen; use the resulting form and verdict to communicate selection.

5. **Medium, layout/AI slop: flatten the order desk’s secondary surfaces.** At [index.css:377](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:377) and [index.css:474](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:474), remove the boxed treatment from the read note and use separators for check rows. The desk already provides containment; additional rounded boxes compete with the actual inputs.

**Design Score: B.** High deductions affect responsive/data states; medium deductions affect hierarchy, interaction and layout. This is a screenshot/source grade, with motion and performance ungraded.

**AI Slop Score: B.** Two medium findings: nested rounded containment and decorative lavender step badges. The ruler prevents the page from reading as a generic template.

Skipped live click-through and explorer validation; runtime behavior and transaction outcomes remain unverified.
SCORES avg=7.6 min=7.0
