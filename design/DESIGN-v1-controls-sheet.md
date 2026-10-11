# BACKED design system (binding)

Hallmark · macrostructure: 02 Long Document, leaning F3 tabular spec sheet, with an F4 incident rail · theme: custom "night ledger" · studied: yes · DNA-source: image+tokens (ref-hl-hlp, ref-stripe-controls, ref-gh-status; see docs/design/REFERENCES.md)

## Art direction
A vault is a controls sheet, not a trading terminal. The page reads top to bottom like a spec that is alive: what the vault is doing in one sentence, the backer's rules as a parameter table with live values, then the incident log that proves the rules fire.

## Type (two faces, neither Inter/Roboto/Arial/system)
- Display: **Familjen Grotesk** 600. Tight, slightly quirky grotesque, used for h1/h2 and the status sentence only. Tracking -0.03em on 40px, -0.02em on 24px.
- Body and figures: **Public Sans** 400/500. Neutral, very legible at 13-15px, real tabular figures (`font-variant-numeric: tabular-nums`) in every table and number.
- Scale (px): 13 / 15 / 18 / 24 / 40. Leading 1.5 body, 1.15 display. No mono anywhere. No letter-spaced caps labels.

## Colour (70/20/10)
- 70 paper `#14120F` (warm near-black, not blue-black), raised `#1B1814`
- 20 ink `#ECE5D8` (bone), dim `#A39A8B`, line `#2C2821`
- 10 accent vermilion `#FF5B35`, **one job: the loss line and everything that happens when it is crossed** (the line, breach state, FLATTENED, incident titles). Primary actions are bone-filled buttons, not accent.
- Sign: negatives get a leading minus and dim ink; only breach uses vermilion. Positive gets "+" and ink.

## Space and shape
8px scale: 4, 8, 12, 16, 24, 32, 48, 64. Radius **4px** on every element. Hairline 1px `--line` rules separate sections (no cards inside cards, no shadows, no blur, no gradients).

## Layout
- Masthead: one line. Wordmark, vault address, network, Connect.
- Fold: left 7/12 = h1 vault, status sentence, the loss-line ruler (signature). Right 5/12 = order ticket with live rule checks (Tabs: Trader | Backer).
- Then sections down the page: Rules (parameter sheet), Incidents (rail), Equity (stepped line), Who holds the key (two-column table), footer single line.
- 390px: single column, ticket after the ruler.

## Signature component: the loss-line ruler
A horizontal ruler in USDC from below the line to above zero, with tick labels. The backer's line is a 2px vermilion rule labelled with its value; equity is a bone marker with its value. On breach (or the replay, key R) the ruler flashes once and the status sentence becomes "Flattened in 2.05 s" with the tx.

## Motion
One page-load: status sentence and ruler fade up 8px, 240ms ease-out, once. Breach flash 420ms once. Nothing else animates. `prefers-reduced-motion`: none.

## Refusals
Terminal grid, order book, candles, mono figures, teal, neon, gradients, glass, pills, sparklines, big-metric stat rows, emoji, em dashes in copy, skeleton-first loading, `transition-all`.
