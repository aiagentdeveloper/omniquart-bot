# STATUS — omniquart-bot

Son güncelleme: 2026-10-13 (lider)

## Durum: YAYINDA (GitHub Pages)

Kullanıcı, tek dosyalık Omniquart paper-trading HTML panelini ücretsiz bir
platformda sürekli erişilebilir yayınlama istedi. Statik sayfa, sunucu tarafı
kod yok.

### Yayında

- **URL:** https://aiagentdeveloper.github.io/omniquart-bot/
- **Repo:** https://github.com/aiagentdeveloper/omniquart-bot (PUBLIC)
- **Kaynak:** `docs/index.html` (Pages `/docs` dalından servis ediyor; `src/index.html` aynısının kopyası)
- **Barındırma:** GitHub Pages (ücretsiz, özel domain yok)
- **Hesap notu:** `gh` oturumu iki hesap arasında; repo **aiagentdeveloper**
  hesabında açıldı (`nurettinsoker` yerine — gh aktif buydu, push adresi bunu gösterdi).

### Test durumu (2026-10-13)

| Kontrol | Sonuç |
|---|---|
| JS söz dizimi (`node --check` script bloğu) | **PASS** |
| Yerel HTTP sunucu (`python -m http.server`) → 200 + title + fetch var | **PASS** |
| Canlı URL HTTP 200 + "Omniquart" içeriği | **PASS** (1. denemede) |
| Binance fapi CORS (`Access-Control-Allow-Origin: *`) | **PASS** (Node fetch ile Origin başlığıyla doğrulandı) |
| Tarayıcıda uçtan uca simülasyon döngüsü | **NOT_RUN** (ajanda tarayıcı yok; kullanıcı sekmesinde test edecek) |

### Bilinen sınırlar

- **İstemci tarafı simülasyon:** döngü yalnız tarayıcı sekmesi açıkken döner.
  Sayfa 7/24 sunulur ama sekme kapalıyken işlem/analiz yoktur.
- localStorage her cihaz/tarayıcıda ayrıdır (senkron yok).
- 30 sembole eşzamanlı public istek → bazen kısmi 429/451 (bölge/Ban),
  hatalı semboller `.catch(()=>null)` ile sessizce atlanır.
- Yatırım tavsiyesi değildir; gerçek emir yok, paper trading.

### Sonraki adım

Kullanıcı canlı URL'de stratejiyi test eder. Geri bildirim olursa strateji
parametreleri (`TP/SL/skor eşikleri`) `docs/index.html` üzerinden güncellenir;
değişiklikten sonra commit + push yeterli (Pages otomatik yayınlanır).
