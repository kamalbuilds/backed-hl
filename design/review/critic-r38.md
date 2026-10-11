**7.5/10 overall.** The loss ruler gives BACKED a product-specific focal point, but the order desk and proof section still feel assembled rather than fully resolved.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.6 | Purpose reads quickly and 1.08 anchors the screen, but wallet connection visually outranks the useful first action, checking an order. |
| typography | 7.9 | Geist and mono numerals work well together, but supporting text has too many closely spaced sizes and the mobile chart labels collide. |
| color | 8.2 | The restrained palette and semantic red establish risk clearly, although lavender serves both wallet connection and the numbered preset badge. |
| layout_spacing | 7.1 | The desktop grid aligns cleanly, but the tall desk delays proof and leaves a conspicuous empty area beneath the equity card. |
| distinctiveness | 6.8 | The ruler and matching logo express BACKED’s mechanism, while the surrounding rounded panels and segmented controls remain recognizably generic product chrome. |
| data_honesty | 7.7 | Snapshot warnings, reference-vault labels and simulation distinctions are explicit, but mobile hides freshness beside the headline value and chart accessibility text calls cached equity “live.” |
| mobile | 7.2 | The reordered desk and collapsed account details show deliberate adaptation with no visible horizontal overflow, but chart annotations crowd and proof arrives several screens down. |

Top five fixes:

1. **High, data honesty:** Keep “Last confirmed 18:46 IST” beside the mobile room value instead of hiding it with the explanatory subline; replace “live equity” with timestamp-qualified wording in the chart’s accessible description. Sources: [index.css:649](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:649), [Equity.tsx:30](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:30).

2. **Medium, hierarchy:** Give “Check an allowed order” clearer action styling, remove the unexplained “1” badge, and shorten the idle checks paragraph to “Choose an example or enter a size.” Sources: [Ticket.tsx:103](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:103), [Ticket.tsx:137](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:137).

3. **Medium, typography/mobile:** At narrow widths, move the date range below the chart and shorten the account annotation to “Last read −0.92”; the current dates visibly run together. Source: [Equity.tsx:41](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:41).

4. **Medium, layout:** Move checkpoints immediately beneath the ruler, ahead of equity on mobile, and into the unused left-column space on desktop; judges should encounter transaction evidence before exhausting the order form. Sources: [App.tsx:168](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:168), [index.css:630](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:630).

5. **Medium, content/AI slop:** Make the lower panel exclusively verification: retain the steps and real-versus-simulated disclosure, relocate Business and Vaults navigation, and move the competitor paragraph into “Who holds the key”; six tabs currently recreate the document dump inside a card. Sources: [App.tsx:175](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:175), [Judges.tsx:47](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Judges.tsx:47).

**Design Score: B.** Categories start at A; the high honesty finding and medium hierarchy, typography, layout, responsive and content findings produce B after weighted rounding.

**AI Slop Score: B.** Two medium deductions: uniform panel treatment outside the signature instrument, and the miscellaneous dossier inside the verification card.

Unchecked: live interactions and explorer receipts; displayed chain outcomes remain unverified.
SCORES avg=7.5 min=6.8
