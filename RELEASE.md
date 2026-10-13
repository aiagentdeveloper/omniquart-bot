# Teslimat — omniquart-bot

Tarih: 2026-10-13

## Yayında

| Öğe | Değer |
|---|---|
| Canlı URL | https://aiagentdeveloper.github.io/omniquart-bot/ |
| Repo (public) | https://github.com/aiagentdeveloper/omniquart-bot |
| Yayın dalı/yolu | `main` / `/docs` |
| Platform | GitHub Pages (ücretsiz, domain almadan) |
| İçerik | `docs/index.html` — tek dosya, bağımlılık yok |

## Ne teslim edildi

- Omniquart paper-trading paneli: Binance Futures public klines verisiyle
  5dk mumlarda EMA9/21 + RSI14 + MACD + Bollinger + hacim skorlaması;
  skor ≥+3 LONG / ≤−3 SHORT; TP %30 ROE, SL −%15 ROE, tasfiye −%90 ROE;
  sabit 20 USDT marjin, 10x, en fazla 7 pozisyon, 30 sembol.
- State `localStorage` (`omniquart_v1`); "Sıfırla" 200 USDT'ye döner.
- Gerçek emir yok; yatırım tavsiyesi değildir.

## Kanıt

- `node --check` → JS söz dizimi PASS
- Yerel HTTP sunucu → 200, title + fetch doğrulandı
- Canlı URL → HTTP 200 (yayın 1. denemede ayağa kalktı)
- Binance `fapi` CORS → `Access-Control-Allow-Origin: *` (Node fetch ile)

## Güncelleme yolu

1. `docs/index.html`'i düzenle (ve `src/index.html` kopyasını senkron tut).
2. `git add docs/index.html src/index.html && git commit -m "..." && git push`
3. GitHub Pages ~1 dk içinde otomatik günceller.

## Bilinen sınırlar

- Simülasyon yalnız açık sekmede döner (sunucu süreci yok).
- Cihazlar arası state senkronu yok.
- Bölgesel/rate-limit nedeniyle bazı semboller sessiz atlanabilir.
