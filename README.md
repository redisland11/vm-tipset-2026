# VM-tipset 2026 — Tippsida + Topplista

Stilren, kompakt frontend för fotbolls-VM 2026-tipset. Ersätter Google Forms-gränssnittet med en egen tabell-baserad design. Skickar tips till samma Google Sheet ("VM-tips 2026 - Rättning") via Apps Script Web App.

## Sidor

- **`index.html`** — Tipsformuläret. Tabell-layout med alla 48 matcher (omg 1+2), poäng synliga i 1/X/2-cellerna, flaggor från flagcdn.com.
- **`topplistan.html`** — Live-topplistan. Pollar Apps Script var 30:e sekund.

## Snabbstart (lokal preview)

Eftersom frontenden anropar Apps Script behöver du först deploya backend:en (se nedan). När `js/config.js` är ifylld med din Web App-URL kan du starta:

```sh
python -m http.server 8000
# eller med Node: npx serve .
```

Öppna sedan http://localhost:8000/

> **Notera**: file://-protokollet (att dubbelklicka HTML-filen) fungerar för rendering men inte för fetch-anrop pga CORS. Använd en lokal server.

## Setup steg-för-steg

1. **Deploya Apps Script**: följ `apps-script/DEPLOY.md`. Du får en Web App-URL.
2. **Klistra in URL:en**: öppna `js/config.js`, ersätt `REPLACE_ME` i `APPS_SCRIPT_URL`.
3. **Testa lokalt**: `python -m http.server 8000` → http://localhost:8000/
4. **Pusha till GitHub**: `git add . && git commit -m "Initial commit" && git remote add origin <url> && git push -u origin main`

## Filstruktur

```
tippsida-webb/
├── index.html              # Tipsformulär
├── topplistan.html         # Topplista
├── css/
│   └── styles.css          # All styling (delad)
├── js/
│   ├── config.js           # Apps Script Web App-URL (justeras manuellt)
│   ├── matches.js          # 48 matcher som hårdkodad array
│   ├── flags.js            # Lagnamn → ISO-kod + flagUrl() helper
│   ├── form.js             # Formulär-logik (klick, validering, POST)
│   └── topplistan.js       # Topplista-logik (fetch, polling, render)
├── apps-script/
│   ├── Code.gs             # Apps Script backend (doPost/doGet)
│   └── DEPLOY.md           # Deploy-instruktioner
├── .gitignore
└── README.md
```

## Arkitektur

```
[Frontend (vanilla HTML/CSS/JS, statiskt hostat)]
        │
        │  POST tips (JSON)        GET topplista (JSON)
        ▼
[Apps Script Web App (Code.gs)]
        │
        ▼
[Google Sheet "VM-tips 2026 - Rättning"]
   ├─ Formulärsvar     ← appendRow vid varje POST
   ├─ Råpoäng kompakt  ← oförändrad, INDIRECT-formler räknar poäng
   └─ Topplistan       ← sorterad slutställning, läses via doGet
```

## Integrering i WordPress

Tre rekommenderade vägar (välj en):

### 1. Cloudflare Pages + iframe i WordPress (rekommenderat)

Hosta repot på Cloudflare Pages (gratis, snabb CDN). I WordPress-sidan, klistra in:

```html
<iframe src="https://din-cloudflare-domain.pages.dev/" width="100%" height="2400" style="border:none;"></iframe>
```

Fördelar: full kontroll, ingen CSS-konflikt med WordPress-temat, snabbt att uppdatera.

### 2. Egen subdomain (t.ex. vm.tgc.se)

Samma Cloudflare-deploy som ovan, men koppla en custom domain. Länka dit från WordPress-menyn.

### 3. Direkt-inkludering i WordPress

Klistra in HTML från `index.html` (body-innehållet) i en WordPress-sida (HTML-block) och länka CSS/JS från GitHub Raw eller jsDelivr CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USER/REPO@main/css/styles.css">
<!-- ... HTML-innehåll ... -->
<script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/js/config.js"></script>
<script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/js/matches.js"></script>
<script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/js/flags.js"></script>
<script src="https://cdn.jsdelivr.net/gh/USER/REPO@main/js/form.js"></script>
```

Risk: WordPress-temats CSS kan kollidera med vår. Vi kan behöva prefixa alla selektorer eller använda shadow DOM. Mer fix än iframe.

## Uppdatera odds (efter att riktiga Expekt-odds är klara)

1. Redigera `js/matches.js` — ändra `oddsHome / oddsDraw / oddsAway` per match.
2. Uppdatera Matchdata-fliken i Sheet:en (`F2:H49` Odds, `I2:K49` Poäng, `L2:N49` Svarstext).
3. Re-deploya frontenden (commit + push).

> Variabel poäng per match betyder att formulärtext (`"Mexiko 200 p"`) ändras. Tidigare svar i Formulärsvar-fliken jämförs mot nya `Matchdata.P` (Facit-svartext) → kan ge fel i rättning om någon redan tippat innan ändringen. Uppdatera odds INNAN turneringens första match (11 juni 2026).

## Testning

Förutsatt att Apps Script är deployat och config.js har rätt URL:

1. Öppna `index.html`, klicka 48 tips, fyll i identitet + utslagsfråga, skicka.
2. Verifiera i Sheet:en: ny rad i Formulärsvar, ny rad i Råpoäng kompakt + Topplistan.
3. Öppna `topplistan.html`, verifiera att tipsaren visas.
4. Försök skicka in igen med samma email → 409-meddelande.

## Tech stack

- Vanilla HTML5 + CSS3 + JavaScript (ES2020+, ingen build)
- Google Apps Script (V8-runtime) som backend
- flagcdn.com för flaggor

## Licens

MIT (eller välj annat senare).
