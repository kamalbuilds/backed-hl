# BACKED design contract (v2, Oct 11 2026): product console on linear.app

System: `~/.config/design-md/designs/linear.app.md` (claimed in hyperliquid/DESIGN-PICKS.md; PLEDGE must pick another).

## Contract (binding, written before code)
1. **Direction:** a dark risk console for one vault. It reads like Linear's product chrome: near-black canvas, a four-step surface ladder, hairline borders, one lavender accent. Not a document: every block is a card with a surface, and numbers are the headline.
2. **Fonts:** Geist (UI and display, 400/500/600) and Geist Mono (addresses, hashes, amounts), loaded from Google Fonts: `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap`. Linear's own faces are proprietary; Geist is the closest open sans with a matching mono. Tabular numerals everywhere.
3. **Palette:** CSS variables in the token block below. One accent (lavender `#5e6ad2`, used on the primary action, focus and the loss-line marker); semantic success / warn / danger only on chips and the ruler.
4. **Spacing:** 4px base, scale 4 / 8 / 12 / 16 / 24 / 32 / 48. Type scale 12 / 13 / 14 / 16 / 20 / 28 / 40.
5. **Layout:** sticky top bar (wordmark, vault pill with truncated mono address, network chip, Connect); a row of 5 metric cards; a 12-column grid with the risk column (loss line, equity chart, incidents) in 8 columns and the order desk card in 4 (sticky); then Rules, Verify on chain, Business and Key cards. Mobile: one column, metrics in a 2-column grid, desk right after the loss line.

## Components
- **Metric card:** 12px uppercase-free label in ink-subtle, 28px value in Geist Mono 500, a delta or sub-line in 13px.
- **Status chip:** pill, 12px/500, a 6px dot plus text, tinted background at 12% of the semantic color. Armed (success), Breached / Frozen (danger), Settled (neutral), Refused (danger), Accepted (success), Simulated (warn), Real (success).
- **Card:** surface-1, 1px hairline, radius 12px, shadow `0 1px 0 rgba(255,255,255,.03) inset, 0 8px 24px rgba(0,0,0,.35)`. Card header: 14px/600 title + 13px subtle sub-line + optional chip on the right.
- **Buttons:** primary (lavender fill, white text, radius 8, 40px), secondary (surface-3 fill, hairline), ghost (text only, hover surface-2). Exactly one primary per view: "Send order" on Trader, "Fund" on Backer, "Connect wallet" in the top bar before connect.
- **Tables:** 13px rows, 12px 16px cell padding, hairline separators, row hover surface-2, right-aligned tabular numbers, chips for status, truncated mono hashes linking to the explorer.
- **Address:** Geist Mono 13px, `0x6619…F049`, copy-free explorer link with a subtle underline on hover only.

## Token block
```css
:root {
  --canvas: #08090a; --surface-1: #0f1011; --surface-2: #141516; --surface-3: #18191a; --surface-4: #1f2023;
  --hairline: #23252a; --hairline-strong: #34343a;
  --ink: #f7f8f8; --ink-muted: #d0d6e0; --ink-subtle: #8a8f98; --ink-tertiary: #62666d;
  --primary: #5e6ad2; --primary-hover: #828fff; --on-primary: #ffffff;
  --success: #27a644; --warn: #f2994a; --danger: #eb5757;
  --radius-sm: 6px; --radius: 8px; --radius-lg: 12px; --radius-pill: 999px;
  --shadow-card: 0 1px 0 rgba(255,255,255,.03) inset, 0 8px 24px rgba(0,0,0,.35);
  --font-sans: "Geist", ui-sans-serif, sans-serif; --font-mono: "Geist Mono", ui-monospace, monospace;
}
```

## Refusals
No document sections with long paragraphs (max two sentences of prose per card); no square-only corners; no gradients; no glow; no second accent; no emoji; no em dashes in copy.

## v3 final pass (Oct 11, 10:40 PM IST): status color system, chart, type floor
- **Two accents, two jobs.** Primary lavender `#5e6ad2` = actions and focus only (Connect, Send order, first-step marker). Secondary teal `--accent-2 #2ec4b0` = data and enforced outcomes (realized-PnL line and area, room bracket, Flat chips, network and recorded-proof chips, proof links).
- **Status chips (text + dot, never color alone):** success green (Armed, Mined, Pass), danger red (Below line, Frozen, Refused, Reverted, Fail), warn amber (Snapshot, RPC retrying, Fee planned, Replay, measured gap), info teal (Testnet, Recorded, Flat), neutral grey (Settled, Not checked, Checking, Loaded). Chip text uses the `--st-*-ink` tints, all at least 4.5:1 on surface-1.
- **Chart:** labelled USDC axis with nice ticks and gridlines, dashed time gridlines with date+time ticks, axis lines, teal stepped line with 8% area, fill dots, annotations (low point, worst fill, measured gap, last read), the backer's line dashed red, and a hover/keyboard tooltip (time, coin/direction, size at price, fill PnL, realized total).
- **Type floor:** no text under 12px; secondary text 13px in ink-subtle `#aab0b9` (about 9:1 on surface-1); tertiary `#8d929a` (about 6:1). Body 14 to 16px.
