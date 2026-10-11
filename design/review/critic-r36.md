The loss ruler gives BACKED a recognizable product idea. The surrounding interface is competent, but the first action and mobile priorities still need work before a respected studio would ship it unchanged.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 8.0 | The headline, 1.19 headroom value and red threshold establish purpose quickly, but the order desk gives four examples similar prominence while both submission actions are disabled. |
| typography | 7.8 | Geist and Geist Mono distinguish explanation from financial values well, but 10.5px preset labels and the tiny “proof” link make useful information feel peripheral. |
| color | 8.5 | Lavender belongs to wallet connection, red communicates loss and refusal, and green communicates state, with no decorative gradient competing for attention. |
| layout_spacing | 7.2 | The desktop grid and metric strip align cleanly, but the empty area beneath the desk and the large walkthrough produce an uneven full-page rhythm. |
| distinctiveness | 7.6 | The graduated loss ruler and matching wordmark express contract enforcement clearly, while the remaining dark cards and segmented controls feel familiar. |
| data_honesty | 7.4 | Source distinguishes snapshots, RPC failures, replay and reference-vault proof, but preset verdicts precede simulation and stale fills are disclosed inside collapsed notes. |
| mobile | 6.8 | The 390px layout has deliberate reordering and no apparent horizontal overflow, but the first viewport contains only explanation and risk information, with trading and proof much farther down. |

Top five fixes, in priority order:

1. **High, premature verdicts.** [Ticket.tsx:103](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:103): replace static “Allowed” and “Refused” headings with scenario labels such as “Within cap” and “Over cap”; reserve verdict colors and wording for the returned contract check. A breached vault can refuse the supposedly allowed example.

2. **High, mobile action buried.** [App.tsx:130](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:130): collapse the five-metric strip behind “Account details” on mobile and keep the compact loss ruler above the desk. Preserve the figures, but let the user reach an order example sooner.

3. **Medium, stale chart looks current.** [Equity.tsx:46](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:46): show the failed-refresh notice beside the chart heading whenever cached fills remain visible, with the last successful fills-fetch time. Keep reconciliation detail in the disclosure.

4. **Medium, competing submission paths.** [Ticket.tsx:145](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:145): keep “Send order” as the clear primary action and move signature submission into a secondary disclosure explaining who submits and pays gas. The current long second button dominates mobile width without explaining its benefit.

5. **Medium, proof becomes another reading assignment.** [Judges.tsx:29](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:29): foreground three judge checkpoints, allowed order, refused order and enforced flatten, then disclose the complete seven-step run. Retain every explorer link.

**Design Score: B.** Starting each category at A, the high findings reduce interaction and responsive grades; medium findings reduce content and hierarchy by half-letter increments, yielding a weighted B.

**AI Slop Score: A.** The ruler encodes actual product meaning; the screenshots show no substantive blacklist pattern. Familiar product chrome limits distinctiveness without itself proving slop.

Skipped live interaction, explorer receipt checks and runtime error-state verification; data honesty is assessed from screenshots and source.
SCORES avg=7.6 min=6.8
