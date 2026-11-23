# ISOByte Study Lab

11. sınıf dersleri için hazırlanmış, tarayıcıda çalışan çok dersli çalışma alanı. İlk açılışta çalışmak istediğin dersi seçersin; ders seçimini sonradan üst menüden değiştirebilirsin.

**Önerilen depo adı:** `isobyte-study-lab`

**Şu anki site adresi:** https://isobyte00.github.io/1.1-ing-yazili/

## Dersler

### 🇬🇧 İngilizce

- 11. sınıf **Future Jobs** ve **Hobbies and Skills** üniteleri
- Will / going to, prefer / would rather / would prefer, can / could ve hobi kalıpları
- Kelime kartları, konu anlatımları, okuma ve dinleme rehberi
- Çoktan seçmeli, boşluk doldurma, sıralama, eşleştirme ve farklı yazılı senaryoları
- Tarayıcıda saklanan çalışma ilerlemesi

### 🇩🇪 Almanca

- **1. Thema: Unterkunft** — kitap s.10–19 ve öğrenci defter notları
- Ev türleri, odalar, mobilyalar, sıfatlar, fiiller ve yer-yön edatları
- Her kelimeyi artikeliyle öğrenmek için gruplandırılmış kelime kartları
- Almanca yazım çalışması: artikel, büyük harf ve umlautlar birebir kontrol edilir
- `möchten` çekimi, Dativ belirli/belirsiz artikel biçimleri ve `Wo?` / `Wohin?` ayrımı
- `in`, `auf`, `unter` başta olmak üzere Wechselpräpositionen alıştırmaları
- Okuma çalışması, karma alıştırma merkezi ve 20 soruluk yazılı provası

## Çalışma kayıtları

Ders seçimi, öğrenilen kelimeler, yazım sonuçları ve deneme puanları tarayıcının `localStorage` alanında saklanır. İngilizce ve Almanca kayıtları birbirinden ayrıdır. Site bir hesap veya sunucu gerektirmez.

## Proje yapısı

| Dosya | Amaç |
| --- | --- |
| `index.html` | Uygulama iskeleti ve ilk ders seçimi |
| `app.js`, `data.js`, `v2-data.js` | İngilizce modülü |
| `german-app.js`, `german-data.js` | Almanca öğrenme arayüzü ve 1. ünite içeriği |
| `subjects.js` | Ders seçimi ve dersler arası geçiş |
| `course.css` | Çok dersli görünüm ve Almanca arayüzü |
| `tts.js` | Tarayıcı / yapılandırılmış seslendirme desteği |

## Kaynak ve kapsam

İngilizce içerik, Yıldırım 11. sınıf İngilizce kitabının 1. ve 2. ünitelerine dayanır. Almanca içerik, Yıldırım 11. sınıf Almanca kitabının **1. Thema: Unterkunft** bölümündeki s.10–19 kapsamı ve sağlanan öğrenci defter notları esas alınarak hazırlanmıştır. Kitabın dinleme kayıtları veya telifli sayfa görselleri bu depoya kopyalanmamıştır.

Almanca notlarında karışabilecek bazı karşılıklar özellikle ayrılmıştır: `der Wohnwagen` (çekme karavan) ve `das Wohnmobil` (motokaravan) farklı kelimelerdir; `das Doppelhaus` ikiz/bitişik ev anlamındadır.

## Geliştirme

İçerik doğrulama kontrollerini Node.js ile çalıştır:

```bash
node tests/validate-content.cjs
node tests/validate-german.cjs
node tests/validate-tts.cjs
```

© 2026 ISOByte · Bağımsız eğitim aracı. Kitap, ses ve marka hakları ilgili hak sahiplerine aittir.
