This has a coherent design direction, but a respected studio would still revise the action hierarchy and evidence presentation before shipping.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.1 | The headline and ruler explain the premise quickly, but the strongest proof sits far below the fold and the mobile ticket barely enters the first screen. |
| typography | 7.8 | Familjen Grotesk adds character and tabular figures support comparison, although the two faces have limited visual separation and supporting labels feel small. |
| color | 8.7 | Warm black, bone and vermilion form a disciplined palette, with the accent consistently identifying the loss boundary and breaches. |
| layout_spacing | 7.2 | Desktop alignment is orderly, but the tall ticket leaves unused space beneath the ruler and repeated section spacing makes the document feel longer than necessary. |
| distinctiveness | 8.1 | The loss ruler, parameter sheet and incident rail express contract enforcement through structure, giving BACKED an identity beyond either rejected reference. |
| data_honesty | 6.3 | Snapshot timestamps, RPC failures and simulation labels are candid, but the success ratio is computed from successful entries alone and missing proof receives an unjustified test label. |
| mobile | 6.6 | Tables reflow deliberately and the supplied capture shows no obvious overflow, but operational copy delays the ticket and several touch targets remain undersized. |

Top five fixes, ordered by impact:

1. **High, evidence integrity:** [Incidents.tsx:36](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Incidents.tsx:36) renders `breaches.length of breaches.length`, so this ratio cannot represent failure. Count independently recorded attempts and outcomes, or say “5 recorded flatten fills.” At [RulesSheet.tsx:33](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/RulesSheet.tsx:33), distinguish unavailable proof from an actual Forge test; every absent transaction currently becomes “forge test only.”

2. **High, mobile hierarchy:** [App.tsx:104](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:104) and [App.tsx:114](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:114). Shorten the lede, retain the snapshot timestamp beside the state, and place retry details in secondary disclosure. The ticket starts around y=744 at 390px; bring its presets into the initial viewport while preserving the ruler.

3. **High, action clarity:** [Ticket.tsx:125](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:125). Separate checking, unavailable, accepted and rejected states. “Send anyway, it will revert” currently also labels an unknown result; signing remains available during checks, and busy actions retain their original labels. Show pending progress and identify that acceptance was simulated for the designated trader before inviting a wallet submission.

4. **Medium, touch targets:** [index.css:223](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:223) produces roughly 43px-high tabs, while [index.css:138](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:138) leaves Reduce only with a small hit area. Give both explicit 44px minimum targets; do the same for transaction links at line 237.

5. **Medium, document rhythm:** [index.css:153](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:153). Reduce repeated section gaps using the existing spacing scale and move a compact, transaction-linked breach result beside the replay. Judges should encounter the measured outcome before scrolling through the entire rules sheet.

**Design Score: B**  
**AI Slop Score: A**

The grade deductions are three High findings and two Medium findings applied to their respective categories; no qualifying AI-template finding warrants a slop deduction.

No files edited; live wallet flows and proof destinations were not checked, so runtime correctness remains unverified.
SCORES avg=7.4 min=6.3
CRITIC_DONE 0
