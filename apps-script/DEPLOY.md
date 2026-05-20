# Deploy Apps Script Web App

Den här filen beskriver hur du kopplar `Code.gs` till Google Sheet:en och deployar den som en Web App, så att tipsformuläret och topplistan kan kommunicera med Sheet:en.

## Engångs-setup

1. Öppna spreadsheet:en: https://docs.google.com/spreadsheets/d/1sqFUoS4R071F6EfRZxkwlcwgPrmESzZOCgxchSwa4IE/edit
2. I menyn: **Tillägg → Apps Script** (Extensions → Apps Script). En ny flik öppnas.
3. Radera default-koden i `Code.gs`-rutan.
4. Öppna `tippsida-webb/apps-script/Code.gs` i den här mappen, kopiera hela innehållet och klistra in i Apps Script-editorn.
5. Spara med Ctrl+S (eller diskettikonen). Namnge projektet t.ex. "VM-tipset 2026 endpoint".

## Första körningen — godkänn behörigheter

Innan deploy måste du köra `doPost`-funktionen en gång manuellt för att godkänna behörigheter (Apps Script behöver tillgång till Sheets):

1. Välj funktionen `doPost` i dropdown-menyn ovanför kodfönstret.
2. Klicka **Kör** (Run).
3. Du får en varning "Behörighet krävs" → klicka **Granska behörigheter**.
4. Välj ditt Google-konto (redisland11@gmail.com).
5. Du får en varning "Google har inte verifierat denna app" → klicka **Avancerat → Gå till VM-tipset 2026 endpoint (osäker)**.
6. Klicka **Tillåt** för att ge åtkomst till Sheets.

Funktionen kommer att kasta ett fel ("TypeError: Cannot read properties of undefined (reading 'postData')") — det är normalt. Behörigheterna är nu satta.

## Deploy som Web App

1. Klicka **Deploy → Ny deployment** (Deploy → New deployment) uppe till höger.
2. Klicka kugghjulet bredvid "Välj typ" → välj **Webbapp**.
3. Konfiguration:
   - **Beskrivning**: VM-tipset endpoint v1
   - **Kör som**: Mig (`redisland11@gmail.com`)
   - **Vem har åtkomst**: **Alla** (Anyone) — VIKTIGT, måste vara öppet för att frontenden ska kunna nå det
4. Klicka **Deploy**.
5. Kopiera **Web app URL** (ser ut som `https://script.google.com/macros/s/AKfyc.../exec`).

## Klistra in URL:en i frontenden

1. Öppna `tippsida-webb/js/config.js`.
2. Ersätt `REPLACE_ME` i `APPS_SCRIPT_URL`-konstanten med URL:en du just kopierade.
3. Spara filen.

## Testa endpointen

### Test 1 — GET (topplistan)

Öppna Web app URL:en i din browser. Du ska se en JSON-respons:
```json
{ "success": true, "players": [...], "updatedAt": "..." }
```

### Test 2 — POST (tipsinlämning)

Starta lokal HTTP-server i `tippsida-webb/`:
```
python -m http.server 8000
```

Öppna http://localhost:8000/index.html, fyll i tipset, skicka in. Verifiera i Sheet:en att raden hamnar i Formulärsvar-fliken.

## Vid kodändringar i Code.gs

Apps Script har två deploy-lägen:

- **Testdeploy** (Deploy → Test deployments): URL:en ändras INTE när du ändrar koden. Bra för utveckling.
- **Produktionsdeploy** (Deploy → Manage deployments → ändra version): Behåll samma URL men uppdatera koden. Klicka **Hantera deployments → blyertspennan → Version: Ny version → Deploy**.

För enkelhet under utveckling: använd `Deploy → Test deployments → Web app URL`. När du är nöjd, kör en riktig deploy.

## Säkerhetsnoteringar

- Endpointen är öppen ("Anyone access"). Vem som helst som hittar URL:en kan POSTa och GETa.
- Dubbel-submit blockeras via email-validering i `doPost`.
- Vill du gömma URL:en mer: håll repot privat tills du delar formulär-länken med deltagarna.
- Loggar finns under "Exekveringar" i Apps Script-editorn.
