# YapWorld — Season 2 Expansion Roadmap (Weeks 15–18)

Execution plan for the last open content item in `docs/roadmap-multilingual.md`
§7: **authoring weeks 15–18 (days 99–126) for all four language packs.**

Weeks 13–14 (days 85–98) of Season 2 are already shipped for every pack. The
manifests already declare all 18 weeks, so days 99–126 currently render as
"coming soon" on every dashboard. This document phases the remaining 112
lessons (28 days × 4 packs) and the release gates around them.

Authoritative per-language outlines (day-by-day topics, arc beats, cast rules):

| Pack | Season-2 outline | W15 module |
|------|------------------|------------|
| `dutch-nl` | `docs/roadmap-dutch-nl.md` §"B2 Depth" | M15 · Formeel & geschreven Nederlands |
| `german-de` | `docs/roadmap-german-de.md` §11 | M15 · Das Passiv & der Nominalstil |
| `italian-it` | `docs/roadmap-italian-it.md` §11 | M15 · Italiano formale: burocrazia e lavoro |
| `spanish-es` | `docs/roadmap-spanish-es.md` "Season 2" | M15 · Trayectorias y cambio |

---

## Phases

One week across **all four packs** per phase, so every language's dashboard
advances together and each phase lands as one reviewable, validated batch.

- **Phase 1 — Week 15 (days 99–105), all packs.** B2. The formal/professional
  register week in NL/DE/IT; trajectory-and-change (se, perífrasis, verbos de
  cambio) in ES. Italian W15 activates Elena (already in the manifest cast).
  Weekly shape: days 99–103 teaching lessons, day 104 review/immersion,
  day 105 capstone (self-intro layer).
- **Phase 2 — Week 16 (days 106–112), all packs.** B2 closes. Complex
  syntax/reported speech weeks; **day 111 is the season-2 life event** in
  Italian and Spanish (the job offer / decision to stay) — continuity-critical.
- **Phase 3 — Week 17 (days 113–119), all packs.** C1 gateway opens: nuance,
  irony, register-switching, honest street register, regional-accent
  *exposure* (Vroni/Dani/Pietro cameos per pack rules). Dutch-first /
  target-language-first instruction per each style guide's season-2 ramp.
- **Phase 4 — Week 18 (days 120–126), all packs.** Professional language,
  bureaucracy survival, and the **day-126 finale** (reunion immersion + the
  definitive self-portrait). Closes all four courses at 126/126.
- **Phase 5 — Release hardening.** `validate --strict` green for all packs in
  CI; native-speaker review passes (DE/IT/ES reviewers — still an open item);
  exclude authoring `.md` docs from `dist/`; audio pass on real devices.

## Per-phase gates (every phase, every pack)

1. `npm run validate:<pack>` — **zero errors, zero warnings** for the new days
   (block-count targets: lesson 8–12, review 6–8, capstone 10–14).
2. Season-2 style ramp honored (per pack style guide §7b/equivalent):
   B2 = mixed target-language/English prompts, C1 = target-language-first;
   dialogues 8–12 lines; `durationMin` [20, 35]; journal `minSentences` ≥ 3;
   comprehension questions in the target language.
3. Weekly register-switch drill present (the signature season-2 exercise).
4. Arc continuity: cast intro timing and location rules in each
   `characters.md` respected (e.g. Sofia/Sofía stay in Milano/Valencia; no
   pre-introduction appearances).
5. `kind` rhythm: 5 × `lesson`, day 6 `review` (immersion anchor),
   day 7 `capstone` ending on the growing self-intro thread.

## Status

- [x] Phase 1 — Week 15 × 4 packs (days 99–105) — *this branch*
- [ ] Phase 2 — Week 16 × 4 packs (days 106–112)
- [ ] Phase 3 — Week 17 × 4 packs (days 113–119)
- [ ] Phase 4 — Week 18 × 4 packs (days 120–126)
- [ ] Phase 5 — Release hardening
