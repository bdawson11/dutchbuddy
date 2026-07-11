# Italian reference voices — sources & cast mapping

Reference clips for the `italian-it` studio voice-over
(`alien79/F5-TTS-italian`, F5 engine). Source: **Mozilla Common Voice**
(Italian), released **CC0** (public domain) — no attribution required, safe
to redistribute the cloned voice output.

| File | Common Voice clip | Voices |
|------|-------------------|--------|
| `default.mp3` | `common_voice_it_19977843` | Narrator + the learner ("You") + any speaker without a dedicated clip (Sofia, Elena) |
| `Giulia.mp3` | `common_voice_it_19977843` | Giulia (31, main narrator) — same clip as `default` |
| `Marco.mp3` | `common_voice_it_23992088` | Marco (29, the livelier bar/gossip friend) |
| `Pietro.mp3` | `common_voice_it_23826622` | Pietro (38, the steadier Naples architect) |

Cast reference: `public/packs/italian-it/characters.md`. The female clip
carries the bulk of the audio (narrator + all non-dialogue lines); the two
male clips are used only on dialogue lines attributed to Marco and Pietro.

Transcripts (`<name>.txt`) are intentionally omitted — F5 auto-transcribes
each reference with Whisper at generation time. To pin exact transcripts for
higher fidelity, look up each clip's sentence in the Common Voice
`validated.tsv` (match the `path` column to the clip id above) and drop it in
a sibling `.txt`.

To swap a voice, replace the file (any of `.wav`/`.mp3`/`.flac`) and rerun
`tools/generate-audio.py` — see `docs/tts-pipeline.md`.
