**7.4/10 overall.** The ruler gives BACKED a useful visual identity, but the surrounding interface still feels like a competent console assembled from standard components. A respected studio would revise it before shipping.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.4 | The **1.19** and loss ruler establish a focal point, but “Backer vault” and the dominant Connect button leave the funding relationship and first useful action secondary. |
| typography | 8.0 | Geist and Geist Mono work well together, with restrained weights and readable amounts, but numerous equally small labels flatten the hierarchy below the main instrument. |
| color | 8.1 | Near-black surfaces and semantic red/green are disciplined, although lavender serves branding, actions, chart history, code and proof links rather than one clear priority. |
| layout_spacing | 7.2 | The desktop grid aligns cleanly, but the tall idle desk and substantial empty space beneath it make the full page feel unevenly distributed. |
| distinctiveness | 6.7 | The graduated loss ruler expresses the product’s mechanism; the purple rounded-square mark, segmented controls and repeated dark cards remain interchangeable with other SaaS consoles. |
| data_honesty | 7.8 | Source distinguishes snapshots, RPC failures, missing fills and simulation, but the Evidence heading implies continuity with the displayed vault while the walkthrough names a different address. |
| mobile | 6.9 | The two-column metrics and desk-before-chart ordering are intentional, but the squeezed “Loss line” heading, wrapped proof action and long evidence sequence weaken the 390px experience. |

Top five fixes, in priority order:

1. **High, hierarchy:** [App.tsx:114](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:114). Make the funding relationship understandable in the heading and mobile introduction: “Trader account. Backer’s rules.” Give the safe “Within cap” example a clearly discoverable first-action role.

2. **Medium, mobile/layout:** [index.css:557](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:557). At 390px, put `.head-acts` on a separate row beneath the full-width card title. Keep “Loss line” unbroken and preserve 44px targets without squeezing three elements across one row.

3. **Medium, density/interaction:** [Ticket.tsx:133](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:133). Replace the four identical “Not checked” rows with one idle instruction; expand the checks after input. Visually prioritize Send order and shorten the secondary label to “Sign & submit,” with the gas explanation underneath.

4. **Medium, honesty/content:** [App.tsx:170](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:170), [Judges.tsx:28](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:28). Label the section “Recorded contract walkthrough” and explicitly distinguish its vault from the loaded account. Surface the replay’s simulated nature beside its trigger instead of relying on later disclosure.

5. **Medium, distinctiveness/spacing:** [index.css:339](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:339). Give the ruler exclusive visual prominence. Remove the Evidence section’s outer card treatment and present it as a quieter verification rail; retain the desk surface because it groups an actual task.

**Design Score: B.** Starting at A per category, the high hierarchy finding and medium typography, layout, interaction, responsive and content findings produce a weighted B.

**AI Slop Score: B.** Two medium deductions: repetitive card treatment and generic brand chrome. The ruler prevents the page from feeling wholly templated.

Skipped live browser and transaction verification; static screenshots and source cannot establish that proof links resolve or recorded outcomes remain accurate.

SCORES avg=7.4 min=6.7
