The loss ruler gives BACKED a recognizable product idea. The first screen is credible; the full page still feels like a submission document packaged into cards. A respected studio would revise it before shipping.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | Purpose lands immediately and the room number anchors the scan, but Connect wallet visually outranks the useful, wallet-free contract demonstration. |
| typography | 8.2 | Geist and Geist Mono work well together, amounts are legible, and the headline wraps cleanly; supporting sections flatten into similar small headings and dense secondary text. |
| color | 8.5 | Lavender actions, teal evidence/data, and red loss boundaries have understandable jobs, consistent with the contract’s appended v3 rules. |
| layout_spacing | 7.4 | The desktop risk/desk split and inset metric strip are disciplined, but the lower page repeats the same bordered-section rhythm without enough compression. |
| distinctiveness | 6.7 | The loss ruler expresses BACKED’s mechanism, while the remaining surfaces largely resemble a standard dark shadcn console. |
| data_honesty | 7.8 | Source distinguishes snapshots, RPC failures, unknown fills, replay, and reference-vault evidence, but the “allowed order” preset promises acceptance before checking existing exposure. |
| mobile | 7.5 | The 390px view deliberately reorders the desk and collapses account details without visible overflow, but the long comparison remains a reading burden and Replay misses the touch-target floor. |

Top five fixes, in priority order:

1. **High: compress repeated explanation and evidence.** [App.tsx:171](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:171), [App.tsx:183](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:183), [App.tsx:197](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:197). Keep checkpoints visible, expand the recorded walkthrough on demand, and collapse the detailed operator comparison. “What no one can do” and “Who holds the key” currently repeat the argument.

2. **High: remove the preset’s premature guarantee.** [Ticket.tsx:81](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:81), [Ticket.tsx:103](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:103). Size accounts for capital but ignores existing exposure, and “3x cap” is hardcoded despite reading `s.maxLev`. Label it “Check an example order,” display the actual cap, and reserve “allowed” for a successful simulation.

3. **Medium: strengthen the first meaningful action.** [index.css:638](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:638). Give the example-order entry stronger contrast and place a brief “No wallet needed to check” cue beside it. It currently resembles another form field.

4. **Medium: finish mobile touch sizing.** [App.tsx:128](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:128), [index.css:753](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:753). Replay uses the 32px small button and escapes the mobile 44px overrides. Enlarge its hit area without enlarging the label.

5. **Medium: put chart sample context above the plot.** [App.tsx:155](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:155), [Equity.tsx:103](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:103). Show fill count and actual fill period in the header; currently the one-minute sample’s context sits beneath the chart or inside reconciliation notes.

**Design Score: B.** High and medium deductions applied within affected categories, then weighted using gstack’s rubric.

**AI Slop Score: B.** One high finding: repeated explanatory content inside stacked, noninteractive cards; the ruler itself has a clear point of view.

Unchecked: live interactions, RPC behavior, and explorer receipts; data honesty reflects screenshots and source, not transaction verification.
SCORES avg=7.7 min=6.7
