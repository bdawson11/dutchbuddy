import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickVoice } from '../src/engine/audio.js';

const v = (name, lang, localService = true) => ({ name, lang, localService });

test('prefers exact locale, local first', () => {
  const voices = [v('Ellen', 'nl-BE'), v('Google Nederlands', 'nl-NL', false), v('Xander', 'nl-NL'), v('Anna', 'de-DE')];
  assert.equal(pickVoice(voices, { locale: 'nl-NL' }).name, 'Xander');
});

test('never falls back to an avoided locale while another exists', () => {
  const voices = [v('Ellen', 'nl-BE'), v('Nienke', 'nl'), v('Anna', 'de-DE')];
  assert.equal(pickVoice(voices, { locale: 'nl-NL', avoid: ['nl-BE'] }).name, 'Nienke');
});

test('falls back to the avoided locale only when it is the only one in the language', () => {
  const voices = [v('Ellen', 'nl-BE'), v('Anna', 'de-DE')];
  assert.equal(pickVoice(voices, { locale: 'nl-NL', avoid: ['nl-BE'] }).name, 'Ellen');
});

test('preferred voice names win, underscore locales are tolerated', () => {
  const voices = [v('Xander', 'nl_NL'), v('Google Nederlands', 'nl-NL', false)];
  assert.equal(pickVoice(voices, { locale: 'nl-NL', preferred: ['google nederlands'] }).name, 'Google Nederlands');
  assert.equal(pickVoice(voices, { locale: 'nl-NL' }).name, 'Xander');
});

test('null when nothing matches', () => {
  assert.equal(pickVoice([v('Anna', 'de-DE')], { locale: 'nl-NL' }), null);
});
