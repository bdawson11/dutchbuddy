# LanguageBuddy new-language pack skill

Package the DutchBuddy build into a repeatable pipeline that produces a validated,
drop-in content pack for any target language — against the **unchanged** engine,
schemas, and validator. This directory is templates + prompts only; it contains no
engine or validator code (it reuses `../tools/validate.js`).

Spec: `../docs/plan.md` §5. Fixed engine/schema/validator/rhythm: §1–4. Worked
reference pack: `../public/packs/dutch-nl/`.

## Files

| File | What it is |
|------|-----------|
| `SKILL.md` | Entry point. The 8-point questionnaire, what's FIXED vs parameterized, the three engine couplings a new language must honor, and the end-to-end workflow. **Start here.** |
| `templates/manifest.template.json` | `manifest.json` with `{{PLACEHOLDERS}}` for every language-specific field (packId, dialect, hero, levels, cast, weeks, footer). |
| `templates/style-guide.template.md` | Generalized authoring contract: voice, en↔target formatting, per-kind block-count targets, the per-block schema+traps reference, the "one new thing" rule, difficulty ramp. |
| `templates/characters.template.md` | Generalized cast bible: 4 characters, the ~day-69 mid-arc life event, the growing self-intro layering table (and the `verhaal` engine-token placement). |
| `templates/curriculum.template.md` | The 12-week / 84-day fill-in: fixed weekly rhythm + anchor beats, with slots the grammar spine drives. |
| `prompts/batch-generation.md` | Per-week lesson-batch prompt: inputs, block-count + one-new-thing + ramp rules, and the mandatory `validate.js` self-check to zero errors. |
| `prompts/review-rubric.md` | Post-generation correctness red-team: grammar spine, register, no-anglicisms, MCQ/answer correctness, arc consistency. |

## How to run it (human or agent), for a new language

1. **Read `SKILL.md`.** Answer its **8-point questionnaire** (dialect, grammar spine,
   84-day curriculum, cultural scene anchors, cast + ~day-69 arc, register/slang,
   meta-module, locale/audio) + choose an app name / `packId`.
2. **Curriculum** — fill `templates/curriculum.template.md` →
   `public/packs/<pack-id>/curriculum.md`. Sequence from the grammar spine.
3. **Manifest** — fill `templates/manifest.template.json` →
   `public/packs/<pack-id>/manifest.json`.
4. **Cast + style guide** — fill the two other templates into the pack folder
   (authoring-time; not shipped).
5. **Lesson batches** — run `prompts/batch-generation.md` once per week (12×),
   writing `public/packs/<pack-id>/lessons/day-NN.json`.
6. **Validate every batch:** `node tools/validate.js public/packs/<pack-id>` → zero
   errors (add `--strict` once all 84 exist).
7. **Correctness pass** — run `prompts/review-rubric.md` per batch.
8. **Ship** — `public/packs/<pack-id>/` drops in as a new pack. The `.md` files stay
   for authoring; only `manifest.json` + `lessons/` are served.

## The three engine couplings (don't fight them — see SKILL.md)

1. Target-language text always goes in the JSON key **`nl`** (historical name, now a
   fixed engine key) — even for non-Dutch packs.
2. Every `capstone` must contain the literal token **`verhaal`** (the validator's
   self-intro invariant) — carry it in the self-intro block title.
3. The validator's arc-leak check hard-codes the Dutch cast (`Sanne`/`Utrecht`) and
   is inert for your names — `review-rubric.md` §5 re-checks your cast instead.

## Design principles

- **Never regenerated:** engine, schemas, `validate.js`, weekly rhythm, block
  taxonomy, dashboard/stats, trust touches.
- **Parameterized:** the 8 questionnaire answers, and only those.
- **Ponytail:** templates and prose, no engine/validator code duplicated, no new
  block types, no schema changes. A new language is data, checked by the tool that
  already exists.
