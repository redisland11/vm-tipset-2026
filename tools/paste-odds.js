// tools/paste-odds.js
// Parsar text från Expekt, matchar mot MATCHES, genererar odds-objekt.

// Kalibrerat mot Expekts faktiska format (2026-05-21):
// Lag på var sin rad, sedan tom rad, sedan 3 odds med tomma rader emellan.
// Datum-rader (t.ex. "11/0621:00") och market-rader (t.ex. "Ö 2.5") matchar inte
// eftersom följande rad måste börja med bokstav, inte siffra.
const EXPEKT_REGEX = /(?<home>[A-Za-zÅÄÖåäö][^\n]*?)\n(?<away>[A-Za-zÅÄÖåäö][^\n]*?)\n\s*\n(?<oddsHome>\d+\.\d+)\s*\n+(?<oddsDraw>\d+\.\d+)\s*\n+(?<oddsAway>\d+\.\d+)/g;

function parseExpektText(text) {
  const matches = [];
  let m;
  EXPEKT_REGEX.lastIndex = 0;
  while ((m = EXPEKT_REGEX.exec(text)) !== null) {
    matches.push({
      home: normalizeTeam(m.groups.home),
      away: normalizeTeam(m.groups.away),
      oddsHome: parseFloat(m.groups.oddsHome.replace(',', '.')),
      oddsDraw: parseFloat(m.groups.oddsDraw.replace(',', '.')),
      oddsAway: parseFloat(m.groups.oddsAway.replace(',', '.')),
    });
  }
  return matches;
}

function matchAgainstMatches(parsed) {
  // För varje parsad rad, slå upp i MATCHES för att bestämma round + group.
  // Returnerar { matched: [...], unmatched: [...] }
  const matched = [];
  const unmatched = [];
  for (const p of parsed) {
    const found = MATCHES.find(m => m.home === p.home && m.away === p.away);
    if (found) {
      matched.push({
        round: found.round,
        group: found.group,
        home: found.home,
        away: found.away,
        oddsHome: p.oddsHome,
        oddsDraw: p.oddsDraw,
        oddsAway: p.oddsAway,
      });
    } else {
      unmatched.push(p);
    }
  }
  return { matched, unmatched };
}

function setStatus(elId, msg, kind) {
  const el = document.getElementById(elId);
  el.className = kind ? `status ${kind}` : '';
  el.textContent = msg || '';
}

function renderPreview(matched, unmatched) {
  const root = document.getElementById('preview');
  if (matched.length === 0 && unmatched.length === 0) {
    root.innerHTML = '';
    return;
  }
  let html = '<table class="preview"><thead><tr><th>Omg</th><th>Grupp</th><th>Match</th><th>1</th><th>X</th><th>2</th></tr></thead><tbody>';
  matched.forEach(m => {
    html += `<tr><td>${m.round}</td><td>${m.group}</td><td>${m.home} – ${m.away}</td><td>${m.oddsHome.toFixed(2)}</td><td>${m.oddsDraw.toFixed(2)}</td><td>${m.oddsAway.toFixed(2)}</td></tr>`;
  });
  unmatched.forEach(m => {
    html += `<tr class="miss"><td colspan="3">EJ MATCHAD: ${m.home} – ${m.away}</td><td>${m.oddsHome.toFixed(2)}</td><td>${m.oddsDraw.toFixed(2)}</td><td>${m.oddsAway.toFixed(2)}</td></tr>`;
  });
  html += '</tbody></table>';
  root.innerHTML = html;
}

function buildCsv(matched) {
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const header = 'round,group,home,away,oddsHome,oddsDraw,oddsAway,updatedAt';
  const rows = matched.map(m => [
    m.round,
    m.group,
    m.home,
    m.away,
    m.oddsHome.toFixed(2),
    m.oddsDraw.toFixed(2),
    m.oddsAway.toFixed(2),
    ts,
  ].join(','));
  return [header, ...rows].join('\n') + '\n';
}

function downloadCsv(text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'odds.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById('processBtn').addEventListener('click', () => {
  const text = document.getElementById('input').value;
  const parsed = parseExpektText(text);
  const { matched, unmatched } = matchAgainstMatches(parsed);

  if (matched.length === 48 && unmatched.length === 0) {
    setStatus('parseStatus', `✓ Hittade ${matched.length}/48 matcher`, 'ok');
    document.getElementById('syncRow').style.display = 'flex';
  } else {
    setStatus('parseStatus', `Hittade ${matched.length}/48 matcher. ${unmatched.length} ej matchade.`, 'err');
    document.getElementById('syncRow').style.display = 'none';
  }
  renderPreview(matched, unmatched);
  window._lastMatched = matched;
});

// JSONP-GET istället för POST: undviker Apps Scripts redirect-CORS-bugg på POST.
// Samma mönster som form.js submit och topplistan.js använder.
function syncToAppsScript(matched, secret) {
  return new Promise((resolve, reject) => {
    const cb = 'oddsSyncCb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    let script;
    let timer;
    const cleanup = () => {
      try { delete window[cb]; } catch (e) { window[cb] = undefined; }
      if (script && script.parentNode) script.parentNode.removeChild(script);
      if (timer) clearTimeout(timer);
    };

    window[cb] = (data) => {
      cleanup();
      if (!data || !data.success) {
        reject(new Error((data && data.error) || 'Okänt fel'));
      } else {
        resolve(data);
      }
    };

    const payload = {
      secret,
      odds: matched.map(m => ({
        round: m.round,
        home: m.home,
        away: m.away,
        oddsHome: m.oddsHome,
        oddsDraw: m.oddsDraw,
        oddsAway: m.oddsAway,
      })),
    };

    script = document.createElement('script');
    script.onerror = () => { cleanup(); reject(new Error('JSONP-script kunde inte laddas')); };
    const sep = APPS_SCRIPT_URL.includes('?') ? '&' : '?';
    script.src = APPS_SCRIPT_URL + sep
      + 'action=updateOdds'
      + '&callback=' + cb
      + '&data=' + encodeURIComponent(JSON.stringify(payload))
      + '&_=' + Date.now();
    document.head.appendChild(script);

    timer = setTimeout(() => { cleanup(); reject(new Error('Timeout efter 30s')); }, 30000);
  });
}

document.getElementById('syncBtn').addEventListener('click', async () => {
  const matched = window._lastMatched;
  const secret = document.getElementById('secret').value;
  if (!matched || matched.length !== 48) {
    setStatus('syncStatus', 'Bearbeta först en komplett uppsättning matcher.', 'err');
    return;
  }
  if (!secret) {
    setStatus('syncStatus', 'Ange ODDS_UPDATE_SECRET.', 'err');
    return;
  }

  setStatus('syncStatus', 'Synkar till Sheet:en...', '');
  document.getElementById('syncBtn').disabled = true;

  try {
    const result = await syncToAppsScript(matched, secret);
    downloadCsv(buildCsv(matched));
    setStatus(
      'syncStatus',
      `✓ Sheet uppdaterad (${result.updated} rader). odds.csv nedladdad — flytta till tippsida-webb/odds.csv och git commit:a.`,
      'ok'
    );
  } catch (err) {
    setStatus('syncStatus', `Fel vid synk: ${err.message}`, 'err');
  } finally {
    document.getElementById('syncBtn').disabled = false;
  }
});
