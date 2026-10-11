# Redesign v2 critique log (linear.app system)

## r1 (v1-1440.png, v1-390.png)
Reads as a product console now: top bar, status chip, five metric cards, sticky desk card, every section a surfaced card.
Issues: (1) two lavender primaries compete (Connect wallet and Send order); (2) the loss-line card repeats "Trading." as plain text above a dead gap, duplicating the Armed chip; (3) at 390 the fifth metric is orphaned in a half-width cell.
Also seen: tables are dense but legible; equity chart is small relative to its card.
Fixes: Connect becomes secondary; status line only renders for alarms/replay/stale; last metric spans two columns on mobile.

## r2 (v2-1440.png, v2-390-full.png)
r1 fixes landed: one lavender primary, loss-line card leads with the ruler, metrics grid closed on mobile.
Issues: (1) at 390 the order desk sits after Incidents, three screens down, contrary to the contract; (2) "Sign, then submit" renders as bare text, not a styled secondary button; (3) equity chart labels and step line are low-contrast against surface-1. Also found: the layout class `.grid` collided with the chart's `<g class="grid">`.
Fixes: layout renamed `.layout`; mobile order loss line, desk, then the rest; sign uses the secondary button; chart text ink-muted mono, step line lavender.
