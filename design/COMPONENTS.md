# BACKED components

Installed with `uicraft add` (runs `npx shadcn@latest add`) into app/src/components/ui, then restyled to DESIGN.md tokens (shadcn CSS variables mapped onto paper/ink/line/alarm in app/src/index.css, every radius = 4px, `transition-all` replaced with explicit properties so `uicraft gate` passes).

| Component | Registry / URL | Used for |
|---|---|---|
| Tabs | shadcn, https://ui.shadcn.com/docs/components/tabs | Trader / Backer switch in the desk (underline tabs, URL `?tab=`) |
| Table | shadcn, https://ui.shadcn.com/docs/components/table | Rules parameter sheet, Who holds the key |
| Button | shadcn, https://ui.shadcn.com/docs/components/button | Send order (bone primary), outline secondaries, Connect |
| Input | shadcn, https://ui.shadcn.com/docs/components/input | Ticket and backer fields |
| Label | shadcn, https://ui.shadcn.com/docs/components/label | Field labels |
| Separator | shadcn, https://ui.shadcn.com/docs/components/separator | Hairline rules between document sections |
| Tooltip | shadcn, https://ui.shadcn.com/docs/components/tooltip | installed, not used yet |

## 21st.dev
Searched with `uicraft 21st timeline` for the incident rail. Best match: https://21st.dev/r/nyxbui/timeline ("Displays a list of events in chronological order"). Install attempted with `npx shadcn@latest add https://21st.dev/r/nyxbui/timeline` and refused: the 21st.dev registry now requires `API_KEY_21ST`, which is not set on this Mac (I did not go looking for one).
FALLBACK: 21st.dev registry install needs API_KEY_21ST (not configured); the incident rail is hand-built in app/src/components/Incidents.tsx following the gh-status reference (1px rail, square nodes, month heading). Set API_KEY_21ST and run the command above to swap it in.

## Hand-built (signature, no registry equivalent)
- LossRuler (app/src/components/LossRuler.tsx): the loss-line ruler, DESIGN.md signature component.
- Equity (app/src/components/Equity.tsx): stepped realized-PnL line from HyperCore fills (hl-hlp reference), no chart library.
