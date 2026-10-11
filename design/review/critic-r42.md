The ruler gives BACKED an identifiable product idea. The lower page still reads like the rejected document dump, now enclosed in cards. A respected studio would revise this before shipping.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.0 | The **1.08** and loss ruler establish a strong focal point, but “The payout is code” does not explain funded trading within three seconds, especially with the shorter mobile subtitle. |
| typography | 7.6 | Geist and Geist Mono provide clean text and readable amounts, but nearly identical section headings flatten the hierarchy, and mobile chart labels shrink below the contract’s effective 12px floor. |
| color | 8.5 | Lavender actions, teal data, red risk and amber stale states have disciplined roles, with legible secondary text and no decorative gradients. |
| layout_spacing | 6.8 | The desktop risk/desk grid aligns well, but the open walkthrough and dense comparison sections create a long, repetitive descent with a large empty region beneath the desk. |
| distinctiveness | 7.2 | The ruler-derived wordmark and explicit flatten zone express BACKED’s mechanism, while the surrounding rounded-card stack remains conventional Linear-inspired chrome. |
| data_honesty | 8.0 | Snapshot timestamps, RPC failure, reference-vault labels and the realized/account PnL gap are unusually explicit, but the large stale number visually outranks its qualification. |
| mobile | 6.2 | Reordering the desk and collapsing account details show deliberate adaptation, but the compressed chart, small navigation targets and fully expanded evidence create excessive reading and scrolling. |

Top five fixes, in priority order:

1. **High, hierarchy: name the transaction people came to understand.** At `app/src/App.tsx:115`, replace the abstract headline with something like **“Back a trader. Set the loss line.”** Make the next sentence explain that the contract checks every order and anyone can flatten below the line. Keep the payout guarantee as supporting evidence.

2. **High, responsive: repair chart measurement before polishing labels.** At `app/src/components/Equity.tsx:20`, the one-time observer can attach to the loading element that is subsequently replaced by the chart wrapper. Keep a stable measured wrapper across states or reattach the observer when it changes. Then enforce the narrow layout at `app/src/components/Equity.tsx:28`: three time ticks, readable labels and a tooltip contained within the card. The supplied mobile image appears to retain a scaled desktop chart.

3. **High, layout; medium, AI slop: shorten the evidence descent.** At `app/src/components/Judges.tsx:28`, collapse the seven-step walkthrough initially because three checkpoints already summarize it. At `app/src/App.tsx:188`, make the detailed operator comparison and business material expandable. Preserve the evidence, but stop giving every supporting argument another permanently expanded card.

4. **Medium, state clarity: attach freshness to the headline amount.** At `app/src/App.tsx:129`, put “Snapshot · 18:46 IST” directly beside the **1.08**, with an explicit stale state while RPC retries. “Armed at” plus a distant qualification makes remembered state look more current than it is.

5. **Medium, responsive: finish the touch-target system.** At `app/src/index.css:688`, raise mobile navigation from 36px to at least 44px. Apply the same minimum to the 40px side selector at `app/src/index.css:145` and disclosure summaries at `app/src/index.css:610`. Keep visible labels compact while enlarging their hit areas.

**Design Score: B.** High deductions affect hierarchy, layout and responsive design; medium deductions affect state clarity, mobile controls and typography.

**AI Slop Score: B.** Two medium deductions: aphoristic hero copy and repeated nested card containers; the functional ruler prevents the page from becoming a generic template.

No files edited or live interactions checked; proof links, chain outcomes and runtime chart behavior remain unverified.
SCORES avg=7.3 min=6.2
