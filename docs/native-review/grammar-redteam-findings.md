# DutchBuddy — Grammar red-team findings

*An automated adversarial grammar/accuracy pass over all 84 lessons (one reviewer
per week, against a 14-point Netherlands-Dutch rubric). Unambiguous errors were
**fixed in place** and are recorded here for traceability; genuine judgment calls
were **flagged** — these are the items a human native speaker should adjudicate.
This is the machine pre-pass; it does not replace native review, it focuses it.*

## Summary

| Week | Days | Fixed | Flagged |
|---|---|---|---|
| 1  | 01–07 | 2 | 3 |
| 2  | 08–14 | 3 | 1 |
| 3  | 15–21 | 3 | 1 |
| 4  | 22–28 | 5 | 3 |
| 5  | 29–35 | 0 | 3 |
| 6  | 36–42 | 2 | 1 |
| 7  | 43–49 | 0 | 2 |
| 8  | 50–56 | 0 | 1 |
| 9  | 57–63 | 1 | 1 |
| 10 | 64–70 | 2 | 3 |
| 11 | 71–77 | 1 | 1 |
| 12 | 78–84 | 0 | 2 |
| pack-wide (apostrophe sweep) | — | 2 | — |
| **Total** | | **~21** | **~22** |

**Highest-value catches:** a Spanish leftover (`chisme`) that had leaked from
authoring metadata into a user-facing title (day-63); a pack-wide Dutch-genitive
apostrophe error on consonant/e-ending names (`Sanne's`→`Sannes`, `Bram's`→`Brams`)
in Dutch fields only — English `en`/`scene` fields left correct; several builder
slots that could assemble ungrammatical sentences (day-11, day-25, day-53); and a
spotlight mislabeling a `worden`-passive as the perfect tense (day-41).

**Priority for native review:** the flagged idiom/naturalness items (a native ear
call) and the dialogues — see `dialogues-for-review.md` for a full read-through.

---

## Findings by week

## Week 8 (M08, days 50-56) — 0 fixed, 1 flagged
- FLAG day-53 block[8] (builder) | word-order/pedagogy | LOW: "Zet het werkwoord op het eind" builder offers a `want` chip alongside omdat/als, but the final slot forces verb-final — picking `want` yields ungrammatical "...want ik ziek ben" (want needs V2). Builders have no correct/incorrect marking so it can't work as a trap. Suggest: drop the `want` chip or relabel the last slot. (Judgment call — verify.)
- Grammar CLEAN days 50,51,52,54,55,56 (gaan/zullen future, dat/omdat/als/want contrast, comparatives+irregulars, arc anchors day-55/56 correct).
## Week 11 (M11, days 71-77) — 1 fixed, 1 flagged
- FIXED day-72 block[5] (mcq) | de/het | HIGH: "Geef me de zout" -> "Geev me het zout" (zout is het-word), prompt+all options, correct index preserved.
- FLAG day-76 block[0] (card callout) | continuity | LOW: "Sanne verhuisde vorige maand naar Utrecht" — move (day69) to visit (day76) is ~1 wk in lesson seq; "vorige maand" may want "vorige week". No in-world calendar specified; verify.
- Grammar CLEAN days 71,73,74,75,77 (verb-prep pairs, particle nuance, diminutive rules, u/je calibration, register-control capstone).
## Week 7 (M07, days 43-49) — 0 fixed, 2 flagged
- FLAG day-44 block[8] (comprehension title) | anglicism | LOW: title "Snap je de split?" uses English "split"; native may prefer "Snap je het verschil?" (deliberate pun). Verify.
- FLAG day-49 block[0]+builder | completeness | LOW: cumulative self-intro recap enumerates layers 1-5, omits layer 6 (feelings/health, day-42); layer-7 card mentions feelings so arc coherent but recap/builder could add layer-6 slot. Verify.
- Grammar CLEAN all 7 (imperfectum forms via 't kofschip, irregulars, perfect-vs-imperfectum split, adjective inflection, Bram arc day-48).
## Week 5 (M05, days 29-35) — 0 fixed, 3 flagged
- FLAG day-30 block[8] (dialogue) | naturalness | LOW: "Wanneer ben je weer in Amsterdam gekomen?" — native prefers teruggekomen/aangekomen. Verify.
- FLAG day-30 block[2] (chips) | gloss | LOW: {nl:"Er is gebeurd", en:"there happened"} incomplete (wants "Er is iets gebeurd") + unidiomatic English gloss. Verify.
- FLAG day-35 block[5] (dictation) | consistency | LOW: prompt speaks "Wat heb je het weekend gedaan?" but attributed Daan line (block[6]) says "dit weekend". Align to "dit weekend". Verify.
- Grammar CLEAN all 7 (participles, hebben/zijn split, separables, adjective inflection, Texel review day-34, layer-5 capstone).
## Week 9 (M09, days 57-63) — 1 fixed, 1 flagged
- FIXED day-63 block[0] (title) | anglicism/non-Dutch | HIGH: "Het nieuws — chisme met Daan" -> "Het nieuws — roddelen met Daan" (chisme = Spanish leftover from characters.md cast metadata, leaked into user-facing title).
- FLAG day-62 block[3]/[6] | reported-speech tense | LOW: "zei dat ze me een baan willen aanbieden" — present vs day-63's backshifted "aanbood" for same event; native may align to "wilden aanbieden". Verify.
- Grammar CLEAN all 7 (conjunctions verb-final, relative die/dat + waar+prep, indirect speech backshift, zou, als real/hypothetical, arc day-62/63 Sanne-knows-not-moved, layer-9 capstone).
## Week 1 (M01, days 1-7) — 2 fixed, 3 flagged
- FIXED day-03 block[0] (table) | accuracy | LOW: split "doei / dag = hello or bye" row — doei is farewell-only in NL Dutch.
- FIXED day-07 block[9] (builder) | format | LOW: self-intro chips lacked terminal punctuation (Builder joins with bare space) -> run-on; added "." per chip + capitalized last.
- FLAG day-01 block[7] (dictation) | spelling | LOW: "goede morgen" 2-word alternate — verify intentional.
- FLAG day-04 vs day-07 | continuity | LOW: learner referred to as "Hij" (day-04) then "Zij" (day-07); gender not fixed in bible. Verify.
- FLAG day-07 block[9] | builder design | LOW: sample sentence richer than any producible pick-combo. Verify.

## Week 6 (M06, days 36-42) — 2 fixed, 1 flagged
- FIXED day-41 title | spelling/anglicism | MED: "Sanne's zware week" -> "Sannes zware week" (Dutch possessive of -e name = plain -s, no apostrophe).
- FIXED day-41 block[4] (dialogue spotlight) | grammar | MED: relabeled "is gestolen" from "perfect tense" to passive (zijn+participle), not stelen's perfect (heeft gestolen). Prevents future aux errors.
- FLAG day-38 block[7] (dialogue) | vocab | LOW: "een paracetamol" — apotheek register prefers "paracetamolletje". Verify.
- Grammar CLEAN 36,37,39(zich voelen table),40,42.
## Week 2 (M02, days 8-14) — 3 fixed, 1 flagged
- FIXED day-08 block[1] (chips) | consistency | LOW: title "0 to 10" -> "0 to 7" (items only nul-zeven).
- FIXED day-11 block[8] (builder) | grammar/V2 | MED: subject chips ["ik","jij","wij"] -> ["ik"] (verb chips are bare ik-forms; jij/wij built ungrammatical *jij drink). Matches day-14 pattern.
- FIXED day-11 block[10] (dictation) | convention | LOW: canonical answer "'s avonds..." -> "'s Avonds..." (sentence-initial cap, matches pack convention).
- FLAG day-10 | density | LOW: 6 cards vs 3 graded; card-heavy. Verify.
- Note: some `speak` fields drop trema vs `nl` (tweeentwintig) — deliberate TTS simplification, consistent, left.
## Week 3 (M03, days 15-21) — 3 fixed, 1 flagged
- FIXED day-20 block[0], day-21 block[0]/[9]/[10] | style-guide A1 scaffolding | MED: recap cards + capstone journal prompts were full-Dutch prose -> rewritten in English (Dutch terms italic), matching day-07/day-14 precedent. (counted as 3 fixes across day-20/day-21)
- FLAG day-20 emoji 🚲 for a "wandeling" (walk) lesson — literal mismatch. Verify.
- Grammar CLEAN 15-19 (diminutive -tje, -e inflection canonical table, possessives ons/onze, De Pijp postcode).

## Week 4 (M04, days 22-28) — 5 fixed, 3 flagged
- FIXED day-24 block[7] (typed) | alternates | LOW: added "kun je mij helpen"/"kan je mij helpen" (mij alongside me).
- FIXED day-25 block[7] (builder) | sense | MED: Waarover chip "de zomer" -> "vers fruit" ("Ik eet graag de zomer" was nonsensical across combos).
- FIXED day-27 block[4] (dialogue) | modal word order | HIGH: "Ik wil altijd een kroket met patat." -> "...bestellen." (spotlight claimed willen+infinitive-at-end but had no infinitive).
- FIXED day-27 block[6] (journal starter) | separable verb | MED: "Ik sta op om…" -> "Ik sta om…" (opstaan splits, op last).
- FIXED day-27 title | possessive apostrophe | MED (by main agent, pack-wide sweep): "Bram's snackbar" -> "Brams snackbar".
- FLAG day-23 block[6] double-order staging; day-27 "Mag ik een keer mee?" (elided gaan) + "doe mee" gloss (meedoen vs meegaan). Verify.
- Grammar CLEAN 22,26,28 (modal table flagship, quantities, layer-4 capstone).

## Week 10 (M10, days 64-70) — 2 fixed, 3 flagged
- FIXED day-70 block[6]/[8] | possessive apostrophe | LOW: "Sanne's brief" -> "Sannes brief" (×2).
- FLAG day-66 "de straat wordt opnieuw gelegd" (prefer bestraat/aangelegd); day-64 journal starters presentative "er" after fronted locative PP (redundant to some natives). Verify.
- Grammar CLEAN 64,65(er excellent),67,68(IPP),69(moving-day arc anchor). Arc verified end-to-end (decide day67 Amsterdam, move day69, Utrecht after).

## Week 12 (M12, days 78-84) — 0 fixed, 2 flagged
- FLAG day-80 block[3] order-count logic ("hetzelfde" vs "een frikandel speciaal" for two people); day-79 "kut" in yellow tier + spelled (responsible but native may nudge to red). Verify.
- Grammar CLEAN all 7 (imperatives+softeners, day-84 six-tense letter, 12 idioms, RED slang responsible, borrel arc payoff, full cumulative mijn verhaal + farewells).

## Pack-wide (main agent)
- FIXED day-63 body | possessive apostrophe | LOW: "over Sanne's nieuws" -> "over Sannes nieuws".
- Apostrophe sweep: Emma's (a-ending) correct everywhere; Bram's/Daan's/Sanne's in en/scene/spotlight/q are ENGLISH text (correct). Only 4 Dutch-field instances existed (day-41 title, day-63 body, day-70 ×2) — all fixed.
- No cross-pack Spanish leftovers remain (chisme grep clean).
