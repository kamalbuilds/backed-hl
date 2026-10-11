**r18 has a coherent design identity, but I would not ship it unchanged.** The ruler makes contract enforcement understandable; the rest of the page needs a sharper path from explanation to action to proof.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.6 | The headline explains the purpose immediately, but the inactive ticket competes with the ruler while the strongest proof sits below the fold. |
| typography | 7.9 | Familjen Grotesk and Public Sans provide controlled hierarchy and tabular numerals, though small parameter chips and repeated explanatory text make the lower page feel like documentation. |
| color | 8.7 | Warm paper, bone text and vermilion form a disciplined palette, with the accent consistently marking the loss boundary and breaches. |
| layout_spacing | 7.3 | The desktop split is well aligned, but repeated section treatments flatten the rhythm and the ticket’s duplicated instruction creates an obvious dead patch. |
| distinctiveness | 8.0 | The controls-sheet structure and loss ruler establish a product-specific viewpoint, although the lower page remains visually close to a technical report. |
| data_honesty | 8.1 | Source distinguishes snapshots, failed reads, empty fills and simulated replay, but proof from several vaults requires careful reading to attribute correctly. |
| mobile | 6.9 | The headline and ruler survive 390px without visible overflow, but the ticket starts near the viewport’s bottom and the full page becomes an exhausting sequence of stacked text. |

Top five fixes:

1. **High, interaction states:** Give the ticket one instruction and expose what will be checked. [Ticket.tsx:137](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:137) repeats the instruction rendered through the verdict at line 141. Keep it once beside the presets; show Market, Leverage, Loss line and Frozen as explicitly awaiting input. The contract’s checks should be visible before users discover them.

2. **High, hierarchy/responsive:** Provide a compact proof entry beside the mobile replay action. [App.tsx:127](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:127) offers replay and order entry, while the judge walkthrough follows the entire ticket. Add a clearly labelled “Verify this run” anchor there and collapse supporting proof detail. The masthead link helps navigation, but does not explain what evidence awaits.

3. **Medium, typography/content:** Lead rule rows with readable names. [RulesSheet.tsx:30](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/RulesSheet.tsx:30) makes `allowed_markets` and `after_breach` the primary labels. Use “Allowed markets” and “After a breach”; retain contract identifiers as secondary detail. The sheet should communicate consequences without asking traders to parse implementation names.

4. **Medium, content clarity:** Identify the judge walkthrough’s vault before its first step. [Judges.tsx:26](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:26) introduces a different vault inside prose beneath a page showing the selected vault. State “Recorded walkthrough: vault …” above the steps and keep each transaction next to its specific outcome.

5. **Medium, spacing/layout:** Replace uniform section spacing with deliberate grouping. [index.css:157](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:157) applies the same separator rhythm across proof, rules, incidents, equity and business material. Group Rules with Incidents, and Business model with Who holds the key; preserve larger breaks between those groups. This would shorten the perceived document without shrinking text.

**Design Score: B**  
Category deductions: hierarchy, interaction states and responsive each receive one High; typography, layout and content receive Medium deductions, weighted using gstack’s categories.

**AI Slop Score: A**  
No qualifying template-pattern finding: the ruler, incident rail and semantic accent earn their place.

Skipped live browser interaction and explorer validation; data honesty assesses presentation and source handling, not independently confirmed transactions.
SCORES avg=7.8 min=6.9
CRITIC_DONE 0
