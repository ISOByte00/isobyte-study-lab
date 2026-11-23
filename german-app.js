/* ISOByte Study Lab — German course module */
(function () {
  'use strict';
  const D = window.GERMAN_STUDY_DATA;
  if (!D) throw new Error('German course data is missing.');
  const STORE = 'isobyte_german_unterkunft_v1';
  const fresh = () => ({ known: [], mistakes: [], spelling: { attempts: 0, correct: 0, wrong: 0 }, best: null, exams: 0 });
  let old = {};
  try { old = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (_) {}
  const S = Object.assign(fresh(), old, { spelling: Object.assign(fresh().spelling, old.spelling || {}) });
  if (!Array.isArray(S.known)) S.known = [];
  if (!Array.isArray(S.mistakes)) S.mistakes = [];
  const U = { page: 'home', group: 'all', search: '', index: 0, flip: false, spell: null, spellAnswer: '', spellChecked: false, quiz: null, exam: false, menu: false };
  const pages = { home: 'Genel Bakış', vocab: 'Kelime Kartları', spelling: 'Yazım Çalışması', grammar: 'Konu Anlatımı', practice: 'Alıştırma Merkezi', reading: 'Okuma Çalışması', exam: 'Yazılı Provası' };
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => [...a].sort(() => Math.random() - .5);
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (_) {} };
  function words() { return D.vocabulary.filter(w => (U.group === 'all' || w.group === U.group) && (!U.search || (w.term + ' ' + w.meaning).toLocaleLowerCase('tr').includes(U.search.toLocaleLowerCase('tr')))); }
  function toast(t) { const e = $('#g-toast'); if (!e) return; e.textContent = t; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 2200); }
  function title(k, h, p) { return '<header class="g-title"><small>' + esc(k) + '</small><h1>' + esc(h) + '</h1><p>' + esc(p) + '</p></header>'; }
  function home() {
    const n = D.vocabulary.length, pct = Math.round(S.known.length / n * 100), sp = S.spelling;
    const cards = [['vocab','01','Kelime kartları','Ev türleri, odalar, mobilyalar ve diğer kelimeler.'],['spelling','02','Yazım testi','Türkçesini gör; Almancasını artikel ve doğru harflerle yaz.'],['grammar','03','Dil bilgisi','möchten, Dativ, Wechselpräpositionen ve cümle yapıları.'],['practice','04','Alıştırma merkezi','Karışık sorularla bilgini kontrol et.'],['reading','05','Okuma','Kitaptaki Murat, Eylül ve Melanie metinleri.'],['exam','06','Yazılı provası','20 soruluk kapsamlı ünite provası.']];
    return '<section class="g-hero"><small>11. SINIF · ALMANCA · 1. THEMA</small><h1>Unterkunft</h1><p>Ev türleri, odalar, mobilyalar, sıfatlar, möchten, Dativ ve yer-yön edatları. Kelimeleri artikelleriyle ve doğru yazımlarıyla öğren.</p><button data-a="go" data-p="vocab">Kelime çalışmaya başla →</button></section>' +
      '<div class="g-stats"><div><small>TOPLAM KELİME</small><b>' + n + '</b></div><div><small>ÖĞRENİLEN</small><b>' + S.known.length + '/' + n + '</b><span>%' + pct + '</span></div><div><small>YAZIM DOĞRULUĞU</small><b>' + (sp.attempts ? Math.round(sp.correct / sp.attempts * 100) : 0) + '%</b><span>' + sp.correct + ' doğru · ' + sp.wrong + ' yanlış</span></div><div><small>EN İYİ DENEME</small><b>' + (S.best == null ? '—' : '%' + S.best) + '</b></div></div>' +
      '<div class="g-grid">' + cards.map(x => '<button data-a="go" data-p="' + x[0] + '"><small>' + x[1] + '</small><b>' + x[2] + '</b><span>' + x[3] + '</span><strong>Aç →</strong></button>').join('') + '</div>' +
      '<aside class="g-note"><b>Defter ve kitap farkları</b><p>Kitapta <b>der Wohnwagen</b> (çekme karavan), defterde ayrıca <b>das Wohnmobil</b> (motokaravan) var. <b>Das Doppelhaus</b> ikiz/bitişik evdir; dubleks ev demek değildir. Bungalow da doğrudan ahşap ev anlamına gelmez.</p></aside>' +
      '<p class="g-source">Kaynak: Almanca 1. Thema Unterkunft, kitap s.10–19 ve defter notları.</p>';
  }
  function vocab() {
    const list = words(), w = list.length ? list[U.index % list.length] : null;
    return title('KELİME EZBERİ','Kelime Kartları','Her kelimeyi artikeliyle ve doğru yazımıyla öğren. Türkçe anlamdan Almanca kelimeye geç.') +
      '<div class="g-filters"><button data-a="group" data-v="all">Tümü (' + D.vocabulary.length + ')</button>' + D.groups.map(g => '<button data-a="group" data-v="' + g.id + '">' + esc(g.label) + ' (' + D.vocabulary.filter(w => w.group === g.id).length + ')</button>').join('') + '</div>' +
      '<input id="g-search" placeholder="Kelime veya anlam ara..." value="' + esc(U.search) + '">' +
      (w ? '<section class="g-flash" data-a="flip"><small>' + (U.flip ? 'ALMANCA · DOĞRU YAZIM' : 'TÜRKÇE ANLAM') + '</small><strong>' + esc(U.flip ? w.term : w.meaning) + '</strong><span>' + (U.flip ? 'Artikel + isim birlikte ezberlenmeli.' : 'Cevabı görmek için karta dokun.') + '</span></section>' +
      '<div class="g-actions"><button data-a="prev">← Önceki</button><button data-a="flip">Cevabı göster</button><button data-a="next">Sonraki →</button><button data-a="speak" data-id="' + w.id + '">🔊</button><button data-a="known" data-id="' + w.id + '">' + (S.known.includes(w.id) ? '✓ Öğrendim' : 'Öğrendim') + '</button></div>' : '<p>Aramayla eşleşen kelime yok.</p>') +
      '<h2>Kelime listesi · ' + list.length + '</h2><div class="g-word-list">' + list.map(w => '<div><b>' + esc(w.term) + '</b><span>' + esc(w.meaning) + '</span><button data-a="speak" data-id="' + w.id + '">🔊</button><button data-a="known" data-id="' + w.id + '">' + (S.known.includes(w.id) ? '✓' : 'Öğrendim') + '</button></div>').join('') + '</div>';
  }
  function nextSpell() {
    const pool = S.mistakes.length ? D.vocabulary.filter(w => S.mistakes.includes(w.id)) : D.vocabulary;
    U.spell = rand(pool.length ? pool : D.vocabulary); U.spellAnswer = ''; U.spellChecked = false;
  }
  function spelling() {
    if (!U.spell) nextSpell();
    const w = U.spell, ok = U.spellAnswer.normalize('NFC').trim() === w.term.normalize('NFC');
    return title('YAZIM VE HAFIZA','Almanca Yazım Çalışması','Türkçe anlamını görüp Almancasını artikel dâhil eksiksiz yaz. Büyük harf ve umlautlar birebir kontrol edilir.') +
      '<section class="g-spell"><small>' + esc((D.groups.find(g => g.id === w.group) || {}).label || 'KELİME') + '</small><h2>' + esc(w.meaning) + '</h2><p>İsimse artikel + isim yaz. Örnek: <b>die Wohnung</b>.</p><form id="g-spell-form"><input id="g-spell-input" value="' + esc(U.spellAnswer) + '" placeholder="Almanca karşılığını yaz..." autocomplete="off" spellcheck="false" ' + (U.spellChecked ? 'disabled' : '') + '><button ' + (U.spellChecked ? 'disabled' : '') + '>Kontrol et</button></form>' +
      (U.spellChecked ? '<div class="g-feedback ' + (ok ? 'ok' : 'bad') + '"><b>' + (ok ? '✓ Tam doğru' : '✕ Yazım hatalı') + '</b><p>Doğru yazım: <strong>' + esc(w.term) + '</strong></p>' + (w.note ? '<small>' + esc(w.note) + '</small>' : '') + '</div><button data-a="spell-next">Sonraki kelime →</button>' : '') +
      '<p class="g-source">Deneme: ' + S.spelling.attempts + ' · Doğru: ' + S.spelling.correct + ' · Yanlış: ' + S.spelling.wrong + ' · Tekrar edilecek kelime: ' + S.mistakes.length + '</p></section>';
  }
  function grammar() {
    return title('KONU ANLATIMI','Dil Bilgisi','Defterdeki cümle yapıları ve kitabın 1. ünitesindeki Dativ / yer edatları.') +
      '<div class="g-grammar">' + D.grammar.map(g => '<article><small>' + esc(g.subtitle) + '</small><h2>' + esc(g.title) + '</h2><div class="g-formula">' + esc(g.formula) + '</div>' +
      (g.rows.length ? '<div class="g-rows">' + g.rows.map(r => '<div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>').join('') + '</div>' : '') +
      '<div class="g-examples">' + g.examples.map(e => '<div><b>' + esc(e[0]) + '</b><strong>' + esc(e[1]) + '</strong>' + (e[2] ? '<small>' + esc(e[2]) + '</small>' : '') + '</div>').join('') + '</div><p class="g-note">' + esc(g.note) + '</p></article>').join('') + '</div>' +
      '<h2>Ezber cümleleri</h2><div class="g-phrases">' + D.phrases.map(p => '<div><b>' + esc(p[0]) + '</b><strong>' + esc(p[1]) + '</strong><span>' + esc(p[2]) + '</span><button data-a="speak-text" data-text="' + esc(p[0] + ' ' + p[1]) + '">🔊</button></div>').join('') + '</div>';
  }
  function makeQ() {
    const nouns = D.vocabulary.filter(w => ['homes','rooms','furniture'].includes(w.group) && /^(der|die|das) /.test(w.term));
    const kind = rand(['article','dativ','prep','moechten','sentence','spelling','reading']);
    if (kind === 'article') { const w = rand(nouns); return {type:'choice',q:'“' + w.meaning + '” kelimesinin artikeli hangisi?',opts:['der','die','das'],a:w.term.split(' ')[0],why:'Doğru kelime: ' + w.term}; }
    if (kind === 'dativ') { const q = rand([['Melanie wohnt in ___ Villa.','einer','die → einer'],['Familie Maier wohnt in ___ Hochhaus.','einem','das → einem'],['Herr Schulze wohnt in ___ Wohnwagen.','einem','der → einem'],['Das Buch ist auf ___ Tisch.','dem','der → dem'],['Der Teppich liegt unter ___ Bett.','dem','das → dem'],['Die Lampe steht auf ___ Kommode.','der','die → der']]); return {type:'input',q:q[0],a:q[1],why:q[2]}; }
    if (kind === 'prep') { const q = rand([['Das Buch ist ___ dem Tisch. (üzerinde)','auf','auf = üzerinde'],['Der Teppich ist ___ dem Bett. (altında)','unter','unter = altında'],['Der Stuhl steht ___ der Garderobe. (yanında)','neben','neben = yanında'],['Die Vase steht ___ dem Tisch. (önünde)','vor','vor = önünde'],['Der Schrank steht ___ dem Bett. (arkasında)','hinter','hinter = arkasında']]); return {type:'choice',q:q[0],opts:shuffle(['auf','unter','in','neben','vor','hinter']),a:q[1],why:q[2]}; }
    if (kind === 'moechten') { const q = rand([['ich','möchte'],['du','möchtest'],['er / sie / es','möchte'],['wir','möchten'],['ihr','möchtet'],['sie / Sie','möchten']]); return {type:'input',q:'möchten fiilini “' + q[0] + '” öznesine göre çekimle.',a:q[1],why:q[0] + ' → ' + q[1]}; }
    if (kind === 'sentence') { const q = rand([['Ali bir villada yaşamak istiyor.',['Ali möchte in einer Villa leben.','Ali möchte in einem Villa leben.','Ali möchten in einer Villa leben.'],'Ali möchte in einer Villa leben.','die Villa → einer'],['Bir yüksek apartmanda oturuyorum.',['Ich wohne in einem Hochhaus.','Ich wohne in einer Hochhaus.','Ich wohnen in einem Hochhaus.'],'Ich wohne in einem Hochhaus.','das Hochhaus → einem']]); return {type:'choice',q:q[0],opts:q[1],a:q[2],why:q[3]}; }
    if (kind === 'reading') { const r=rand(D.readings), q=rand(r.questions); return {type:'choice',q:'“' + r.text + '”\\nİfade doğru mu? ' + q[0],opts:['Richtig','Falsch'],a:q[1]?'Richtig':'Falsch',why:q[1]?'Metinde verilen bilgiyle örtüşüyor.':'Metindeki bilgi ifadeyi doğrulamıyor.'}; }
    const w=rand(D.vocabulary); return {type:'input',q:'“' + w.meaning + '” kelimesini Almanca yaz. İsimse artikelini ekle.',a:w.term,why:'Doğru yazım: ' + w.term};
  }
  function session(n) { return {items:Array.from({length:n},makeQ),i:0,ans:'',checked:false,score:0,done:false}; }
  function quiz(s,isExam) {
    if (s.done) return '<section class="g-result"><b>' + s.score + '/' + s.items.length + '</b><h2>%' + Math.round(s.score/s.items.length*100) + ' başarı</h2><p>' + (isExam?'Yazılı provası':'Alıştırma') + ' tamamlandı.</p><button data-a="restart">Yeniden çöz</button></section>';
    const q=s.items[s.i], ok=s.ans===q.a;
    return '<div class="g-qmeta">' + (isExam?'YAZILI PROVASI':'ALIŞTIRMA') + ' · ' + (s.i+1) + '/' + s.items.length + ' · ' + s.score + ' doğru</div><section class="g-question"><h2>' + esc(q.q).replace(/\\n/g,'<br>') + '</h2>' +
      (q.type==='choice' ? q.opts.map(o=>'<button class="g-option ' + (s.ans===o?'selected ':'') + (s.checked&&o===q.a?'right':'') + '" data-a="option" data-v="' + esc(o) + '" ' + (s.checked?'disabled':'') + '>' + esc(o) + '</button>').join('') : '<input id="g-q-answer" value="' + esc(s.ans) + '" placeholder="Almanca cevabını yaz..." spellcheck="false" ' + (s.checked?'disabled':'') + '>') +
      (s.checked?'<p class="g-feedback ' + (ok?'ok':'bad') + '"><b>' + (ok?'✓ Doğru':'✕ Doğru cevap: '+esc(q.a)) + '</b><br>' + esc(q.why) + '</p>':'') +
      '<button data-a="' + (s.checked?'q-next':'q-check') + '" ' + (!s.checked&&!s.ans?'disabled':'') + '>' + (s.checked?(s.i===s.items.length-1?'Sonuçları gör':'Sonraki soru →'):'Kontrol et') + '</button></section>';
  }
  function practice() { if (!U.quiz || U.exam) { U.quiz=session(10); U.exam=false; } return title('KARMA TEKRAR','Alıştırma Merkezi','Artikel, Dativ, yer edatları, möchten, cümle kurma ve kelime yazımı.') + quiz(U.quiz,false); }
  function exam() { if (!U.quiz || !U.exam) { U.quiz=session(20); U.exam=true; } return title('SINAV MODU','Yazılı Provası','20 soruluk karma prova. Sorular gönderdiğin 1. ünite ve defter notlarına göre hazırlanır.') + '<p class="g-note">Özellikle der / die / das, Dativ artikelleri, in / auf / unter, möchten çekimi ve kelimelerin eksiksiz yazımına dikkat et.</p>' + quiz(U.quiz,true); }
  function reading() { return title('LESEVERSTEHEN','Okuma Çalışması','Kitabın 12. ve 16. sayfalarındaki metinleri tekrar et.') + D.readings.map(r=>'<article class="g-reading"><h2>'+esc(r.title)+'</h2><p>'+esc(r.text)+'</p>'+r.questions.map(q=>'<div>'+esc(q[0])+' <b>'+(q[1]?'Richtig':'Falsch')+'</b></div>').join('')+'</article>').join(''); }
  function mount() {
    if ($('#german-root')) return;
    const r=document.createElement('div'); r.id='german-root';
    r.innerHTML='<div class="g-shell"><aside class="g-sidebar"><div class="g-brand"><b>DE</b><span><strong>Deutsch</strong><small>ISOByte Study Lab</small></span></div><small class="g-nav-label">ALMANCA · 1. ÜNİTE</small><nav>'+Object.entries(pages).map(x=>'<button data-a="go" data-p="'+x[0]+'">'+x[1]+'</button>').join('')+'</nav><button class="g-switch" data-a="switch">⇄ Dersi değiştir</button></aside><div class="g-main"><header><button data-a="menu">☰</button><span>11. Sınıf / Almanca / <b id="g-crumb">Genel Bakış</b></span><button data-a="switch">Dersi değiştir</button></header><main id="g-view"></main><footer>© 2026 ISOByte · Almanca 1. Thema · Kitap s.10–19 ve defter notları</footer></div></div><div id="g-toast"></div>';
    document.body.append(r); r.addEventListener('click',click); r.addEventListener('input',input); r.addEventListener('submit',submit); render();
  }
  function render() {
    if (!$('#german-root')) return;
    const views={home,vocab,spelling,grammar,practice,reading,exam};
    $('#g-view').innerHTML=views[U.page](); $('#g-crumb').textContent=pages[U.page];
    $('#german-root').querySelector('.g-sidebar').classList.toggle('open',U.menu);
    $('#german-root').querySelectorAll('.g-sidebar nav button').forEach(b=>b.classList.toggle('active',b.dataset.p===U.page));
  }
  function speak(t) {
    if (!window.StudyVoice) return toast('Ses motoru yüklenemedi.');
    try { const k=StudyVoice.start(); StudyVoice.say(t,'de-DE',0.95,k).then(ok=>{if(!ok)toast('Almanca ses paketi bulunamadı.');}).catch(()=>toast('Seslendirme başarısız.')); } catch (_) { toast('Seslendirme kullanılamıyor.'); }
  }
  function checkSpell() {
    U.spellAnswer=$('#g-spell-input')?.value || U.spellAnswer;
    if (!U.spellAnswer.trim()) return toast('Önce cevap yaz.');
    const ok=U.spellAnswer.normalize('NFC').trim()===U.spell.term.normalize('NFC');
    S.spelling.attempts++; if(ok){S.spelling.correct++;S.mistakes=S.mistakes.filter(x=>x!==U.spell.id);}else{S.spelling.wrong++;if(!S.mistakes.includes(U.spell.id))S.mistakes.push(U.spell.id);}
    U.spellChecked=true;save();render();
  }
  function activeQuiz(){return U.quiz;}
  function checkQuiz(){const s=activeQuiz();if(!s||s.checked||!s.ans)return;const q=s.items[s.i];s.checked=true;if(s.ans===q.a)s.score++;render();}
  function click(e) {
    const b=e.target.closest('[data-a]'); if(!b)return; const a=b.dataset.a;
    if(a==='go'){U.page=b.dataset.p;U.menu=false;render();scrollTo(0,0);}
    else if(a==='switch')window.dispatchEvent(new CustomEvent('isobyte:choose-course'));
    else if(a==='menu'){U.menu=!U.menu;render();}
    else if(a==='group'){U.group=b.dataset.v;U.index=0;U.flip=false;render();}
    else if(a==='flip'){U.flip=!U.flip;render();}
    else if(a==='next'||a==='prev'){const n=words().length;U.index=(U.index+(a==='next'?1:-1)+n)%n;U.flip=false;render();}
    else if(a==='known'){const i=S.known.indexOf(b.dataset.id);i<0?S.known.push(b.dataset.id):S.known.splice(i,1);save();render();}
    else if(a==='speak'){const w=D.vocabulary.find(x=>x.id===b.dataset.id);if(w)speak(w.term);}
    else if(a==='speak-text')speak(b.dataset.text||'');
    else if(a==='spell-next'){nextSpell();render();}
    else if(a==='option'){if(!U.quiz.checked){U.quiz.ans=b.dataset.v;render();}}
    else if(a==='q-check')checkQuiz();
    else if(a==='q-next'){
      if(U.quiz.i===U.quiz.items.length-1){U.quiz.done=true;if(U.exam){const pct=Math.round(U.quiz.score/U.quiz.items.length*100);S.best=Math.max(S.best||0,pct);S.exams++;save();}}
      else{U.quiz.i++;U.quiz.ans='';U.quiz.checked=false;}render();
    }
    else if(a==='restart'){U.quiz=session(U.exam?20:10);render();}
  }
  function input(e){
    const t=e.target;
    if(t.id==='g-search'){const p=t.selectionStart;U.search=t.value;render();const n=$('#g-search');n?.focus();n?.setSelectionRange(p,p);}
    else if(t.id==='g-spell-input')U.spellAnswer=t.value;
    else if(t.id==='g-q-answer')U.quiz.ans=t.value;
  }
  function submit(e){if(e.target.id==='g-spell-form'){e.preventDefault();checkSpell();}}
  window.GermanStudy={mount,render};
})();