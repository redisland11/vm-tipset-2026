const picks = {};

function renderRound(roundNumber, containerId) {
  const matches = MATCHES.filter(m => m.round === roundNumber);
  const container = document.getElementById(containerId);

  let html = `<div class="match-table-wrapper"><table class="match-table">
    <thead><tr>
      <th class="col-date">Dag</th>
      <th class="col-group">Grupp</th>
      <th class="col-home">Hemma</th>
      <th class="col-away">Borta</th>
      <th class="col-pick">1</th>
      <th class="col-pick">X</th>
      <th class="col-pick">2</th>
    </tr></thead><tbody>`;

  let prevGroup = null;
  matches.forEach(m => {
    const globalIdx = MATCHES.indexOf(m);
    const p = pointsFor(m);
    const groupBreak = prevGroup !== null && m.group !== prevGroup;
    prevGroup = m.group;

    html += `<tr${groupBreak ? ' class="group-break"' : ''} data-match-index="${globalIdx}">
      <td class="date"><span class="d-day">${formatDate(m.date)}</span><span class="d-time">${m.time}</span></td>
      <td class="group">${m.group}</td>
      <td class="home"><span class="home-inner"><span class="team-name">${m.home}</span>${flagImg(m.home)}</span></td>
      <td class="away"><span class="away-inner">${flagImg(m.away)}<span class="team-name">${m.away}</span></span></td>
      <td class="pick" data-choice="1" tabindex="0" role="radio" aria-label="${m.home} ${p.home} poäng"><span class="points">${p.home}</span><span class="unit">p</span></td>
      <td class="pick" data-choice="X" tabindex="0" role="radio" aria-label="Oavgjort ${p.draw} poäng"><span class="points">${p.draw}</span><span class="unit">p</span></td>
      <td class="pick" data-choice="2" tabindex="0" role="radio" aria-label="${m.away} ${p.away} poäng"><span class="points">${p.away}</span><span class="unit">p</span></td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;

  container.querySelectorAll('.pick').forEach(cell => {
    const selectCell = () => {
      const row = cell.closest('tr');
      const matchIndex = parseInt(row.dataset.matchIndex, 10);
      const choice = cell.dataset.choice;
      picks[matchIndex] = choice;

      row.querySelectorAll('.pick').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      cell.classList.add('selected');
      cell.setAttribute('aria-checked', 'true');
      row.classList.add('picked');

      updateCounter();
      validateForm();
    };

    cell.addEventListener('click', selectCell);
    cell.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectCell();
      }
    });
  });
}

function updateCounter() {
  const count = Object.keys(picks).length;
  document.getElementById('picksCount').textContent = count;
}

function validateForm() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const teamName = document.getElementById('teamName').value.trim();
  const tieBreaker = document.getElementById('tieBreaker').value.trim();
  const picksCount = Object.keys(picks).length;
  const allPicked = picksCount === 48;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid = name && emailOk && teamName && tieBreaker !== '' && allPicked;

  const btn = document.getElementById('submitBtn');
  const hint = document.getElementById('submitHint');
  btn.disabled = !valid;

  if (valid) {
    hint.textContent = 'Allt ifyllt — redo att skicka';
    hint.classList.add('ready');
  } else {
    const missing = [];
    if (!name || !emailOk || !teamName) missing.push('identitet');
    if (!allPicked) missing.push(`${48 - picksCount} matcher kvar`);
    if (tieBreaker === '') missing.push('utslagsfråga');
    hint.textContent = 'Kvar: ' + missing.join(' · ');
    hint.classList.remove('ready');
  }
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
    timer = setTimeout(() => { cleanup(); reject(new Error('JSONP-timeout efter 30s')); }, 30000);
  });
}

async function submitTips() {
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('statusMessage');

  btn.disabled = true;
  btn.textContent = 'Skickar…';
  status.className = 'status-message hidden';

  // Skicka picks som array av strings (texten "Mexiko 200 p" osv) — kompakt
  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    teamName: document.getElementById('teamName').value.trim(),
    tieBreaker: parseInt(document.getElementById('tieBreaker').value, 10),
    picks: MATCHES.map((m, idx) => answerText(m, picks[idx]))
  };

  try {
    const url = APPS_SCRIPT_URL + '?action=submit&data=' + encodeURIComponent(JSON.stringify(payload));
    const data = await jsonpFetch(url);

    // Kontrakt: handleSubmit svarar alltid med action='submit_ok' eller 'submit_error'.
    // Saknas fältet → gammal deploy av Apps Script som ignorerar action=submit.
    if (data.action !== 'submit_ok' && data.action !== 'submit_error') {
      throw new Error('Apps Script har inte uppdaterats. Re-deploya Code.gs (ny version) enligt DEPLOY.md, sen försök igen.');
    }

    if (data.success) {
      status.className = 'status-message success';
      status.textContent = `Tack ${payload.name}! Ditt tips är inskickat. Du kan följa topplistan här bredvid.`;
      btn.textContent = 'Skickat ✓';
      btn.disabled = true;
    } else if (data.error === 'EMAIL_EXISTS') {
      status.className = 'status-message error';
      status.textContent = `Email-adressen ${payload.email} har redan skickat in ett tips. Kontakta oss om du tror att det är fel.`;
      btn.disabled = false;
      btn.textContent = 'Skicka in mitt tips';
    } else if (data.error === 'TEAM_NAME_EXISTS') {
      status.className = 'status-message error';
      status.textContent = `Lagnamnet "${payload.teamName}" är redan upptaget. Välj ett annat lagnamn och skicka in igen.`;
      btn.disabled = false;
      btn.textContent = 'Skicka in mitt tips';
    } else {
      throw new Error(data.error || 'Okänt serverfel');
    }
  } catch (err) {
    status.className = 'status-message error';
    status.textContent = 'Kunde inte skicka tipset just nu: ' + err.message + '. Försök igen om en stund.';
    btn.disabled = false;
    btn.textContent = 'Skicka in mitt tips';
  }
  status.classList.remove('hidden');
  status.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Ladda odds först — utan dem kan vi inte visa korrekta poäng i 1/X/2-cellerna.
  try {
    await loadOdds();
  } catch (err) {
    const status = document.getElementById('statusMessage');
    status.className = 'status-message error';
    status.textContent = `Kunde inte ladda odds: ${err.message}. Ladda om sidan.`;
    status.classList.remove('hidden');
    return;  // ingen rendering, submit-knappen aktiveras aldrig
  }

  renderRound(1, 'round1Container');
  renderRound(2, 'round2Container');

  document.querySelectorAll('#name, #email, #teamName, #tieBreaker').forEach(input => {
    input.addEventListener('input', validateForm);
  });

  document.getElementById('submitBtn').addEventListener('click', submitTips);

  validateForm();
});
