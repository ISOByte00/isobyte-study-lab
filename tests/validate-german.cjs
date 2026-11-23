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

console.log('PASS: ' + data.vocabulary.length + ' German terms, ' + data.grammar.length + ' grammar modules, ' + data.readings.length + ' reading texts; application scripts parse.');
