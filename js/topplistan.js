const POLL_INTERVAL_MS = 30000;
let pollTimer = null;

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `Uppdaterad ${h}:${m}`;
}

function renderPlayers(players) {
  const tbody = document.getElementById('leaderboardBody');
  if (!players.length) {
    tbody.innerHTML = `<tr class="empty"><td colspan="6">Inga tippade ännu. Bli först — gå till <a href="index.html">Tipsa</a>.</td></tr>`;
    return;
  }

  tbody.innerHTML = players.map(p => `
    <tr>
      <td class="rank">${p.rank ?? ''}</td>
      <td class="team">${escapeHtml(p.teamName ?? '')}</td>
      <td class="name">${escapeHtml(p.name ?? '')}</td>
      <td class="points">${p.totalPoints ?? ''}</td>
      <td class="tiebreak">${p.tieBreaker ?? ''}</td>
      <td class="dev">${p.deviation ?? ''}</td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function fetchLeaderboard() {
  const status = document.getElementById('leaderboardStatus');
  const lastUpdated = document.getElementById('lastUpdated');

  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: 'GET' });
    const data = await res.json();

    if (!data.success) throw new Error(data.error || 'Okänt fel');

    renderPlayers(data.players || []);
    status.classList.add('hidden');
    lastUpdated.textContent = formatTime(new Date(data.updatedAt || Date.now()));
  } catch (err) {
    status.className = 'leaderboard-status error';
    status.textContent = 'Kunde inte hämta topplistan: ' + err.message;
    status.classList.remove('hidden');
  }
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(fetchLeaderboard, POLL_INTERVAL_MS);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('refreshBtn').addEventListener('click', fetchLeaderboard);

  fetchLeaderboard();
  startPolling();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    } else {
      fetchLeaderboard();
      startPolling();
    }
  });
});
