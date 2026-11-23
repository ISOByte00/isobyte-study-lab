'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');

const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'tts.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const german = fs.readFileSync(path.join(root, 'german-app.js'), 'utf8');
const courseCss = fs.readFileSync(path.join(root, 'course.css'), 'utf8');

assert(page.includes('src="tts.js"') && page.indexOf('src="tts.js"') < page.indexOf('src="app.js"'));
assert(engine.includes("provider:'browser'") && engine.includes("'google'"));
assert(engine.includes('function cloudSay') && engine.includes('JSON.stringify({text,lang,rate})'));
assert(engine.includes("prefs.provider==='google'?cloudSay"));
assert(engine.includes('prefs.endpoint') && engine.includes('CORS'));
assert(engine.includes('Cihazında Almanca tarayıcı sesi yok'));
assert(app.includes('id="voice-provider"') && app.includes('id="voice-endpoint"'));
assert(german.includes('id="g-voice-provider"') && german.includes('id="g-voice-endpoint"'));
assert(german.includes("StudyVoice.say(t, 'de-DE', rate, k)"));
assert(german.includes("setPref('provider',t.value)") && german.includes("setPref('rate', t.value)"));
assert(courseCss.includes('.g-voice-settings'));
assert(!page.includes('API_KEY') && !engine.includes('texttospeech.googleapis.com'));

new vm.Script(fs.readFileSync(path.join(root, 'tts.js'), 'utf8'), { filename: 'tts.js' });
new vm.Script(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), { filename: 'app.js' });
new vm.Script(fs.readFileSync(path.join(root, 'german-app.js'), 'utf8'), { filename: 'german-app.js' });

assert(engine.includes("indexedDB.open('isobyte_cloud_tts_audio_v1'"));
assert(engine.includes('const audioMemory = new Map()') || engine.includes('const audioMemory=new Map()'));
assert(engine.includes('JSON.stringify([url,lang,text])'), 'Audio cache must be keyed by Worker, language and exact text');
assert(engine.includes('readCachedAudio(cacheKey)') && engine.includes('saveCachedAudio(cacheKey,blob)'));
console.log('PASS: browser and Google Cloud Worker TTS, German de-DE playback controls, shared preferences, no API key in the client.');
