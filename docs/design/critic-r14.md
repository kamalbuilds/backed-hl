This has a coherent point of view, but a respected studio would still revise the ticket and mobile proof path before shipping.

| Axis | Score | Evidence |
|---|---:|---|
| hierarchy | 7.4 | Purpose reads immediately and the ruler anchors the page, but the refused-order ticket lacks a clear next action. |
| typography | 8.1 | Familjen Grotesk and Public Sans give headings and tabular figures distinct roles, though the ticket’s verdict and explanatory text are too similar in scale. |
| color | 8.8 | Warm paper, bone ink and vermilion form a disciplined palette, with the accent consistently identifying the loss boundary and breaches. |
| layout_spacing | 7.6 | The desktop split and table alignment are deliberate, but repeated section treatments flatten the full page into a lengthy document without navigational rhythm. |
| distinctiveness | 8.4 | The loss ruler, parameter sheet and incident rail establish an identifiable controls product without repeating either negative reference’s visual formula. |
| data_honesty | 8.0 | Snapshot timestamps, RPC failures and replay labels communicate uncertainty explicitly, but ticket checks omit that freshness context and the equity explanation overstates attribution. |
| mobile | 7.2 | The 390px layout preserves readable fields, reflows tables and specifies 44px controls without visible horizontal overflow, but removes the immediate measured proof and leaves verification deep below the fold. |

Top five fixes:

1. **High · Make the ticket’s next action unambiguous.** [Ticket.tsx:142](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:142)  
   In the captured refusal state, signing still looks like a normal alternative beneath the revert test. Apply the refusal treatment to both submission paths and identify them as deliberate tests. Also rename “2.5x long” to “Add 2.5x long”: the preset sizes an additional order, which produces **4.18x total exposure** in this screenshot.

2. **High · Carry freshness into the rule checks.** [App.tsx:140](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:140), [Ticket.tsx:51](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Ticket.tsx:51)  
   The hero says “Last confirmed,” while the ticket can present unqualified passes using the same retained snapshot. Pass the read time and stale state into the ticket; distinguish last-read rules from the current simulation result.

3. **High · Restore mobile proof beside the replay.** [index.css:284](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/index.css:284)  
   Remove the rule hiding `.measured`. Keep a compact “Median 2.05 s · 5 live runs · fill tx” directly beneath the replay so mobile judges can immediately distinguish animation from evidence.

4. **Medium · Give the long document a short navigation spine.** [App.tsx:146](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/App.tsx:146)  
   Add plain anchor links for Rules, Incidents and Verification near the fold, with matching section IDs. Preserve the document structure while making its evidence reachable without scanning every section.

5. **Medium · Separate chart observation from causal explanation.** [Equity.tsx:45](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/components/Equity.tsx:45), [backed.ts:57](/Users/kamal/Desktop/solana/cwf/hyperliquid/projects/backed/web/app/src/lib/backed.ts:57)  
   Outgoing spot transfers are counted as flatten bounties, then used to explain the equity gap. Show the measured gap separately; label transfers as transfers unless their bounty attribution is verified.

**Design Score: B**  
Category deductions: hierarchy, interaction states and responsive each take one High; layout and content each take one Medium. Other assessed categories retain A, yielding a weighted B after whole-letter rounding.

**AI Slop Score: A**  
No High or Medium template-pattern finding: the visual choices express the mechanism and its evidence.

Unchecked: live wallet flows, explorer destinations and runtime overflow; these are screenshot/source judgments, with no files edited.
SCORES avg=7.9 min=7.2
CRITIC_DONE 0
