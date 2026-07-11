# Reference voices for the studio TTS pipeline

Voice-cloning engines (`f5` for Italian, `neutts-gguf` for Spanish) take
their voice identity from short reference clips in
`tools/tts-refs/<pack>/`:

- `default.wav` + `default.txt` — **required**; the narrator voice used for
  chips, dictation, shadowing, and any speaker without a dedicated clip.
- `<CastName>.wav` + `<CastName>.txt` — optional per-character voices
  (`Giulia.wav`, `Marco.wav`, … must match `cast[].name` in the pack
  manifest). The `.txt` holds the exact transcript of the clip.

Clip guidance: ~10 seconds (3–15 s for NeuTTS), one speaker, clean audio, no
music. Mozilla Common Voice (CC0) is the recommended source — pick native
speakers with the pack's target accent (Peninsular Spanish for `spanish-es`,
standard Italian for `italian-it`). Note source clip IDs in the pack's
`audio/SOURCES.md` for provenance.

These directories are empty in git on purpose: reference clips are authoring
inputs you supply on the machine that runs `tools/generate-audio.py`.
The German engine (`orpheus-gguf`) does not use reference clips — its voices
are selected by name in `tools/tts-models.json`.
