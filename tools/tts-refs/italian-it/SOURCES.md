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
| `Pietro.mp3` | `common_voice_it_19175569` | Pietro (38, the steadier Naples architect) — exact transcript in `Pietro.txt` |
| `Sofia.mp3` | `common_voice_it_19480831` | Sofia (27, the friend who moves to Milano) — exact transcript in `Sofia.txt` |

(Narrator/Giulia was `common_voice_it_19977843` and Marco/Pietro were
`cv_23992088`/`cv_23826622` in the first cut; all replaced with clips that
ship exact transcripts.)

Cast reference: `public/packs/italian-it/characters.md`. `default`/`Giulia`
(the narrator) carries the bulk of the audio; `Sofia` gives the arc character
her own distinct female voice on her dialogue lines. Elena (season 2) still
borrows `default`. The two male clips are used only on Marco/Pietro dialogue.

Transcripts: **all five references now ship their exact Common Voice sentence**
in a sibling `<name>.txt` — the highest-fidelity setup (no Whisper guessing).
Reference-clip transcripts are used only for voice cloning at generation time;
they are never spoken in the lessons.

To swap a voice, replace the file (any of `.wav`/`.mp3`/`.flac`) and rerun
`tools/generate-audio.py` — see `docs/tts-pipeline.md`.
