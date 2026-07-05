# LanguageBuddy — Multilingual Expansion Roadmap

Umbrella roadmap for growing the single-pack DutchBuddy repo into a four-app
portfolio on one shared engine. Per-language curriculum roadmaps live beside
this file:

| Pack | App | Identity | Roadmap | Status |
|------|-----|----------|---------|--------|
| `dutch-nl` | DutchBuddy | Netherlands Dutch, not Flemish | `docs/plan.md` §3 | **Complete** — 84/84 days |
| `german-de` | GermanBuddy | Germany Hochdeutsch, not Austrian/Swiss | `docs/roadmap-german-de.md` | Scaffolded — manifest + bible + W1 |
| `italian-it` | ItalianBuddy | Standard Italian, dialect-aware | `docs/roadmap-italian-it.md` | Scaffolded — manifest + bible + W1 |
| `spanish-es` | SpanishBuddy* | Peninsular Castilian, not LatAm | `docs/roadmap-spanish-es.md` | Scaffolded — manifest + bible + W1 |

\* Name clash with the reference app spanishbuddy.app cited in `docs/plan.md` —
naming/domain decision is an open item (see §6).

---

## 1. What stays fixed (the contract)

Per `docs/plan.md` §5, these are **never regenerated per language**:

- Engine, schemas (v1), validator, block taxonomy (11 types)
- Weekly rhythm: W1–2 = 6 teaching days + capstone; W3–12 = 5 teaching + 1
  review/immersion + 1 capstone; 84 days, A1→B1
- Story mechanics: 4-character cast, mid-arc life event at ~day 69, the
  growing self-intro capstone thread, register traffic-light, day-74
  language-specific meta-module slot
- Trust touches: free/no-signup, localStorage-only disclosure, donation footer

Each pack parameterizes: dialect identity + contrast, a 2–4-item **grammar
spine** that drives sequencing, cultural scene anchors, cast + arc, slang
tiers, the meta-module, and locale/TTS config.

### Grammar spines at a glance

| Language | Spine (sequencing anchors) | B1 gate | Day-74 meta-module |
|----------|---------------------------|---------|--------------------|
| Dutch | V2 · perfect-as-past · verb-final subclauses · *er* | subclauses | Blijf in het Nederlands (switch-to-English problem) |
| German | Case system (nom→acc→dat) · V2 + verb-final · separable verbs + Perfekt · adjective endings | cases + subclauses | see `roadmap-german-de.md` |
| Italian | Conjugation system + subject-drop · passato prossimo (essere/avere) vs imperfetto · agreement · clitics | congiuntivo intro | see `roadmap-italian-it.md` |
| Spanish (ES) | ser/estar · past triad (perfecto compuesto ES-style vs indefinido vs imperfecto) · subjunctive · object pronouns + gustar | subjunctive | see `roadmap-spanish-es.md` |

Deliberate contrast points that make each app feel native, not templated:
German gets cases early and often (Dutch has none); Italian and Spanish get
conjugation-first sequencing (Dutch/German get word-order-first); Spanish-ES
teaches **vosotros** natively and uses *he comido* as the everyday recent past
(both are the peninsular identity markers, exactly as *not Flemish* is Dutch's).

---

## 2. Engine workstream (shared, one-time)

Ordered by leverage; items 1–3 are pre-launch blockers for any second pack:

1. **Per-pack branding at build time** — `index.html` title/meta/OG/favicon
   must come from the manifest (or a small vite plugin reading
   `VITE_PACK`). Today it is DutchBuddy-branded for every build.
2. **Build scripts per pack** — `build:german-de` etc. (`VITE_PACK=german-de
   vite build --outDir dist/german-de`), plus per-pack `validate` scripts
   (done in `package.json` alongside this roadmap).
3. **TTS voice audit per locale** — Web Speech API quality varies widely for
   `de-DE` / `it-IT` / `es-ES` across browsers. Verify `audio.js` falls back
   gracefully when no locale voice exists; keep the v2 pre-generated-TTS
   swap on the roadmap (schema already supports it).
4. **Grading config per pack** — diacritic tolerance is right for Dutch;
   Spanish (ñ, á…), German (ü, ß — accept `ss` for `ß`), Italian (à, è, é)
   need per-pack normalization flags in the manifest rather than engine
   constants.
5. **Field-name debt (accepted, documented)** — the lesson schema's
   target-language field is literally named `nl` for every pack. Renaming to
   `target`/`t` is a schemaVersion-2 change; not worth blocking expansion.
   Every new pack's style guide documents the convention.
6. **CI matrix** — run `validate.js` over every pack dir on every PR
   (strict for released packs, lenient for in-development packs).

## 3. Content pipeline per new pack

Identical for all three new languages (the process proven on Dutch):

1. **Roadmap locked** (done) → 2. **Manifest + character bible + style
   guide** (done) → 3. **Week 1 batch** (done/in progress) → 4. weekly
   batches W2–W12, `validate` gating every batch → 5. native-speaker review
   of dialogues → 6. brand/design pass (per-pack accent theming from the
   manifest) → 7. domain + Vercel project → launch.

Batch order across packs: finish one language to W4 (a shippable A1) before
starting the next language's W2, rather than advancing all three in
lock-step — a complete A1 app per language beats three quarter-finished
packs. Suggested order: **German → Spanish-ES → Italian** (German shares the
most structure with Dutch and is the fastest to QA; Spanish has the largest
audience; Italian closes).

## 4. Launch sequencing (suggested)

- **Phase 1 (now):** all three packs scaffolded (roadmap, manifest, bible,
  style guide, W1) — dashboard renders every pack with "Coming soon" days.
- **Phase 2:** engine items 1–3 above; German W2–W4 → GermanBuddy A1 beta.
- **Phase 3:** Spanish-ES W2–W4 beta (resolve naming first); Italian W2–W4.
- **Phase 4:** B-level content (W5–W12) per language in the same order;
  native review per language before each public launch.
- **Phase 5:** extract the pack-generation skill (`docs/plan.md` §5) — after
  three runs, the questionnaire and templates are proven, not theoretical.

## 5. QA gates per pack

- `npm run validate:<pack>` clean (strict before release)
- Grammar-spine spot checks by a native speaker (dialogues minimum)
- Story-arc continuity: life event lands day 69; self-intro layers cumulative
- Register check: no Flemish/Austrian-Swiss/LatAm forms leaking into
  NL/DE/ES packs respectively; slang tiers carry caution notes
- Audio pass on real devices for the pack locale

## 6. Open items

- **Spanish naming**: "SpanishBuddy" collides with spanishbuddy.app (the
  structural reference app). Decide app name + domain before Phase 3.
- Native-speaker reviewers needed: German, Italian, Peninsular Spanish.
- Donation link, domains, OG cards per pack (per-pack branding item 1).
- Decide single-domain multi-pack switcher vs four separate branded apps
  (current architecture assumes four builds; a switcher is a later option
  since progress is already keyed by packId).
