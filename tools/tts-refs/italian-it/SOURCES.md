# Italian reference voices — sources & cast mapping

Reference clips for the `italian-it` studio voice-over
(`alien79/F5-TTS-italian`, F5 engine). Source: **Mozilla Common Voice**
(Italian), released **CC0** (public domain) — no attribution required, safe
to redistribute the cloned voice output.

| File | Common Voice clip | Voices |
|------|-------------------|--------|
| `default.mp3` | `common_voice_it_19461138` | Narrator + the learner ("You") + any speaker without a dedicated clip (Elena) — exact transcript in `default.txt` |
| `Giulia.mp3` | `common_voice_it_19461138` | Giulia (31, main narrator) — same clip as `default`, exact transcript in `Giulia.txt` |
| `Marco.mp3` | `common_voice_it_25339452` | Marco (29, the livelier bar/gossip friend) — exact transcript in `Marco.txt` |
| `Pietro.mp3` | `common_voice_it_23826622` | Pietro (38, the steadier Naples architect) |
| `Sofia.mp3` | `common_voice_it_19480831` | Sofia (27, the friend who moves to Milano) — exact transcript in `Sofia.txt` |

(Narrator/Giulia was `common_voice_it_19977843` in the first cut; replaced
with `cv_19461138`, which ships an exact transcript.)

Cast reference: `public/packs/italian-it/characters.md`. `default`/`Giulia`
(the narrator) carries the bulk of the audio; `Sofia` gives the arc character
her own distinct female voice on her dialogue lines. Elena (season 2) still
borrows `default`. The two male clips are used only on Marco/Pietro dialogue.

Transcripts (`<name>.txt`): `Sofia.txt` holds the exact Common Voice sentence
(highest fidelity). The others are omitted — F5 auto-transcribes those
references with Whisper at generation time. To pin exact transcripts for the
rest, look up each clip's sentence in the Common Voice `validated.tsv` (match
the `path` column to the clip id above) and drop it in a sibling `.txt`.

To swap a voice, replace the file (any of `.wav`/`.mp3`/`.flac`) and rerun
`tools/generate-audio.py` — see `docs/tts-pipeline.md`.
