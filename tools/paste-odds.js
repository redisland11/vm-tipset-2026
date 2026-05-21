// tools/paste-odds.js
// Parsar text från Expekt, matchar mot MATCHES, genererar odds-objekt.

// Första gissning på Expekts format. Kalibreras när första copy-paste görs.
const EXPEKT_REGEX = /(?<home>[\wåäöÅÄÖ\-\. ]+?)\s*[-–]\s*(?<away>[\wåäöÅÄÖ\-\. ]+?)\s+(?<oddsHome>\d+[.,]\d+)\s+(?<oddsDraw>\d+[.,]\d+)\s+(?<oddsAway>\d+[.,]\d+)/g;

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
