# DutchBuddy — Character Bible

*Authoring-time only. Not shipped. Consulted by every lesson-generation pass so
recurring-cast voices and the story arc stay coherent across 84 days written in
parallel batches. If a dialogue names a character, that character must be in the
manifest `cast` list (the validator enforces this) and must behave as written here.*

---

## The four

### Emma — main narrator
- **Who:** 31, marketing lead at a mid-size Amsterdam agency. Born in Groningen, moved to Amsterdam for work at 24. Lives in the Pijp.
- **Voice:** warm, quick, a little ironic. The one who explains the city to you. Uses *gezellig*, *lekker*, *hoor* naturally. Optimistic but not naïve.
- **Role in the arc:** your primary guide. Narrates immersion days early (her buurt, her weekend). Present at the beginning and the end. She is the steady thread.
- **Speech markers:** starts sentences with *"Kijk,…"* (look,…) when explaining. Warm sign-offs: *"Doei!"*, *"Tot snel!"*

### Daan — café friend, your gossip (*chisme*) partner
- **Who:** 29, works in a bookshop, aspiring musician. Emma's oldest friend. The person you sit across from at the café.
- **Voice:** dry, funny, opinionated, loves a bit of gossip and a debate. The one who says the blunt thing, then softens it with a particle. Heavy user of *toch*, *echt*, *nou*, *joh*.
- **Role in the arc:** your conversation partner on "wat heb je gedaan?" / "het nieuws" days. He's who you practice storytelling and opinions with. In W8 he debates whether expats must learn Dutch (he says yes, provocatively, then admits it's hard).
- **Speech markers:** *"Echt waar?"*, *"Joh, …"*, *"Nou, …"*, ends teasing lines with *"hoor"*.

### Sanne — the friend whose life moves
- **Who:** 27, UX designer. Starts in Amsterdam (shares the friend group). **Her life is the season-long story.**
- **Voice:** thoughtful, a bit anxious, earnest. Talks about feelings more than the others (good vehicle for the emotions/advice module). Warms up over the year.
- **Role in the arc — THE SPINE (keep these day anchors exact):**
  - **W6 / ~day 41:** rough week — bike stolen, gets sick, goes to the huisarts. (health module immersion)
  - **W9 / ~day 62:** news lands — a **job offer in Utrecht**. Told via reported speech ("ze zei dat…"). This is the reported-speech immersion.
  - **W10 / day 69:** **she takes the job and moves Amsterdam → Utrecht.** Moving-day conversation. THE mid-arc life event. Every language pack's arc pivots ~day 69; this is Dutch's.
  - **W11 / ~day 76:** Emma visits Sanne in **Utrecht** — Saturday catch-up. Sanne is settling in, happier.
  - **W12 / day 83:** back in Amsterdam for a borrel with everyone, one year on.
- **Continuity rule:** before day 62 Sanne lives in Amsterdam and knows nothing of Utrecht. Between 62 and 69 it's a decision in progress. From day 69 on she lives in Utrecht. Never break this ordering.

### Bram — routine & immersion voice
- **Who:** 38, architect in Rotterdam. Emma knows him through work. Steadier, older, family man (partner + young kid).
- **Voice:** measured, precise, proud of Rotterdam (contrasts it with Amsterdam — *"geen woorden maar daden"*). Good vehicle for routine/habit language and, later, childhood memories.
- **Role in the arc:** W4 immersion (his daily routine + favorite snackbar), W7 immersion (his Rotterdam childhood — imperfectum). Represents the "real life outside the Randstad tourist bubble" voice.
- **Speech markers:** plain, no-nonsense, occasional Rotterdam pride jab at Amsterdam.

### You (the learner)
- Speaker id **`You`** — always allowed by the validator, never needs to be in the cast list.
- An adult who has recently moved to (or is about to move to) the Netherlands. Motivated, a bit self-conscious about switching to English. Lives in Amsterdam by default. The "blijf in het Nederlands" module (day 74) speaks directly to this person's core struggle.

---

## The growing self-intro — "mijn verhaal"

Every capstone ends with the learner producing/extending a personal self-introduction that gains exactly one new grammar layer per week. This is the app's signature thread. Capstone authors MUST append the correct cumulative layer:

| Wk | Capstone day | New "mijn verhaal" layer (cumulative — earlier layers still expected) |
|----|------|------|
| 1 | 7  | name, where you're from, that you're learning Dutch (present, *zijn/hebben*) |
| 2 | 14 | + your daily routine (present tense, V2, a time expression) |
| 3 | 21 | + your family and your buurt (possessives, adjectives with -e) |
| 4 | 28 | + what you like to eat/drink and a modal wish (*ik wil…, ik houd van…*) |
| 5 | 35 | + something you **did** recently (perfect tense) |
| 6 | 42 | + how you've been feeling / a small health event (*ik voelde me…, ik had…*) |
| 7 | 49 | + a childhood memory (imperfectum: *toen ik klein was…*) |
| 8 | 56 | + a plan and an opinion (*ik ga…, ik vind dat…* + a subclause) |
| 9 | 63 | + something someone told you (reported speech: *… zei dat…*) |
| 10 | 70 | + a big decision, with *er* and a subclause (Sanne's move as the model) |
| 11 | 77 | + register control: the same intro said politely (*u*) vs casually (*je*) |
| 12 | 84 | **Mijn verhaal, definitief** — the whole thing, one tense-move per slot, plus a letter to your past self and Dutch farewells |

Capstones reference this table by using a `builder` or `journal` block titled around "mijn verhaal" that layers in that week's move.

---

## Season 2 (Weeks 13–18) — the second year

*Season 1 closed on a borrel "one year on" (days 83–84). Season 2 picks up in the
learner's second year: same friends, a little older, real life happening. It carries
the pack from B1 into **B2 depth** (weeks 13–16) and the **C1 gateway** (weeks 17–18).
See `docs/roadmap-dutch-nl.md` for the full week-by-week outline. The four continuity
rules below are load-bearing; the arc anchors are exact.*

### Where each character goes

- **Emma** — season-2 narrator again, opens it on day 90. She's up for a step into a
  lead / creative-director role and quietly weighing going freelance. Her thread
  carries the **professional & written-register** material (sollicitatie, werkoverleg,
  vergadering). Still warm, still ironic, a touch more tired. Present at the start
  (day 90) and the very end (day 126).
- **Daan** — his band lands a real support slot and he cannot stop overthinking it.
  His thread carries **opinion, irony, hypotheticals and hedging** — he is the voice
  of week 17 (irony & particles) and the hypothetical immersion on day 97
  (*"als we ja zeggen…"*). Same dry, teasing Daan, now with a decision to dodge.
- **Sanne** — **lives in Utrecht for the entire season (never moves back)**. Her life
  is again the spine. **Season-2 pivot, day 111: she announces she's expecting a baby.**
  Delivered and re-told through reported speech + hypotheticals + layered tenses — it
  is the grammar showcase of week 16 as well as the emotional pivot. Her partner stays
  offstage (referred to, never a dialogue speaker, so no extra cast entry needed).
  Warmer and more settled than season 1.
- **Bram** — the measured Rotterdam professional; the natural anchor for
  **formal/workplace** register. Helps You draft a formal email on day 104, and is in
  the week-18 werkoverleg (day 125). Still proud of Rotterdam, still no-nonsense.
- **Youssef** *(new — season 2 only)* — Emma's new project manager / colleague in
  Amsterdam. Late 30s, calm, professional, a clean **neutral-to-formal workplace voice**
  and the interviewer/meeting figure for the professional-Dutch weeks. Added to the
  manifest `cast` so he's a legal dialogue speaker; use him for werkoverleg /
  sollicitatiegesprek scenes (day 125). Not chatty, not a gossip — the register foil.

### Arc anchors (keep exact)

- **Immersion / review days (season-2 story every time):** **90** (season-2 opener,
  Emma), **97** (Daan's hypotheticals), **104** (Bram + a formal email), **111**
  (**the pivot — Sanne's news**), **118** (Daan & Emma irony banter), **125**
  (werkoverleg with Youssef, Emma & Bram).
- **The season-2 life event: day 111** — mirrors Sanne's day-69 move. One major event,
  landing on the week-16 review day, re-told through the week's grammar.
- **Finale: day 126** — definitive C1-gateway self-intro capstone, mirroring day 84:
  full recap, register-agile intro, a letter *forward* to the C1 learner, honest "this
  is the leap, not the certificate" framing, Dutch farewells, stats banner.

### Continuity rules (season 2)

1. **Sanne lives in Utrecht throughout season 2.** She visits Amsterdam; she does not
   move back. Never contradict this.
2. **Sanne's pregnancy is not public before day 111.** Days 85–110 must not reference
   it. From day 111 on it's known to the group.
3. **Emma's career step is "in progress" across the season** and need not resolve;
   treat it as ongoing context, not a fixed outcome, so any week can touch it.
4. **Youssef only exists from week 15 on** (workplace context). Don't place him in
   earlier scenes; he never appears in season 1.

## The growing self-intro — "mijn verhaal", season 2 (weeks 13–18)

Same rule as season 1: each capstone appends **exactly one** new cumulative layer
(all earlier layers still expected). Season-2 layers:

| Wk | Capstone day | New "mijn verhaal" layer (cumulative) |
|----|------|------|
| 13 | 91  | + a **nuanced opinion with connectors** — your view *with reservations* (*hoewel…, enerzijds…anderzijds, daarentegen, bovendien*) |
| 14 | 98  | + a **hypothetical / regret** about your Dutch journey (*als ik dit eerder had geweten, zou ik…*; *ik had beter … kunnen doen*) |
| 15 | 105 | + a **professional self-presentation** in formal register (nominalized: *"met ervaring in…", "verantwoordelijk voor…", "ik ben van mening dat…"*) |
| 16 | 112 | + **layered-tense storytelling** — one anecdote that moves across tenses and includes a reported line (Sanne's news as the model) |
| 17 | 119 | + **irony & register-switching** — the same point said formally vs playfully, with layered particles |
| 18 | 126 | **Mijn verhaal, C1-gateway** — the whole thing, register-agile, opinionated, idiomatic; a letter *forward* to the C1 you; honest "the leap, not the certificate" framing |
