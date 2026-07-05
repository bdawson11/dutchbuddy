# Prompt — QA / grammar red-team rubric

Run after a batch passes `validate.js`. The validator proves **shape** (fields,
counts, cast membership, self-intro token). This pass proves **truth** —
grammatical correctness, register, cultural fit, arc consistency. Run it per batch
(or over the whole pack before launch). Read adversarially: assume something is
wrong and hunt for it.

> Native-speaker review of at least the `dialogue` blocks remains an open dependency
> before any public launch. This rubric is the pre-native machine/authoring gate,
> not a substitute for it.

---

## 1. Grammar spine — the structural hard parts (Q2)

For each spine element in the style guide §6, spot-check every lesson that touches
it:
- **{{SPINE_1}}** — is it modeled correctly *everywhere*, including inside dialogues
  and sample sentences, not just the teaching card? *(Dutch: is the verb genuinely
  in position 2 in main clauses and at the end in every subclause?)*
- **{{SPINE_2}}** — formation right (endings, auxiliaries, irregulars)? Any
  over-regularized forms?
- **{{SPINE_3}}** (the A2→B1 gate) — correct at every occurrence from its
  introduction on?
- **{{SPINE_4}}** / the feared module — the dense one; check the hardest examples by
  hand.
- **Agreement / gender / articles / tone** — whatever this language marks, is it
  consistent? Prefer common, checkable words over rare ones authors might guess.

## 2. Register & voice

- Formal vs casual ({{FORMAL_PRONOUN}} / {{CASUAL_PRONOUN}} / honorifics) used
  appropriately for each scene and character?
- Dialect identity held: only {{DIALECT_IDENTITY}} forms, never
  {{WHAT_IT_IS_NOT}} forms sneaking in.
- Each recurring character sounds like their `characters.md` voice (markers,
  register, personality).

## 3. No anglicisms / naturalness

- Is the target language real and idiomatic, or English-shaped (calques, word order
  borrowed from English, "translated" idioms that no native says)?
- Where the language natively borrows English, is it the form a native actually
  uses — not an invented one?
- Glosses tight; nothing patronizing or academic.

## 4. Answer & MCQ correctness (highest-yield bug class)

- **Every `mcq`/`comprehension`:** is `correct` (0-based) actually the right option?
  Re-read all distractors — is there a *second* defensible answer? (If so, fix the
  distractor.)
- **Every `typed`/`dictation`:** does `answers[]` list *all* reasonable spellings
  (contractions, with/without article, spacing, accent variants), with the correctly
  accented form first? Would a correct learner answer get wrongly rejected?
- **`builder`:** does `sample` parse from the provided `slots`/`chips`? Is it
  actually grammatical?
- **`explain` text:** does it teach the *why*, and is the explanation itself
  correct?

## 5. Story-arc consistency (replaces the Dutch-only validator check)

The validator's arc check hard-codes the old Dutch cast and won't police your names.
Enforce it here for your cast:
- **{{CHAR3_NAME}}** (the mover): before **day 62** they live in {{HOME_CITY}} and
  know nothing of {{DEST_CITY}}; day 62 the news; **day 69 the move**; after, they
  live in {{DEST_CITY}}. No leak of {{DEST_CITY}} before day 62; no reference to the
  old home as current after day 69.
- Other anchor beats land where `characters.md` says (rough week ~41, catch-up ~76,
  reunion ~83).
- Any `dialogue` speaker is in the manifest `cast` (validator caught this, but
  confirm the *characterization* fits — right person, right scene).

## 6. Self-intro thread integrity

- Every capstone's self-intro block carries this week's **cumulative** layer from
  the `characters.md` table (earlier layers still present), and the `verhaal` token
  is in its title.
- The layer's grammar matches what's been taught by that week (don't ask for a tense
  not yet introduced).

## 7. Learner experience

- Could a real beginner do each day on a phone in 15–25 minutes?
- Difficulty ramps within the lesson and across the 84 days (no B1-level sentence in
  a week-1 chip).
- It's actually *fun* — a buddy, not a textbook.

---

**Output of this pass:** a per-day list of concrete fixes (file, block index, what's
wrong, the correction). Apply fixes, re-run `node tools/validate.js
public/packs/{{PACK_ID}}` to confirm nothing broke shape, then the batch is
merge-ready (native-speaker dialogue review still pending for launch).
