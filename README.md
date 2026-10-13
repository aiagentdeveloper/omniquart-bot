# omniquart-bot

Omniquart — Binance Futures verisiyle çalışan, **paper trading** (simülasyon)
yapan tek dosyalık web paneli. Gerçek emir gönderilmez.

## Canlı

https://aiagentdeveloper.github.io/omniquart-bot/

## Yerel çalıştırma

```
cd src
python -m http.server 8765
```

Sonra tarayıcıda `http://127.0.0.1:8765/`. (Doğrudan dosyayı çift tıklayıp
`file://` ile de açılır; Binance CORS'a izin verdiği için ikisi de çalışır.)

## Güncelleme + yeniden yayın

1. `docs/index.html` dosyasını düzenle; `src/index.html` ile aynı tut.
2. `git add docs/index.html src/index.html && git commit -m "guncelleme" && git push`
3. GitHub Pages ~1 dakikada otomatik güncellenir.

## Strateji özeti

- 30 sembol, 5dk mumlar; EMA9/21 trendi, RSI14, MACD histogramı, Bollinger
  konumu ve hacim artışı ortak skor (−5…+5).
- Skor ≥ +3 → LONG, ≤ −3 → SHORT; ters sinyal / %30 ROE kâr al / −%15 ROE
  zarar kes / −%90 tasfiye ile kapanış.
- Sabit 20 USDT marjin, 10x, en fazla 7 eş zamanlı pozisyon, %0.04 taker.
- Durum tarayıcı `localStorage`'ında (`omniquart_v1`); sayfayı kapatınca
  simülasyon döngüsü durur, sekme tekrar açılınca kaldığı yerden devam eder.

Yatırım tavsiyesi değildir.
