# {{APP_NAME}} — Curriculum (12 weeks / 84 days) — template

*Authoring-time. The locked scope-per-day, written **before** any lesson JSON. This
is the single source of truth for what each day teaches; lesson batches never invent
scope, they only realize it.*

> **How to use:** design the 84 days **from the grammar spine (Q2)**, not by
> translating the Dutch map. The Dutch curriculum in `../docs/plan.md` §3 is the
> worked example — read it for *how* a spine drives sequencing, then build your own.
> Replace every `{{PLACEHOLDER}}`. Keep the FIXED rhythm below verbatim.

---

## FIXED weekly rhythm (never changes)

- **12 weeks, 84 days.** Day ids `day-01`…`day-84`, sequential (validator enforces).
- **Weeks 1–2:** 6 teaching days + 1 **capstone** (day 7, 14).
- **Weeks 3–12:** 5 teaching days + 1 **review/immersion** day + 1 **capstone**.
- **Module codes:** week N → `MNN` (`M01`…`M12`). Every lesson's `module` must match
  its manifest week (validator enforces). `unit` = one per week is simplest (`U0N`).
- **Kinds:** `lesson` (teaching), `review` (the review/immersion day), `capstone`.
- **Every review/immersion day** carries the recurring-cast story arc.
- **Every capstone** ends on the growing self-intro (`verhaal` thread — see
  `characters.md`) and adds that week's cumulative layer.
- **Levels:** A1 = weeks 1–4, A2 = weeks 5–8, B1 = weeks 9–12.

## FIXED anchor beats (place these, content is yours)

- **Grammar spine early + revisited** — introduce each spine element (Q2) in A1/A2,
  revisit relentlessly. Put the **A2→B1 gate** structure at the week 8 boundary.
- **The feared module** (spine's hardest element) gets extra room — the Dutch pack
  gave `er` two full days in week 10. Do the same for yours if it's that dense.
- **Cast arc beats** land on review/immersion days: mid-arc mover's rough week ~W6,
  their news ~W9 (day 62), **their move day 69 (W10)**, the catch-up ~W11, the
  reunion ~W12.
- **Meta-module (Q7)** — the one language-specific challenge — lands in **week 11**.
- **Register/slang system (Q6)** — the traffic-light tiers — land in **week 12**.

---

## A1 Foundations — Weeks 1–4
*{{A1_BLURB}}*

**Week 1 — {{WEEK1_THEME}}** (spine element(s) introduced: {{...}})
1. {{topic}}
2. {{topic}}
3. {{topic}}
4. {{topic}}
5. {{topic}}
6. {{topic}}
7. **Capstone** — first self-intro (layer 1) + journal

**Week 2 — {{WEEK2_THEME}}** (spine element(s): {{...}})
8.–13. {{six teaching topics; put an early spine element here — Dutch put V2 in W2}}
14. **Capstone** — self-intro layer 2

**Week 3 — {{WEEK3_THEME}}**
15.–19. {{five teaching topics}}
20. **Review + immersion** — {{CHAR1_NAME}} narrates their neighborhood
21. **Capstone** — self-intro layer 3

**Week 4 — {{WEEK4_THEME}}** (a cultural scene anchor drives vocab here)
22.–26. {{five teaching topics}}
27. **Review + immersion** — {{CHAR4_NAME}}'s routine + favorite local spot
28. **Capstone** — full-A1 production; self-intro layer 4

## A2 Building — Weeks 5–8
*{{A2_BLURB}}*

**Week 5 — {{WEEK5_THEME}}: the everyday past tense** (major spine element)
29.–33. {{five teaching topics building the past tense}}
34. **Review + immersion** — {{CHAR1_NAME}}'s weekend trip (past-tense narrative)
35. **Capstone** — storytelling with {{CHAR2_NAME}}; self-intro layer 5

**Week 6 — {{WEEK6_THEME}}: health, feelings, advice**
36.–40. {{five teaching topics}}
41. **Review + immersion** — {{CHAR3_NAME}}'s rough week (arc beat)
42. **Capstone** — self-intro layer 6

**Week 7 — {{WEEK7_THEME}}: the other past / memories**
43.–47. {{five teaching topics}}
48. **Review + immersion** — {{CHAR4_NAME}}'s childhood
49. **Capstone** — childhood woven into self-intro; layer 7

**Week 8 — {{WEEK8_THEME}}: future, opinions, the A2→B1 gate**
50.–54. {{five teaching topics; put the subordinate-clause / gate structure here}}
55. **Review + immersion** — {{CHAR1_NAME}} & {{CHAR2_NAME}} debate {{spicy Q}}
56. **Capstone** — self-intro layer 8

## B1 Threshold — Weeks 9–12
*{{B1_BLURB}}*

**Week 9 — {{WEEK9_THEME}}: complex sentences**
57.–61. {{five teaching topics}}
62. **Review + immersion** — {{CHAR3_NAME}}'s news lands (reported speech, arc beat)
63. **Capstone** — self-intro layer 9

**Week 10 — {{WEEK10_THEME}}: the feared module**
64.–68. {{five teaching topics; give the feared module 2 days if it's that dense}}
69. **Review + immersion** — {{CHAR3_NAME}} moves {{HOME_CITY}} → {{DEST_CITY}}
    (**the mid-arc life event**; braids all of M10's grammar)
70. **Capstone** — "my big decision"; self-intro layer 10

**Week 11 — {{WEEK11_THEME}}: sounding native + the meta-module**
71.–75. {{five teaching topics; the meta-module (Q7) is one of these}}
76. **Review + immersion** — {{CHAR1_NAME}} visits {{CHAR3_NAME}} in {{DEST_CITY}}
77. **Capstone** — self-intro layer 11 (register control)

**Week 12 — {{WEEK12_THEME}}: street {{LANGUAGE_NAME}} & the finale**
78.–82. {{five teaching topics; the register/slang traffic-light (Q6) lands here}}
83. **Final immersion** — the whole cast reunites, one year on
84. **Final capstone — the definitive self-intro** — 12-week recap, letter to your
    past self (one tense-move per slot), target-language farewells, stats banner
