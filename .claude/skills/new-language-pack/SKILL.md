---
name: new-language-pack
description: Bootstrap and author a new YapWorld language content pack (e.g. "add French", "add Swahili"). Use when adding a new language content pack to YapWorld — scaffolding the pack files, answering the design questionnaire, filling in the manifest/character bible/style guide, and authoring weekly lesson batches against the validator. Not for editing an existing pack's engine code or fixing the block-rendering engine itself — packs are pure data, the engine is fixed.
---

# New language pack

YapWorld adds a language as **content work only** — the engine
(`src/engine/`), schemas, validator, and block taxonomy never change for a
new pack. This skill is the repeatable process: scaffold → questionnaire →
fill identity → author weekly batches, each gated on the validator.

Background reading (don't duplicate it, reference it): `docs/plan.md` §2
(schemas), §4 (content generation & QA process), §5 (the original design of
this workflow); `docs/roadmap-expansion.md` §1 (which language, and why) and
§2 (the pack-factory tooling this skill sits on top of); one existing pack's
`docs/roadmap-<pack>.md` (e.g. `docs/roadmap-german-de.md`) as the fully
worked curriculum example.

**Schema note:** everything produced by this skill is **schema v2** — the
target-language field is named `target` (never `nl`) in every `chips` item
and `dialogue`/`shadow` line. `tools/new-pack.js` scaffolds v2 by
construction; never introduce an `nl` field into new content.

## What's fixed vs what's parameterized

**Fixed by the skill (never regenerated):** the engine (player, dashboard,
progress layer, audio), the manifest/lesson schemas, `tools/validate.js` and
`tools/validate-all.js`, the weekly rhythm, the 11-block-type taxonomy, the
dashboard/stat mechanics, the trust touches (free/no-signup, local-only
storage disclosure, donation footer).

**Parameterized per language (the questionnaire below):** dialect identity,
grammar spine, curriculum outline, cultural scene anchors, cast + arc,
register/slang system, the day-74 meta-module, locale/audio config.

## Step 1 — the questionnaire

Answer every item before scaffolding (or immediately after, before writing
any lesson content). Keep answers concrete — one specific variant, not a
family of dialects.

1. **Dialect identity + contrast** — which one variant, contrasted against
   what it explicitly is NOT (e.g. "Germany Standard German, Hochdeutsch,
   northern-neutral — not Austrian, not Swiss"; "Brazilian Portuguese — not
   European"). The house style is always **one specific dialect identity**,
   never a blend.
2. **Grammar spine (2–4 items)** — the structural hard parts that anchor
   sequencing, each with the week it opens and the week it's mastered.
   Design this from the language's own grammar, not by translating another
   pack's spine (see `docs/roadmap-german-de.md` §2 for why: German's spine
   is rebuilt around the case system even though it shares V2 word order and
   perfect-as-past with Dutch).
3. **Cultural scene anchors (6–8)** — the recurring settings that drive
   vocab modules (German: die Bäckerei, WG-Leben, Pfand & Supermarkt...).
4. **Cast concept + mid-arc life event** — 4 original characters + "You".
   One character's life is the season-long story, with a life event landing
   **~day 69** (season 1) — a move, a job change, something with real
   narrative weight. If the pack runs a season 2 (weeks 13–18), a second life
   event lands **~day 111**, mirroring day 69, usually with two new
   supporting characters (one professional-register anchor, one
   exposure-only regional-color cameo — see German's Mareike/Vroni).
5. **Register/slang tiers** — 🟢 green (use freely) / 🟡 yellow (casual, mind
   the room) / 🔴 red (flagged, explained, use-with-care — never drilled for
   production), with language-appropriate examples and caution notes.
6. **Day-74 meta-module** — one language-specific challenge module (Dutch:
   "blijf in het Nederlands" — staying in the target language; German:
   "Fälle in Echtzeit" — cases under time pressure). Ask: what does *this*
   language's learner specifically freeze on?
7. **Locale/TTS config** — the BCP-47 locale (`fr-FR`, `pt-BR`...) for
   `manifest.locale`; sanity-check Web Speech API voice availability for it.
8. **Grading / diacritic needs** — does `grading.diacriticTolerant: true`
   suffice, or does the language need an engine-level grading tweak (e.g.
   elision/apostrophe tolerance for French, locale-aware lowercasing for
   Turkish's dotless ı)? Tweaks like this are the one case where this skill
   *does* touch engine code — flag it explicitly and keep the change scoped
   to the grading normalizer.

## Step 2 — bootstrap

Run the scaffolder — it refuses cleanly (no partial writes) if the pack
already exists or the pack-id is already in the catalog:

```
npm run new-pack <pack-id> "<Language>" <locale> <flag-emoji> <accent-hex>
# e.g.
npm run new-pack french-fr "French" fr-FR 🇫🇷 "#2563eb"
```

This creates `public/packs/<pack-id>/{manifest.json,style-guide.md,
characters.md,lessons/}`, `docs/roadmap-<pack-id>.md`, appends the pack to
`public/packs/catalog.json` (it now appears in the language picker, all days
"coming soon"), and adds a `validate:<pack-id>` script to `package.json`.
Everything is a TODO-marked skeleton — the manifest already validates
(`node tools/validate.js public/packs/<pack-id>` — missing-day warnings
only, zero errors) but has no real content yet.

Then, using the questionnaire answers, fill in order:

1. **`docs/roadmap-<pack-id>.md`** — dialect identity, grammar spine,
   weekly themes (all 18 weeks, even if only weeks 1–4 get authored this
   session), cultural anchors, cast/arc summary, register tiers, day-74
   meta-module, locale config. This is the locked scope input for every
   later authoring batch.
2. **`public/packs/<pack-id>/manifest.json`** — `dialect`, `hero`, level
   `blurb`s, week `title`s (mirror the roadmap doc), `cast[]` (name + role,
   one line each). Do not set `released: true` until the pack is actually
   shippable (weeks 1–12 minimum) — validation stays lenient on missing
   days until then.
3. **`public/packs/<pack-id>/characters.md`** — the 4-character bios, the
   life-event day anchors (69, and 111 for season 2), the growing self-intro
   layer table (one new grammar layer per capstone, cumulative).
4. **`public/packs/<pack-id>/style-guide.md`** — §6 grammar accuracy rules
   (one paragraph per grammar-spine item) and §7 difficulty ramp. The rest
   of the style guide (schema conventions, block-count targets, the `target`
   field convention) is already filled in by the scaffolder — it's fixed,
   don't rewrite it.

## Step 3 — weekly-batch authoring (per `docs/plan.md` §4)

Content is authored in **weekly batches** (7 lessons per pass) against three
fixed inputs: the roadmap doc's scope for that week, the style guide, and
the character bible. Pipeline per batch: generate → `npm run
validate:<pack-id>` (machine gate) → spot-check (grammar accuracy, register,
no anglicisms) → move to the next week. **Never skip the validate gate** —
it's what lets weekly batches be written independently without drift.

**Weekly rhythm (fixed):**
- Weeks 1–2: 6 teaching days + 1 capstone.
- Weeks 3–12: 5 teaching days + 1 review/immersion day + 1 capstone.
- Weeks 13–18 (season 2, optional): same rhythm, B2 → C1-gateway depth.
- Block-count targets: `lesson` 8–12 blocks, `review` 6–8, `capstone` 10–14
  (the validator warns outside these).

**The 11 block types** (one engine component each — purpose, one line):

| type | purpose |
|---|---|
| `card` | Teach a rule, table, or culture note (markdown body). |
| `chips` | Tappable vocab/phrase pairs with audio. |
| `contrast` | Side-by-side pairs to teach a distinction (e.g. two verb forms). |
| `mcq` | Multiple choice — recognition-level check. |
| `typed` | Typed drill with fuzzy grading — production-level check. |
| `builder` | Slot-fill sentence construction — structured production. |
| `dialogue` | Scripted scene with the recurring cast, tap-to-reveal + audio. |
| `dictation` | Listen (TTS) → type what you heard. |
| `shadow` | Listen → repeat, self-scored. |
| `comprehension` | Questions on a preceding dialogue/passage. |
| `journal` | Free-text prompt, saved locally — open production. |

A lesson's arc within these types ramps: teach → recognise → produce → use.
See an existing pack's style guide (`public/packs/german-de/style-guide.md`)
§4–5 for the exact per-type schema and gotchas — reference it, don't
re-derive it.

**Story-arc touches to hit on every batch:**
- The 4-character cast + "You"; only cast-list names or `"You"` may speak in
  a `dialogue` block (the validator enforces this).
- The mid-arc life event lands on **day 69** (and **day 111** for a season-2
  arc) — every review/immersion day around it should carry the arc forward.
- Every **capstone** appends that week's layer to the growing self-intro
  (a `builder` or `journal` block) — cumulative, never regress a layer.
- **Register traffic-light** — model 🟢/🟡/🔴 tiers honestly in dialogue and
  slang content; never drill 🔴 for production, only for recognition.
- **Day 74** is the language-specific meta-module slot — don't let it become
  a generic grammar day.

## Step 4 — validate and ship

Gate every week on `npm run validate:<pack-id>` — zero errors required,
resolve warnings (block-count, table-width) too. Run `npm run validate`
(catalog-driven, all packs) before considering a session done. Set the
manifest's `released: true` only once the pack has enough authored weeks to
be genuinely shippable — that flips validation strict (missing days become
errors), which is the pre-release gate.
