# Reference voices for the studio TTS pipeline

Voice-cloning engines (`f5` for Italian, `neutts-gguf` for Spanish) take
their voice identity from short reference clips in
`tools/tts-refs/<pack>/`. References are discovered by the **audio file** —
the filename (minus extension) is the voice name:

- `default.wav|mp3|flac` — **required**; the narrator/fallback voice used for
  chips, dictation, shadowing, and any speaker without a dedicated clip.
- `<CastName>.wav|mp3|flac` — optional per-character voices; the name must
  match a `cast[].name` in the pack manifest (`Giulia.mp3`, `Marco.mp3`, …).

**Transcripts are optional.** If a sibling `<name>.txt` exists it is used as
the reference transcript; otherwise F5 transcribes the clip itself with
Whisper. Providing an accurate transcript improves fidelity, so add one when
you have it (for Common Voice clips, the sentence is in the dataset's
`validated.tsv`). NeuTTS works best with a transcript — the tool warns when
one is missing.

Clip guidance: ~10 seconds (3–15 s for NeuTTS), one speaker, clean audio, no
music. Mozilla Common Voice (CC0) is the recommended source — pick native
speakers with the pack's target accent (Peninsular Spanish for `spanish-es`,
standard Italian for `italian-it`). Record provenance in each pack's
`SOURCES.md`.

The German engine (`orpheus-gguf`) does **not** use reference clips — its
voices are selected by name in `tools/tts-models.json`.

## Shipped references

- `italian-it/` — three Mozilla Common Voice (CC0) clips, mapped to the cast
  in `italian-it/SOURCES.md`.
