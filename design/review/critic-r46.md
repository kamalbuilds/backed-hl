The loss ruler gives BACKED a recognizable product idea, and the desktop zoning supports the brief. It is below studio shipment quality: the order summary overstates what is known, and mobile still carries too much explanatory weight.

Assessment uses the supplied screenshots and source. Live transactions and explorer destinations were not verified.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.7 | The **1.94** and loss ruler establish risk immediately, but the headline addresses backers while the default action serves traders. |
| typography | 7.8 | Geist and mono amounts form a coherent system, though subordinate labels, timestamps and proof links compete through similarly small sizes. |
| color | 7.5 | Red risk, amber uncertainty and green outcomes read clearly, but lavender covers actions, data, links and informational chips, weakening its priority signal. |
| layout_spacing | 7.2 | Desktop aligns the risk instrument and ticket convincingly, while repeated bordered cards give secondary evidence almost the same visual weight as trading. |
| distinctiveness | 7.4 | The graduated loss ruler and matching brand glyph express BACKED’s mechanism, but the surrounding card-and-tab vocabulary remains conventional. |
| data_honesty | 6.0 | Snapshot labels, proof hashes and fill tooltips support trust, but incorrect percentage units and a partial risk scenario undermine the confirmation. |
| mobile | 6.8 | The ticket correctly follows the ruler and the supplied view shows no obvious overflow, but key metrics disappear behind disclosure and the comparison becomes a long reading task. |

Top five fixes, in priority order:

1. **High, interaction states:** [Ticket.tsx:149](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:149). After timeout, replace “Checking” and “Simulating” with “Unavailable” and “Estimate only.” At [line 174](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:174), keep ordinary submission disabled until simulation passes; place deliberate revert tests in a separate proof interaction.

2. **High, content correctness:** [Ticket.tsx:158](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:158). The adverse-move calculation considers only the new order, despite existing positions. Calculate the resulting position, including shorts and reductions, before claiming “Room to the loss line after that”; otherwise label this explicitly as the new order’s incremental estimate.

3. **Medium, numeric correctness:** [App.tsx:137](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:137). Divide dollar-denominated `eq` by `s.cap / 1e6`. The displayed **−0.00%** contradicts **−0.06 USDC** against **15.90 USDC** capital, which is approximately **−0.38%**.

4. **Medium, hierarchy/mobile:** [index.css:629](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:629). Keep account value, PnL and leverage cap visible in a compact mobile metric grid; disclose supplementary details. Safe order entry benefits from seeing these numbers beside the loss room.

5. **Medium, layout/AI slop:** [App.tsx:172](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:172) and [App.tsx:197](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:197). Consolidate the repeated contract explanation and operator comparison into one secondary disclosure. Preserve visible checkpoint proof, but reduce equal-weight card repetition and the mobile comparison’s default height.

**Design Score: B.** Starting categories at A, the high findings reduce interaction and content grades; medium findings reduce hierarchy, typography, color, layout and responsive polish.

**AI Slop Score: B.** Two medium findings: repetitive equal-weight surfaces and duplicated explanatory content; neither warrants a high finding.

SCORES avg=7.2 min=6.0
