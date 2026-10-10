The controls-sheet direction has a coherent point of view. I would hold shipment for state honesty and proof readability.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.8 | The headline and loss ruler explain the purpose quickly, but the strongest proof sits below Rules and the desktop ticket remains visually unresolved. |
| typography | 8.2 | Familjen Grotesk and Public Sans provide restrained character, sensible headline wrapping, and tabular numerals; chart labels and transaction metadata are comparatively small. |
| color | 8.5 | Warm paper, bone ink, and vermilion form a disciplined palette, although generic validation failures also receive the accent reserved for loss-line events. |
| layout_spacing | 7.5 | Desktop alignment and section rhythm are consistent, but the indented incident rail leaves substantial unused space beside repetitive entries. |
| distinctiveness | 8.1 | The loss ruler and parameter-sheet structure establish a recognizable account-control interface without repeating either rejected reference’s visual vocabulary. |
| data_honesty | 5.8 | Timestamps and recorded transactions help, but snapshot values are called live, failed fills reads become empty states, and successful flatten evidence is labelled “reverted tx.” |
| mobile | 7.1 | The stacked ticket and reformatted tables fit 390px without visible overflow, but vault/network identity disappears and the primary action falls well below the first viewport. |

Top five fixes, ordered by impact:

1. **High: Make freshness explicit throughout.** At [App.tsx:110](app/src/App.tsx#L110), present “Last confirmed: Trading” when reads fail, with a dated timestamp; qualify the live claims at lines 135 and 169. At [App.tsx:51](app/src/App.tsx#L51), preserve previous fills and show a request error instead of displaying “No fills yet.”

2. **High: Give contract checks a terminal state.** At [Ticket.tsx:35](app/src/components/Ticket.tsx#L35), add bounded pending/error handling and clear obsolete verdicts when inputs change. The captured “Asking the contract…” state must resolve visibly; at line 121, prevent unqualified submission while checks remain unresolved.

3. **Medium: Make proof labels describe their evidence.** At [RulesSheet.tsx:33](app/src/components/RulesSheet.tsx#L33), distinguish rejected-order transactions from successful flatten transactions, and make “unit test” an actual evidence link rather than an unsupported label.

4. **Medium: Edit the incident rail for scanning.** At [Incidents.tsx:37](app/src/components/Incidents.tsx#L37), move repeated explanations into a shared introduction and retain each event’s duration, caller, exception, and transaction. Preserve every event while reducing the reading required to find meaningful differences.

5. **Medium: Retain account context on mobile.** At [index.css:210](app/src/index.css#L210), replace the hidden metadata with a compact second masthead row showing the vault and testnet; enlarge the replay hit area at line 119 without enlarging its text.

**Design Score: B**  
Category deductions: high findings in interaction states and content honesty; medium findings in hierarchy, spacing, color semantics, and responsive context.

**AI Slop Score: A**  
No high or medium template-pattern finding: the ruler, restrained typography, and evidence-led document structure carry a specific product idea.

Review covered screenshots and source; live interactions and transaction destinations were not checked, so execution and proof validity remain unverified.

SCORES avg=7.6 min=5.8
CRITIC_DONE 0
