# GermanBuddy — Character Bible

*Authoring-time only. Not shipped. Consulted by every lesson-generation pass so
recurring-cast voices and the story arc stay coherent across 84 days written in
parallel batches. If a dialogue names a character, that character must be in the
manifest `cast` list (the validator enforces this) and must behave as written here.*

---

## The four

### Lena — main narrator
- **Who:** 31, designer at a mid-size Berlin studio. Born in Hannover (hence her clean, northern-neutral Hochdeutsch), moved to Berlin for work at 25. Lives in a WG in Neukölln.
- **Voice:** warm, quick, a little ironic. The one who explains the city — and the grammar — to you. Uses *doch, mal, na ja, alles klar* naturally. Optimistic but not naïve; loves a good *Feierabendbier*.
- **Role in the arc:** your primary guide. Narrates immersion days early (her Kiez, her weekend trip). Present at the beginning and the end. She is the steady thread; she's the one who visits Aylin in Munich in W11.
- **Speech markers:** starts explanations with *"Also,…"* or *"Guck mal,…"*. Warm sign-offs: *"Tschüss!"*, *"Bis bald!"*. An occasional light Berlin *"Na?"* as a greeting.

### Jonas — Kneipe friend, your gossip & debate partner
- **Who:** 29, works in a bookshop, aspiring musician. Lena's oldest friend. The person you sit across from at the Kneipe or café.
- **Voice:** dry, funny, opinionated, loves a bit of gossip and a debate. The one who says the blunt thing, then softens it with a particle. Heavy user of *echt, na ja, halt, ey, Quatsch*.
- **Role in the arc:** your conversation partner on "Was hast du gemacht?" / "die Neuigkeiten" days. He's who you practice storytelling and opinions with. In W8 he debates whether expats must learn German (he says yes, provocatively, then admits it's hard).
- **Speech markers:** *"Echt jetzt?"*, *"Ey, …"*, *"Na ja, …"*, *"Quatsch!"*, ends teasing lines with *"…, oder?"* or *"…, ne?"*.

### Aylin — the friend whose life moves
- **Who:** 27, UX designer, German-born with Turkish grandparents. Starts in Berlin (shares the friend group). **Her life is the season-long story.**
- **Voice:** thoughtful, a bit anxious, earnest. Talks about feelings more than the others (good vehicle for the emotions/advice module). Warms up and steadies over the year.
- **Role in the arc — THE SPINE (keep these day anchors exact):**
  - **W6 / ~day 41:** rough week — bike stolen (*Fahrrad geklaut*), gets sick, goes to the Hausarzt. (health-module immersion)
  - **W9 / ~day 62:** news lands — a **job offer in Munich (München)**. Told via reported speech (*"sie hat gesagt, dass…"*). This is the reported-speech immersion.
  - **W10 / day 69:** **she takes the job and moves Berlin → Munich.** Moving-day (*Umzug*) conversation. THE mid-arc life event. Every language pack's arc pivots ~day 69; this is German's.
  - **W11 / ~day 76:** Lena visits Aylin in **Munich** — Saturday catch-up. Aylin is settling in, happier (light Bavarian-flavor cameo — *Servus, Grüß Gott* — that we enjoy as color while reinforcing our Hochdeutsch norm).
  - **W12 / day 83:** back in Berlin for a Kneipe evening with everyone, one year on.
- **Continuity rule:** before day 62 Aylin lives in Berlin and knows nothing of Munich. Between 62 and 69 it's a decision in progress. From day 69 on she lives in Munich. Never break this ordering.

### Klaus — routine & immersion voice
- **Who:** 38, architect in Cologne (Köln). Lena knows him through work. Steadier, older, family man (partner + young kid).
- **Voice:** measured, precise, proud of Cologne and the Rhineland (contrasts it with Berlin — the Karneval, the *Kölsch*, the easygoing *"et hätt noch immer jot jejange"* attitude). Good vehicle for routine/habit language and, later, childhood memories.
- **Role in the arc:** W4 immersion (his daily routine + favorite Bäckerei/Imbiss), W7 immersion (his Cologne childhood — Präteritum). Represents the "real life outside the Berlin bubble" voice.
- **Speech markers:** plain, no-nonsense, an occasional Rhineland pride jab at Berlin (*"In Köln machen wir das so…"*). Warm but grounded.

### You (the learner)
- Speaker id **`You`** — always allowed by the validator, never needs to be in the cast list.
- An adult who has recently moved to (or is about to move to) Germany. Motivated, a bit self-conscious about cases and about people switching to English on them. Lives in Berlin by default. The day-74 meta-module (*Fälle in Echtzeit* — cases in real time) speaks directly to this person's core struggle.

---

## The growing self-intro — *Meine Geschichte*

Every capstone ends with the learner producing/extending a personal self-introduction that gains exactly one new grammar layer per week. This is the app's signature thread. Capstone authors MUST append the correct cumulative layer:

| Wk | Capstone day | New *Meine Geschichte* layer (cumulative — earlier layers still expected) |
|----|------|------|
| 1  | 7  | name, where you're from, that you're learning German (present, *sein/haben*) |
| 2  | 14 | + your daily routine (present, V2, a time expression) |
| 3  | 21 | + your family and your Kiez (possessives + accusative; predicate adjectives) |
| 4  | 28 | + what you like to eat/drink and a modal wish (*ich möchte…, ich mag…*) |
| 5  | 35 | + something you **did** recently (Perfekt) |
| 6  | 42 | + how you've been feeling / a small health event (*mir ging es…, ich hatte…* — dative) |
| 7  | 49 | + a childhood memory (Präteritum: *als ich klein war…*) |
| 8  | 56 | + a plan and an opinion (*ich werde…/ich will…, ich finde, dass…* + a subclause) |
| 9  | 63 | + something someone told you (reported speech: *… hat gesagt, dass…*) |
| 10 | 70 | + a big decision, with the dative and a subclause (Aylin's move as the model) |
| 11 | 77 | + register control: the same intro said politely (*Sie*) vs casually (*du*), now with adjective endings |
| 12 | 84 | **Meine Geschichte, endgültig** — the whole thing, one tense-move per slot, plus a letter to your past self and German farewells |

Capstones reference this table by using a `builder` or `journal` block titled around "Meine Geschichte" that layers in that week's move.
