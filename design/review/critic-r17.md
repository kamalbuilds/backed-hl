This has a coherent point of view: a contract controls sheet with a loss ruler. It clears the generic-template problem, but the first interaction and mobile reading path still need work before a respected studio would ship it unchanged.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.6 | The headline explains the purpose immediately, but the blank ticket competes with the ruler without offering an equally clear starting action. |
| typography | 8.0 | Familjen Grotesk and Public Sans give the page character and readable figures, though the desktop headline’s narrow measure produces an unnecessarily chopped three-line statement. |
| color | 8.8 | Warm paper, bone ink, and vermilion form a disciplined palette, with the accent consistently identifying the loss boundary and breaches. |
| layout_spacing | 7.4 | The desktop split and section rules align cleanly, but dense proof paragraphs and repeated table sections flatten the lower page’s rhythm. |
| distinctiveness | 8.4 | The labelled loss ruler and incident rail express BACKED’s actual mechanism and establish an identity beyond the rejected lime hero and terminal grid. |
| data_honesty | 7.8 | Snapshot timestamps, RPC failures, replay labels, and transaction links distinguish evidence from simulation, but the untouched ticket falsely implies that a contract request went unanswered. |
| mobile | 7.2 | The masthead, ruler, and stacked ticket fit 390px comfortably, but hiding section navigation leaves a very long document with poor access to rules and incidents. |

Top five fixes, ranked:

1. **High, interaction states and content:** Fix the idle ticket at [Ticket.tsx:137](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:137). An empty size sets `checks=[]`, which renders “No answer from the contract” before any request. Render “Choose an example or enter a size to check the rules,” reserve failure copy for actual failures, and give the disabled action a stable label instead of “Test: send without a check.”

2. **Medium, hierarchy and interaction states:** Make the presets explain what they demonstrate at [Ticket.tsx:103](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:103). “$1 limit” and “SOL” require prior knowledge; use compact outcome-oriented labels such as “Within cap,” “Over cap,” “Below oracle,” and “Blocked market,” keeping the actual order details visible after selection.

3. **Medium, typography and layout:** Widen the desktop headline measure at [index.css:88](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:88). The `18ch` maximum creates “A trader uses your / USDC. The contract / holds the line.” Let the sentence occupy more of the available column and preserve phrase boundaries; the current mobile headline already reads more naturally.

4. **Medium, responsive design and hierarchy:** Restore compact mobile section links at [index.css:295](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:295). Keep Rules and Incidents accessible near the ruler or immediately after the ticket, with 44px targets. The masthead’s verification link covers only one destination.

5. **Medium, content, hierarchy, and layout:** Compress the judge verification sequence at [Judges.tsx:27](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:27). Each step should present one result, one short explanation, and descriptively labelled proof links; move additional transaction history into expandable detail. Preserve the simulation refusal’s explicit absence of a transaction.

**Design Score: B.** One high finding and four medium findings, charged to the affected categories above.

**AI Slop Score: A.** No deduction: the restrained palette, functional ruler, and evidence-led structure show specific design intent.

No files changed; live interactions, touch behavior, and transaction completion were not checked. Proof authenticity remains unverified.

SCORES avg=7.9 min=7.2
CRITIC_DONE 0
