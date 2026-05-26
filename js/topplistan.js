function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `Uppdaterad ${h}:${m}`;
}

// Odds-oberoende rättning: parsar poäng ur answer-text ("Mexiko 147 p" → 147)
// och prefix-matchar pick mot home/away-namn istället för full strängjämförelse.
function extractPoints(answerText) {
  if (!answerText) return 0;
  const m = String(answerText).match(/(\d+)\s*p\s*$/);
  return m ? parseInt(m[1], 10) : 0;
}

function pickSide(pick, match) {
  if (!pick || !match) return null;
  if (pick.startsWith(match.home + ' ')) return '1';
  if (pick.startsWith('Oavgjort ')) return 'X';
  if (pick.startsWith(match.away + ' ')) return '2';
  return null;
}

function pointsForPick(pick, match) {
  if (!match || !match.facit) return 0;
  const side = pickSide(pick, match);
  if (!side || side !== String(match.facit).trim()) return 0;
  if (side === '1') return extractPoints(match.answer1);
  if (side === 'X') return extractPoints(match.answerX);
  if (side === '2') return extractPoints(match.answer2);
  return 0;
}

function shortMatchName(home, away) {
  // Kortform för långa lagnamn (sparas plats i headern)
  const shorten = (name) => {
    if (name === 'Bosnien och Hercegovina') return 'Bosnien';
    if (name === 'Kongo-Kinshasa') return 'Kongo';
    if (name === 'Saudiarabien') return 'Saudi';
    if (name === 'Elfenbenskusten') return 'Elfenben';
    if (name === 'Nederländerna') return 'Nederl.';
    return name;
  };
  return `${shorten(home)} - ${shorten(away)}`;
}

function renderHeader(matches, distribution) {
  const cells = matches.map((m, i) => {
    const d = distribution[i] || { count1: 0, countX: 0, count2: 0, total: 0 };
    const max = Math.max(d.count1, d.countX, d.count2, 1);
    const h1 = (d.count1 / max) * 100;
    const hX = (d.countX / max) * 100;
    const h2 = (d.count2 / max) * 100;
    const tooltip = d.total > 0
      ? `${d.count1} (1) · ${d.countX} (X) · ${d.count2} (2)`
      : 'Inga tippade ännu';
    return `<th class="match-col" title="${escapeHtml(tooltip)}">
        <div class="match-bars" aria-hidden="true">
          <span class="b b1" style="height:${h1}%"></span>
          <span class="b bx" style="height:${hX}%"></span>
          <span class="b b2" style="height:${h2}%"></span>
        </div>
        <div class="match-bar-labels"><span>${d.count1}</span><span>${d.countX}</span><span>${d.count2}</span></div>
        <div class="match-name">${escapeHtml(shortMatchName(m.home, m.away))}</div>
      </th>`;
  }).join('');

  return `<tr>
    <th class="sticky-col col-rank">Plac.</th>
    <th class="sticky-col col-name">Lagnamn</th>
    <th class="sticky-col col-points">Poäng</th>
    <th class="sticky-col col-next">Nästa match</th>
    ${cells}
  </tr>`;
}

function renderRows(matches, players, nextMatchIndex) {
  if (!players.length) {
    return `<tr class="empty"><td class="empty-cell" colspan="${4 + matches.length}">Inga tippade ännu. Bli först — <a href="index.html">tipsa här</a>.</td></tr>`;
  }

  return players.map(p => {
    const picks = p.picks || [];
    const nextPick = (nextMatchIndex >= 0 && picks[nextMatchIndex]) ? picks[nextMatchIndex] : '—';
    const cells = picks.map((pick, i) => {
      const m = matches[i];
      let cls = 'match-cell';
      if (m && m.facit) {
        cls += pointsForPick(pick, m) > 0 ? ' correct' : ' wrong';
      }
      return `<td class="${cls}">${escapeHtml(pick || '')}</td>`;
    }).join('');
    return `<tr>
      <td class="sticky-col col-rank rank">${escapeHtml(p.rank)}</td>
      <td class="sticky-col col-name name">${escapeHtml(p.teamName)}</td>
      <td class="sticky-col col-points points">${escapeHtml(p.totalPoints)}</td>
      <td class="sticky-col col-next next">${escapeHtml(nextPick)}</td>
      ${cells}
    </tr>`;
  }).join('');
}

function jsonpFetch(url) {
  return new Promise((resolve, reject) => {
    const cb = 'jsonpCb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    let script;
    let timer;
    const cleanup = () => {
      try { delete window[cb]; } catch (e) { window[cb] = undefined; }
      if (script && script.parentNode) script.parentNode.removeChild(script);
      if (timer) clearTimeout(timer);
    };
    window[cb] = (data) => { cleanup(); resolve(data); };
    script = document.createElement('script');
    script.onerror = () => { cleanup(); reject(new Error('JSONP-script kunde inte laddas')); };
    const sep = url.includes('?') ? '&' : '?';
    script.src = url + sep + 'callback=' + cb + '&_=' + Date.now();
    document.head.appendChild(script);
    timer = setTimeout(() => { cleanup(); reject(new Error('JSONP-timeout efter 15s')); }, 15000);
  });
}

async function fetchLeaderboard() {
  const status = document.getElementById('leaderboardStatus');
  const loading = document.getElementById('lbLoading');
  const lastUpdated = document.getElementById('lastUpdated');
  const debug = [];
  const isMock = new URLSearchParams(location.search).has('mock');
  debug.push(`Origin: ${location.origin}`);
  debug.push(`Mode: ${isMock ? 'mock (fetch)' : 'live (JSONP)'}`);

  if (loading) loading.classList.remove('hidden');

  try {
    let data;
    if (isMock) {
      const res = await fetch('mock-leaderboard.json', { cache: 'no-store' });
      debug.push(`Status: ${res.status}`);
      data = await res.json();
    } else {
      data = await jsonpFetch(APPS_SCRIPT_URL);
      debug.push(`JSONP OK`);
    }
    if (!data.success) throw new Error(data.error || 'Okänt fel');

    const matches = data.matches || [];
    const players = data.players || [];

    // Räkna om totalPoints + rank lokalt så rättningen är robust mot odds-uppdateringar.
    // Sheets-formlerna i Topplistan-fliken matchar pick-text mot facit-svartext, vilket
    // bryter när oddsen ändras efter att picks lämnats in. Vi ignorerar backend's värden.
    players.forEach(p => {
      let sum = 0;
      (p.picks || []).forEach((pick, i) => { sum += pointsForPick(pick, matches[i]); });
      p.totalPoints = sum;
    });
    players.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      const da = Number(a.deviation) || 0;
      const db = Number(b.deviation) || 0;
      if (da !== db) return da - db;
      return String(a.teamName).localeCompare(String(b.teamName), 'sv');
    });
    players.forEach((p, i) => { p.rank = i + 1; });

    // Räkna fördelningen lokalt med prefix-match på lagnamn / "Oavgjort ".
    // Picks sparas som text-snapshot ("Mexiko 200 p") vid submission, men match.answer1/X/2
    // ändras vid odds-uppdatering — full strängmatch i backend ger då 0/0/0.
    const distribution = matches.map((m, i) => {
      let c1 = 0, cX = 0, c2 = 0;
      players.forEach(p => {
        const pick = (p.picks && p.picks[i]) || '';
        if (!pick) return;
        if (pick.startsWith(m.home + ' ')) c1++;
        else if (pick.startsWith('Oavgjort ')) cX++;
        else if (pick.startsWith(m.away + ' ')) c2++;
      });
      return { count1: c1, countX: cX, count2: c2, total: c1 + cX + c2 };
    });
    const nextMatchIndex = typeof data.nextMatchIndex === 'number' ? data.nextMatchIndex : -1;

    document.getElementById('lbThead').innerHTML = renderHeader(matches, distribution);
    document.getElementById('lbTbody').innerHTML = renderRows(matches, players, nextMatchIndex);

    // Återapplicera nuvarande sökfilter (om något) efter ny render
    const searchInput = document.getElementById('lbSearch');
    if (searchInput && searchInput.value) applySearch(searchInput.value);

    status.classList.add('hidden');
    lastUpdated.textContent = formatTime(new Date(data.updatedAt || Date.now()));
  } catch (err) {
    debug.push(`ERROR: ${err.name} — ${err.message}`);
    status.className = 'leaderboard-status error';
    status.innerHTML = `<strong>Kunde inte hämta topplistan</strong><br><pre style="margin:8px 0 0;white-space:pre-wrap;font-size:11px;">${escapeHtml(debug.join('\n'))}</pre>`;
    status.classList.remove('hidden');
  } finally {
    if (loading) loading.classList.add('hidden');
  }
}

function applySearch(term) {
  const t = (term || '').trim().toLowerCase();
  const tbody = document.getElementById('lbTbody');
  if (!tbody) return;
  tbody.querySelectorAll('tr').forEach(row => {
    if (!t) {
      row.classList.remove('filtered-out');
      return;
    }
    const teamCell = row.querySelector('.col-name');
    const teamText = teamCell ? teamCell.textContent.toLowerCase() : '';
    row.classList.toggle('filtered-out', !teamText.includes(t));
  });
}

// Ingen auto-polling: topplistan ändras bara när facit matas in (2-3 ggr/dag).
// Användaren laddar om sidan för att hämta senaste topplistan.
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('lbSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => applySearch(e.target.value));
  }

  fetchLeaderboard().then(() => {
    const scrollVal = new URLSearchParams(location.search).get('scroll');
    if (scrollVal) {
      setTimeout(() => {
        const wrapper = document.getElementById('lbWrapper');
        if (wrapper) wrapper.scrollLeft = parseInt(scrollVal, 10);
      }, 200);
    }
  });
});
