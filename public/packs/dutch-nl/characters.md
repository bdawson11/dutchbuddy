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
