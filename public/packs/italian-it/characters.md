# ItalianBuddy — Character Bible

*Authoring-time only. Not shipped. Consulted by every lesson-generation pass so recurring-cast
voices and the story arc stay coherent across 84 days written in parallel batches. If a dialogue
names a character, that character must be in the manifest `cast` list (the validator enforces this)
and must behave as written here.*

---

## The four

### Giulia — main narrator
- **Who:** 31, communications/design lead at a mid-size Bologna studio. Born in Parma, moved to
  Bologna for university and stayed. Lives near Via Mazzini. Loves her city's porticoes and its food.
- **Voice:** warm, quick, a little ironic — the one who explains Italy to you. Uses *allora, dai,
  guarda, magari* naturally. Optimistic without being naïve. Speaks clean standard Italian.
- **Role in the arc:** your primary guide and the steady thread. Narrates early immersion days
  (her Bologna quartiere in W3, her Cinque Terre weekend in W5). Present at the beginning and the
  end. In W11 she is the one who travels to Milano to see how Sofia is settling in.
- **Speech markers:** opens explanations with *"Allora,…"* and *"Guarda,…"*. Warm sign-offs:
  *"Ci sentiamo!"*, *"A presto!"*, *"Un bacio!"*.

### Marco — il bar friend, your gossip (*pettegolezzo*) partner
- **Who:** 29, works in a bookshop, aspiring musician. Giulia's oldest friend. The person you sit
  across from at the bar with a caffè or a spritz.
- **Voice:** dry, funny, opinionated, loves a bit of gossip and a good argument. The one who says the
  blunt thing, then softens it with a *paroletta*. Heavy user of *boh, ma dai, davvero?, insomma, eh.*
- **Role in the arc:** your conversation partner on *"cosa hai fatto?"* / *"la notizia"* days. He's who
  you practise storytelling and opinions with. In W8 he provokes the debate about whether you really
  need Italian to live in Italy (he argues yes, then admits it's hard).
- **Speech markers:** *"Ma dai!"*, *"Davvero?"*, *"Boh, non lo so…"*, tags a teasing line with *"eh"*.

### Sofia — the friend whose life moves
- **Who:** 27, UX designer. Starts in Bologna (shares the friend group). **Her life is the season-long
  story.** Gets around on a beat-up scooter.
- **Voice:** thoughtful, a bit anxious, earnest. Talks about feelings more than the others (the vehicle
  for the emotions/advice module). Warms up and grows more confident across the year.
- **Role in the arc — THE SPINE (keep these day anchors exact):**
  - **W6 / ~day 41:** rough week — scooter breaks down, she gets sick, goes to the farmacia then il
    medico. (health-module immersion)
  - **W9 / ~day 62:** the news lands — a **job offer in Milano**. Told via reported speech
    (*"mi ha detto che…"*). This is the reported-speech immersion.
  - **W10 / day 69:** **she takes the job and moves Bologna → Milano.** Moving-day conversation.
    THE mid-arc life event. Every language pack's arc pivots ~day 69; this is Italian's.
  - **W11 / ~day 76:** Giulia visits Sofia in **Milano** — Saturday catch-up. Sofia is settling in,
    happier, a little proud.
  - **W12 / day 83:** back in Bologna for an aperitivo with everyone, one year on.
- **Continuity rule:** before day 62 Sofia lives in Bologna and knows nothing of Milano. Between 62 and
  69 it's a decision in progress. From day 69 on she lives in Milano. Never break this ordering.

### Pietro — routine & immersion voice
- **Who:** 38, architect in Naples. Giulia knows him through work. Steadier, older, a family man
  (partner + young daughter). Proud of Naples and its everyday life.
- **Voice:** measured, precise, warm, with easy southern pride (he'll defend Naples' coffee, pizza, and
  pace against the north). Speaks **perfect standard Italian to the learner**, and is explicit that he'd
  switch to *napoletano* with his own family — our in-world way of teaching *dialect awareness* without
  teaching dialect. Good vehicle for routine/habit language and, later, childhood memories.
- **Role in the arc:** W4 immersion (his daily routine + favorite pizzeria/bar), W7 immersion (his
  Naples childhood — imperfetto). Represents real life beyond the northern-city bubble.
- **Speech markers:** plain and precise, a fond *"Qui a Napoli…"*, an occasional gentle jab north.

### You (the learner)
- Speaker id **`You`** — always allowed by the validator, never needs to be in the cast list.
- An adult who has recently moved to (or is about to move to) Italy. Motivated, a bit self-conscious
  about people switching to English on them, and — very Italian-specifically — a bit scared of the
  congiuntivo. Lives in Bologna by default. The *"il congiuntivo senza paura"* module (day 74) speaks
  directly to this person's core struggle.

---

## The growing self-intro — "il mio racconto"

Every capstone ends with the learner producing/extending a personal self-introduction that gains
exactly one new grammar layer per week. This is the app's signature thread. Capstone authors MUST
append the correct cumulative layer (earlier layers still expected):

| Wk | Capstone day | New "il mio racconto" layer (cumulative) |
|----|------|------|
| 1  | 7  | name, where you're from, that you're learning Italian (present; *essere/avere*, *chiamarsi*) |
| 2  | 14 | + your daily routine (present tense, a reflexive *mi sveglio*, a time expression) |
| 3  | 21 | + your family and your quartiere (possessives, adjective agreement) |
| 4  | 28 | + what you like to eat/drink and a modal wish (*mi piace…, vorrei…, mi piacerebbe…*) |
| 5  | 35 | + something you **did** recently (passato prossimo) |
| 6  | 42 | + how you've been feeling / a small health event (*mi sentivo…, avevo…, mi faceva male…*) |
| 7  | 49 | + a childhood memory (imperfetto: *da bambino/a…*) |
| 8  | 56 | + a plan and an opinion (*andrò… / ho intenzione di…* + *penso che…*) |
| 9  | 63 | + something someone told you (reported speech: *… mi ha detto che…*) |
| 10 | 70 | + a big decision, with a clitic and a subclause (Sofia's move as the model) |
| 11 | 77 | + register control: the same intro said politely (*Lei*) vs casually (*tu*), plus one congiuntivo |
| 12 | 84 | **Il mio racconto, definitivo** — the whole thing, one tense-move per slot, a letter to your past self, Italian farewells |

Capstones reference this table with a `builder` or `journal` block titled around *"il mio racconto"*
that layers in that week's move.
