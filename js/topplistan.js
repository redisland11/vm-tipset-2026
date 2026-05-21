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
      if (m && m.facitText) {
        cls += (pick && pick === m.facitText) ? ' correct' : ' wrong';
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
  const lastUpdated = document.getElementById('lastUpdated');
  const debug = [];
  const isMock = new URLSearchParams(location.search).has('mock');
  debug.push(`Origin: ${location.origin}`);
  debug.push(`Mode: ${isMock ? 'mock (fetch)' : 'live (JSONP)'}`);

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
    const distribution = data.distribution || matches.map(() => ({ count1: 0, countX: 0, count2: 0, total: 0 }));
    const nextMatchIndex = typeof data.nextMatchIndex === 'number' ? data.nextMatchIndex : -1;

    document.getElementById('lbThead').innerHTML = renderHeader(matches, distribution);
    document.getElementById('lbTbody').innerHTML = renderRows(matches, players, nextMatchIndex);

    status.classList.add('hidden');
    lastUpdated.textContent = formatTime(new Date(data.updatedAt || Date.now()));
  } catch (err) {
    debug.push(`ERROR: ${err.name} — ${err.message}`);
    status.className = 'leaderboard-status error';
    status.innerHTML = `<strong>Kunde inte hämta topplistan</strong><br><pre style="margin:8px 0 0;white-space:pre-wrap;font-size:11px;">${escapeHtml(debug.join('\n'))}</pre>`;
    status.classList.remove('hidden');
  }
}

// Topplistan uppdateras manuellt via "↻ Uppdatera"-knappen.
// Ingen auto-polling: topplistan ändras bara när facit matas in (2-3 ggr/dag),
// så slöseri med Apps Script-quota att polla kontinuerligt.
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshBtn').addEventListener('click', fetchLeaderboard);
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
