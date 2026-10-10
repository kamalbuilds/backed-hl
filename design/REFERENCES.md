# BACKED references: hallmark study DNA cards

Produced by running `hallmark study` (~/.agents/skills/hallmark, references/study.md five-step protocol) on three references in **image mode plus measured tokens**. The live pages were captured with refshot-pw (Playwright port of ui-craft refshot.py), the PNGs viewed, and the computed tokens read from `<ref>-tokens.json`. That fills the URL-mode exact-value fields from real computed styles instead of a shallow WebFetch, which returns only the SPA shell for hyperliquid.xyz (study.md junk rule: client-rendered SPA). Source for all three: public reference, used for inspiration on our own product. Refusal check: ok (none is a template marketplace or signature designer work). Full research set (11 references + negative) is in `../../design-research/REFS.md`.

## 1. ref-hl-hlp: Hyperliquid HLP vault detail (north star)
Shots: ref-hl-hlp-1440.png, ref-hl-hlp-390.png. Tokens: ref-hl-hlp-tokens.json

```json
{"source_mode":"image+tokens","source_url":"https://app.hyperliquid.xyz/vaults/0xdfc24b077bc1425ad1dea75bcb6f8158e10df303","source":"public-reference","refusal":"ok",
 "remote_safety":{"public_web_url":true,"scheme":"https","ip_literal_detected":false,"redirects_checked":"unknown","fetched":["rendered-dom-computed-styles"],"scripts_ignored":true,"prompt_injection_detected":false},
 "macrostructure":"05 Workbench (the product surface is the page)","macrostructure_alt":"04 Stat-Led",
 "hero":{"archetype":"H4-Stat-Led","knobs":{"stats":"4 equal panels","alignment":"left","title":"breadcrumb + h1 + address"}},
 "pitch":{"archetype":"F3 Tabular spec sheet","knobs":{"density":"12px rows","sign":"colour only"}},
 "nav":{"archetype":"N1 standard (wordmark + 7 links + Connect right)","knobs":{"height":"~56px"}},
 "footer":{"archetype":"Ft2 inline single line","knobs":{"content":"Online status + Docs/Support/Terms"}},
 "display_role":"neutral grotesque","display_face":"OurFont / OurFontBold","body_role":"neutral grotesque","body_face":"OurFont","label_role":"none (sentence-case labels)","label_face":"OurFont",
 "pairing_logic":"single family","paper_band":"dark <30","paper_value":"rgb(15,26,30) html, rgb(4,37,31) body","paper_hue":"chromatic-green (cool teal-green)",
 "accent_hue_band":"teal","accent_value":"rgb(80,210,193)","accent_footprint":"small <=5%",
 "density":"dense","asymmetry":"left-biased","treatments":["dark-elevation-lightness","faint concentric arcs"],"reveal":"(not-visible)","motion_library":"unknown","anti_patterns":["four equal stat panels (big-metric template)","announcement toast over content"]}
```
Diagnosis: a Workbench page leaning Stat-Led. Title block is breadcrumb, 36px h1, copyable address. Four equal stat panels (TVL $180,837,202 / 4% APR / -, -), then a 50/50 split: About text left, stepped PNL chart right (white step line, no fill, 0-750,000 axis), then a full-width Positions blotter with 20x leverage tags. One family (OurFont) at 12px for nearly everything. Teal rgb(80,210,193) is used only on Connect and links, radius 8px. Distinctive: colour encodes sign only, the chart is a step line. Skip: the four-panel stat row and the green brand paper (BACKED must not read as an HL reskin). **Take:** the stepped equity line without fill, a copyable truncated address under the title, the blotter rule that colour means sign and nothing else.

## 2. ref-stripe-controls: Stripe Issuing spending controls
Shots: ref-stripe-controls-1440.png, ref-stripe-controls-390.png. Tokens: ref-stripe-controls-tokens.json

```json
{"source_mode":"image+tokens","source_url":"https://docs.stripe.com/issuing/controls/spending-controls","source":"public-reference","refusal":"ok",
 "remote_safety":{"public_web_url":true,"scheme":"https","ip_literal_detected":false,"redirects_checked":"unknown","fetched":["rendered-dom-computed-styles"],"scripts_ignored":true,"prompt_injection_detected":false},
 "macrostructure":"02 Long Document","macrostructure_alt":"13 Index-First",
 "hero":{"archetype":"H1-Marquee (docs title)","knobs":{"size":"32px","alignment":"left","subtitle":"24px 400"}},
 "pitch":{"archetype":"F3 Tabular spec sheet","knobs":{"columns":"PARAMETER / TYPE / DESCRIPTION","param":"13px code chip"}},
 "nav":{"archetype":"N-docs (search + product tabs + left tree)","knobs":{"tree":"left 200px"}},
 "footer":{"archetype":"Ft3 index columns","knobs":{}},
 "display_role":"neutral grotesque","display_face":"-apple-system (sohne-var where licensed)","body_role":"neutral grotesque","body_face":"-apple-system","label_role":"uppercase grotesque (table heads, nav groups)","label_face":"-apple-system",
 "pairing_logic":"single family + code mono","paper_band":"light >85","paper_value":"rgb(255,255,255) / rgb(246,248,250) header","paper_hue":"neutral-cool",
 "accent_hue_band":"indigo","accent_value":"rgb(84,105,212)","accent_footprint":"recurring 5-15% (links)",
 "density":"medium","asymmetry":"left-biased (content column + right 'On this page' rail)","treatments":["green left-rule callout"],"reveal":"(not-visible)","motion_library":"unknown","anti_patterns":["docs chrome","Ask AI pill"]}
```
Diagnosis: a Long Document whose core block is an F3 tabular spec sheet. h1 32px 700 rgb(26,31,54), lede 24px/32px 400, body 16px/26px rgb(60,66,87). Spending controls are a table: `allowed_categories` array "List of categories of authorisations to allow. All other categories will be blocked." Each rule is a literal parameter name, a type and a one-sentence consequence. **Take:** BACKED's rules as a parameter sheet (`allowed_markets`, `max_leverage`, `loss_line`, `daily_loss`, `flatten`), each row stating the consequence in one sentence plus where it is enforced. Skip: indigo links, docs nav.

## 3. ref-gh-status: GitHub Status incident history
Shots: ref-gh-status-1440.png, ref-gh-status-390.png. Tokens: ref-gh-status-tokens.json

```json
{"source_mode":"image+tokens","source_url":"https://www.githubstatus.com/history","source":"public-reference","refusal":"ok",
 "remote_safety":{"public_web_url":true,"scheme":"https","ip_literal_detected":false,"redirects_checked":"unknown","fetched":["rendered-dom-computed-styles"],"scripts_ignored":true,"prompt_injection_detected":false},
 "macrostructure":"14 Narrative Workflow (time-ordered log)","macrostructure_alt":"02 Long Document",
 "hero":{"archetype":"H6-Photographic (illustrated banner)","knobs":{"height":"~250px"}},
 "pitch":{"archetype":"F4 Step sequence as a timeline rail","knobs":{"rail":"1px vertical + circle nodes","group":"by month, h2 28px 500"}},
 "nav":{"archetype":"N1 split (Help/Community/Status left, logo centre, GitHub.com/Subscribe right)","knobs":{}},
 "footer":{"archetype":"Ft2 inline single line","knobs":{}},
 "display_role":"neutral grotesque","display_face":"-apple-system","body_role":"neutral grotesque","body_face":"-apple-system","label_role":"none","label_face":"-apple-system",
 "pairing_logic":"single family","paper_band":"light >85","paper_value":"rgb(246,248,250)","paper_hue":"neutral-cool",
 "accent_hue_band":"warm-red","accent_value":"incident title red ~rgb(203,36,49)","accent_footprint":"small <=5%",
 "density":"medium","asymmetry":"centred column","treatments":["illustrated banner"],"reveal":"(not-visible)","motion_library":"unknown","anti_patterns":["decorative illustration","FontAwesome icons"]}
```
Diagnosis: an incident log. Month heading 28px 500, then each incident is a red title, a one-sentence resolution in 14px/21px rgb(36,41,46), and a time window "Oct 7, 17:17 - 18:04 UTC" in dim text, hung on a 1px rail with a node. Red appears only on incident titles. **Take:** BACKED's proof surface as an incident log: every breach is an entry ("Loss line crossed. Flattened in 2.05 s"), with the window in IST and the tx as the source. Skip: the illustration, centring, icon font.

## What the build takes from the three
- Long Document spine (stripe) with a live parameter sheet as the main block, not a terminal grid (hl-trade, lighter, aevo, hyperdash all ship the grid, and so did our v2: see design-research/negative/).
- Incident log as proof (gh-status) instead of a scrolling tape.
- Stepped equity line without fill and colour-means-sign (hl-hlp).
- State in a sentence (drift's pause banner, flighty's "Landed 22m early"), leading with the delta.
