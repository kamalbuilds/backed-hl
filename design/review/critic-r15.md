r15 has a credible design direction, but it is below studio shipment quality. The loss ruler is the strongest element; the initial order state and mobile reading journey need work.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.5 | The headline explains the mechanism quickly, but the prominent ticket opens with a refusal and two revert-testing actions, leaving the intended first action ambiguous. |
| typography | 8.1 | Familjen Grotesk and Public Sans provide a restrained, coherent hierarchy with tabular figures, though the lower sections offer little distinction between essential proof and supporting explanation. |
| color | 8.8 | Warm black and bone feel deliberate, and vermilion consistently identifies the loss threshold and breach events; failed-order emphasis is comparatively weak. |
| layout_spacing | 7.4 | The desktop split and ruler alignment work, but the full page repeats the same section treatment across rules, evidence, economics, and comparison, flattening their relative importance. |
| distinctiveness | 8.0 | The controls-sheet approach and labeled loss ruler establish a product-specific viewpoint; the conventional ticket remains its least distinctive component. |
| data_honesty | 8.3 | Source distinguishes snapshots, RPC failures, absent fills, recorded evidence, and simulated replay, although the screenshots alone cannot establish that the linked transactions prove each claim. |
| mobile | 7.0 | The headline, ruler, and two-line masthead adapt sensibly at 390px, but the lengthy ticket delays section navigation and the lower page becomes an exhausting sequence of stacked records. |

Top five fixes:

1. **High, hierarchy and interaction: give the initial ticket a deliberate starting state.** [Ticket.tsx:18](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:18) initializes an additional 2.5× position without accounting for existing exposure, producing the pictured 4.18× refusal. Start with an empty size and a clear instruction, or calculate a genuinely valid addition. Keep rejected examples explicitly selectable.

2. **Medium, content and action hierarchy: separate normal trading from adversarial testing.** [Ticket.tsx:140](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:140) places relayer plumbing directly above two equally prominent test actions. Move signing mechanics and revert-testing controls into an expandable secondary area; keep the contract verdict and correction path immediately visible.

3. **Medium, mobile navigation: put section access before the ticket.** [App.tsx:146](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:146) renders navigation after the entire fold, including the trading form. At 390px, place it between the ruler/replay and ticket so judges can reach Rules and Incidents without traversing the form.

4. **Medium, responsive chart: observe the persistent chart container.** [Equity.tsx:8](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:8) attaches its observer once, while loading and populated states replace the referenced element. Keep one outer container across states so later width changes update SVG geometry; verify labels at 390px after loading and resizing.

5. **Medium, layout and content hierarchy: shorten the primary proof journey.** [App.tsx:166](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:166) places the judge walkthrough after Rules, Incidents, and Equity, then continues with three equally styled reference sections. Put the concise walkthrough immediately after the fold and subordinate economics, key comparison, and factory discovery visually.

**Design Score: B.** From A: one high finding in hierarchy/interaction, with medium deductions in content, layout, and responsive design.

**AI Slop Score: A.** No high or medium template-pattern finding: the ruler earns its prominence, the palette encodes meaning, and the evidence has product-specific structure.

No files edited; live interactions and explorer proofs were not checked, so runtime correctness remains unverified.
SCORES avg=7.9 min=7.0
CRITIC_DONE 0
