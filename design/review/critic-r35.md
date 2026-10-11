**Ship verdict: needs another pass.** The loss ruler gives BACKED a recognizable point of view, but the mobile evidence navigation and replay mismatch prevent studio-level readiness.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 8.0 | The 1.19 headroom figure anchors the scan, but the bright Connect wallet button outranks the wallet-free actions that demonstrate the product. |
| typography | 8.0 | Geist and Geist Mono give labels and amounts clear roles, while the lower page compresses headings, annotations, and proof descriptions into a narrow range of small sizes. |
| color | 8.6 | Lavender consistently identifies the primary action, red communicates the loss boundary, and neutral chart strokes avoid competing accents. |
| layout_spacing | 7.3 | The desktop risk/desk grid is coherent, but the evidence rail loses the upper console’s containment and reads like an appended report. |
| distinctiveness | 7.5 | The graduated loss ruler and matching wordmark express contract-enforced risk, though the surrounding dark chrome remains recognizably Linear-derived. |
| data_honesty | 7.4 | Source distinguishes snapshots, failed reads, realized PnL, and recorded proof, but replay can display an amount inconsistent with its ruler. |
| mobile | 6.5 | The risk → desk → equity ordering is deliberate and no page-wide overflow is visible, but wrapped evidence tabs overlap the walkthrough text. |

Top five fixes, in priority order:

1. **High, mobile: fix the evidence tab height.** [index.css:469](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:469) wraps the tabs while [tabs.tsx:26](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/ui/tabs.tsx:26) retains a fixed horizontal height. Give this list automatic height and its triggers explicit 44px heights so both rows occupy normal flow.

2. **High, data honesty: make replay internally consistent.** [App.tsx:128](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:128) renders `Math.abs(room)` during crossing, producing **1.19 “past the line”** while the ruler shows **0.05 below**. Derive the amount and caption from the same replay value, and label the instrument itself “Recorded replay” throughout playback.

3. **Medium, layout: finish the evidence surface.** [App.tsx:169](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:169) and [index.css:587](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:587) place the heading, tabs, introduction, and comparison prose on an almost bare rail. Use one contained proof panel with consistent header and row padding; avoid adding individual cards around every row.

4. **Medium, hierarchy: identify the first useful action.** [Ticket.tsx:103](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:103) gives the successful preset the same treatment as three rejection cases. Label it “Try allowed order · 2.5x,” give it stronger neutral emphasis, and group the rejection cases underneath; judges should immediately recognize where to begin.

5. **Medium, typography/content: reduce the equity annotation block.** [Equity.tsx:45](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:45) stacks a wrapping legend, date range, reconciliation gap, and transfer caveat beneath the chart. Keep the legend and measured gap visible, then put transfer detail behind a disclosure; the mobile chart needs a readable conclusion.

**Design Score: B.** High deductions affect Responsive and Interaction States; medium deductions affect Hierarchy, Layout, Typography, and Content, yielding B under gstack’s weighted grading.

**AI Slop Score: A.** No qualifying high or medium template tells: the surfaces organize actual tasks, the ruler carries meaning, and the page avoids decorative feature grids and fabricated social proof.

Skipped live browser interaction and on-chain verification; state and proof findings rely on screenshots and source, so runtime behavior remains unverified.
SCORES avg=7.6 min=6.5
