# /design-review: BACKED (http://localhost:8950/ preview of web/app dist), 2026-10-10

Mode: full audit, gstack design-review checklist (10 categories), screenshots via Playwright (shoot.mjs) at 1440 and 390, headless gstack browse/Aside not used. Outside voice: Codex CLI, read-only sandbox, independent of the builder (prompt: review/critic-prompt.md). Design detector (impeccable) not installed; the install needs the user's OK, so detection was done by hand against the 30 detector rule ids.

**Design Score: B**

**AI Slop Score: A** (structure follows the enforcement mechanism: loss ruler, parameter sheet, incident rail; no stat trio, no gradients, no terminal clone, no kicker, no mono costume)

## Per-category (final round r11)
| Category | Grade | Note |
|---|---|---|
| Visual hierarchy | B+ | purpose, state, ruler in order on desktop; mobile ticket below first screen (medium) |
| Typography | A- | Familjen Grotesk 600 + Public Sans 400/500, 13/15/16/18/24/40 scale, tabular nums, balanced h1 |
| Spacing & layout | B+ | 8px scale, 7/5 fold, aligned section heads; long mobile document (medium) |
| Color & contrast | A | 70/20/10, vermilion only for the line and breaches, inputs #6b6355 border >=3:1 |
| Interaction states | B | checking/unavailable/accepted/rejected ticket states, disabled styles, confirm on destructive; local rule rows can lag the simulation (medium) |
| Responsive | B | no overflow at 390, 44px targets, tables restacked as records |
| Content | B+ | read times, replay labelled not live, 50.56 s outlier disclosed, proof scoped to the reference vault |
| AI slop | A | none found |
| Motion | A | one 240ms rise, 420ms breach flash (opacity), transform-only ruler, reduced-motion honoured |
| Performance | B | 591 kB JS (viem), fonts preconnected with swap |

## Fixes applied across rounds
See CRITIQUE.md: 11 rounds, each with the critic's findings and what changed.

## Outside voice, final round (verbatim)
This has a coherent design direction, but I would not ship it unchanged. The loss ruler makes contract enforcement tangible; the long mobile sequence and inconsistent freshness cues weaken it.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 8.0 | Desktop clearly leads from purpose to account state to loss boundary, but mobile spends almost its entire first screen explaining before exposing the ticket. |
| typography | 8.4 | Familjen Grotesk and Public Sans provide restrained character and readable measures, though dense proof text and left-aligned numerical columns weaken scanning. |
| color | 9.0 | Warm paper, bone ink and vermilion form a disciplined palette, with the accent consistently identifying the loss boundary and breach events. |
| layout_spacing | 8.0 | Desktop alignment and section rhythm are deliberate, but the repeated heading, explanation and content structure becomes laborious down the mobile page. |
| distinctiveness | 8.5 | The controls sheet, loss ruler and incident rail express a specific product thesis without reproducing either negative reference’s visual formula. |
| data_honesty | 7.0 | Snapshot timestamps, explicit replay labels and differentiated API failures are strong, but ticket checks can present stale local rule values alongside a fresh contract simulation. |
| mobile | 7.2 | Tables reflow sensibly and source defines 44px mobile controls, but the ticket begins around y=752 and the strongest incident proof sits much farther down. |

Top five fixes, ordered by impact:

1. **High, interaction states: carry freshness into the ticket.** [App.tsx:137](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:137), [Ticket.tsx:45](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:45). The hero admits “Last confirmed,” while Market, Loss line and Frozen checks derive from `s` without their own freshness qualification. Pass the read time and stale state into the ticket, distinguish cached checks from the simulation result, and replace “Send unchecked” with a recheck action when verification is unavailable.

2. **High, responsive hierarchy: shorten the mobile path to action and proof.** [index.css:220](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:220), [App.tsx:124](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:124). Compress the introductory and replay blocks so meaningful ticket controls enter the first screen; add a direct “View 5 breach runs” anchor beside the measured result. Preserve the ruler’s readable labels.

3. **Medium, content hierarchy: demote the signature submission path.** [Ticket.tsx:133](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:133). “Sign, then submit (you pay gas)” adds a protocol decision to the primary trading flow and consumes another mobile row. Put it behind “Other submission options,” with the gas explanation inside that disclosure.

4. **Medium, typography: align comparable rule values.** [RulesSheet.tsx:31](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/RulesSheet.tsx:31), [index.css:160](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:160). Tabular numerals help, but leverage, loss and bounty values still have uneven left edges. Right-align the desktop value column and consistently align parameter/value pairs on mobile.

5. **Medium, spacing: reduce repeated explanatory weight on mobile.** [Incidents.tsx:35](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Incidents.tsx:35), [index.css:215](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:215). The summary and two explanatory paragraphs precede the actual incident entries. Keep the run count and median visible, move methodology into an expandable block, and bring the first transaction-backed incident forward.

**Design Score: B.** Starting each category at A, the two high findings and three medium findings produce deductions in interaction states, responsive hierarchy, content, typography and spacing.

**AI Slop Score: A.** No substantive template-pattern finding: the visual signature serves the enforcement mechanism, and the evidence determines the page structure.

Skipped live browser and wallet checks; screenshots and source cannot establish transaction success or proof-link validity.

SCORES avg=8.0 min=7.0
CRITIC_DONE 0
