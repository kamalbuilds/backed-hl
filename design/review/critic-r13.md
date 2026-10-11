This has a point of view: a live controls sheet built around the loss line. It clears the two rejected directions, but the action hierarchy and mobile reading burden keep it below studio-ready.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.4 | The headline explains the mechanism quickly and leads into the ruler, but the strongest action invites submission of an already-refused order. |
| typography | 8.0 | Familjen Grotesk and Public Sans provide clear roles and tabular numerals, although the lower page flattens into similar-sized table text and explanations. |
| color | 8.7 | Bone, warm black, and vermilion form a disciplined palette with a meaningful accent; the size and price inputs are visibly weaker than adjacent controls. |
| layout_spacing | 7.3 | The desktop split and aligned section introductions work, but Business model and Who holds the key lose the spacing and separators established above them. |
| distinctiveness | 8.0 | The loss ruler and incident record express contract enforcement through the interface, giving BACKED an identity beyond a landing template or trading terminal. |
| data_honesty | 7.8 | Source distinguishes snapshots, replay, missing fills, and RPC failures, but the equity-gap explanation always says “under,” even when live equity is above realized PnL. |
| mobile | 6.8 | The masthead and stacked tables adapt thoughtfully, but the ticket starts around 727px down and the full page requires extensive scrolling through repeated explanations. |

Top five fixes, in priority order:

1. **High, hierarchy and interaction:** [Ticket.tsx:142](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:142). Demote “Send anyway, it will revert” to an explicit secondary test action. A refusal should foreground the reason and correction; reserve the filled button for an accepted order. Apply the same treatment to “Send unchecked.”

2. **High, mobile:** [App.tsx:127](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:127). Compress the replay and timing block on mobile and move its expanded explanation into Incidents. Keep the ruler, but bring the ticket’s market and side controls into the first viewport.

3. **Medium, spacing and content hierarchy:** [App.tsx:170](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:170). Give Business model and Who holds the key the same section boundary and vertical spacing as Rules and Incidents. Put detailed economics behind an expandable section so proof remains the main reading path.

4. **Medium, color and affordance:** [index.css:79](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:79). Explicitly apply the existing `--input` border token to ticket inputs. In the screenshot, editable size and price fields look almost disabled beside the clearly outlined market selector.

5. **Medium, data presentation:** [Equity.tsx:39](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:39). Right-align the current-value label inside the chart boundary at narrow widths, and make the gap sentence at line 45 choose “above” or “under” from the sign. Both the annotation placement and wording must survive changing values.

**Design Score: B.** Category deductions: hierarchy B, typography A−, spacing B, color A−, interaction B, responsive B, content B; no observed deduction for motion, performance feel, or AI slop. Weighted result rounds to B.

**AI Slop Score: A.** No material template-pattern finding: the visual signature represents the product’s actual mechanism, and the palette serves state rather than decoration.

No files edited; live interactions, overflow, and proof-link destinations were not checked, so those remain unverified.
SCORES avg=7.7 min=6.8
CRITIC_DONE 0
