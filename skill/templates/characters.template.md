# {{APP_NAME}} — Character Bible (template)

*Authoring-time only. Not shipped. Consulted by every lesson-generation pass so
recurring-cast voices and the story arc stay coherent across 84 days written in
parallel batches. If a dialogue names a character, that character must be in the
manifest `cast` list (the validator enforces this) and must behave as written here.*

> **How to use:** fill every `{{PLACEHOLDER}}`. Keep the four **roles** (narrator /
> convo partner / the-one-who-moves / routine voice), the **~day-69 mid-arc life
> event**, and the **self-intro layering table structure** — only the content is
> parameterized. Names here must exactly match the manifest `cast`.

---

## The four

### {{CHAR1_NAME}} — main narrator
- **Who:** {{age, job, where from, where lives}}.
- **Voice:** {{warm/quick/ironic? the one who explains the place to you}}. Uses the
  identity markers naturally. Optimistic but not naïve.
- **Role in the arc:** your primary guide. Narrates immersion days early (their
  neighborhood, their weekend). Present at the beginning and the end. The steady
  thread.
- **Speech markers:** {{a signature opener, a warm sign-off}}.

### {{CHAR2_NAME}} — conversation partner / gossip
- **Who:** {{age, job, relationship to the narrator}}.
- **Voice:** dry, funny, opinionated; says the blunt thing then softens it. Heavy
  user of {{particles/fillers}}.
- **Role in the arc:** your partner on the "what did you do?" / "the news" days —
  storytelling and opinions. In W8 debates {{a spicy local question, e.g. "must
  expats learn the language?"}}.
- **Speech markers:** {{catchphrases}}.

### {{CHAR3_NAME}} — the friend whose life moves (THE SPINE)
- **Who:** {{age, job}}. Starts in {{HOME_CITY}} (shares the friend group). **Their
  life is the season-long story.**
- **Voice:** thoughtful, a bit anxious, earnest — talks about feelings more than the
  others (good vehicle for the emotions/advice module). Warms up over the year.
- **Role in the arc — keep these day anchors exact:**
  - **W6 / ~day 41:** a rough week (health-module immersion) — {{small crisis}}.
  - **W9 / ~day 62:** the news lands — **{{the life change, e.g. a job offer in
    {{DEST_CITY}}}}**. Told via reported speech. (reported-speech immersion)
  - **W10 / day 69:** **they take it and move {{HOME_CITY}} → {{DEST_CITY}}.**
    Moving-day conversation. **THE mid-arc life event.** Every pack's arc pivots
    ~day 69; this is {{LANGUAGE_NAME}}'s.
  - **W11 / ~day 76:** {{CHAR1_NAME}} visits {{CHAR3_NAME}} in {{DEST_CITY}} —
    catch-up. They're settling in, happier.
  - **W12 / day 83:** back in {{HOME_CITY}} for a get-together with everyone, one
    year on.
- **Continuity rule:** before day 62 {{CHAR3_NAME}} lives in {{HOME_CITY}} and knows
  nothing of {{DEST_CITY}}. Between 62 and 69 it's a decision in progress. From day
  69 on they live in {{DEST_CITY}}. Never break this ordering. *(The Dutch validator
  hard-codes the old cast's version of this check and won't police your names — your
  review-rubric pass enforces it for {{CHAR3_NAME}}/{{DEST_CITY}}.)*

### {{CHAR4_NAME}} — routine & immersion voice
- **Who:** {{older, settled, from a city that isn't the capital}}.
- **Voice:** measured, precise, proud of {{THEIR_CITY}} (contrasts it with the
  capital). Good vehicle for routine/habit language and, later, childhood memories.
- **Role in the arc:** W4 immersion (daily routine + a favorite local spot), W7
  immersion (childhood — the past-description tense). The "real life outside the
  capital" voice.
- **Speech markers:** {{plain, regional pride jab}}.

### You (the learner)
- Speaker id **`You`** — always allowed by the validator, never needs to be in the
  cast list.
- An adult who has recently moved to (or is about to move to) {{the target place}}.
  Motivated, a bit self-conscious about switching to English. The meta-module
  (Q7, ~day 74) speaks directly to this person's core struggle.

---

## The growing self-intro (FIXED thread — engine keyword `verhaal`)

Every capstone ends with the learner producing/extending a personal self-intro that
gains exactly **one new grammar layer per week**. This is the app's signature thread.

**Engine constraint:** `tools/validate.js` proves each capstone carries this thread
by grepping for the literal token **`verhaal`** (`/verhaal/i`). It is a fixed engine
keyword for *all* packs. So each capstone's self-intro block **must contain
`verhaal`.** Recommended placement — the self-intro `builder`/`journal` block
`title`:

```
"title": "Mijn verhaal → {{TARGET_SELF_INTRO_LABEL}}"
```

(e.g. `"Mijn verhaal → minha história"`.) The learner reads the target-language
label; `verhaal` rides along as the fixed thread tag. Do this on **every** capstone
(days 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84).

The layer added each week is driven by the **grammar spine + curriculum**. Fill this
table so it climbs your sequence (earlier layers still expected each week):

| Wk | Capstone day | New self-intro layer (cumulative) |
|----|------|------|
| 1  | 7  | {{name, where you're from, that you're learning — present, "to be"/"to have"}} |
| 2  | 14 | + {{your daily routine — present tense, core word order, a time expression}} |
| 3  | 21 | + {{your family and your neighborhood — possessives, adjective agreement}} |
| 4  | 28 | + {{what you like to eat/drink and a modal wish}} |
| 5  | 35 | + {{something you DID recently — the everyday past tense}} |
| 6  | 42 | + {{how you've been feeling / a small health event}} |
| 7  | 49 | + {{a childhood memory — the past-description tense}} |
| 8  | 56 | + {{a plan and an opinion + a subordinate clause}} |
| 9  | 63 | + {{something someone told you — reported speech}} |
| 10 | 70 | + {{a big decision, using the feared module + a subclause — {{CHAR3_NAME}}'s move as the model}} |
| 11 | 77 | + {{register control: the same intro said formally vs casually}} |
| 12 | 84 | **The definitive self-intro** — the whole thing, one tense-move per slot, plus a letter to your past self and target-language farewells |

Capstones reference this table via a `builder` or `journal` block whose `title`
carries the `verhaal` tag (above) and whose content layers in that week's move.
