'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'german-data.js'), 'utf8'), sandbox);
const data = sandbox.window.GERMAN_STUDY_DATA;

assert.ok(data, 'German content must be exposed');
assert.ok(data.vocabulary.length >= 90, 'Expected a broad first-unit vocabulary');
assert.equal(new Set(data.vocabulary.map(x => x.id)).size, data.vocabulary.length, 'Vocabulary IDs must be unique');
for (const word of data.vocabulary) {
  assert.ok(word.term && word.meaning && word.group, 'Each word needs a term, meaning and group');
}
for (const group of ['homes', 'rooms', 'furniture', 'adjectives', 'verbs', 'prepositions']) {
  assert.ok(data.groups.some(x => x.id === group), 'Missing vocabulary group: ' + group);
}
for (const term of ['die Wohnung', 'das Hochhaus', 'die Küche', 'der Kühlschrank', 'der Spiegel', 'möchten', 'unter', 'zwischen']) {
  assert.ok(data.vocabulary.some(x => x.term === term), 'Missing required term: ' + term);
}
assert.ok(data.grammar.some(x => x.id === 'moechten'));
assert.ok(data.grammar.some(x => x.id === 'dativ'));
assert.ok(data.grammar.some(x => x.id === 'wechsel'));
assert.ok(data.grammar.some(x => x.id === 'position'));
assert.ok(data.phrases.length >= 8);
assert.ok(data.readings.length >= 3);

new vm.Script(fs.readFileSync(path.join(root, 'german-app.js'), 'utf8'), { filename: 'german-app.js' });
new vm.Script(fs.readFileSync(path.join(root, 'subjects.js'), 'utf8'), { filename: 'subjects.js' });


assert.ok(fs.readFileSync(path.join(root, 'german-app.js'), 'utf8').includes('async function speechLoop()'), 'German vocabulary must support sequential playback');
const germanApp = fs.readFileSync(path.join(root, 'german-app.js'), 'utf8');
for (const feature of [
  'id="g-voice-mode"',
  'id="g-voice-provider"',
  'id="g-voice-rate"',
  'id="g-voice-endpoint"',
  'data-a="speak-all"',
  'data-a="shuffle"',
  'data-a="toggle-meanings"',
  'Almanca → Türkçe → Almanca',
  "StudyVoice.say(content, lang",
  'data-a="spell-group"',
  'function normalizeGermanAnswer(value)',
  'function spellingAnswerMatches(answer, term)',
  '.replace(/[äöüß]/g',
  'U.spellGroup === \'all\'',
  'Artikel yazman gerekmiyor',
  'function quizAnswerCorrect(q, answer)'
]) {
  assert.ok(germanApp.includes(feature), 'Missing German vocabulary feature: ' + feature);
}


const instrumentedGermanApp = germanApp.replace(
  'window.GermanStudy={mount,render};',
  'window.GermanStudy={mount,render,__test:{U,S,nextSpell,spelling,spellingAnswerMatches,quizAnswerCorrect}};'
);
assert.notEqual(instrumentedGermanApp, germanApp, 'German app test hooks must be attached');
const appSandbox = {
  window: { GERMAN_STUDY_DATA: data },
  localStorage: { getItem: () => null, setItem: () => {} }
};
vm.runInNewContext(instrumentedGermanApp, appSandbox);
const spellingTests = appSandbox.window.GermanStudy.__test;

for (const [answer, term] of [
  ['kueche', 'die Küche'],
  ['gross', 'groß'],
  ['fuer', 'für'],
  ['schuelerheim', 'das Schülerheim'],
  ['Wohnung', 'die Wohnung'],
  ['DIE KÜCHE', 'die Küche']
]) {
  assert.equal(spellingTests.spellingAnswerMatches(answer, term), true, answer + ' should match ' + term);
}
assert.equal(spellingTests.spellingAnswerMatches('kuche', 'die Küche'), false, 'Missing umlaut transliteration should not pass');
assert.equal(spellingTests.spellingAnswerMatches('zimmer', 'die Küche'), false, 'A different word must not pass');
assert.equal(spellingTests.quizAnswerCorrect({ kind: 'spelling', a: 'die Küche' }, 'kueche'), true, 'Spelling questions must use tolerant comparison');

spellingTests.U.spellGroup = 'rooms';
spellingTests.S.mistakes = [];
spellingTests.nextSpell();
assert.equal(spellingTests.U.spell.group, 'rooms', 'Selected topic must limit spelling questions');
spellingTests.S.mistakes = ['kueche'];
spellingTests.nextSpell();
assert.equal(spellingTests.U.spell.id, 'kueche', 'Mistakes in the selected topic should be prioritized');
spellingTests.U.spellGroup = 'homes';
spellingTests.nextSpell();
assert.equal(spellingTests.U.spell.group, 'homes', 'Mistakes from another topic must not leak into the selected topic');

const spellingHtml = spellingTests.spelling();
for (const label of ['Ev türleri', 'Odalar', 'Mobilyalar', 'Sıfatlar', 'Fiiller', 'Edatlar', 'Artikel yazman gerekmiyor']) {
  assert.ok(spellingHtml.includes(label), 'Missing spelling UI element: ' + label);
}
console.log('PASS: ' + data.vocabulary.length + ' German terms, sequential German/Turkish playback, vocabulary controls, grammar, readings and application syntax.');
