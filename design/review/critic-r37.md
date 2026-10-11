**Credible product UI, but not studio-ready.** The ruler gives BACKED a recognizable point of view; the idle order desk and repeated evidence sections weaken it.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | The 1.19 headroom figure anchors the scan, but wallet connection, verification, replay and order presets compete for the first action. |
| typography | 8.1 | Geist and Geist Mono work well together, with restrained weights and clear numerals, but supporting labels and hashes become a uniformly small secondary layer. |
| color | 8.5 | Lavender identifies the primary action while red marks risk and green marks status; the palette stays disciplined without recreating the rejected terminal. |
| layout_spacing | 7.7 | The desktop grid and metric strip align cleanly, but the proof summary followed by the full walkthrough repeats content and extends the page unnecessarily. |
| distinctiveness | 7.3 | The graduated loss ruler and matching wordmark express this product’s mechanism, while the surrounding rounded dark cards still feel interchangeable with other crypto applications. |
| data_honesty | 8.0 | Source distinguishes snapshots, RPC failures, unknown fills and simulated replay, but the equity chart places a later account read beside an earlier fill timeline without an explicit temporal boundary. |
| mobile | 7.2 | The 390px layout preserves the ruler and avoids visible overflow, but the first viewport barely reaches an order preset and the full page becomes a long stack of supporting evidence. |

Top five fixes:

1. **High, hierarchy / interaction:** At [Ticket.tsx:101](app/src/components/Ticket.tsx:101), make “Check an allowed order” the unmistakable first step, with refusal examples secondary. Four equally styled presets above an empty form give judges a choice before demonstrating the mechanism.

2. **Medium, mobile:** At [index.css:593](app/src/index.css:593), reduce the mobile loss-card header footprint and prioritize replay over verification there. The two-action row, repeated headroom label and chart explanation consume enough height to push the meaningful order interaction below the first screen.

3. **Medium, layout / content / AI slop:** At [App.tsx:168](app/src/App.tsx:168) and [Judges.tsx:29](app/src/components/Judges.tsx:29), consolidate the checkpoint summary and seven-step walkthrough into one evidence surface with expandable detail. The repeated rows and repeated card framing make the lower page feel assembled rather than composed.

4. **Medium, data presentation:** At [Equity.tsx:39](app/src/components/Equity.tsx:39), explicitly separate “Fill history through 10:13” from “Account read at 22:29.” The detached square needs a labeled latest-read lane so its horizontal position cannot imply a plotted timestamp.

5. **Medium, typography:** At [index.css:515](app/src/index.css:515), strengthen the proof-row reading order: larger event titles, quieter explanatory text, and clearly identifiable explorer links. Currently descriptions, timestamps and hashes carry nearly equal small-text emphasis.

**Design Score: B.** The High finding reduces hierarchy and interaction categories by one letter; Medium findings reduce affected categories by half a letter.

**AI Slop Score: B.** Two Medium patterns: repeated card framing and duplicated proof content. The ruler prevents the page from becoming a generic template.

Not checked: live interactions, explorer receipts or measured contrast; data honesty reflects screenshots and source, not independent transaction verification.
SCORES avg=7.8 min=7.2
