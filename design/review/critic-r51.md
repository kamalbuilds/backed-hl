This is a substantial redesign, but below studio shipping quality. The terminal structure works; mobile composition and the balance between trading controls and demo material still need work.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.7 | Status and risk are immediately readable, but the oversized example action competes with order entry, while activity remains secondary. |
| typography | 8.0 | Tabular numerals and restrained weights suit trading, although small muted annotations make charts and receipts harder to scan. |
| color | 8.2 | Green, red, amber and lavender have clear roles, with good differentiation between armed, settled and refusal states. |
| layout_spacing | 7.4 | Hairline zoning replaces the generic card stack successfully, but desktop retains substantial vacant space and mobile repeats the full workspace vertically. |
| distinctiveness | 8.0 | The loss ruler, enforced-rule strip and receipt rows give BACKED a recognizable terminal identity without copying Hyperliquid’s branding. |
| data_honesty | 8.4 | Snapshot timestamps, source-vault attribution and the explicit realized/account PnL gap are strong, but “fresh simulation” appears before any simulation has run. |
| mobile | 6.5 | Controls remain legible, but Trade/Risk/Activity are jump links through a roughly six-screen page, with account identity and several grid columns hidden from immediate view. |

Top five fixes:

1. **Make mobile navigation switch workspaces.** [App.tsx:132](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:132), [index.css:941](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:941): show the selected Trade, Risk or Activity workspace beneath a compact account summary; avoid requiring traders to scroll past the ticket, receipts and both risk visualizations.

2. **Put order entry ahead of demo presets.** [Ticket.tsx:111](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:111): move refusal examples below the fields into an expandable “Test contract rules” section, and reduce the successful example to one compact action.

3. **Rebalance the desktop risk zone.** [index.css:892](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:892): make the ruler a compact instrument and give the PnL chart the dominant plotting area; reduce repeated framing and vertical padding so activity gets meaningful space, not merely a position above 900px.

4. **Make simulation freshness conditional.** [App.tsx:176](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:176), [Ticket.tsx:153](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:153): the idle screenshot says the verdict is a fresh simulation while also asking for a size; display that claim only after a completed check, with its timestamp.

5. **Preserve mobile account identity.** [index.css:871](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:871), [index.css:910](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:910): retain a compact linked vault address and expose backer, trader and factory through an Account disclosure instead of hiding them.

**Design Score: B**  
**AI Slop Score: B**. Purposeful terminal structure; residual boxed demo material and repetitive mobile stacking keep it below A.

Skipped runtime click-through and signing checks; this assesses supplied screenshots and source, so interactive states remain unverified.
SCORES avg=7.7 min=6.5