The risk instrument is convincing. The full page still feels like a submission dossier packaged inside product cards. A respected studio would revise it before shipping.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.7 | The 1.19 readout creates a clear focal point, but replay, order checking, wallet connection and duplicated proof compete for the next action. |
| typography | 8.0 | Geist and Geist Mono handle UI and amounts cleanly, while the lower page compresses too much important explanation into small, similarly weighted text. |
| color | 8.4 | Lavender identifies the primary action and red identifies risk; restrained surfaces and readable secondary text maintain palette discipline. |
| layout_spacing | 7.2 | The opening grid aligns well, but the equity section leaves a large empty right column and subsequent nested panels create repetitive density. |
| distinctiveness | 7.3 | The graduated loss ruler and matching wordmark express BACKED’s mechanism, while most surrounding surfaces remain recognizable Linear-style console furniture. |
| data_honesty | 7.8 | Testnet, reference-vault, cached and simulated states are explicitly distinguished in source, but the refusal checkpoint offers no inspectable evidence beside its authoritative badge. |
| mobile | 7.2 | The reordered desk, collapsed account details and refusal buttons show deliberate adaptation, but navigation disappears and the ruler loses its explanation of who can flatten. |

Top five fixes:

1. **High, hierarchy/layout:** [App.tsx:173](app/src/App.tsx:173), [Judges.tsx:29](app/src/components/Judges.tsx:29). Consolidate checkpoints and walkthrough into one proof destination; collapse the seven-step transcript initially and move business/comparison material behind dedicated navigation. Cards have reduced visual flatness without resolving the document dump.

2. **High, data honesty:** [Judges.tsx:57](app/src/components/Judges.tsx:57). Give “20x refused” a link to the recorded simulation input and revert result. “No tx, reverted” cannot independently demonstrate refusal; distinguish an order never broadcast from a mined transaction that reverted.

3. **Medium, mobile comprehension:** [index.css:649](app/src/index.css:649). Preserve a short visible ruler caption: “Below the red line, anyone can close positions.” Mobile currently removes both the detailed status explanation and the caption describing the product’s central permission.

4. **Medium, chart communication:** [Equity.tsx:41](app/src/components/Equity.tsx:41), [Equity.tsx:46](app/src/components/Equity.tsx:46). Show the measured difference between realized PnL and account PnL beside the chart when material. The detached square looks like an unexplained discontinuity while its explanation is collapsed.

5. **Medium, mobile navigation:** [index.css:394](app/src/index.css:394). Replace hidden desktop navigation with compact mobile access to Verify, Rules and Business. Judges should reach these directly rather than search through the entire scroll.

**Design Score: B**. High deductions affect hierarchy/layout and evidence presentation; medium deductions affect mobile and chart comprehension.

**AI Slop Score: B**. Two medium findings: almost every content block receives the same rounded shadowed container, and proof panels nest inside panels while duplicating checkpoint content. The functional ruler and specific copy prevent a harsher grade.

No files edited; browser interactions and chain evidence were not checked, so runtime correctness remains unverified.
SCORES avg=7.7 min=7.2
