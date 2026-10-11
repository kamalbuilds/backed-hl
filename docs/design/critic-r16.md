The ruler gives BACKED a clear point of view. The page still needs a better first action and tighter mobile sequencing before a respected studio would ship it unchanged.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.4 | The headline explains the mechanism quickly, but the prominent ticket opens with blank inputs, four passes, and a refusal, leaving the next action unclear. |
| typography | 7.8 | Familjen Grotesk and Public Sans feel deliberate, with sensible headline measures and tabular numerals, but the long evidence sections lack enough typographic differentiation. |
| color | 8.6 | Bone on warm black is disciplined, and vermilion consistently marks the loss boundary and breaches; subdued dividers make some section boundaries too faint. |
| layout_spacing | 7.2 | The desktop split and aligned section headers work, but the lower page repeats nearly identical table-and-rule compositions without prioritizing its strongest evidence. |
| distinctiveness | 8.1 | The loss ruler and incident ledger express the product’s enforcement mechanism and avoid both rejected visual directions, although the supporting sections feel like documentation. |
| data_honesty | 8.0 | Source distinguishes snapshots, RPC failures, simulated checks, replay, and testnet evidence, but the first-screen all-pass/refused combination obscures what was actually validated. |
| mobile | 6.8 | The 390px headline and ruler hold together without visible horizontal overflow, but the ticket starts below the first viewport and the full page becomes an exhausting verification document. |

Top five fixes:

1. **High, interaction states:** [Ticket.tsx:38](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:38). Stop simulating the untouched, zero-size form. Show “Enter a size or try an example” until there is a valid order; reserve “contract refuses” for an intentional submission or example. The current four-pass summary followed by `size/px` reads as a contradiction.

2. **High, responsive hierarchy:** [App.tsx:132](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:132). Move the section navigation after the ticket on mobile and add a direct “Try an order” jump beside replay. The first screen offers navigation through supporting material while the core interaction remains undiscovered.

3. **Medium, content hierarchy:** [Judges.tsx:27](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:27). Give each proof step a short outcome heading, such as “Order accepted” or “Breach closed,” followed by its transaction. Separate secondary timing and settlement detail so judges can identify what each link proves before reading the paragraph.

4. **Medium, spacing/layout:** [index.css:158](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:158). Strengthen the Rules and Incidents section headers and compact the supporting business/comparison sections. Their current repeated treatment gives every section similar importance across a very long page.

5. **Medium, data presentation:** [Equity.tsx:39](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:39). Explicitly label the detached marker “Account PnL” and label the step-line endpoint “Realized PnL,” including both values. Position the account marker in a visibly separate current-reading column so it cannot be mistaken for a point on the fills timeline.

**Design Score: B.** Starting at A, the high findings reduce interaction states and responsive grades by one letter each; the medium findings reduce content, layout, and data presentation by half a letter each.

**AI Slop Score: A.** No high or medium template-pattern finding; repeated section rhythm is a polish issue, and the signature ruler earns its place.

Skipped live click-through and explorer verification; transaction validity and runtime behavior remain unverified.
SCORES avg=7.7 min=6.8
CRITIC_DONE 0
