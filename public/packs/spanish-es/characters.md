# SpanishBuddy — Character Bible

*Authoring-time only. Not shipped. Consulted by every lesson-generation pass so
recurring-cast voices and the story arc stay coherent across 84 days written in
parallel batches. If a dialogue names a character, that character must be in the
manifest `cast` list (the validator enforces this) and must behave as written here.*

*All cast are **distinción** speakers (Peninsular /θ/ for c/z) and tutear by default.
Default setting: **Madrid**, with the mid-arc move to **Valencia** at day 69.*

---

## The four

### Lucía — main narrator
- **Who:** 31, comms/publishing lead at a mid-size Madrid agency. Born and raised in Madrid, lives in Lavapiés. Explains the city to you.
- **Voice:** warm, quick, a little ironic. Optimistic but not naïve. The steady thread.
- **Role in the arc:** your primary guide. Narrates immersion days early (her *barrio*, her weekend in the sierra). Present at the beginning and the end. In W11 she is the one who visits Sofía in Valencia.
- **Speech markers:** opens explanations with *"Mira,…"*; uses *vale, o sea, en plan, tía* naturally. Warm sign-offs: *"¡Nos vemos!", "¡Un beso!"*

### Rafa — bar friend, your *cotilleo* (gossip) partner
- **Who:** 29, works in a bookshop, aspiring musician. Lucía's oldest friend. The person you sit across from at the bar.
- **Voice:** dry, funny, opinionated, loves a bit of *cotilleo* and a debate. Says the blunt thing, then softens it. Heavy user of *tío, hombre, pues nada, ¿en serio?*; swears mildly (*joder, jolín*) — the vehicle for the day-79 register lesson.
- **Role in the arc:** your conversation partner on "¿qué has hecho?" / "las noticias" days. Who you practice storytelling and opinions with. In W8 he debates whether you must speak Spanish to live in Spain (says yes, provocatively, then admits it's hard).
- **Speech markers:** *"¿En serio?", "Tío, …", "Hombre, …", "Pues nada, …"*, ends teasing lines with a soft *"¿eh?"*.

### Sofía — the friend whose life moves
- **Who:** 27, UX designer. Starts in Madrid (shares the friend group). **Her life is the season-long story.**
- **Voice:** thoughtful, a bit anxious, earnest. Talks about feelings more than the others (good vehicle for the emotions/advice module). Warms up over the year.
- **Role in the arc — THE SPINE (keep these day anchors exact):**
  - **W6 / ~day 41:** rough week — bag stolen, gets sick, goes to the *médico*. (health module immersion)
  - **W9 / ~day 62:** news lands — a **job offer in Valencia**. Told via reported speech (*"me dijo que…"*). This is the reported-speech immersion.
  - **W10 / day 69:** **she takes the job and moves Madrid → Valencia.** Moving-day conversation. THE mid-arc life event. Every language pack's arc pivots ~day 69; this is Spanish's.
  - **W11 / ~day 76:** Lucía visits Sofía in **Valencia** — Saturday catch-up. Sofía is settling in, happier.
  - **W12 / day 83:** back in Madrid for a *terraza* with everyone, one year on.
- **Continuity rule:** before day 62 Sofía lives in Madrid and knows nothing of Valencia. Between 62 and 69 it's a decision in progress. From day 69 on she lives in Valencia. Never break this ordering.

### Nacho — routine & immersion voice
- **Who:** 38, architect. From a *pueblo* in Castilla-La Mancha; now lives on the edge of Madrid with his partner and a young kid. Lucía knows him through work.
- **Voice:** measured, precise, proud of *pueblo* life (contrasts it with Madrid — *"en el pueblo se vive mejor"*). Good vehicle for routine/habit language and, later, childhood memories.
- **Role in the arc:** W4 immersion (his daily routine + favorite neighborhood bar), W7 immersion (his *pueblo* childhood — imperfecto). The "real Spain outside the Madrid bubble" voice.
- **Speech markers:** plain, no-nonsense; *"hombre, …", "buah, …"*, occasional *pueblo*-pride jab at the big city.

### You (the learner)
- Speaker id **`You`** — always allowed by the validator, never needs to be in the cast list.
- An adult who has recently moved to (or is about to move to) Spain — Madrid by default. Motivated, a bit self-conscious about register and about people switching to English. The day-74 *vosotros + tuteo* meta-module speaks directly to this person's core struggle: knowing when to tutear, when *usted*, and that plural-informal is *vosotros*.

---

## The growing self-intro — "Mi historia"

Every capstone ends with the learner producing/extending a personal self-introduction that
gains exactly one new grammar layer per week. This is the app's signature thread. Capstone
authors MUST append the correct cumulative layer:

| Wk | Capstone day | New "Mi historia" layer (cumulative — earlier layers still expected) |
|----|------|------|
| 1  | 7  | name, where you're from, that you're learning Spanish (present, *ser / llamarse*) |
| 2  | 14 | + your daily routine (present tense, a time expression) |
| 3  | 21 | + your family and your *barrio* (possessives, adjective agreement, *ser* vs *estar*) |
| 4  | 28 | + what you like to eat/drink and a wish (*me gusta…, quiero…*) |
| 5  | 35 | + something you've **done** recently (pretérito perfecto compuesto) |
| 6  | 42 | + how you've been feeling / a small health event (*me he sentido…, me dolía…*) |
| 7  | 49 | + a childhood memory (imperfecto: *cuando era pequeño/a…*) |
| 8  | 56 | + a plan and an opinion (*voy a…, creo que…* + a first subjunctive after *espero que…*) |
| 9  | 63 | + something someone told you (reported speech: *… me dijo que…*) |
| 10 | 70 | + a big decision, with a relative clause / connector (Sofía's move as the model) |
| 11 | 77 | + register control: the same intro said formally (*usted*) vs casually (*tú* / to a group *vosotros*) |
| 12 | 84 | **Mi historia, definitiva** — the whole thing, one tense-move per slot, plus a letter to your past self and Spanish farewells |

Capstones reference this table by using a `builder` or `journal` block titled around "Mi historia" that layers in that week's move.
