This has a credible design point of view, but it is below the 9/10 studio shipment bar. The ruler and evidence ledger feel specific to BACKED; mobile still feels like a compressed document.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.5 | Desktop communicates protected trading quickly, but mobile runs the headline directly into the live status and hides the explanation of who can close the account. |
| typography | 8.1 | Familjen Grotesk and Public Sans give restrained character and readable tabular figures, although mobile headline/status spacing weakens the otherwise clear scale. |
| color | 8.8 | Warm paper, bone ink and vermilion are disciplined, with the accent consistently identifying the loss boundary and breach events. |
| layout_spacing | 7.6 | The desktop grid and section alignment are coherent, but the tall ticket determines the fold while the left column finishes considerably earlier. |
| distinctiveness | 8.2 | A controls sheet organized around a loss ruler and incident history has its own argument, though the ordinary form panel carries less identity. |
| data_honesty | 7.5 | Read timestamps, explicit replay labels and transaction links establish provenance, but silent price/capital fallbacks and generic test links weaken that precision. |
| mobile | 6.7 | Tables recompose sensibly and the supplied view shows no obvious overflow, but excessive ticket height delays the checks and several secondary controls remain small touch targets. |

The five fixes I would prioritize:

1. **High, hierarchy/mobile: preserve the mechanism explanation.** At [index.css:221](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:221), `.lede` disappears entirely. Show a short mobile sentence explaining that orders are checked and anyone can flatten below the line. Add 12px between the headline and status so they read as separate levels.

2. **High, data honesty: remove silent invented numeric fallbacks.** At [Ticket.tsx:14](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:14), missing ETH data becomes a price of 2,480 and zero capital becomes 20 USDC. Show unavailable values and suspend calculated presets until actual inputs exist.

3. **Medium, layout/mobile: shorten the ticket without shrinking its controls.** At [index.css:229](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:229), every field becomes a separate full-width row. Keep Size and Limit price paired at 390px; the checks and verdict should arrive sooner than they do in the full-page capture.

4. **Medium, mobile: finish the touch-target treatment.** [App.tsx:125](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:125) uses a 32px Replay button, while [index.css:123](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:123) leaves secondary action buttons without padding. Give Replay, Load and Show all refused orders at least 44px-high hit areas.

5. **Medium, comprehension: explain the ruler’s zero visibly.** At [LossRuler.tsx:35](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/LossRuler.tsx:35), “Capital is 0” is available only to screen readers. Add a visible “PnL, USDC · 0 = starting capital” label; otherwise “equity −0.92” can read as a negative account balance.

**Design Score: B.** Starting each category at A, the high findings lower hierarchy, responsive design and content quality; medium findings further reduce layout and responsive polish.

**AI Slop Score: A.** No high or medium template-pattern finding: the palette, typography, ruler and proof structure serve the product.

Skipped live browser, wallet and proof-destination checks; runtime behavior and linked evidence remain unverified.

SCORES avg=7.8 min=6.7
CRITIC_DONE 0
